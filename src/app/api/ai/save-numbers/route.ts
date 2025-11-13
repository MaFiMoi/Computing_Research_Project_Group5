import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { 
      phone_number, 
      source_id,
      scam_type,
      confidence_score,
      raw_data
    } = await request.json();

    if (!phone_number || !source_id) {
      return NextResponse.json(
        { success: false, error: 'phone_number and source_id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const scamDataQuery = `
        INSERT INTO scam_data (
          phone_number,
          source_id,
          scam_type,
          confidence_score,
          raw_data
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;

      await client.query(scamDataQuery, [
        phone_number,
        source_id,
        scam_type || null,
        confidence_score || 0,
        raw_data || {}
      ]);

      const checkQuery = `
        SELECT id, total_reports FROM phone_numbers WHERE phone_number = $1
      `;
      const checkResult = await client.query(checkQuery, [phone_number]);

      let phoneNumberId;
      let isNew = false;

      if (checkResult.rows.length === 0) {
        let riskLevel = 'low';
        if (confidence_score >= 90) riskLevel = 'critical';
        else if (confidence_score >= 70) riskLevel = 'high';
        else if (confidence_score >= 50) riskLevel = 'medium';

        const insertQuery = `
          INSERT INTO phone_numbers (
            phone_number,
            is_scam,
            risk_level,
            total_reports,
            first_reported_at
          )
          VALUES ($1, $2, $3, 1, CURRENT_TIMESTAMP)
          RETURNING id;
        `;

        const insertResult = await client.query(insertQuery, [
          phone_number,
          confidence_score >= 50,
          riskLevel
        ]);

        phoneNumberId = insertResult.rows[0].id;
        isNew = true;
      } else {
        phoneNumberId = checkResult.rows[0].id;
        
        const updateQuery = `
          UPDATE phone_numbers
          SET 
            total_reports = total_reports + 1,
            last_updated = CURRENT_TIMESTAMP,
            is_scam = CASE 
              WHEN $2 >= 50 THEN true 
              ELSE is_scam 
            END,
            risk_level = CASE
              WHEN $2 >= 90 THEN 'critical'
              WHEN $2 >= 70 THEN 'high'
              WHEN $2 >= 50 THEN 'medium'
              ELSE risk_level
            END
          WHERE id = $1;
        `;

        await client.query(updateQuery, [phoneNumberId, confidence_score]);
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          phone_number_id: phoneNumberId,
          is_new: isNew,
          action: isNew ? 'created' : 'updated'
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving phone number:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save phone number' },
      { status: 500 }
    );
  }
}
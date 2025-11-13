import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const riskLevel = searchParams.get('risk_level');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pn.*,
        COUNT(DISTINCT pc.id) as check_count,
        COUNT(DISTINCT r.id) as report_count
      FROM phone_numbers pn
      LEFT JOIN phone_checks pc ON pn.phone_number = pc.phone_number
      LEFT JOIN reports r ON pn.phone_number = r.phone_number
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (riskLevel) {
      query += ` AND pn.risk_level = $${paramIndex}`;
      params.push(riskLevel);
      paramIndex++;
    }

    if (search) {
      query += ` AND pn.phone_number LIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` 
      GROUP BY pn.id
      ORDER BY pn.last_updated DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}
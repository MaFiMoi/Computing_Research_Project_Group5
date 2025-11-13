import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { 
      crawl_log_id, 
      status,
      numbers_found, 
      numbers_added,
      numbers_updated,
      error_message,
      crawl_duration
    } = await request.json();

    if (!crawl_log_id) {
      return NextResponse.json(
        { success: false, error: 'crawl_log_id is required' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE ai_crawl_logs
      SET 
        status = $1,
        numbers_found = $2,
        numbers_added = $3,
        numbers_updated = $4,
        error_message = $5,
        crawl_duration = $6,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;

    const result = await pool.query(query, [
      status,
      numbers_found || 0,
      numbers_added || 0,
      numbers_updated || 0,
      error_message || null,
      crawl_duration || 0,
      crawl_log_id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Crawl log not found' },
        { status: 404 }
      );
    }

    if (status === 'success') {
      await pool.query(`
        UPDATE web_sources
        SET 
          total_numbers_found = total_numbers_found + $1,
          success_rate = (
            SELECT 
              (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / COUNT(*)) * 100
            FROM ai_crawl_logs
            WHERE source_id = (SELECT source_id FROM ai_crawl_logs WHERE id = $2)
          )
        WHERE id = (SELECT source_id FROM ai_crawl_logs WHERE id = $2)
      `, [numbers_found, crawl_log_id]);
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error completing crawl:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete crawl' },
      { status: 500 }
    );
  }
}
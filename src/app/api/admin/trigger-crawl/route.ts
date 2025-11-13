import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { source_id } = await request.json();

    if (!source_id) {
      return NextResponse.json(
        { success: false, error: 'source_id is required' },
        { status: 400 }
      );
    }

    const checkQuery = `SELECT * FROM web_sources WHERE id = $1 AND is_active = true`;
    const checkResult = await pool.query(checkQuery, [source_id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Web source not found or inactive' },
        { status: 404 }
      );
    }

    const source = checkResult.rows[0];
    
    const logQuery = `
      INSERT INTO ai_crawl_logs (source_id, status, started_at)
      VALUES ($1, 'pending', CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    const logResult = await pool.query(logQuery, [source_id]);

    return NextResponse.json({
      success: true,
      message: `Crawl triggered for ${source.source_name}`,
      data: {
        crawl_log_id: logResult.rows[0].id,
        source_name: source.source_name,
        source_url: source.source_url
      }
    });
  } catch (error) {
    console.error('Error triggering crawl:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger crawl' },
      { status: 500 }
    );
  }
}
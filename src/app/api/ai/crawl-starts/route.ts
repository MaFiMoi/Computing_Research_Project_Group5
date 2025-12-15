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

    const query = `
      INSERT INTO ai_crawl_logs (
        source_id,
        status,
        started_at
      )
      VALUES ($1, 'running', CURRENT_TIMESTAMP)
      RETURNING id, started_at;
    `;

    const result = await pool.query(query, [source_id]);
    const crawlLog = result.rows[0];

    await pool.query(
      `UPDATE web_sources SET last_crawled_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [source_id]
    );

    return NextResponse.json({
      success: true,
      data: {
        crawl_log_id: crawlLog.id,
        started_at: crawlLog.started_at
      }
    });
  } catch (error) {
    console.error('Error starting crawl:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start crawl' },
      { status: 500 }
    );
  }
}
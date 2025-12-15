import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const source_id = searchParams.get('source_id');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        acl.*,
        ws.source_name,
        ws.source_url,
        ws.priority
      FROM ai_crawl_logs acl
      LEFT JOIN web_sources ws ON acl.source_id = ws.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (source_id) {
      query += ` AND acl.source_id = $${paramIndex}`;
      params.push(source_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND acl.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY acl.started_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    const statsQuery = `
      SELECT 
        COUNT(*) as total_crawls,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        SUM(numbers_found) as total_numbers_found,
        SUM(numbers_added) as total_numbers_added,
        AVG(crawl_duration) as avg_duration
      FROM ai_crawl_logs
      WHERE started_at >= CURRENT_DATE - INTERVAL '30 days';
    `;

    const statsResult = await pool.query(statsQuery);

    return NextResponse.json({
      success: true,
      data: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI logs' },
      { status: 500 }
    );
  }
}
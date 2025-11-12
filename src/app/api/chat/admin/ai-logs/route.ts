import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        acl.*,
        ws.source_name,
        ws.source_url
      FROM ai_crawl_logs acl
      LEFT JOIN web_sources ws ON acl.source_id = ws.id
      ORDER BY acl.started_at DESC
      LIMIT 50;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI logs' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        ws.*,
        COUNT(acl.id) as total_crawls,
        SUM(acl.numbers_found) as total_numbers_found
      FROM web_sources ws
      LEFT JOIN ai_crawl_logs acl ON ws.id = acl.source_id
      GROUP BY ws.id
      ORDER BY ws.priority DESC;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch web sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { source_name, source_url, crawl_frequency, priority } = await request.json();

    const query = `
      INSERT INTO web_sources (source_name, source_url, crawl_frequency, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      source_name,
      source_url,
      crawl_frequency,
      priority
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add web source' },
      { status: 500 }
    );
  }
}
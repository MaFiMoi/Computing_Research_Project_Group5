import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        ws.*,
        COUNT(DISTINCT acl.id) as total_crawls,
        SUM(acl.numbers_found) as total_numbers_found,
        AVG(acl.crawl_duration) as avg_duration,
        MAX(acl.completed_at) as last_crawl,
        COUNT(acl.id) FILTER (WHERE acl.status = 'success') as successful_crawls,
        COUNT(acl.id) FILTER (WHERE acl.status = 'failed') as failed_crawls
      FROM web_sources ws
      LEFT JOIN ai_crawl_logs acl ON ws.id = acl.source_id
      GROUP BY ws.id
      ORDER BY ws.priority DESC, ws.created_at DESC;
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

    if (!source_name || !source_url) {
      return NextResponse.json(
        { success: false, error: 'source_name and source_url are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO web_sources (
        source_name, 
        source_url, 
        crawl_frequency, 
        priority,
        is_active
      )
      VALUES ($1, $2, $3, $4, true)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      source_name,
      source_url,
      crawl_frequency || 'daily',
      priority || 3
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Web source added successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add web source' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, is_active, priority, crawl_frequency } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE web_sources
      SET 
        is_active = COALESCE($2, is_active),
        priority = COALESCE($3, priority),
        crawl_frequency = COALESCE($4, crawl_frequency)
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id, 
      is_active, 
      priority, 
      crawl_frequency
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Web source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Web source updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update web source' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const query = `DELETE FROM web_sources WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Web source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Web source deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete web source' },
      { status: 500 }
    );
  }
}
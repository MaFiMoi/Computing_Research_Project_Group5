import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        r.*,
        u.name as reporter_name,
        u.email as reporter_email
      FROM reports r
      LEFT JOIN users u ON r.reported_by = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ` AND r.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { reportId, status, adminId } = await request.json();

    const query = `
      UPDATE reports
      SET 
        status = $1,
        reviewed_by = $2,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    const result = await pool.query(query, [status, adminId, reportId]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        u.last_login,
        u.is_active,
        COUNT(DISTINCT pc.id) as total_checks,
        COUNT(DISTINCT r.id) as total_reports
      FROM users u
      LEFT JOIN phone_checks pc ON u.id = pc.user_id
      LEFT JOIN reports r ON u.id = r.reported_by
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
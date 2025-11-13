import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET() {
  try {
    // Lấy thống kê tổng quan
    const statsQuery = `SELECT * FROM admin_overview_stats;`;
    const statsResult = await pool.query(statsQuery);

    // Lấy thống kê theo ngày
    const dailyQuery = `SELECT * FROM get_daily_stats(7);`;
    const dailyResult = await pool.query(dailyQuery);

    return NextResponse.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        daily: dailyResult.rows
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
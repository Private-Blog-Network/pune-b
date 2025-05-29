// app/api/dashboard/student-count-by-course/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT course AS name, COUNT(*) AS count
      FROM students
      GROUP BY course
      ORDER BY count DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error counting students by course:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to count students by course' },
      { status: 500 }
    );
  }
}

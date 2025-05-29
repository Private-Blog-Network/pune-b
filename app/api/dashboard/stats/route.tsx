// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [courses]: any = await db.query('SELECT COUNT(*) AS count FROM courses');
    const [students]: any = await db.query('SELECT COUNT(*) AS count FROM students');
    const [standards]: any = await db.query('SELECT COUNT(*) AS count FROM standards');
    const [teachers]: any = await db.query('SELECT COUNT(*) AS count FROM teachers');

    return NextResponse.json({
      success: true,
      data: {
        courses: courses[0].count,
        students: students[0].count,
        standards: standards[0].count,
        teachers: teachers[0].count,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

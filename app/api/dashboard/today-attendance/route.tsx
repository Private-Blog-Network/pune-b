// app/api/dashboard/today-attendance/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Get total students per course
    const [students]: any = await db.query(`
      SELECT course AS name, COUNT(*) AS total
      FROM students
      GROUP BY course
    `);

    // 2. Get today's attendance count per course
    const [attendedToday]: any = await db.query(`
      SELECT course AS name, COUNT(DISTINCT student_id) AS presentToday
      FROM attendance
      WHERE date = ?
      GROUP BY course
    `, [today]);

    // Map today's attendance for quick lookup
    const attendanceMap: Record<string, number> = {};
    attendedToday.forEach((row: any) => {
      attendanceMap[row.name] = row.presentToday;
    });

    // 3. Merge and compute attendanceLeft
    const result = students.map((row: any) => {
      const present = attendanceMap[row.name] || 0;
      return {
        name: row.name,
        attendanceLeft: Math.max(0, row.total - present),
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in today attendance analytics:', error);
    return NextResponse.json({ success: false, message: 'Error occurred' }, { status: 500 });
  }
}

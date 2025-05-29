import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teacher_id, courses, subjects, days } = body;

    if (!teacher_id || !Array.isArray(courses) || !Array.isArray(subjects) || !Array.isArray(days)) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    // Ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teacher_timetables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT UNIQUE NOT NULL,
        timetable JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Construct timetable object
    const timetable = {
      courses,
      subjects, // already in format: [{ subject, start_time, end_time }]
      days
    };

    // Insert or update (UPSERT)
    const [result] = await connection.query(
      `
        INSERT INTO teacher_timetables (teacher_id, timetable)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE timetable = VALUES(timetable)
      `,
      [teacher_id, JSON.stringify(timetable)]
    );

    return NextResponse.json({ message: 'Timetable saved successfully!' });
  } catch (error) {
    console.error('Error saving timetable:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

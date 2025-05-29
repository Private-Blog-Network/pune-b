import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

const createAttendanceTableIfNotExists = async () => {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course VARCHAR(100) NOT NULL,
      student_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('present', 'absent') NOT NULL,
      UNIQUE KEY unique_attendance (course, student_id, date)
    );
  `);
};

// GET: fetch students and attendance
export async function GET(req: NextRequest) {
  try {
    await createAttendanceTableIfNotExists();

    const { searchParams } = req.nextUrl;
    const course = searchParams.get('course');
    const date = searchParams.get('date');

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course is required' }, { status: 400 });
    }

    const [students] = await connection.execute(
      'SELECT id, name FROM students WHERE course = ?',
      [course]
    );

    let records = [];

    if (date) {
      const [attendance] = await connection.execute(
        'SELECT student_id, status FROM attendance WHERE course = ? AND date = ?',
        [course, date]
      );
      records = attendance;
    }

    return NextResponse.json({ success: true, students, records });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ success: false, message: 'Server error while fetching data' }, { status: 500 });
  }
}

// POST: save or update attendance
export async function POST(req: NextRequest) {
  try {
    await createAttendanceTableIfNotExists();

    const { course, date, records } = await req.json();

    if (!course || !date || !records || typeof records !== 'object') {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const entries = Object.entries(records); // [[studentId, 'present'], ...]

    for (const [studentId, status] of entries) {
      const [existing] = await connection.execute(
        'SELECT id FROM attendance WHERE course = ? AND student_id = ? AND date = ?',
        [course, studentId, date]
      );

      if ((existing as any[]).length > 0) {
        await connection.execute(
          'UPDATE attendance SET status = ? WHERE course = ? AND student_id = ? AND date = ?',
          [status, course, studentId, date]
        );
      } else {
        await connection.execute(
          'INSERT INTO attendance (course, student_id, date, status) VALUES (?, ?, ?, ?)',
          [course, studentId, date, status]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Attendance saved successfully' });
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ success: false, message: 'Server error while saving attendance' }, { status: 500 });
  }
}

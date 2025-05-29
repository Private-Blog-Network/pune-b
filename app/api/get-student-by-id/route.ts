// app/api/get-student-by-id/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // import connection pool

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 });
    }

    const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);

    const student = (rows as any[])[0];

    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 });
  }
}

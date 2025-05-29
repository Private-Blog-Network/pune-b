import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

// GET all courses
export async function GET(req: NextRequest) {
  try {
    const [rows] = await connection.execute('SELECT * FROM courses ORDER BY name ASC');
    return NextResponse.json({ success: true, courses: rows });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch courses' }, { status: 500 });
  }
}

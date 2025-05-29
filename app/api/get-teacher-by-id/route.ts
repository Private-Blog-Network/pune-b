import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

// GET /api/get-teacher-by-id?id=123
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Teacher ID is required' }, { status: 400 });
    }

    const [rows] = await connection.execute('SELECT * FROM teachers WHERE id = ?', [id]);

    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json({ success: true, teacher: rows[0] });
    } else {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    return NextResponse.json({ success: false, message: 'Server error fetching teacher' }, { status: 500 });
  }
}

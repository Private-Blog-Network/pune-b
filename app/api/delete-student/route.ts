import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // your MySQL db connection

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 });
    }

    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);

    // Optional: check if any row was actually deleted
    const { affectedRows } = (result as any);

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 });
  }
}

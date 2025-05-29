import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db'; // adjust to your DB instance path

// GET: /api/manage-timetable?teacher_id=1
export async function GET(req: NextRequest) {
  const teacherId = req.nextUrl.searchParams.get('teacher_id');

  if (!teacherId) {
    return NextResponse.json({ error: 'Missing teacher_id' }, { status: 400 });
  }

  try {
    const [rows] = await connection.query(
      `SELECT * FROM teacher_timetables WHERE teacher_id = ?`,
      [teacherId]
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    console.error('Error fetching timetable:', err);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}

// DELETE: /api/manage-timetable?id=1
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing timetable entry id' }, { status: 400 });
  }

  try {
    await connection.query('DELETE FROM teacher_timetables WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Timetable entry deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error deleting timetable entry:', err);
    return NextResponse.json({ error: 'Failed to delete timetable entry' }, { status: 500 });
  }
}

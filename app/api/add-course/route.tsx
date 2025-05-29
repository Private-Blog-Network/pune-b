import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

// Ensure the courses table exists
async function ensureCourseTableExists() {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      duration_months INT NOT NULL,
      fee_inr DECIMAL(10,2) NOT NULL,
      subjects JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Add a new course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, duration, fee, subjects } = body;

    if (
      !name ||
      typeof Number(duration) !== 'number' ||
      typeof Number(fee) !== 'number' ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
    }

    await ensureCourseTableExists();

    // Check for duplicate course
    const [existing] = await connection.execute(
      'SELECT id FROM courses WHERE name = ?',
      [name.trim()]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Course with this name already exists' },
        { status: 400 }
      );
    }

    // Insert course with JSON-encoded subjects
    await connection.execute(
      'INSERT INTO courses (name, duration_months, fee_inr, subjects) VALUES (?, ?, ?, ?)',
      [name.trim(), duration, fee, JSON.stringify(subjects)]
    );

    return NextResponse.json({ success: true, message: 'Course added successfully' });
  } catch (error: any) {
    console.error('Add Course Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add course' },
      { status: 500 }
    );
  }
}

// View all courses
export async function GET(req: NextRequest) {
  try {
    const [courses] = await connection.execute('SELECT * FROM courses');
    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error('Get Courses Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// Update an existing course by ID
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, duration, fee, subjects } = body;

    if (
      !id ||
      !name ||
      typeof Number(duration) !== 'number' ||
      typeof Number(fee) !== 'number' ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
    }

    await ensureCourseTableExists();

    // Update the course
    await connection.execute(
      'UPDATE courses SET name = ?, duration_months = ?, fee_inr = ?, subjects = ? WHERE id = ?',
      [name.trim(), duration, fee, JSON.stringify(subjects), id]
    );

    return NextResponse.json({ success: true, message: 'Course updated successfully' });
  } catch (error: any) {
    console.error('Update Course Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}

// Delete a course by ID
// Delete a course by ID
export async function DELETE(req: NextRequest) {
    try {
      const { searchParams } = req.nextUrl;
      const id = searchParams.get('id');
  
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ success: false, message: 'Invalid course ID' }, { status: 400 });
      }
  
      await ensureCourseTableExists();
  
      // Delete the course
      const result = await connection.execute('DELETE FROM courses WHERE id = ?', [id]);
  
      if ((result as any).affectedRows === 0) {
        return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, message: 'Course deleted successfully' });
    } catch (error: any) {
      console.error('Delete Course Error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to delete course' },
        { status: 500 }
      );
    }
  }
  

import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Standard name is required and must be a string' }, { status: 400 });
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS standards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [result]: any = await connection.execute(
      'INSERT INTO standards (name) VALUES (?)',
      [name.trim()]
    );

    return NextResponse.json({ message: 'Standard added successfully', standardId: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name } = await req.json();

    if (!id || !name || typeof name !== 'string') {
      return NextResponse.json({ error: 'ID and valid name are required' }, { status: 400 });
    }

    const [result]: any = await connection.execute(
      'UPDATE standards SET name = ? WHERE id = ?',
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Standard not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Standard updated successfully' });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const [result]: any = await connection.execute(
      'DELETE FROM standards WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Standard not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Standard deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// NEW GET ROUTE TO FETCH STANDARDS
export async function GET(req: NextRequest) {
  try {
    const [standards]: any = await connection.execute('SELECT * FROM standards');

    return NextResponse.json({ standards });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search')?.trim() || '';

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let query = `SELECT id, name, email, phone, address, photo_url AS photo FROM students`;
    let countQuery = `SELECT COUNT(*) AS total FROM students`;
    const queryParams: any[] = [];

    if (search !== '') {
      query += ` WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?`;
      countQuery += ` WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?`;
      const searchValue = `%${search}%`;
      queryParams.push(searchValue, searchValue, searchValue, searchValue);
    }

    query += ` LIMIT ${limitNumber} OFFSET ${offset}`;

    const [students] = await connection.execute(query, queryParams);
    const [totalCountResult] = await connection.execute(countQuery, queryParams);

    const totalCount = (totalCountResult as any)[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limitNumber);

    return NextResponse.json({ success: true, students, totalPages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

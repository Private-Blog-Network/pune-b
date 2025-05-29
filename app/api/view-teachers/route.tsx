import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search')?.trim() || '';

    const offset = (page - 1) * limit;

    let query = `SELECT id, name, email, phone, address, photo_url FROM teachers`;
    let countQuery = `SELECT COUNT(*) AS total FROM teachers`;
    const queryParams: any[] = [];

    if (search !== '') {
      query += ` WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?`;
      countQuery += ` WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?`;
      const likeSearch = `%${search}%`;
      queryParams.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [teachers] = await connection.execute(query, queryParams);
    const [countResult] = await connection.execute(countQuery, queryParams);

    const totalCount = (countResult as any)[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ success: true, teachers, totalPages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

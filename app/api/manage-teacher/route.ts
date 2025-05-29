import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

// Update teacher by ID
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;

    if (!id || id.trim() === '') {
      return NextResponse.json({ success: false, message: 'Teacher ID is required' }, { status: 400 });
    }

    const fieldsToUpdate: Record<string, any> = {};
    const textFields = ['name', 'dob', 'email', 'phone', 'address', 'department', 'subject'];

    // Collect non-empty text fields
    for (const field of textFields) {
      const value = formData.get(field);
      console.log(value,"this is val")
      if (typeof value === 'string' && value.trim() !== '') {
        fieldsToUpdate[field] = value.trim();
      }
    }

    // Handle optional photo upload
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && typeof photoFile === 'object' && photoFile.size > 0) {
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      const photoUrl = await uploadToGoogleDrive(photoBuffer, photoFile.name, photoFile.type);
      fieldsToUpdate['photo_url'] = photoUrl;
    }

    // Handle optional document upload
    const documentFile = formData.get('document') as File | null;
    if (documentFile && typeof documentFile === 'object' && documentFile.size > 0) {
      const documentBuffer = Buffer.from(await documentFile.arrayBuffer());
      const documentUrl = await uploadToGoogleDrive(documentBuffer, documentFile.name, documentFile.type);
      fieldsToUpdate['document_url'] = documentUrl;
    }

    // Debugging logs
    console.log('Updating teacher ID:', id);
    console.log('Fields to update:', fieldsToUpdate);

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields provided to update' }, { status: 400 });
    }

    const updateKeys = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    const query = `UPDATE teachers SET ${updateKeys} WHERE id = ?`;
    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Teacher not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Teacher updated successfully!' });
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ success: false, message: 'Server error while updating teacher' }, { status: 500 });
  }
}

// Delete teacher by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Teacher ID is required' }, { status: 400 });
    }

    const [result] = await connection.execute('DELETE FROM teachers WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ success: false, message: 'Server error while deleting teacher' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  try {
    // Parse FormData from the request
    const formData = await req.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Student ID is required' }, { status: 400 });
    }

    const fieldsToUpdate: Record<string, any> = {};

    // Supported text fields
    const textFields = [
      'name', 'dob','standard', 'email', 'phone', 'address',
      'state', 'district', 'taluka', 'pincode', 'course',
      'father_name', 'mother_name', 'guardian_phone',
    ];

    // Extract text fields from FormData
    textFields.forEach((field) => {
      const value = formData.get(field);
      if (value && typeof value === 'string' && value.trim() !== '') {
        fieldsToUpdate[field] = value.trim();
      }
    });

    // Handle photo upload (if exists)
    const photoFile = formData.get('photo') as File;
    if (photoFile && photoFile.size > 0) {
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      const photoUrl = await uploadToGoogleDrive(photoBuffer, photoFile.name, photoFile.type);
      fieldsToUpdate['photo_url'] = photoUrl;
    }

    // Handle document upload (if exists)
    const documentFile = formData.get('document') as File;
    if (documentFile && documentFile.size > 0) {
      const documentBuffer = Buffer.from(await documentFile.arrayBuffer());
      const documentUrl = await uploadToGoogleDrive(documentBuffer, documentFile.name, documentFile.type);
      fieldsToUpdate['document_url'] = documentUrl;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields provided to update' }, { status: 400 });
    }

    // Prepare SQL update query
    const updateKeys = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    const query = `UPDATE students SET ${updateKeys} WHERE id = ?`;
    console.log(query)
    const [result] = await connection.execute(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Student not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Student updated successfully!' });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ success: false, message: 'Server error while updating student' }, { status: 500 });
  }
}

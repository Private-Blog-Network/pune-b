import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';
import { uploadToGoogleDrive } from '@/lib/googleDrive';

export async function POST(req: NextRequest) {
  try {
    // Create students table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        dob DATE,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        state VARCHAR(100),
        district VARCHAR(100),
        taluka VARCHAR(100),
        pincode VARCHAR(10),
        course VARCHAR(100),
        standard VARCHAR(100),
        father_name VARCHAR(255),
        mother_name VARCHAR(255),
        guardian_phone VARCHAR(20),
        photo_url VARCHAR(255),
        document_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get the form data fields
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const state = formData.get('state') as string;
    const district = formData.get('district') as string;
    const taluka = formData.get('taluka') as string;
    const pincode = formData.get('pincode') as string;
    const course = formData.get('course') as string;
    const standard = formData.get('standard') as string;
    const fatherName = formData.get('father_name') as string;
    const motherName = formData.get('mother_name') as string;
    const guardianPhone = formData.get('guardian_phone') as string;

    // Get photo and document files
    const photoFile = formData.get('photo') as File;
    const documentFile = formData.get('document') as File;

    // Upload Photo to Google Drive
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
    const photoUrl = await uploadToGoogleDrive(photoBuffer, photoFile.name, photoFile.type);

    // Upload Document to Google Drive
    const documentBuffer = Buffer.from(await documentFile.arrayBuffer());
    const documentUrl = await uploadToGoogleDrive(documentBuffer, documentFile.name, documentFile.type);

    // Insert student details into the database
    const [result] = await connection.execute(
      `INSERT INTO students (name, dob, email, phone, address, state, district, taluka, pincode, course, standard, father_name, mother_name, guardian_phone, photo_url, document_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        dob,
        email,
        phone,
        address,
        state,
        district,
        taluka,
        pincode,
        course,
        standard,
        fatherName,
        motherName,
        guardianPhone,
        photoUrl,
        documentUrl,
      ]
    );

    return NextResponse.json({ success: true, message: 'Student added successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to add student' }, { status: 500 });
  }
}

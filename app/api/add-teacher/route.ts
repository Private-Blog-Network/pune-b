import { NextRequest, NextResponse } from 'next/server';
import connection from '@/lib/db';
import { uploadToGoogleDrive } from '@/lib/googleDrive';
import * as yup from 'yup';

// Define backend validation schema
const teacherSchema = yup.object().shape({
  name: yup.string().required(),
  dob: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  address: yup.string().required(),
  department: yup.string().required(),
  subject: yup.string().required(),
});

export async function POST(req: NextRequest) {
  try {
    // Create teachers table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        dob DATE,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        department VARCHAR(100),
        subject VARCHAR(100),
        photo_url VARCHAR(255),
        document_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Parse form data
    const formData = await req.formData();
    const fields = {
      name: formData.get('name') as string,
      dob: formData.get('dob') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      department: formData.get('department') as string,
      subject: formData.get('subject') as string,
    };

    // Validate input data
    await teacherSchema.validate(fields);

    // Handle optional files
    const photoFile = formData.get('photo') as File | null;
    const documentFile = formData.get('document') as File | null;

    let photoUrl = '';
    let documentUrl = '';

    if (photoFile && photoFile.name) {
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      photoUrl = await uploadToGoogleDrive(photoBuffer, photoFile.name, photoFile.type);
    }

    if (documentFile && documentFile.name) {
      const documentBuffer = Buffer.from(await documentFile.arrayBuffer());
      documentUrl = await uploadToGoogleDrive(documentBuffer, documentFile.name, documentFile.type);
    }

    // Save teacher to DB
    await connection.execute(
      `INSERT INTO teachers 
       (name, dob, email, phone, address, department, subject, photo_url, document_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fields.name,
        fields.dob,
        fields.email,
        fields.phone,
        fields.address,
        fields.department,
        fields.subject,
        photoUrl,
        documentUrl,
      ]
    );

    return NextResponse.json({ success: true, message: 'Teacher added successfully!' });
  } catch (error: any) {
    console.error(error);

    const message =
      error.name === 'ValidationError'
        ? `Validation Error: ${error.message}`
        : 'Failed to add teacher';

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const [rows] = await connection.execute("SELECT * FROM teachers");
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
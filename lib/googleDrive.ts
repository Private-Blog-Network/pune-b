import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadToGoogleDrive(fileBuffer: Buffer, filename: string, mimeType: string) {
  const bufferStream = Readable.from(fileBuffer); // Convert Buffer to a Readable stream

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      mimeType,
    },
    media: {
      mimeType,
      body: bufferStream, // Use the readable stream here
    },
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error("Failed to upload file");

  // Make it publicly accessible
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return `https://drive.google.com/uc?id=${fileId}`;
}

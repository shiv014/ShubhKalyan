import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a Buffer to Cloudinary using base64
async function uploadToCloudinary(buffer, mimeType, folder = 'shubhkalyan') {
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'video', // Cloudinary uses 'video' for all audio/video files
  });
  return result;
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Uploaded file is not an audio file' }, { status: 400 });
    }

    // Convert to Buffer then upload via base64 to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await uploadToCloudinary(buffer, file.type, 'shubhkalyan/audio');

    const fileUrl = uploadResult.secure_url;

    // Update the event's audio_path
    await db.run(
      'UPDATE events SET audio_path = ? WHERE id = ?',
      [fileUrl, event.id]
    );

    return NextResponse.json({
      message: 'Audio uploaded successfully',
      fileUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}

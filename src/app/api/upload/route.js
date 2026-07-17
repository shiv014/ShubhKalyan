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

// Upload a Buffer to Cloudinary using base64 (works reliably on Vercel serverless)
async function uploadToCloudinary(buffer, mimeType, folder = 'shubhkalyan') {
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
  return result;
}

// Tell Next.js not to parse the body — we handle it via formData()
export const config = {
  api: { bodyParser: false },
};

// Handle photo upload
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
    const caption = formData.get('caption') || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image' }, { status: 400 });
    }

    // Convert to Buffer then upload via base64 to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await uploadToCloudinary(buffer, file.type, 'shubhkalyan');

    const fileUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    // Save to database
    const result = await db.run(
      'INSERT INTO photos (event_id, file_path, public_id, caption) VALUES (?, ?, ?, ?)',
      [event.id, fileUrl, publicId, caption]
    );

    return NextResponse.json({
      message: 'Photo uploaded successfully',
      photo: {
        id: result.lastID,
        file_path: fileUrl,
        caption
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status: 500 });
  }
}

// Handle photo deletion
export async function DELETE(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const photo = await db.get(
      'SELECT * FROM photos WHERE id = ? AND event_id = ?',
      [photoId, event.id]
    );
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete from database first
    await db.run('DELETE FROM photos WHERE id = ?', [photoId]);

    // Delete from Cloudinary using stored public_id
    if (photo.public_id) {
      try {
        await cloudinary.uploader.destroy(photo.public_id);
      } catch (e) {
        console.warn('Could not delete from Cloudinary:', e.message);
      }
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

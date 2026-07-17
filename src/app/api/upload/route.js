import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

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

    // Verify it is a basic image format
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file is not an image' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExtension}`;
    
    // Save directory: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/${filename}`;

    // Save in database
    const result = await db.run(
      'INSERT INTO photos (event_id, file_path, caption) VALUES (?, ?, ?)',
      [event.id, relativePath, caption]
    );

    return NextResponse.json({
      message: 'Photo uploaded successfully',
      photo: {
        id: result.lastID,
        file_path: relativePath,
        caption
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
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

    const photo = await db.get('SELECT * FROM photos WHERE id = ? AND event_id = ?', [photoId, event.id]);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete photo record from DB
    await db.run('DELETE FROM photos WHERE id = ?', [photoId]);

    // Delete the file from the disk
    try {
      const absolutePath = path.join(process.cwd(), 'public', photo.file_path);
      await unlink(absolutePath);
    } catch (e) {
      console.warn('File not found on disk, but removed from database');
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

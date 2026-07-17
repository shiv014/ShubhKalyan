import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filePath } = await req.json();
    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    const db = await getDb();
    const event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Reset existing cover photos
    await db.run('UPDATE photos SET is_cover = 0 WHERE event_id = ?', [event.id]);

    // Check if this stock photo is already in their gallery
    let photo = await db.get(
      'SELECT id FROM photos WHERE event_id = ? AND file_path = ?',
      [event.id, filePath]
    );

    if (photo) {
      // Just set it as cover
      await db.run('UPDATE photos SET is_cover = 1 WHERE id = ?', [photo.id]);
    } else {
      // Insert new
      const result = await db.run(
        'INSERT INTO photos (event_id, file_path, caption, is_cover) VALUES (?, ?, ?, 1)',
        [event.id, filePath, 'Theme Background']
      );
      photo = { id: result.lastID };
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        file_path: filePath,
        caption: 'Theme Background',
        is_cover: 1
      }
    });
  } catch (error) {
    console.error('Stock cover error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

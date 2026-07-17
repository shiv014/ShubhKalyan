import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const photo = await db.get(
      'SELECT id FROM photos WHERE id = ? AND event_id = ?',
      [photoId, event.id]
    );

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Reset all covers for this event to 0
    await db.run('UPDATE photos SET is_cover = 0 WHERE event_id = ?', [event.id]);
    
    // Set the selected photo to 1
    await db.run('UPDATE photos SET is_cover = 1 WHERE id = ?', [photoId]);

    return NextResponse.json({ success: true, message: 'Cover photo updated' });
  } catch (error) {
    console.error('Update cover error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

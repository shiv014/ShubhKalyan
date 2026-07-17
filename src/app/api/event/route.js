import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Fetch the user's event, photos, and RSVPs
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // Fetch the event
    let event = await db.get('SELECT * FROM events WHERE user_id = ?', [user.id]);

    // If no event exists yet, create a default draft event
    if (!event) {
      await db.run(
        'INSERT INTO events (user_id, template_id, status) VALUES (?, ?, ?)',
        [user.id, 'tpl-1', 'draft']
      );
      event = await db.get('SELECT * FROM events WHERE user_id = ?', [user.id]);
    }

    // Fetch photos
    const photos = await db.all('SELECT * FROM photos WHERE event_id = ? ORDER BY id DESC', [event.id]);

    // Fetch RSVPs
    const rsvps = await db.all('SELECT * FROM rsvps WHERE event_id = ? ORDER BY id DESC', [event.id]);

    return NextResponse.json({ event, photos, rsvps });
  } catch (error) {
    console.error('Error fetching event data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update the user's event details
export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, brideName, groomName, eventDate, venue, venueLat, venueLng, audioPath } = await req.json();

    const db = await getDb();

    // Check if event exists
    let event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update details
    await db.run(
      'UPDATE events SET template_id = ?, bride_name = ?, groom_name = ?, event_date = ?, venue = ?, venue_lat = ?, venue_lng = ?, audio_path = ? WHERE user_id = ?',
      [templateId, brideName, groomName, eventDate, venue, venueLat, venueLng, audioPath, user.id]
    );

    const updatedEvent = await db.get('SELECT * FROM events WHERE user_id = ?', [user.id]);

    return NextResponse.json({
      message: 'Event details updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

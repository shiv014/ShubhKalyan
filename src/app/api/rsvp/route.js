import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public endpoint to submit an RSVP
export async function POST(req) {
  try {
    const { eventId, name, email, attending, guestsCount, message } = await req.json();

    if (!eventId || !name) {
      return NextResponse.json({ error: 'Event ID and guest name are required' }, { status: 400 });
    }

    const isAttending = attending === 1 || attending === true ? 1 : 0;
    const finalGuestsCount = isAttending ? (parseInt(guestsCount) || 1) : 0;

    const db = await getDb();

    // Verify the event exists
    const event = await db.get('SELECT id FROM events WHERE id = ?', [eventId]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Insert RSVP
    const result = await db.run(
      `INSERT INTO rsvps (event_id, name, email, attending, guests_count, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, name.trim(), email ? email.trim() : null, isAttending, finalGuestsCount, message ? message.trim() : null]
    );

    return NextResponse.json({
      message: 'RSVP submitted successfully',
      rsvp: {
        id: result.lastID,
        name,
        email,
        attending: isAttending,
        guests_count: finalGuestsCount,
        message
      }
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Private endpoint to delete an RSVP
export async function DELETE(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rsvpId = searchParams.get('id');

    if (!rsvpId) {
      return NextResponse.json({ error: 'RSVP ID is required' }, { status: 400 });
    }

    const db = await getDb();

    // Make sure the event belongs to the logged-in user
    const event = await db.get('SELECT id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify the RSVP belongs to the user's event
    const rsvp = await db.get('SELECT id FROM rsvps WHERE id = ? AND event_id = ?', [rsvpId, event.id]);
    if (!rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    // Delete RSVP
    await db.run('DELETE FROM rsvps WHERE id = ?', [rsvpId]);

    return NextResponse.json({ message: 'RSVP deleted successfully' });
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

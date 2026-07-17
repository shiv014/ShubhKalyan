import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const RESERVED_SLUGS = ['login', 'register', 'dashboard', 'api', 'templates', 'public', 'uploads', 'favicon.ico'];

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await req.json();

    const db = await getDb();

    // Find the user's event
    const event = await db.get('SELECT id, user_id FROM events WHERE user_id = ?', [user.id]);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Case 1: Taking event offline (removing URL)
    if (!slug || slug.trim() === '') {
      await db.run(
        "UPDATE events SET slug = NULL, status = 'draft' WHERE id = ?",
        [event.id]
      );
      return NextResponse.json({
        message: 'Your wedding page is now offline.',
        slug: null,
        status: 'draft'
      });
    }

    // Case 2: Claiming/Renaming URL
    // Sanitize slug: lowercase, letters, numbers, and hyphens only
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '') // remove special characters except hyphens
      .replace(/-+/g, '-');       // collapse multiple hyphens

    if (cleanSlug.length < 3) {
      return NextResponse.json(
        { error: 'URL endpoint must be at least 3 alphanumeric characters long' },
        { status: 400 }
      );
    }

    // Check reserved keywords
    if (RESERVED_SLUGS.includes(cleanSlug)) {
      return NextResponse.json(
        { error: 'This URL is a reserved keyword. Please choose another one.' },
        { status: 400 }
      );
    }

    // Check if slug is already taken by someone else
    const conflictingEvent = await db.get(
      'SELECT id FROM events WHERE slug = ? AND user_id != ?',
      [cleanSlug, user.id]
    );

    if (conflictingEvent) {
      return NextResponse.json(
        { error: 'This URL is already taken. Please try another one.' },
        { status: 409 }
      );
    }

    // Update slug and publish event
    await db.run(
      "UPDATE events SET slug = ?, status = 'published' WHERE id = ?",
      [cleanSlug, event.id]
    );

    return NextResponse.json({
      message: 'URL updated and website published successfully!',
      slug: cleanSlug,
      status: 'published'
    });
  } catch (error) {
    console.error('Error claiming URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

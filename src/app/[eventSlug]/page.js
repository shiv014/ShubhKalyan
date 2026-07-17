import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getTemplateById } from '@/lib/templates';
import TemplateRenderer from '@/components/TemplateRenderer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { eventSlug } = await params;
  
  const db = await getDb();
  const event = await db.get("SELECT bride_name, groom_name FROM events WHERE slug = ? AND status = 'published'", [eventSlug]);
  
  if (!event) {
    return {
      title: 'Page Not Found | ShubhKalyan',
    };
  }

  const bride = event.bride_name || 'Bride';
  const groom = event.groom_name || 'Groom';

  return {
    title: `The Wedding of ${bride} & ${groom} | ShubhKalyan`,
    description: `You are cordially invited to celebrate the union of ${bride} and ${groom}. View invitation details and RSVP online.`,
  };
}

export default async function LiveEventPage({ params }) {
  const { eventSlug } = await params;

  const db = await getDb();

  // Find the published event with this slug
  const event = await db.get(
    "SELECT * FROM events WHERE slug = ? AND status = 'published'",
    [eventSlug]
  );

  if (!event) {
    notFound();
  }

  // Get template details
  const template = getTemplateById(event.template_id);
  if (!template) {
    notFound();
  }

  // Fetch photos
  const photos = await db.all(
    "SELECT * FROM photos WHERE event_id = ? ORDER BY id DESC",
    [event.id]
  );

  return (
    <main>
      <TemplateRenderer 
        event={event} 
        template={template} 
        photos={photos} 
        previewMode={false} 
      />
    </main>
  );
}

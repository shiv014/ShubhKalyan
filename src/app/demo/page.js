import TemplateRenderer from '@/components/TemplateRenderer';
import { getTemplateById } from '@/lib/templates';

export const metadata = {
  title: 'Live Wedding Invitation Demo | ShubhKalyan',
  description: 'View a live sample of a premium wedding invitation website created with ShubhKalyan.',
};

export default function DemoPage() {
  const mockEvent = {
    id: 9999,
    bride_name: 'Alice',
    groom_name: 'Bob',
    event_date: '2026-10-10T16:00:00',
    venue: 'Grand Palace, Colaba, Mumbai, India',
    venue_lat: '18.9220',
    venue_lng: '72.8347',
    audio_path: '/audio/shehnai-short.m4a',
    status: 'published',
  };

  const mockTemplate = getTemplateById('tpl-1') || {
    id: 'tpl-1',
    name: 'Royal Crimson & Gold',
    category: 'Royal',
    layout: 'royal',
    primaryColor: '#7c2230',
    secondaryColor: '#d4af37',
    bgColor: '#fbf9f5',
    textColor: '#1a1a1a',
    accentColor: '#f3e6c9',
    fontTitle: 'var(--font-serif)',
    fontBody: 'var(--font-sans)',
    fontNames: 'var(--font-cursive)',
  };

  const mockPhotos = [
    { id: 1, file_path: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', caption: 'Our Engagement' },
    { id: 2, file_path: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=800&q=80', caption: 'Pre-wedding Shoot' },
    { id: 3, file_path: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80', caption: 'Mehendi Ceremony' },
    { id: 4, file_path: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=80', caption: 'Haldi Fun' },
  ];

  return (
    <main>
      <TemplateRenderer 
        event={mockEvent} 
        template={mockTemplate} 
        photos={mockPhotos} 
        previewMode={true} 
      />
    </main>
  );
}

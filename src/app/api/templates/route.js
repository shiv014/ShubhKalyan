import { NextResponse } from 'next/server';
import { searchTemplates } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || 'All';

    const templates = searchTemplates(query, category);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

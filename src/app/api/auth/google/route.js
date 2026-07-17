import { NextResponse } from 'next/server';

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const template = searchParams.get('template') || '';

  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host');
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID is not configured.' }, { status: 500 });
  }

  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.set('client_id', clientId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('response_type', 'code');
  oauthUrl.searchParams.set('scope', 'openid email profile');
  oauthUrl.searchParams.set('access_type', 'offline');
  oauthUrl.searchParams.set('prompt', 'consent');
  
  // Pass the template param in the state so we can redirect to it later
  oauthUrl.searchParams.set('state', JSON.stringify({ template }));

  return NextResponse.redirect(oauthUrl.toString());
}

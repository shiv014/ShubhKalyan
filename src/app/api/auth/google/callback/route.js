import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateStr = searchParams.get('state');

  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host');
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  let template = '';
  if (stateStr) {
    try {
      const stateObj = JSON.parse(stateStr);
      template = stateObj.template || '';
    } catch (e) {
      console.error('Failed to parse state:', e);
    }
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=Google authentication failed or was cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=OAuth configuration missing`);
  }

  try {
    // 1. Exchange auth code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Google token exchange error:', tokenData);
      throw new Error('Failed to exchange Google token');
    }

    const { access_token } = tokenData;

    // 2. Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userRes.json();
    if (!userRes.ok) {
      console.error('Google user info error:', userData);
      throw new Error('Failed to fetch Google user profile');
    }

    const { email, name, id: googleId } = userData;

    // 3. Find or create user in our DB
    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      // Create new user (using empty password since they use OAuth)
      const result = await db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name || email, email, `oauth_google_${googleId}`]
      );
      user = {
        id: result.lastID,
        name: name || email,
        email: email
      };
    }

    // 4. Generate custom JWT token
    const token = signToken({ id: user.id, name: user.name, email: user.email });

    // 5. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // 6. Redirect to dashboard
    const redirectDest = template ? `/dashboard?template=${template}` : '/dashboard';
    return NextResponse.redirect(`${baseUrl}${redirectDest}`);
    
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=Authentication failed. Please try again.`);
  }
}

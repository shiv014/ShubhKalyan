import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { provider } = await req.json();

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid or missing provider' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Create a mock OAuth user profile
    const mockEmail = `oauth_${provider}_test@shubhkalyan.in`;
    const mockName = `Test ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    const mockPassword = 'oauth_mock_password_do_not_use_directly';

    // Find or create the user
    let user = await db.get('SELECT * FROM users WHERE email = ?', [mockEmail]);
    
    if (!user) {
      const result = await db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [mockName, mockEmail, mockPassword]
      );
      user = {
        id: result.lastID,
        name: mockName,
        email: mockEmail
      };
    }

    // Generate JWT token
    const token = signToken({ id: user.id, name: user.name, email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      message: `Successfully authenticated with ${provider}`,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

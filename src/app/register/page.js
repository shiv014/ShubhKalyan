'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  // Session Persistence Check
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push(templateParam ? `/dashboard?template=${templateParam}` : '/dashboard');
        }
      })
      .catch(console.error);
  }, [router, templateParam]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Forward template parameter to dashboard
        router.push(templateParam ? `/dashboard?template=${templateParam}` : '/dashboard');
      } else {
        setError(data.error || 'Failed to register account');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setError('');
    setOauthLoading(provider);

    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });

      const data = await res.json();
      if (res.ok) {
        // Forward template parameter to dashboard
        router.push(templateParam ? `/dashboard?template=${templateParam}` : '/dashboard');
      } else {
        setError(data.error || `Failed to register with ${provider}`);
      }
    } catch (err) {
      console.error(err);
      setError(`OAuth registration error. Please try again.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex-center bg-sand" style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', animation: 'fadeInUp 0.5s ease' }}>
        
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img src="/logo.png" alt="ShubhKalyan Logo" className="brand-logo-large" />
          </Link>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Create an account to build your wedding page
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '0.8rem' }}>
             {error}
          </div>
        )}

        {/* Regular Signup Form */}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Your Name</label>
            <input 
              type="text" 
              id="name" 
              className="form-input" 
              placeholder="e.g. Alice Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="e.g. alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (min 6 characters)</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 0.75rem' }}>or signup with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* OAuth2 Mock buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            type="button"
            onClick={() => {
              window.location.href = templateParam 
                ? `/api/auth/google?template=${encodeURIComponent(templateParam)}` 
                : '/api/auth/google';
            }}
            className="btn btn-outline" 
            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#333' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        {/* Footnote */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link href={templateParam ? `/login?template=${templateParam}` : '/login'} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'underline' }}>
            Log In here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex-center bg-sand" style={{ minHeight: '100vh' }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

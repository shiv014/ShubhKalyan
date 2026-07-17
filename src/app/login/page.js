'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'facebook'
  const [showOauthModal, setShowOauthModal] = useState(null); // 'google' | 'facebook' | null

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Forward template parameter to dashboard
        router.push(templateParam ? `/dashboard?template=${templateParam}` : '/dashboard');
      } else {
        setError(data.error || 'Invalid email or password');
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
        setError(data.error || `Failed to authenticate with ${provider}`);
      }
    } catch (err) {
      console.error(err);
      setError(`OAuth authentication error. Please try again.`);
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
            Login to create your custom wedding website
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '0.8rem' }}>
             {error}
          </div>
        )}

        {/* Regular Credentials Form */}
        <form onSubmit={handleLogin}>
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
            <label className="form-label" htmlFor="password">Password</label>
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
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 0.75rem' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* OAuth2 Mock buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => handleOAuthLogin('google')} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              backgroundColor: '#ffffff', 
              color: '#3c4043', 
              borderColor: '#dadce0',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'google' ? 'Connecting...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.33-1.58-5.04-3.71H.94v2.31C2.42 16.02 5.48 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.96 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V6.95H.94A8.99 8.99 0 0 0 0 9c0 1.95.62 3.79 1.69 5.3l2.27-2.56z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.42 1.98.94 4.96l3.02 2.31C4.67 5.16 6.65 3.58 9 3.58z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleOAuthLogin('facebook')} 
            className="btn btn-secondary" 
            style={{ 
            type="button"
            onClick={() => setShowOauthModal('facebook')}
            className="btn btn-outline" 
            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#333' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </button>
        </div>

        {/* Footnote */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem', marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link href={templateParam ? `/register?template=${templateParam}` : '/register'} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'underline' }}>
            Register here
          </Link>
        </p>

      </div>

      {/* Simulated OAuth Modal */}
      {showOauthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button 
              onClick={() => setShowOauthModal(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
            >
              &times;
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '500', color: '#202124', marginBottom: '0.5rem' }}>
                Sign in with {showOauthModal === 'google' ? 'Google' : 'Facebook'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5f6368' }}>Choose an account to continue to <b>ShubhKalyan</b></div>
            </div>

            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => {
                const provider = showOauthModal;
                setShowOauthModal(null);
                handleOAuthLogin(provider);
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: showOauthModal === 'google' ? '#4285F4' : '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                T
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#3c4043' }}>Test {showOauthModal === 'google' ? 'Google' : 'Facebook'} User</div>
                <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>oauth_test@{showOauthModal}.com</div>
              </div>
            </div>
            
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid #eee', marginTop: '0.5rem', cursor: 'pointer', color: '#5f6368' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Use another account</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-center bg-sand" style={{ minHeight: '100vh' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

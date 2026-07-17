'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Crown, Flower2, Sparkles, ScrollText, Paintbrush, Edit3, Link as LinkIcon, Check, ArrowRight, ArrowDown, X } from 'lucide-react';
import { getTemplates } from '@/lib/templates';

const CATEGORY_COLORS = {
  Royal: { bg: 'rgba(124,34,48,0.08)', color: '#7c2230' },
  Floral: { bg: 'rgba(201,125,128,0.1)', color: '#a85060' },
  Minimalist: { bg: 'rgba(30,30,30,0.07)', color: '#333' },
  Vintage: { bg: 'rgba(171,84,54,0.1)', color: '#ab5436' },
};

const CATEGORY_LABEL = {
  Royal: <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Crown size={14} /> Royal</span>,
  Floral: <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Flower2 size={14} /> Floral</span>,
  Minimalist: <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={14} /> Minimalist</span>,
  Vintage: <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ScrollText size={14} /> Vintage</span>,
};

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedPreviewTpl, setSelectedPreviewTpl] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const allTemplates = getTemplates();

  const filteredTemplates = allTemplates.filter(t => {
    const matchesCategory = category === 'All' || t.category === category;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* ---- NAVBAR ---- */}
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="logo">Shubh<span>Kalyan</span></div>
          <div className="nav-links">
            <a href="#browse" className="nav-link">Templates</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <Link href="/login" className="btn btn-ghost" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>Log In</Link>
            <Link href="/register" className="btn btn-gold" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section style={{
        background: 'linear-gradient(135deg, #1e0a0f 0%, #3d1020 40%, #2a1a35 100%)',
        padding: '5rem 0 4rem',
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Background decorative circles — clipped to section bounds only */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(207,168,48,0.12), transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,34,48,0.25), transparent 70%)' }} />
        </div>

        <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left: Text */}
          <div className="animate-fade-in-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(207,168,48,0.12)', border: '1px solid rgba(207,168,48,0.3)', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cfa830', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#cfa830' }}>Auspicious Weddings, Online</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.2, color: '#ffffff', marginBottom: '1.25rem', fontWeight: '700' }}>
              Your Dream<br />
              <span style={{ background: 'linear-gradient(90deg, #cfa830, #e4c45a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Wedding Website</span>
              <br />in Minutes
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', maxWidth: '480px', lineHeight: 1.75 }}>
              Browse 120+ designer templates, fill in your details, and publish your personalized wedding invitation page at your own custom URL — all for free.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#browse" className="btn btn-gold" style={{ padding: '1rem 2rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Browse 120+ Templates <ArrowDown size={18} />
              </a>
              <Link href="/register" className="btn" style={{ padding: '1rem 2rem', fontSize: '0.95rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                Create Free Account
              </Link>
            </div>
            {/* Trust markers */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {[['120+', 'Designer Templates'], ['Free', 'To Publish'], ['Custom', 'Wedding URL'], ['RSVP', 'Management']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#cfa830', fontWeight: '700' }}>{val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', marginTop: '2px' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }} className="animate-fade-in animate-delay-200">
            {/* Glow */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(207,168,48,0.15), transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
            <div className="animate-float" style={{ width: '270px', height: '480px', border: '10px solid #2a2a2a', borderRadius: '36px', background: '#1a0a10', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
              {/* Phone notch */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80px', height: '18px', background: '#2a2a2a', borderRadius: '0 0 12px 12px', zIndex: 10 }} />
              {/* Simulated wedding page */}
              <div style={{ height: '55%', backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.3))' }} />
                <div style={{ position: 'relative', textAlign: 'center', border: '1.5px solid rgba(207,168,48,0.7)', outline: '3px double rgba(207,168,48,0.4)', outlineOffset: '4px', padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '0.4rem', letterSpacing: '3px', color: '#cfa830', textTransform: 'uppercase', marginBottom: '0.4rem' }}>✦ Cordially Invited ✦</div>
                  <div style={{ fontFamily: 'var(--font-great-vibes)', fontSize: '1.6rem', color: '#fff', lineHeight: 1.1 }}>Alice &amp; Bob</div>
                  <div style={{ fontSize: '0.38rem', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', marginTop: '0.4rem' }}>October 10, 2026</div>
                </div>
              </div>
              <div style={{ background: '#fbf9f5', height: '45%', padding: '0.75rem', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#cfa830', fontWeight: '700', marginBottom: '0.4rem' }}>Save the Date</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', color: '#7c2230', marginBottom: '0.3rem' }}>Ceremony &amp; Celebration</div>
                <div style={{ fontSize: '0.5rem', color: '#666', lineHeight: 1.8 }}>Saturday, October 10, 2026<br />4:00 PM · Grand Palace, Mumbai</div>
                <div style={{ marginTop: '0.6rem', height: '1px', background: '#e8d9c5' }} />
                <div style={{ fontSize: '0.45rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#cfa830', fontWeight: '700', marginTop: '0.5rem' }}>Gallery</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginTop: '0.3rem' }}>
                  {['https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=100&q=60',
                    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=100&q=60'].map(src => (
                    <div key={src} style={{ height: '32px', background: '#ddd', borderRadius: '2px', overflow: 'hidden' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section id="how-it-works" style={{ padding: '5rem 0', background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.75rem' }}>Simple Process</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-primary)', fontWeight: '700' }}>Create Your Site in 3 Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {[
              { step: '01', icon: <Paintbrush size={28} color="#fff" />, title: 'Pick a Template', desc: 'Browse 120+ beautifully crafted templates across Royal, Floral, Minimalist, and Vintage styles. No account needed to browse.' },
              { step: '02', icon: <Edit3 size={28} color="#fff" />, title: 'Add Your Details', desc: 'Fill in bride & groom names, wedding date, venue, and upload your favourite photos for the gallery.' },
              { step: '03', icon: <LinkIcon size={28} color="#fff" />, title: 'Publish & Share', desc: 'Claim your custom URL like shubhkalyan.in/alicewedsbob and share it with family and friends.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(124,34,48,0.2)', fontSize: '1.75rem' }}>
                  {icon}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>Step {step}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '0.75rem', fontWeight: '600' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TEMPLATES BROWSER ---- */}
      <section id="browse" style={{ padding: '5.5rem 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-secondary)', display: 'block', marginBottom: '0.75rem' }}>120+ Designs</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.75rem' }}>Explore Designer Templates</h2>
            <p style={{ maxWidth: '560px', margin: '0 auto 2.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.75 }}>
              Four distinct styles, ten colour palettes, three font combinations — 120 unique looks. Pick yours and make it your own.
            </p>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {['All', 'Royal', 'Floral', 'Minimalist', 'Vintage'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  border: '1.5px solid',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(category === cat
                    ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
                    : { background: '#fff', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' })
                }}
              >
                {cat === 'All' ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sparkles size={14} /> All Styles</span> : CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, palette, or style..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.75rem', borderRadius: '999px', width: '100%' }}
              />
            </div>
          </div>

          {/* Template Grid */}
          <div className="template-grid-responsive">
            {filteredTemplates.slice(0, 24).map(tpl => (
              <div
                key={tpl.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1.5px solid',
                  borderColor: hoveredId === tpl.id ? 'var(--color-primary-light)' : 'var(--border-color)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  transform: hoveredId === tpl.id ? 'translateY(-5px)' : 'translateY(0)',
                  boxShadow: hoveredId === tpl.id ? 'var(--shadow-md)' : 'var(--shadow-card)',
                }}
                onClick={() => setSelectedPreviewTpl(tpl)}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail */}
                <div style={{ height: '180px', backgroundImage: `url(${tpl.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.55))' }} />

                  {/* Category-specific inner card preview */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                  }}>
                    {tpl.layout === 'minimalist' ? (
                      <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '4px', padding: '0.75rem 1.25rem', textAlign: 'center', width: '80%' }}>
                        <div style={{ fontFamily: tpl.fontTitle, fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: tpl.primaryColor, opacity: 0.6, marginBottom: '0.3rem' }}>Save the Date</div>
                        <div style={{ fontFamily: tpl.fontNames, fontSize: '1.3rem', color: tpl.primaryColor, lineHeight: 1.1 }}>{tpl.coupleNames}</div>
                        <div style={{ width: '30px', height: '1px', background: tpl.primaryColor, margin: '0.4rem auto', opacity: 0.3 }} />
                        <div style={{ fontSize: '0.45rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: tpl.primaryColor, opacity: 0.5 }}>October 10, 2026</div>
                      </div>
                    ) : tpl.layout === 'vintage' ? (
                      <div style={{ border: '1px solid rgba(220,180,100,0.7)', outline: '2px double rgba(220,180,100,0.4)', outlineOffset: '4px', padding: '0.9rem 1.5rem', textAlign: 'center', maxWidth: '85%' }}>
                        <div style={{ fontSize: '0.42rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#dca658', marginBottom: '0.25rem' }}>— Est. 2026 —</div>
                        <div style={{ fontFamily: tpl.fontNames, fontSize: '1.4rem', color: '#fff', lineHeight: 1.1 }}>{tpl.coupleNames}</div>
                        <div style={{ fontSize: '0.4rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,245,220,0.8)', marginTop: '0.3rem' }}>October 10, 2026</div>
                      </div>
                    ) : tpl.layout === 'floral' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.45rem', letterSpacing: '3px', textTransform: 'uppercase', color: tpl.secondaryColor, marginBottom: '0.4rem' }}>❀ Getting Married ❀</div>
                        <div style={{ fontFamily: tpl.fontNames, fontSize: '1.8rem', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{tpl.coupleNames}</div>
                        <div style={{ width: '35px', height: '1.5px', background: tpl.secondaryColor, margin: '0.4rem auto', borderRadius: '1px' }} />
                        <div style={{ fontSize: '0.42rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>October 10, 2026</div>
                      </div>
                    ) : (
                      <div style={{ border: `1.5px solid ${tpl.secondaryColor}`, outline: `3px double ${tpl.secondaryColor}`, outlineOffset: '5px', padding: '0.9rem 1.5rem', textAlign: 'center', maxWidth: '85%' }}>
                        <div style={{ fontSize: '0.42rem', letterSpacing: '4px', textTransform: 'uppercase', color: tpl.secondaryColor, marginBottom: '0.3rem' }}>✦ Cordially Invited ✦</div>
                        <div style={{ fontFamily: tpl.fontNames, fontSize: '1.6rem', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{tpl.coupleNames}</div>
                        <div style={{ fontSize: '0.42rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginTop: '0.3rem' }}>October 10, 2026</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div style={{ padding: '1.1rem 1.25rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.4 }}>{tpl.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '4px',
                      background: CATEGORY_COLORS[tpl.category]?.bg,
                      color: CATEGORY_COLORS[tpl.category]?.color
                    }}>{tpl.category}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[tpl.primaryColor, tpl.secondaryColor, tpl.bgColor].map((c, i) => (
                        <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, border: '1.5px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length > 24 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Showing 24 of {filteredTemplates.length} templates.
              </p>
              <Link href="/register" className="btn btn-primary">
                Sign Up to Unlock All {filteredTemplates.length} Templates
              </Link>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.5 }}><Search size={48} /></div>
              <p>No templates found for "{search}".</p>
            </div>
          )}
        </div>
      </section>

      {/* ---- CTA BAND ---- */}
      <section style={{ background: 'linear-gradient(135deg, #7c2230, #5d1722)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#fff', fontWeight: '700', marginBottom: '1rem' }}>
            Ready to Create Your Wedding Site?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            It&apos;s completely free. Pick a template, add your details, and publish in minutes.
          </p>
          <Link href="/register" className="btn btn-gold" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Create Your Wedding Site — Free
          </Link>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer style={{ background: '#1a0e12', color: 'rgba(255,255,255,0.6)', padding: '3rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                Shubh<span style={{ color: '#cfa830' }}>Kalyan</span>
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: '280px', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>
                Beautiful digital wedding invitations, hosted at your own custom URL on shubhkalyan.in.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#cfa830', marginBottom: '0.75rem' }}>Product</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="#browse" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>Browse Templates</a>
                  <Link href="/register" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>Create Account</Link>
                  <Link href="/login" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>Log In</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(255,255,255,0.35)' }}>© 2026 ShubhKalyan. All rights reserved.</p>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(255,255,255,0.35)' }}>Hosted at shubhkalyan.in</p>
          </div>
        </div>
      </footer>

      {/* ---- PREVIEW MODAL ---- */}
      {selectedPreviewTpl && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedPreviewTpl(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 30px 80px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'scaleIn 0.3s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{selectedPreviewTpl.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {selectedPreviewTpl.category}</span>
              </div>
              <button onClick={() => setSelectedPreviewTpl(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#111'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-responsive">
              <div style={{ flexShrink: 0, width: '120px', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url(${selectedPreviewTpl.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
                  <div style={{ border: `1.5px solid ${selectedPreviewTpl.secondaryColor}`, padding: '0.75rem', textAlign: 'center', width: '100%' }}>
                    <div style={{ fontFamily: selectedPreviewTpl.fontNames, fontSize: '1.4rem', color: '#fff', lineHeight: 1.1 }}>Alice &amp; Bob</div>
                    <div style={{ width: '25px', height: '1px', background: selectedPreviewTpl.secondaryColor, margin: '0.4rem auto', opacity: 0.7 }} />
                    <div style={{ fontSize: '0.42rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Oct 10, 2026</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Style</div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '4px', background: CATEGORY_COLORS[selectedPreviewTpl.category]?.bg, color: CATEGORY_COLORS[selectedPreviewTpl.category]?.color }}>{selectedPreviewTpl.category}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Colour Palette</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[selectedPreviewTpl.primaryColor, selectedPreviewTpl.secondaryColor, selectedPreviewTpl.bgColor, selectedPreviewTpl.accentColor].map((c, i) => (
                      <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: '2px solid rgba(0,0,0,0.1)' }} title={c} />
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Includes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {['Full-screen cover hero', 'Ceremony details', 'Photo gallery', 'RSVP form'].map(f => (
                      <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={14} color="var(--color-success)" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setSelectedPreviewTpl(null)} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.85rem' }}>Close</button>
              <Link href={`/register?template=${selectedPreviewTpl.id}`} className="btn btn-gold" style={{ flex: 2, textAlign: 'center', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Use This Template <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

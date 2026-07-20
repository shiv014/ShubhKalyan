'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Download, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import PhotoLightbox from './PhotoLightbox';
import AudioPlayer from './AudioPlayer';
import CountdownTimer from './CountdownTimer';

const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666' }}>Loading Map...</div>
});

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

function formatDate(dateStr) {
  if (!dateStr) return 'Saturday, October 10, 2026';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function formatTime(dateStr) {
  if (!dateStr) return '4:00 PM';
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function getRsvpDeadline(eventDateStr) {
  if (!eventDateStr) return 'September 15, 2026';
  try {
    const eventDate = new Date(eventDateStr);
    eventDate.setDate(eventDate.getDate() - 25);
    return eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'September 15, 2026';
  }
}

// ---- RSVP FORM ----
function RsvpForm({ event, previewMode, primary, secondary }) {
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState('1');
  const [rsvpGuests, setRsvpGuests] = useState('1');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', border: `1px solid ${secondary}`, borderRadius: '6px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', backgroundColor: '#fff', boxSizing: 'border-box', transition: 'border-color 0.3s, box-shadow 0.3s' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem', color: primary };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (previewMode) { setStatus('success'); setStatusMsg('RSVP form is live! (Preview mode — submissions disabled)'); return; }
    setStatus('submitting');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, name: rsvpName, email: rsvpEmail, attending: parseInt(rsvpAttending), guestsCount: parseInt(rsvpGuests), message: rsvpMessage })
      });
      const data = await res.json();
      if (res.ok) { 
        setStatus('success'); 
        setStatusMsg('Thank you! Your RSVP has been received.'); 
        setRsvpName(''); setRsvpEmail(''); setRsvpMessage(''); setRsvpGuests('1'); 
        if (!previewMode) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
      }
      else { setStatus('error'); setStatusMsg(data.error || 'Failed. Please try again.'); }
    } catch { setStatus('error'); setStatusMsg('Connection error. Please try again.'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {status === 'success' && <div style={{ padding: '0.85rem 1rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>✓ {statusMsg}</div>}
      {status === 'error' && <div style={{ padding: '0.85rem 1rem', background: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>⚠ {statusMsg}</div>}
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="rsvp-name" style={labelStyle}>Full Name</label>
        <input id="rsvp-name" type="text" required value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}} />
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="rsvp-email" style={labelStyle}>Email Address</label>
        <input id="rsvp-email" type="email" required value={rsvpEmail} onChange={e => setRsvpEmail(e.target.value)} placeholder="your.email@example.com" style={inputStyle} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}} />
      </div>
      <div className="grid-2-col" style={{ marginBottom: '1.25rem' }}>
        <div style={{ textAlign: 'left' }}>
          <label htmlFor="rsvp-attending" style={labelStyle}>Attending?</label>
          <select id="rsvp-attending" value={rsvpAttending} onChange={e => setRsvpAttending(e.target.value)} style={inputStyle} onFocus={e => {e.target.style.borderColor=primary}} onBlur={e => {e.target.style.borderColor=secondary}}>
            <option value="1">Joyfully Accept ✓</option>
            <option value="0">Regretfully Decline</option>
          </select>
        </div>
        <div>
          <label htmlFor="rsvp-guests" style={labelStyle}>Total Guests</label>
          <select id="rsvp-guests" value={rsvpGuests} onChange={e => setRsvpGuests(e.target.value)} disabled={rsvpAttending === '0'} style={{...inputStyle, backgroundColor: rsvpAttending === '0' ? '#f5f5f5' : '#fff'}} onFocus={e => {e.target.style.borderColor=primary}} onBlur={e => {e.target.style.borderColor=secondary}}>
            {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}{n===5?' +':''} guest{n>1?'s':''}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="rsvp-message" style={labelStyle}>Message for the Couple</label>
        <textarea id="rsvp-message" value={rsvpMessage} onChange={e => setRsvpMessage(e.target.value)} rows={3} placeholder="Send a warm wish..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}}></textarea>
      </div>
      <button type="submit" disabled={status === 'submitting'} style={{ width: '100%', padding: '1rem', background: primary, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: status === 'submitting' ? 'not-allowed' : 'pointer', transition: 'all 0.3s', opacity: status === 'submitting' ? 0.7 : 1, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onMouseEnter={e => {if(status !== 'submitting') e.target.style.transform = 'translateY(-2px)'}} onMouseLeave={e => {if(status !== 'submitting') e.target.style.transform = 'translateY(0)'}}>
        {status === 'submitting' ? 'Sending RSVP...' : 'Confirm Reservation'}
      </button>
    </form>
  );
}

// ---- CALENDAR & MAP ----
function CalendarAndMap({ event, bride, groom, venue, template, dateStr }) {
  const handleDownloadIcs = () => {
    const title = `Wedding of ${bride} & ${groom}`;
    const date = new Date(event.event_date || Date.now());
    const start = date.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${title}\nLOCATION:${venue || ''}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Wedding of ${bride} & ${groom}`);
    const details = encodeURIComponent(`Join us in celebrating the wedding of ${bride} & ${groom}.`);
    const location = encodeURIComponent(venue || '');
    const date = new Date(event.event_date || Date.now());
    const start = date.toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const mapQuery = (event.venue_lat && event.venue_lng) ? `${event.venue_lat},${event.venue_lng}` : venue;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div className="action-buttons-container">
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || '')}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', background: '#fff', border: `1px solid ${template.primaryColor}`, color: template.primaryColor, borderRadius: '50px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} onMouseEnter={e=>{e.target.style.background=template.primaryColor;e.target.style.color='#fff'}} onMouseLeave={e=>{e.target.style.background='#fff';e.target.style.color=template.primaryColor}}>
          <MapPin size={16} /> Open in Maps
        </a>
        <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', background: template.primaryColor, color: '#fff', borderRadius: '50px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'opacity 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=1}>
          <Calendar size={16} /> Google Calendar
        </a>
        <button onClick={handleDownloadIcs} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${template.primaryColor}`, color: template.primaryColor, borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.3s' }} onMouseEnter={e=>{e.target.style.background=template.primaryColor; e.target.style.color='#fff'}} onMouseLeave={e=>{e.target.style.background='transparent'; e.target.style.color=template.primaryColor}}>
          <Download size={16} /> Apple / Outlook
        </button>
      </div>
      
      {mapQuery && (
        <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${template.secondaryColor || '#ccc'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative' }}>
          <MapViewer position={(event.venue_lat && event.venue_lng) ? [parseFloat(event.venue_lat), parseFloat(event.venue_lng)] : null} />
        </div>
      )}
    </div>
  );
}

// ---- GALLERY GRID ----
function GalleryGrid({ photos, template, onPhotoClick, containerStyle, imageStyle }) {
  const [showAll, setShowAll] = useState(false);
  
  if (!photos || photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', border: `2px dashed ${template.primaryColor}`, borderRadius: '8px', opacity: 0.5, background: template.accentColor }}>
        <p style={{ fontFamily: template.fontTitle, fontSize: '1.1rem' }}>Gallery photos will appear here</p>
      </div>
    );
  }

  let displayPhotos = [];
  if (showAll) {
    displayPhotos = photos;
  } else {
    // Repeat photos array to have at least 8 elements, then double it for the marquee translation
    let basePhotos = [...photos];
    while (basePhotos.length < 8) {
      basePhotos = basePhotos.concat(photos);
    }
    displayPhotos = basePhotos.concat(basePhotos.map((p, idx) => ({ ...p, _uniqueKey: `${p.id}-dup-${idx}` })));
  }

  return (
    <>
      <style>{`
        .gallery-row {
          display: flex;
          overflow-x: hidden; /* Hide scrollbar for continuous marquee */
          padding-bottom: 1.5rem;
          width: 100%;
        }
        .marquee-track {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gallery-item {
          flex: 0 0 280px;
          border-radius: inherit;
        }
        .gallery-grid-full {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.25rem;
        }
        .gallery-grid-full .gallery-item {
          flex: none;
          width: 100%;
        }
        @media (max-width: 768px) {
          .gallery-item {
            flex: 0 0 200px;
          }
        }
      `}</style>
      
      <div className={showAll ? "gallery-grid-full" : "gallery-row"}>
        {showAll ? (
          displayPhotos.map(p => (
            <div key={p.id} className="gallery-item" onClick={() => onPhotoClick(p)} style={{ cursor: 'pointer', overflow: 'hidden', ...containerStyle }}>
              <img src={p.file_path} alt={p.caption||''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...imageStyle }} onMouseEnter={e=>{e.target.style.transform='scale(1.05)';}} onMouseLeave={e=>{e.target.style.transform='scale(1)';}} />
            </div>
          ))
        ) : (
          <div className="marquee-track">
            {displayPhotos.map((p, idx) => (
              <div key={p._uniqueKey || `${p.id}-${idx}`} className="gallery-item" onClick={() => onPhotoClick(p)} style={{ cursor: 'pointer', overflow: 'hidden', ...containerStyle }}>
                <img src={p.file_path} alt={p.caption||''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...imageStyle }} onMouseEnter={e=>{e.target.style.transform='scale(1.05)';}} onMouseLeave={e=>{e.target.style.transform='scale(1)';}} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {photos.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ padding: '0.8rem 2.5rem', background: 'transparent', border: `1px solid ${template.primaryColor}`, color: template.primaryColor, borderRadius: '50px', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e=>{e.target.style.background=template.primaryColor;e.target.style.color='#fff'}} onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color=template.primaryColor}}>
            {showAll ? 'Collapse Gallery' : `View Full Grid (${photos.length} Photos)`}
          </button>
        </div>
      )}
    </>
  );
}

// ---- LAYOUT A: ROYAL ----
function RoyalLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  const rsvpDeadline = getRsvpDeadline(event?.event_date);
  
  const subLayout = template.subLayout;
  let layoutBg = template.bgColor;
  let cardBorder = `1px solid ${template.secondaryColor}`;
  let cardShadow = `6px 6px 0 ${template.secondaryColor}`;
  let cardBg = template.accentColor;
  let separator = '✦';
  let borderOverlay = null;

  if (subLayout === 'rajputana') {
    separator = '🕌';
    cardBg = '#fdfaf2';
    borderOverlay = (
      <div style={{ position: 'absolute', inset: '2rem', border: `2px solid ${template.secondaryColor}`, borderRadius: '4px', outline: `1px solid ${template.secondaryColor}`, outlineOffset: '4px', pointerEvents: 'none', opacity: 0.4 }} />
    );
  } else if (subLayout === 'victorian') {
    separator = '❦';
    layoutBg = 'radial-gradient(circle, #fdfbf7 0%, #f6f1e5 100%)';
    cardBg = '#fffcf7';
    borderOverlay = (
      <div style={{ position: 'absolute', inset: '2.5rem', border: `1px solid ${template.secondaryColor}`, pointerEvents: 'none', opacity: 0.3 }} />
    );
  } else if (subLayout === 'artdeco') {
    separator = '♦';
    layoutBg = '#121212';
    cardBg = '#1c1c1c';
    cardBorder = `3px double ${template.secondaryColor}`;
    cardShadow = 'none';
    borderOverlay = (
      <div style={{ position: 'absolute', inset: '1.5rem', border: `2px double ${template.secondaryColor}`, pointerEvents: 'none', opacity: 0.3 }} />
    );
  }

  return (
    <div style={{ fontFamily: template.fontBody, background: layoutBg, color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.5)', transition: 'color 0.3s' }}
            onMouseEnter={e=>e.target.style.color=template.secondaryColor} onMouseLeave={e=>e.target.style.color='#fff'}>{id}</span>
        ))}
      </nav>
      {/* Hero */}
      <header id="home" style={{ height: '92vh', position: 'relative', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: subLayout === 'artdeco' ? 'linear-gradient(180deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.4) 50%,rgba(0,0,0,0.9) 100%)' : 'linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.25) 50%,rgba(0,0,0,0.65) 100%)' }} />
        {borderOverlay}
        <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem 3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: '440px', margin: '0 1rem', border: subLayout === 'artdeco' ? `3px double ${template.secondaryColor}` : undefined, background: subLayout === 'artdeco' ? 'rgba(18,18,18,0.8)' : undefined, backdropFilter: subLayout === 'artdeco' ? 'blur(8px)' : undefined }}>
          <span style={{ fontSize: '0.55rem', letterSpacing: '5px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700' }}>{separator} {subLayout === 'rajputana' ? 'Shubh Vivah' : 'Cordially Invited'} {separator}</span>
          <div style={{ width: '35px', height: '1px', background: template.secondaryColor, opacity: 0.7 }} />
          <div style={{ fontFamily: template.fontNames, fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{bride} <span style={{ fontFamily: template.fontTitle, fontSize: '1.2rem', fontWeight: '400' }}>&amp;</span> {groom}</div>
          <div style={{ width: '35px', height: '1px', background: template.secondaryColor, opacity: 0.7 }} />
          <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>{dateStr}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
            <button onClick={() => scrollTo('rsvp')} style={{ padding: '0.6rem 2rem', background: subLayout === 'artdeco' ? template.secondaryColor : 'transparent', border: `1px solid ${template.secondaryColor}`, color: subLayout === 'artdeco' ? '#121212' : template.secondaryColor, fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=subLayout === 'artdeco' ? '#fff' : template.secondaryColor;e.currentTarget.style.color=subLayout === 'artdeco' ? '#121212' : '#fff';}} onMouseLeave={e=>{e.currentTarget.style.background=subLayout === 'artdeco' ? template.secondaryColor : 'transparent';e.currentTarget.style.color=subLayout === 'artdeco' ? '#121212' : template.secondaryColor;}}>
              RSVP Online
            </button>
            <CountdownTimer eventDate={event?.event_date} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: subLayout === 'artdeco' ? '#121212' : template.bgColor, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', zIndex: 3 }} />
      </header>
      {/* Details */}
      <section id="details" className="tpl-section-standard" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Save the Date</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '1rem' }}>Ceremony &amp; Celebration</h2>
        <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '0.95rem' }}>Join us as we celebrate our union surrounded by those we cherish most.</p>
        <div style={{ background: cardBg, border: cardBorder, borderLeft: subLayout === 'artdeco' ? cardBorder : `4px solid ${template.secondaryColor}`, borderRadius: subLayout === 'artdeco' ? '0px' : '8px', padding: '2.5rem 2rem', display: 'inline-block', minWidth: '300px', textAlign: 'left', boxShadow: cardShadow }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '0.5rem' }}>DATE &amp; TIME</div>
          <div style={{ fontFamily: template.fontTitle, fontSize: '1.2rem', color: template.primaryColor, marginBottom: '0.25rem' }}>{dateStr}</div>
          <div style={{ fontSize: '0.9rem', color: template.primaryColor, opacity: 0.7, marginBottom: '1.5rem' }}>at {timeStr}</div>
          <div style={{ width: '100%', height: '1px', background: template.secondaryColor, opacity: 0.3, marginBottom: '1.5rem' }} />
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '0.5rem' }}>VENUE</div>
          <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, fontStyle: 'italic', marginBottom: '1.5rem' }}>{venue}</div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="tpl-section-standard" style={{ maxWidth: '900px', margin: '0 auto', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Moments</span>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400' }}>Our Gallery</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '4/3', borderRadius: '4px', border: `2px solid ${template.secondaryColor}` }} />
      </section>
      {/* RSVP */}
      <section id="rsvp" className="tpl-section-standard" style={{ background: template.accentColor }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Reservation</span>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>Will You Attend?</h2>
            <p style={{ opacity: 0.65, fontSize: '0.85rem' }}>Please respond by {rsvpDeadline}</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem 2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: `1px solid ${template.secondaryColor}` }}>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- LAYOUT B: FLORAL ----
function FloralLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  const rsvpDeadline = getRsvpDeadline(event?.event_date);
  
  const subLayout = template.subLayout;
  let layoutBg = template.bgColor;
  let detailsCardStyle = { background: template.accentColor, borderRadius: '32px', padding: '2.5rem 2rem', marginTop: '1.5rem' };
  let separator = '❀';

  if (subLayout === 'boho') {
    separator = '🌾';
    detailsCardStyle = {
      background: template.accentColor,
      backgroundImage: 'linear-gradient(rgba(171,84,54,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(171,84,54,0.03) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      borderRadius: '16px',
      padding: '2.5rem 2rem',
      marginTop: '1.5rem',
      border: `1px dashed ${template.primaryColor}`
    };
  } else if (subLayout === 'enchanted') {
    separator = '🌿';
    layoutBg = 'linear-gradient(to bottom, #f4f7f5 0%, #e8efe9 100%)';
    detailsCardStyle = {
      background: '#ffffff',
      border: `2px solid ${template.secondaryColor}`,
      borderRadius: '24px',
      padding: '2.5rem 2rem',
      marginTop: '1.5rem',
      boxShadow: '0 10px 35px rgba(26,51,40,0.05)'
    };
  }

  return (
    <div style={{ fontFamily: template.fontBody, background: layoutBg, color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem' }}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.65rem', fontWeight: '600', letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer' }}>{id}</span>
        ))}
      </nav>
      <header id="home" style={{ height: '85vh', position: 'relative', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0 0 50% 50% / 0 0 80px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom,rgba(0,0,0,0.4),rgba(0,0,0,0.5))` }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
          <span style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '1rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{separator} We Are Getting Married {separator}</span>
          <div style={{ fontFamily: template.fontNames, fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', color: '#fff', textShadow: '0 3px 15px rgba(0,0,0,0.4)', lineHeight: 1.15, margin: '0.5rem 0' }}>{bride} <span style={{ fontFamily: template.fontTitle, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>&amp;</span> {groom}</div>
          <div style={{ width: '50px', height: '2px', background: template.secondaryColor, margin: '1rem auto', borderRadius: '2px', opacity: 0.85 }} />
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '600' }}>{dateStr}</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => scrollTo('rsvp')} style={{ padding: '0.7rem 2rem', background: template.primaryColor, border: 'none', borderRadius: '50px', color: '#fff', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}>RSVP Now</button>
            <CountdownTimer eventDate={event?.event_date} />
          </div>
        </div>
      </header>
      <section id="details" className="tpl-section-standard" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, display: 'block', marginBottom: '0.5rem' }}>Join Us</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '1.5rem' }}>The Celebration</h2>
        <div style={detailsCardStyle}>
          <div style={{ fontSize: '1.3rem', fontFamily: template.fontTitle, color: template.primaryColor, marginBottom: '0.5rem' }}>{dateStr}</div>
          <div style={{ fontSize: '0.85rem', color: template.primaryColor, opacity: 0.65, marginBottom: '1.5rem' }}>{timeStr}</div>
          <div style={{ width: '40px', height: '2px', background: template.primaryColor, opacity: 0.2, margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: template.primaryColor, opacity: 0.8, marginBottom: '1.5rem' }}>📍 {venue}</div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
      </section>
      <section id="gallery" className="tpl-section-standard" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, display: 'block', marginBottom: '0.5rem' }}>Our Story</span>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400' }}>Photo Gallery</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '4/3', borderRadius: subLayout === 'boho' ? '4px' : '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
      </section>
      <section id="rsvp" className="tpl-section-standard" style={{ background: `linear-gradient(135deg,${template.accentColor},${template.bgColor})` }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>RSVP</h2>
            <p style={{ opacity: 0.65, fontSize: '0.85rem' }}>We hope to see you there! Kindly respond by {rsvpDeadline}.</p>
          </div>
          <div style={{ background: '#fff', borderRadius: subLayout === 'boho' ? '8px' : '24px', padding: '2rem 2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- LAYOUT C: MINIMALIST ----
// ---- LAYOUT C: MINIMALIST ----
function MinimalistLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  const rsvpDeadline = getRsvpDeadline(event?.event_date);
  
  const subLayout = template.subLayout;
  let wrapperStyle = { fontFamily: template.fontBody, background: '#fff', color: template.textColor, minHeight: '100vh', overflowX: 'hidden' };
  let cardClass = "";
  let detailsStyle = { borderTop: `2px solid ${template.primaryColor}`, paddingTop: '1.5rem' };
  let mainBg = '#fff';

  if (subLayout === 'glassmorphism') {
    wrapperStyle.background = 'linear-gradient(135deg, #f5f3f7 0%, #e8eaf6 100%)';
    cardClass = "frosted-card";
    mainBg = 'transparent';
  } else if (subLayout === 'zen') {
    wrapperStyle.background = '#fafaf9';
    mainBg = '#fafaf9';
    detailsStyle = { borderTop: `1px solid ${template.primaryColor}`, paddingTop: '2rem' };
  } else if (subLayout === 'coastal') {
    wrapperStyle.background = '#f4f8fa';
    mainBg = '#f4f8fa';
    detailsStyle = { borderTop: `2px solid #8fa89b`, paddingTop: '1.5rem' };
  }

  return (
    <div style={wrapperStyle}>
      <nav style={{ borderBottom: `1px solid ${template.accentColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', position: 'sticky', top: 0, background: subLayout === 'glassmorphism' ? 'rgba(255,255,255,0.7)' : mainBg, backdropFilter: subLayout === 'glassmorphism' ? 'blur(10px)' : 'none', zIndex: 100 }}>
        <span style={{ fontFamily: template.fontTitle, fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor }}>{bride} &amp; {groom}</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['details','gallery','rsvp'].map(id => (
            <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer', color: template.textColor, fontWeight: '500' }}>{id}</span>
          ))}
        </div>
      </nav>
      <header id="home" className="tr-hero-grid" style={{ minHeight: '82vh', background: subLayout === 'glassmorphism' ? 'linear-gradient(45deg, #ffdde1 0%, #ee9ca7 100%)' : undefined }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem' }}>
          <div className={cardClass} style={{ padding: subLayout === 'glassmorphism' ? '2.5rem' : '0px', borderRadius: subLayout === 'glassmorphism' ? '20px' : '0px' }}>
            <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, display: 'block', marginBottom: '1.5rem' }}>Save the Date</span>
            <div style={{ fontFamily: template.fontNames, fontSize: 'clamp(2.2rem, 7vw, 2.8rem)', color: template.primaryColor, lineHeight: 1.1, marginBottom: '1.5rem' }}>{bride}<br /><span style={{ fontSize: 'clamp(1rem, 3.5vw, 1.4rem)' }}>&amp;</span><br />{groom}</div>
            <div style={{ width: '40px', height: '2px', background: template.primaryColor, marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.65, marginBottom: '0.5rem', lineHeight: 1.9 }}>{dateStr}</p>
            <p style={{ fontSize: '0.75rem', color: template.primaryColor, opacity: 0.55, lineHeight: 1.9 }}>{venue}</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem', marginTop: '2rem' }}>
              <button onClick={() => scrollTo('rsvp')} style={{ padding: '0.8rem 2rem', background: template.primaryColor, color: '#fff', border: 'none', fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}>RSVP</button>
              <CountdownTimer eventDate={event?.event_date} />
            </div>
          </div>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <img src={cover} alt="Wedding" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </header>
      <section id="details" className="tpl-section-minimal" style={{ maxWidth: '700px', margin: '0 auto', background: mainBg }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Details</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '2rem' }}>Ceremony &amp; Reception</h2>
        <div className={`tr-details-grid ${cardClass}`} style={{ padding: subLayout === 'glassmorphism' ? '2rem' : '0px', borderRadius: subLayout === 'glassmorphism' ? '16px' : '0px' }}>
          <div style={detailsStyle}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, marginBottom: '0.5rem' }}>When</div>
            <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, marginBottom: '0.25rem' }}>{dateStr}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.55 }}>{timeStr}</div>
          </div>
          <div style={detailsStyle}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, marginBottom: '0.5rem' }}>Where</div>
            <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, marginBottom: '1rem' }}>{venue}</div>
          </div>
        </div>
        <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
      </section>
      <section id="gallery" className="tpl-section-minimal" style={{ borderTop: `1px solid ${template.accentColor}`, background: mainBg }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Gallery</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '2rem' }}>Our Story</h2>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '1', borderRadius: subLayout === 'glassmorphism' ? '12px' : '4px' }} />
      </section>
      <section id="rsvp" className="tpl-section-minimal" style={{ background: subLayout === 'glassmorphism' ? 'transparent' : template.accentColor }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }} className={cardClass}>
          <div style={{ padding: subLayout === 'glassmorphism' ? '2.5rem' : '0px', borderRadius: subLayout === 'glassmorphism' ? '24px' : '0px' }}>
            <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Response</span>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>Will You Attend?</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '2rem' }}>Please respond by {rsvpDeadline}.</p>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- LAYOUT D: VINTAGE ----
// ---- LAYOUT D: VINTAGE ----
function VintageLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  const rsvpDeadline = getRsvpDeadline(event?.event_date);
  
  const subLayout = template.subLayout;
  let layoutBg = subLayout === 'celestial' ? '#0f172a' : '#faf7ef';
  let layoutColor = subLayout === 'celestial' ? '#f8fafc' : template.textColor;
  let cardBg = subLayout === 'celestial' ? '#1e293b' : '#fffdf4';
  let cardBorder = subLayout === 'celestial' ? `1.5px solid rgba(255,255,255,0.15)` : `2px solid ${template.primaryColor}`;
  let cardShadow = subLayout === 'celestial' ? `0 10px 30px rgba(0,0,0,0.4)` : `5px 5px 0 ${template.secondaryColor}`;
  let separator = '❧';
  let navStyle = { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)' };

  if (subLayout === 'celestial') {
    separator = '✨';
  } else if (subLayout === 'haldi') {
    separator = '🌼';
    layoutBg = '#fffdf0';
    cardBg = '#fef3c7';
    cardShadow = `5px 5px 0 ${template.primaryColor}`;
  }

  return (
    <div style={{ fontFamily: template.fontBody, background: layoutBg, color: layoutColor, minHeight: '100vh', overflowX: 'hidden' }}>
      <nav style={navStyle}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: 'rgba(255,245,220,0.9)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '3.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: template.fontTitle }}>{id}</span>
        ))}
      </nav>
      <header id="home" style={{ height: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: subLayout === 'celestial' ? 'brightness(0.35) contrast(1.1)' : 'sepia(0.45) brightness(0.6)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: subLayout === 'celestial' ? 'rgba(10,20,40,0.4)' : 'rgba(50,25,0,0.45)', zIndex: 1 }} />
        
        {/* Celestial Star Overlay */}
        {subLayout === 'celestial' && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="star animate-twinkle" style={{
                position: 'absolute',
                left: `${(i * 7.7) % 100}%`,
                top: `${(i * 13.3) % 100}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                backgroundColor: '#fff',
                borderRadius: '50%',
                opacity: 0.7
              }} />
            ))}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2.5rem', border: subLayout === 'celestial' ? `1px solid ${template.secondaryColor}` : '1px solid rgba(220,180,100,0.55)', borderRadius: '4px', maxWidth: '420px', margin: '0 1rem', background: subLayout === 'celestial' ? 'rgba(15,23,42,0.85)' : undefined, backdropFilter: subLayout === 'celestial' ? 'blur(8px)' : undefined }}>
          <div style={{ border: subLayout === 'celestial' ? `1.5px solid ${template.secondaryColor}` : '3px double rgba(220,180,100,0.75)', padding: '2rem', borderRadius: '2px' }}>
            <span style={{ display: 'block', fontSize: '0.5rem', letterSpacing: '5px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '1rem' }}>{separator} Est. {new Date().getFullYear()} {separator}</span>
            <div style={{ fontFamily: template.fontTitle, fontSize: '0.9rem', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,245,220,0.8)', marginBottom: '0.75rem' }}>The Wedding of</div>
            <div style={{ fontFamily: template.fontNames, fontSize: 'clamp(2.2rem, 8vw, 2.8rem)', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', lineHeight: 1.1, marginBottom: '0.25rem' }}>{bride}</div>
            <div style={{ color: template.secondaryColor, fontSize: '0.85rem', fontFamily: template.fontTitle, letterSpacing: '3px', margin: '0.25rem 0' }}>AND</div>
            <div style={{ fontFamily: template.fontNames, fontSize: 'clamp(2.2rem, 8vw, 2.8rem)', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', lineHeight: 1.1, marginTop: '0.25rem' }}>{groom}</div>
            <div style={{ width: '60px', height: '1px', background: template.secondaryColor, margin: '1rem auto', opacity: 0.6 }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,245,220,0.8)' }}>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
            <button onClick={() => scrollTo('rsvp')} style={{ padding: '0.65rem 2rem', background: subLayout === 'celestial' ? template.secondaryColor : 'transparent', border: `1px solid ${template.secondaryColor}`, color: subLayout === 'celestial' ? '#1e293b' : template.secondaryColor, fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', fontFamily: template.fontTitle }}>Kindly Reply</button>
            <CountdownTimer eventDate={event?.event_date} />
          </div>
        </div>
      </header>
      <section id="details" className="tpl-section-standard" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>{separator}</div>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400', marginBottom: '2rem' }}>Ceremony Details</h2>
        <div style={{ border: cardBorder, boxShadow: cardShadow, padding: '2.5rem', display: 'inline-block', textAlign: 'left', minWidth: '300px', background: cardBg }}>
          <div style={{ marginBottom: '1.5rem' }}><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Date</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor }}>{dateStr}</div></div>
          <div style={{ marginBottom: '1.5rem' }}><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Time</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor }}>{timeStr}</div></div>
          <div style={{ marginBottom: '1.5rem' }}><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Venue</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, fontStyle: 'italic' }}>{venue}</div></div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
        <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginTop: '2rem' }}>{separator}</div>
      </section>
      <section id="gallery" className="tpl-section-standard" style={{ maxWidth: '900px', margin: '0 auto', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>{separator}</div>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400' }}>Our Memories</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ border: subLayout === 'celestial' ? `1px solid rgba(255,255,255,0.15)` : `3px solid ${template.primaryColor}`, aspectRatio: '4/3', boxShadow: cardShadow }} imageStyle={{ filter: subLayout === 'celestial' ? 'none' : 'sepia(0.2)' }} />
      </section>
      <section id="rsvp" className="tpl-section-standard" style={{ background: subLayout === 'celestial' ? '#0b0f19' : '#fffdf4', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>{separator}</div>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400', marginBottom: '0.5rem' }}>Kindly Reply</h2>
            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Please respond by {rsvpDeadline}</p>
          </div>
          <div style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow, padding: '2rem 2.5rem' }}>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// Removed ImageModal because we are using PhotoLightbox now

// ---- MAIN EXPORT ----
export default function TemplateRenderer({ event, template, photos = [], previewMode = false }) {
  const [carouselIndex, setCarouselIndex] = useState(null);
  const posterRef = useRef(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  if (!event || !template) return <div style={{ padding: '4rem', textAlign: 'center', color: '#7c2230', fontFamily: 'serif' }}>Loading...</div>;
  const bride = event.bride_name || 'Alice';
  const groom = event.groom_name || 'Bob';
  const dateStr = formatDate(event.event_date);
  const timeStr = formatTime(event.event_date);
  const venue = event.venue || 'Grand Palace Ballroom, Mumbai';
  
  const coverPhoto = photos.find(p => p.is_cover === 1) || (photos.length > 0 ? photos[0] : null);
  const coverImage = coverPhoto ? coverPhoto.file_path : (template.bgImage || FALLBACK_HERO);
  
  const handlePhotoClick = (photo) => {
    const idx = photos.findIndex(p => p.id === photo.id);
    setCarouselIndex(idx);
  };
  
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsGeneratingPoster(true);
    try {
      // Brief delay to ensure fonts/images are ready
      await new Promise(r => setTimeout(r, 150)); 
      const dataUrl = await htmlToImage.toJpeg(posterRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: template.bgColor || '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Wedding-Poster-${bride}-${groom}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
      alert('Failed to generate poster. Please try again.');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const props = { bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick: handlePhotoClick, coverImage };
  const cat = (template.category || template.layout || 'royal').toLowerCase();
  
  return (
    <>
      {cat === 'floral' ? <FloralLayout {...props} /> :
       cat === 'minimalist' ? <MinimalistLayout {...props} /> :
       cat === 'vintage' ? <VintageLayout {...props} /> :
       <RoyalLayout {...props} />}
       
      {carouselIndex !== null && (
        <PhotoLightbox 
          photos={photos} 
          currentIndex={carouselIndex} 
          onNavigate={setCarouselIndex} 
          onClose={() => setCarouselIndex(null)} 
          bride={bride}
          groom={groom}
        />
      )}

      <AudioPlayer src={event?.audio_path || "/audio/shehnai-short.m4a"} />

      {/* Floating Action Button for Download Poster */}
      {!previewMode && (
        <button 
          onClick={handleDownloadPoster}
          disabled={isGeneratingPoster}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9998,
            background: template.primaryColor || '#000', color: '#fff', border: 'none',
            borderRadius: '50%', padding: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isGeneratingPoster ? 'wait' : 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)', transition: 'all 0.3s',
            opacity: isGeneratingPoster ? 0.7 : 1
          }}
          onMouseEnter={e => {if(!isGeneratingPoster) e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';}}
          onMouseLeave={e => {if(!isGeneratingPoster) e.currentTarget.style.transform = 'translateY(0) scale(1)';}}
        >
          <ImageIcon size={22} />
        </button>
      )}

      {/* Off-screen Poster Generation Node */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -9999 }}>
        <div ref={posterRef} style={{ 
          width: '800px', height: '1131px', // A4 aspect ratio (approx)
          background: template.bgColor || '#fff', color: template.textColor || '#000',
          fontFamily: template.fontBody || 'sans-serif', position: 'relative',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Poster Hero Half */}
          <div style={{ height: '55%', backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)' }} />
             <div style={{ position: 'absolute', bottom: '2.5rem', left: 0, right: 0, textAlign: 'center', color: '#fff' }}>
                <div style={{ fontFamily: template.fontNames || 'serif', fontSize: '5rem', textShadow: '0 4px 15px rgba(0,0,0,0.6)', lineHeight: 1.1 }}>{bride} <span style={{fontSize:'3rem', fontFamily: template.fontTitle || 'serif'}}>&amp;</span> {groom}</div>
                <div style={{ fontSize: '1.2rem', letterSpacing: '6px', textTransform: 'uppercase', marginTop: '1.2rem', textShadow: '0 2px 5px rgba(0,0,0,0.8)', fontWeight: '600' }}>Are Getting Married</div>
             </div>
          </div>
          {/* Poster Details Half */}
          <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: `8px solid ${template.secondaryColor || '#ccc'}`, background: template.accentColor || '#fff', padding: '2rem' }}>
              <div style={{ fontFamily: template.fontTitle || 'serif', fontSize: '2.5rem', color: template.primaryColor || '#000', marginBottom: '2.5rem' }}>Join Us for the Celebration</div>
              
              <div style={{ display: 'flex', gap: '3rem', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor || '#666', fontWeight: '800', marginBottom: '0.5rem' }}>DATE &amp; TIME</div>
                  <div style={{ fontFamily: template.fontTitle || 'serif', fontSize: '1.6rem', color: template.primaryColor || '#000' }}>{dateStr}</div>
                  <div style={{ fontSize: '1.2rem', color: template.primaryColor || '#000', opacity: 0.8, marginTop: '0.25rem' }}>at {timeStr}</div>
                  
                  <div style={{ width: '100%', height: '1px', background: template.secondaryColor || '#ccc', opacity: 0.5, margin: '1.5rem 0' }} />
                  
                  <div style={{ fontSize: '0.9rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor || '#666', fontWeight: '800', marginBottom: '0.5rem' }}>VENUE</div>
                  <div style={{ fontFamily: template.fontTitle || 'serif', fontSize: '1.4rem', color: template.primaryColor || '#000', fontStyle: 'italic', lineHeight: 1.4 }}>{venue}</div>
                </div>
                
                <div style={{ width: '2px', height: '180px', background: template.secondaryColor || '#ccc', opacity: 0.4 }} />
                
                <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor || '#000', fontWeight: '800', marginBottom: '1.25rem' }}>Scan for Maps</div>
                   <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                     <QRCodeCanvas value={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.venue_lat && event.venue_lng) ? `${event.venue_lat},${event.venue_lng}` : venue)}`} size={140} level="H" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

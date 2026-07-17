'use client';

import { useState, useEffect, useRef } from 'react';

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
      if (res.ok) { setStatus('success'); setStatusMsg('Thank you! Your RSVP has been received.'); setRsvpName(''); setRsvpEmail(''); setRsvpMessage(''); setRsvpGuests('1'); }
      else { setStatus('error'); setStatusMsg(data.error || 'Failed. Please try again.'); }
    } catch { setStatus('error'); setStatusMsg('Connection error. Please try again.'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {status === 'success' && <div style={{ padding: '0.85rem 1rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>✓ {statusMsg}</div>}
      {status === 'error' && <div style={{ padding: '0.85rem 1rem', background: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>⚠ {statusMsg}</div>}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Full Name</label>
        <input type="text" required value={rsvpName} onChange={e => setRsvpName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}} />
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Email Address</label>
        <input type="email" required value={rsvpEmail} onChange={e => setRsvpEmail(e.target.value)} placeholder="your.email@example.com" style={inputStyle} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Attending?</label>
          <select value={rsvpAttending} onChange={e => setRsvpAttending(e.target.value)} style={inputStyle} onFocus={e => {e.target.style.borderColor=primary}} onBlur={e => {e.target.style.borderColor=secondary}}>
            <option value="1">Joyfully Accept ✓</option>
            <option value="0">Regretfully Decline</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Total Guests</label>
          <select value={rsvpGuests} onChange={e => setRsvpGuests(e.target.value)} disabled={rsvpAttending === '0'} style={{...inputStyle, backgroundColor: rsvpAttending === '0' ? '#f5f5f5' : '#fff'}} onFocus={e => {e.target.style.borderColor=primary}} onBlur={e => {e.target.style.borderColor=secondary}}>
            {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}{n===5?' +':''} guest{n>1?'s':''}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Message for the Couple</label>
        <textarea value={rsvpMessage} onChange={e => setRsvpMessage(e.target.value)} rows={3} placeholder="Send a warm wish..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => {e.target.style.borderColor=primary; e.target.style.boxShadow=`0 0 0 3px rgba(0,0,0,0.05)`}} onBlur={e => {e.target.style.borderColor=secondary; e.target.style.boxShadow='none'}}></textarea>
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

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', background: template.primaryColor, color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'opacity 0.3s' }} onMouseEnter={e=>e.target.style.opacity=0.85} onMouseLeave={e=>e.target.style.opacity=1}>
          📅 Add to Google Calendar
        </a>
        <button onClick={handleDownloadIcs} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${template.primaryColor}`, color: template.primaryColor, borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.3s' }} onMouseEnter={e=>{e.target.style.background=template.primaryColor; e.target.style.color='#fff'}} onMouseLeave={e=>{e.target.style.background='transparent'; e.target.style.color=template.primaryColor}}>
          🍏 Apple / Outlook
        </button>
      </div>
      
      {venue && (
        <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${template.secondaryColor || '#ccc'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      )}
    </div>
  );
}

// ---- GALLERY GRID ----
function GalleryGrid({ photos, template, onPhotoClick, containerStyle, imageStyle }) {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef(null);
  const reqRef = useRef(null);
  
  useEffect(() => {
    if (showAll || !photos || photos.length === 0) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }
    
    let scrollPos = scrollRef.current ? scrollRef.current.scrollLeft : 0;
    
    const animate = () => {
      if (scrollRef.current) {
        scrollPos += 0.6; // pixels per frame (speed)
        
        // We rendered 4 identical sets of photos.
        // Once we scroll past exactly half the total width (2 sets),
        // we instantly snap back to 0. Because set 3 matches set 1 perfectly,
        // it creates a seamless infinite loop.
        const halfWidth = scrollRef.current.scrollWidth / 2;
        if (scrollPos >= halfWidth) {
          scrollPos -= halfWidth; 
        }
        scrollRef.current.scrollLeft = scrollPos;
      }
      reqRef.current = requestAnimationFrame(animate);
    };
    
    reqRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(reqRef.current);
  }, [showAll, photos]);
  
  if (!photos || photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', border: `2px dashed ${template.primaryColor}`, borderRadius: '8px', opacity: 0.5, background: template.accentColor }}>
        <p style={{ fontFamily: template.fontTitle, fontSize: '1.1rem' }}>Gallery photos will appear here</p>
      </div>
    );
  }

  // To ensure the continuous marquee fills the screen and loops seamlessly, 
  // we duplicate the array 4 times when not showing the full grid.
  let displayPhotos = [];
  if (showAll) {
    displayPhotos = photos;
  } else {
    for (let i = 0; i < 4; i++) {
      displayPhotos = displayPhotos.concat(photos.map(p => ({ ...p, _uniqueKey: `${p.id}-${i}` })));
    }
  }

  return (
    <>
      <style>{`
        .gallery-row {
          display: flex;
          gap: 1.25rem;
          overflow-x: hidden; /* Hide scrollbar for continuous marquee */
          padding-bottom: 1.5rem;
        }
        .gallery-item {
          flex: 0 0 calc(33.333% - 0.85rem);
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
          .gallery-row {
            gap: 1rem;
          }
          .gallery-item {
            flex: 0 0 80%; /* Show 80% of one image so the next one peeks in */
          }
        }
      `}</style>
      
      <div ref={scrollRef} className={showAll ? "gallery-grid-full" : "gallery-row"}>
        {displayPhotos.map(p => (
          <div key={p._uniqueKey || p.id} className="gallery-item" onClick={() => onPhotoClick(p)} style={{ cursor: 'pointer', overflow: 'hidden', ...containerStyle }}>
            <img src={p.file_path} alt={p.caption||''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ...imageStyle }} onMouseEnter={e=>{e.target.style.transform='scale(1.05)'; if(imageStyle?.filter) e.target.style.filter=imageStyle.filter;}} onMouseLeave={e=>{e.target.style.transform='scale(1)'; if(imageStyle?.filter) e.target.style.filter=imageStyle.filter;}} />
          </div>
        ))}
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
  return (
    <div style={{ fontFamily: template.fontBody, background: template.bgColor, color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.5)', transition: 'color 0.3s' }}
            onMouseEnter={e=>e.target.style.color=template.secondaryColor} onMouseLeave={e=>e.target.style.color='#fff'}>{id}</span>
        ))}
      </nav>
      {/* Hero */}
      <header id="home" style={{ height: '92vh', position: 'relative', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.25) 50%,rgba(0,0,0,0.65) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, border: `2px solid ${template.secondaryColor}`, outline: `4px double ${template.secondaryColor}`, outlineOffset: '7px', padding: '2.5rem 3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: '440px', margin: '0 1rem' }}>
          <span style={{ fontSize: '0.55rem', letterSpacing: '5px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700' }}>✦ Cordially Invited ✦</span>
          <div style={{ width: '35px', height: '1px', background: template.secondaryColor, opacity: 0.7 }} />
          <div style={{ fontFamily: template.fontNames, fontSize: '3.2rem', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{bride} <span style={{ fontFamily: template.fontTitle, fontSize: '1.2rem', fontWeight: '400' }}>&amp;</span> {groom}</div>
          <div style={{ width: '35px', height: '1px', background: template.secondaryColor, opacity: 0.7 }} />
          <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>{dateStr}</span>
          <button onClick={() => scrollTo('rsvp')} style={{ marginTop: '0.5rem', padding: '0.6rem 2rem', background: 'transparent', border: `1px solid ${template.secondaryColor}`, color: template.secondaryColor, fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=template.secondaryColor;e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=template.secondaryColor;}}>
            RSVP Online
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: template.bgColor, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', zIndex: 3 }} />
      </header>
      {/* Details */}
      <section id="details" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Save the Date</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '1rem' }}>Ceremony &amp; Celebration</h2>
        <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 2.5rem', fontSize: '0.95rem' }}>Join us as we celebrate our union surrounded by those we cherish most.</p>
        <div style={{ background: template.accentColor, border: `1px solid ${template.secondaryColor}`, borderLeft: `4px solid ${template.secondaryColor}`, borderRadius: '8px', padding: '2.5rem 2rem', display: 'inline-block', minWidth: '300px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '0.5rem' }}>DATE &amp; TIME</div>
          <div style={{ fontFamily: template.fontTitle, fontSize: '1.2rem', color: template.primaryColor, marginBottom: '0.25rem' }}>{dateStr}</div>
          <div style={{ fontSize: '0.9rem', color: template.primaryColor, opacity: 0.7, marginBottom: '1.5rem' }}>at {timeStr}</div>
          <div style={{ width: '100%', height: '1px', background: template.secondaryColor, opacity: 0.3, marginBottom: '1.5rem' }} />
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '0.5rem' }}>VENUE</div>
          <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, fontStyle: 'italic' }}>{venue}</div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
      </section>
      {/* Gallery */}
      <section id="gallery" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Moments</span>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400' }}>Our Gallery</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '4/3', borderRadius: '4px', border: `2px solid ${template.secondaryColor}` }} />
      </section>
      {/* RSVP */}
      <section id="rsvp" style={{ padding: '5rem 1.5rem', background: template.accentColor }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Reservation</span>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>Will You Attend?</h2>
            <p style={{ opacity: 0.65, fontSize: '0.85rem' }}>Please respond by September 15, 2026</p>
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
  return (
    <div style={{ fontFamily: template.fontBody, background: template.bgColor, color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem' }}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.65rem', fontWeight: '600', letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer' }}>{id}</span>
        ))}
      </nav>
      <header id="home" style={{ height: '85vh', position: 'relative', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '0 0 50% 50% / 0 0 80px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom,rgba(0,0,0,0.4),rgba(0,0,0,0.5))` }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
          <span style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.secondaryColor, fontWeight: '700', marginBottom: '1rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>❀ We Are Getting Married ❀</span>
          <div style={{ fontFamily: template.fontNames, fontSize: '3.5rem', color: '#fff', textShadow: '0 3px 15px rgba(0,0,0,0.4)', lineHeight: 1.15, margin: '0.5rem 0' }}>{bride} <span style={{ fontFamily: template.fontTitle, fontSize: '1.6rem' }}>&amp;</span> {groom}</div>
          <div style={{ width: '50px', height: '2px', background: template.secondaryColor, margin: '1rem auto', borderRadius: '2px', opacity: 0.85 }} />
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: '600' }}>{dateStr}</p>
          <button onClick={() => scrollTo('rsvp')} style={{ marginTop: '1.5rem', padding: '0.7rem 2rem', background: template.primaryColor, border: 'none', borderRadius: '50px', color: '#fff', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}>RSVP Now</button>
        </div>
      </header>
      <section id="details" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, display: 'block', marginBottom: '0.5rem' }}>Join Us</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '1.5rem' }}>The Celebration</h2>
        <div style={{ background: template.accentColor, borderRadius: '32px', padding: '2.5rem 2rem', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '1.3rem', fontFamily: template.fontTitle, color: template.primaryColor, marginBottom: '0.5rem' }}>{dateStr}</div>
          <div style={{ fontSize: '0.85rem', color: template.primaryColor, opacity: 0.65, marginBottom: '1.5rem' }}>{timeStr}</div>
          <div style={{ width: '40px', height: '2px', background: template.primaryColor, opacity: 0.2, margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: template.primaryColor, opacity: 0.8 }}>📍 {venue}</div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
      </section>
      <section id="gallery" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, display: 'block', marginBottom: '0.5rem' }}>Our Story</span>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400' }}>Photo Gallery</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '4/3', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
      </section>
      <section id="rsvp" style={{ padding: '5rem 1.5rem', background: `linear-gradient(135deg,${template.accentColor},${template.bgColor})` }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>RSVP</h2>
            <p style={{ opacity: 0.65, fontSize: '0.85rem' }}>We hope to see you there! Kindly respond by September 15th.</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem 2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- LAYOUT C: MINIMALIST ----
function MinimalistLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  return (
    <div style={{ fontFamily: template.fontBody, background: '#fff', color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      <nav style={{ borderBottom: `1px solid ${template.accentColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', position: 'sticky', top: 0, background: '#fff', zIndex: 100 }}>
        <span style={{ fontFamily: template.fontTitle, fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor }}>{bride} &amp; {groom}</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['details','gallery','rsvp'].map(id => (
            <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer', color: template.textColor, fontWeight: '500' }}>{id}</span>
          ))}
        </div>
      </nav>
      <header id="home" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '82vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1.5rem' }}>Save the Date</span>
          <div style={{ fontFamily: template.fontNames, fontSize: '2.8rem', color: template.primaryColor, lineHeight: 1.1, marginBottom: '1.5rem' }}>{bride}<br /><span style={{ fontSize: '1.4rem' }}>&amp;</span><br />{groom}</div>
          <div style={{ width: '40px', height: '2px', background: template.primaryColor, marginBottom: '1.5rem' }} />
          <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.55, marginBottom: '0.5rem', lineHeight: 1.9 }}>{dateStr}</p>
          <p style={{ fontSize: '0.75rem', color: template.primaryColor, opacity: 0.45, lineHeight: 1.9 }}>{venue}</p>
          <button onClick={() => scrollTo('rsvp')} style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: template.primaryColor, color: '#fff', border: 'none', fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-start' }}>RSVP</button>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <img src={cover} alt="Wedding" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </header>
      <section id="details" style={{ padding: '5rem 3rem', maxWidth: '700px' }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Details</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '2rem' }}>Ceremony &amp; Reception</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ borderTop: `2px solid ${template.primaryColor}`, paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, marginBottom: '0.5rem' }}>When</div>
            <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, marginBottom: '0.25rem' }}>{dateStr}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.55 }}>{timeStr}</div>
          </div>
          <div style={{ borderTop: `2px solid ${template.primaryColor}`, paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, marginBottom: '0.5rem' }}>Where</div>
            <div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor }}>{venue}</div>
          </div>
        </div>
        <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
      </section>
      <section id="gallery" style={{ padding: '4rem 3rem', borderTop: `1px solid ${template.accentColor}` }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Gallery</span>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '2rem' }}>Our Story</h2>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ aspectRatio: '1' }} />
      </section>
      <section id="rsvp" style={{ padding: '5rem 3rem', background: template.accentColor }}>
        <div style={{ maxWidth: '460px' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: template.primaryColor, opacity: 0.45, display: 'block', marginBottom: '1rem' }}>Response</span>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '2rem', color: template.primaryColor, fontWeight: '400', marginBottom: '0.5rem' }}>Will You Attend?</h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '2rem' }}>Please respond by September 15, 2026.</p>
          <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
        </div>
      </section>
    </div>
  );
}

// ---- LAYOUT D: VINTAGE ----
function VintageLayout({ bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick, coverImage }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const cover = coverImage;
  return (
    <div style={{ fontFamily: template.fontBody, background: '#faf7ef', color: template.textColor, minHeight: '100vh', overflowX: 'hidden' }}>
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)' }}>
        {['home','details','gallery','rsvp'].map(id => (
          <span key={id} onClick={() => scrollTo(id)} style={{ color: 'rgba(255,245,220,0.9)', fontSize: '0.6rem', fontWeight: '700', letterSpacing: '3.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: template.fontTitle }}>{id}</span>
        ))}
      </nav>
      <header id="home" style={{ height: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.45) brightness(0.6)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(50,25,0,0.45)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2.5rem', border: '1px solid rgba(220,180,100,0.55)', borderRadius: '4px', maxWidth: '420px', margin: '0 1rem' }}>
          <div style={{ border: '3px double rgba(220,180,100,0.75)', padding: '2rem', borderRadius: '2px' }}>
            <span style={{ display: 'block', fontSize: '0.5rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#dca658', marginBottom: '1rem' }}>— Est. 2026 —</span>
            <div style={{ fontFamily: template.fontTitle, fontSize: '0.9rem', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,245,220,0.8)', marginBottom: '0.75rem' }}>The Wedding of</div>
            <div style={{ fontFamily: template.fontNames, fontSize: '2.8rem', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', lineHeight: 1.1, marginBottom: '0.25rem' }}>{bride}</div>
            <div style={{ color: '#dca658', fontSize: '0.85rem', fontFamily: template.fontTitle, letterSpacing: '3px', margin: '0.25rem 0' }}>AND</div>
            <div style={{ fontFamily: template.fontNames, fontSize: '2.8rem', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', lineHeight: 1.1, marginTop: '0.25rem' }}>{groom}</div>
            <div style={{ width: '60px', height: '1px', background: '#dca658', margin: '1rem auto', opacity: 0.6 }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,245,220,0.8)' }}>{dateStr}</span>
          </div>
          <button onClick={() => scrollTo('rsvp')} style={{ marginTop: '1.25rem', padding: '0.65rem 2rem', background: 'transparent', border: '1px solid #dca658', color: '#dca658', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', fontFamily: template.fontTitle }}>Kindly Reply</button>
        </div>
      </header>
      <section id="details" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>❧</div>
        <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400', marginBottom: '2rem' }}>Ceremony Details</h2>
        <div style={{ border: `2px solid ${template.primaryColor}`, boxShadow: `5px 5px 0 ${template.secondaryColor}`, padding: '2.5rem', display: 'inline-block', textAlign: 'left', minWidth: '300px', background: '#fffdf4' }}>
          <div style={{ marginBottom: '1.5rem' }}><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Date</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor }}>{dateStr}</div></div>
          <div style={{ marginBottom: '1.5rem' }}><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Time</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor }}>{timeStr}</div></div>
          <div><div style={{ fontSize: '0.55rem', letterSpacing: '3px', textTransform: 'uppercase', color: template.secondaryColor, marginBottom: '0.4rem' }}>Venue</div><div style={{ fontFamily: template.fontTitle, fontSize: '1rem', color: template.primaryColor, fontStyle: 'italic' }}>{venue}</div></div>
          <CalendarAndMap event={event} bride={bride} groom={groom} venue={venue} template={template} dateStr={dateStr} />
        </div>
        <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginTop: '2rem' }}>❦</div>
      </section>
      <section id="gallery" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>❧</div>
          <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400' }}>Our Memories</h2>
        </div>
        <GalleryGrid photos={photos} template={template} onPhotoClick={onPhotoClick} containerStyle={{ border: `3px solid ${template.primaryColor}`, aspectRatio: '4/3', boxShadow: `4px 4px 0 ${template.secondaryColor}` }} imageStyle={{ filter: 'sepia(0.2)' }} />
      </section>
      <section id="rsvp" style={{ padding: '5rem 1.5rem', background: '#fffdf4', borderTop: `1px solid ${template.accentColor}` }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '1.8rem', color: template.secondaryColor, marginBottom: '0.5rem' }}>❧</div>
            <h2 style={{ fontFamily: template.fontTitle, fontSize: '1.8rem', color: template.primaryColor, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '400', marginBottom: '0.5rem' }}>Kindly Reply</h2>
            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Please respond by September 15, 2026</p>
          </div>
          <div style={{ background: '#fff', border: `2px solid ${template.primaryColor}`, boxShadow: `5px 5px 0 ${template.secondaryColor}`, padding: '2rem 2.5rem' }}>
            <RsvpForm event={event} previewMode={previewMode} primary={template.primaryColor} secondary={template.secondaryColor} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- IMAGE MODAL CAROUSEL ----
function ImageModal({ photos, currentIndex, onClose, setCarouselIndex }) {
  if (currentIndex === null || !photos || !photos[currentIndex]) return null;
  
  const photo = photos[currentIndex];
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setCarouselIndex(currentIndex === 0 ? photos.length - 1 : currentIndex - 1);
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCarouselIndex(currentIndex === photos.length - 1 ? 0 : currentIndex + 1);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(photo.file_path);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `wedding-photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(photo.file_path, '_blank');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={onClose}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '2rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '3rem', cursor: 'pointer', lineHeight: 1, zIndex: 10 }}>&times;</button>
      
      {photos.length > 1 && (
        <button onClick={handlePrev} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', zIndex: 10, transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.3)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.1)'}>
          &#10094;
        </button>
      )}

      <img src={photo.file_path} alt={photo.caption || ''} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
      
      {photo.caption && <p style={{ color: '#fff', marginTop: '1.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>{photo.caption}</p>}
      
      {photos.length > 1 && (
        <button onClick={handleNext} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', zIndex: 10, transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.3)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.1)'}>
          &#10095;
        </button>
      )}

      <button onClick={handleDownload} style={{ marginTop: '2rem', padding: '0.9rem 2rem', background: '#fff', color: '#000', border: 'none', borderRadius: '50px', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', zIndex: 10 }} onMouseEnter={e=>e.target.style.transform='scale(1.05)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download Photo
      </button>
      
      {photos.length > 1 && (
        <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '1rem', letterSpacing: '2px' }}>
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

// ---- MAIN EXPORT ----
export default function TemplateRenderer({ event, template, photos = [], previewMode = false }) {
  const [carouselIndex, setCarouselIndex] = useState(null);

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
  
  const props = { bride, groom, dateStr, timeStr, venue, template, photos, event, previewMode, onPhotoClick: handlePhotoClick, coverImage };
  const cat = (template.category || template.layout || 'royal').toLowerCase();
  
  return (
    <>
      {cat === 'floral' ? <FloralLayout {...props} /> :
       cat === 'minimalist' ? <MinimalistLayout {...props} /> :
       cat === 'vintage' ? <VintageLayout {...props} /> :
       <RoyalLayout {...props} />}
       
      {carouselIndex !== null && <ImageModal photos={photos} currentIndex={carouselIndex} setCarouselIndex={setCarouselIndex} onClose={() => setCarouselIndex(null)} />}
    </>
  );
}

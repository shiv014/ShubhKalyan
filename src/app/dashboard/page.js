'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { ExternalLink, CheckCircle, XCircle, Edit3, Paintbrush, Image as ImageIcon, Mail, Link as LinkIcon, MapPin, UploadCloud, Star, Copy, RefreshCw, ChevronDown, MailOpen, ImageOff } from 'lucide-react';
import { getTemplates, getTemplateById } from '@/lib/templates';
import TemplateRenderer from '@/components/TemplateRenderer';
import styles from './dashboard.module.css';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#666' }}>Loading Map...</div>
});

const STOCK_COVERS = [
  { name: 'Royal Palace', path: '/covers/cover_royal_1784272436002.jpg' },
  { name: 'Floral Garden', path: '/covers/cover_floral_1784272450659.jpg' },
  { name: 'Minimalist Marble', path: '/covers/cover_minimalist_1784272467100.jpg' },
  { name: 'Vintage Sepia', path: '/covers/cover_vintage_1784272482211.jpg' },
  { name: 'Beach Sunset', path: '/covers/cover_beach_1784272520709.jpg' },
  { name: 'Rustic Barn', path: '/covers/cover_rustic_1784272532607.jpg' },
  { name: 'Modern Gold', path: '/covers/cover_modern_1784272543611.jpg' },
  { name: 'Classic Church', path: '/covers/cover_classic_1784272554643.jpg' },
  { name: 'Hindu Traditional', path: '/covers/cover_hindu_traditional_1784273058888.jpg' },
  { name: 'South Indian', path: '/covers/cover_hindu_south_1784273072834.jpg' },
  { name: 'Hindu Modern', path: '/covers/cover_hindu_modern_1784273087256.jpg' },
  { name: 'Haldi / Mehendi', path: '/covers/cover_hindu_haldi_1784273102331.jpg' }
];

function DashboardPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'templates', 'photos', 'rsvp', 'url'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Database state
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [user, setUser] = useState(null);

  // Local Form state (for instant preview matching)
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [venueLat, setVenueLat] = useState(null);
  const [venueLng, setVenueLng] = useState(null);
  const [audioPath, setAudioPath] = useState(null);
  const [templateId, setTemplateId] = useState('tpl-1');
  const [slug, setSlug] = useState('');

  // Upload/Form feedback state
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingTpl, setSavingTpl] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  const [alert, setAlert] = useState(null); // { type: 'success'|'danger', message: '' }

  // Search/Filter for 120 templates
  const [tplSearch, setTplSearch] = useState('');
  const [tplCategory, setTplCategory] = useState('All');
  
  // File input ref
  const fileInputRef = useRef(null);
  const [photoCaption, setPhotoCaption] = useState('');

  // All templates cache
  const allTemplates = getTemplates();

  const searchParams = useSearchParams();
  // Capture the template URL param ONCE at mount — never re-read from searchParams inside the effect
  const initialTemplateParam = useRef(searchParams.get('template'));

  // Load event data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/event');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        
        const data = await res.json();
        if (res.ok) {
          setEvent(data.event);
          setPhotos(data.photos || []);
          setRsvps(data.rsvps || []);
          
          // Populate form fields
          setBrideName(data.event.bride_name || '');
          setGroomName(data.event.groom_name || '');
          setEventDate(data.event.event_date || '');
          setVenue(data.event.venue || '');
          setVenueLat(data.event.venue_lat ? parseFloat(data.event.venue_lat) : null);
          setVenueLng(data.event.venue_lng ? parseFloat(data.event.venue_lng) : null);
          setAudioPath(data.event.audio_path || null);
          setSlug(data.event.slug || '');

          // Read template param from ref (captured once at mount, never causes re-runs)
          const templateParam = initialTemplateParam.current;
          if (templateParam && templateParam !== data.event.template_id) {
            setTemplateId(templateParam);
            await fetch('/api/event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                templateId: templateParam,
                brideName: data.event.bride_name || '',
                groomName: data.event.groom_name || '',
                eventDate: data.event.event_date || '',
                venue: data.event.venue || '',
                venueLat: data.event.venue_lat || null,
                venueLng: data.event.venue_lng || null,
                audioPath: data.event.audio_path || null
              })
            });
          } else {
            setTemplateId(data.event.template_id || 'tpl-1');
          }
          // Always clear param from URL on first load
          if (templateParam) router.replace('/dashboard');

          // Get username from cookie (we can fetch it or mock it)
          setUser({ name: 'Guest Host' });
        } else {
          showToast('danger', data.error || 'Failed to load details');
        }
      } catch (err) {
        console.error(err);
        showToast('danger', 'Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount — templateParam captured via ref above

  const showToast = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Save Details
  const saveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          brideName,
          groomName,
          eventDate,
          venue,
          venueLat,
          venueLng,
          audioPath
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEvent(data.event);
        showToast('success', 'Wedding details updated!');
        setActiveTab('templates');
      } else {
        showToast('danger', data.error || 'Failed to update details');
      }
    } catch (err) {
      showToast('danger', 'Failed to save details');
    } finally {
      setSavingDetails(false);
    }
  };

  // 2. Select & Save Template
  const handleSelectTemplate = async (id) => {
    setTemplateId(id);
    setSavingTpl(true);
    try {
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: id,
          brideName,
          groomName,
          eventDate,
          venue,
          venueLat,
          venueLng,
          audioPath
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEvent(data.event);
        showToast('success', `Theme switched!`);
        // Auto-advance to next step
        setActiveTab('photos');
        window.scrollTo(0, 0);
      } else {
        showToast('danger', data.error || 'Failed to update theme');
      }
    } catch (err) {
      showToast('danger', 'Connection error');
    } finally {
      setSavingTpl(false);
    }
  };

  // 3. Upload Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', photoCaption);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos([data.photo, ...photos]);
        setPhotoCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('success', 'Photo added to gallery!');
      } else {
        showToast('danger', data.error || 'Failed to upload photo');
      }
    } catch (err) {
      showToast('danger', 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 3b. Upload Audio
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAudio(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAudioPath(data.fileUrl);
        showToast('success', 'Background music uploaded successfully! Save to apply.');
      } else {
        showToast('danger', data.error || 'Failed to upload audio');
      }
    } catch (err) {
      showToast('danger', 'Upload failed');
    } finally {
      setUploadingAudio(false);
    }
  };

  // 4. Delete Photo
  const handlePhotoDelete = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await fetch(`/api/upload?id=${photoId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
        showToast('success', 'Photo removed');
      } else {
        showToast('danger', 'Failed to delete photo');
      }
    } catch (err) {
      showToast('danger', 'Error deleting photo');
    }
  };

  // 4b. Set Cover Photo
  const handleSetCover = async (photoId) => {
    try {
      const res = await fetch(`/api/upload/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      });
      if (res.ok) {
        setPhotos(photos.map(p => ({ ...p, is_cover: p.id === photoId ? 1 : 0 })));
        showToast('success', 'Cover photo updated!');
      } else {
        showToast('danger', 'Failed to update cover photo');
      }
    } catch (err) {
      showToast('danger', 'Error updating cover photo');
    }
  };

  // 4c. Set Stock Cover
  const handleSetStockCover = async (filePath) => {
    try {
      const res = await fetch(`/api/upload/stock-cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedPhotos = photos.map(p => ({ ...p, is_cover: 0 }));
        const existing = updatedPhotos.find(p => p.file_path === filePath);
        if (existing) {
          existing.is_cover = 1;
          setPhotos(updatedPhotos);
        } else {
          setPhotos([data.photo, ...updatedPhotos]);
        }
        showToast('success', 'Cover photo updated!');
      } else {
        showToast('danger', 'Failed to update cover photo');
      }
    } catch (err) {
      showToast('danger', 'Error updating cover photo');
    }
  };

  // 5. Claim/Update URL
  const handleSaveUrl = async (e) => {
    e.preventDefault();
    setSavingUrl(true);
    try {
      const res = await fetch('/api/event/claim-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
      const data = await res.json();
      if (res.ok) {
        setEvent({ ...event, slug: data.slug, status: data.status });
        setSlug(data.slug || '');
        showToast('success', data.message);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#cfa830', '#7c2230', '#ffffff']
        });
      } else {
        showToast('danger', data.error || 'Failed to claim URL');
      }
    } catch (err) {
      showToast('danger', 'Error configuring URL');
    } finally {
      setSavingUrl(false);
    }
  };

  // 6. Release URL (Take offline)
  const handleTakeOffline = async () => {
    if (!confirm('Are you sure you want to take your site offline? This will free up your custom URL.')) return;

    setSavingUrl(true);
    try {
      const res = await fetch('/api/event/claim-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: '' })
      });
      const data = await res.json();
      if (res.ok) {
        setEvent({ ...event, slug: null, status: 'draft' });
        setSlug('');
        showToast('success', 'Website taken offline.');
      } else {
        showToast('danger', data.error || 'Failed to update status');
      }
    } catch (err) {
      showToast('danger', 'Error offline');
    } finally {
      setSavingUrl(false);
    }
  };

  // 7. Delete RSVP guest entry
  const handleDeleteRsvp = async (rsvpId) => {
    if (!confirm('Delete this RSVP guest record?')) return;

    try {
      const res = await fetch(`/api/rsvp?id=${rsvpId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRsvps(rsvps.filter(r => r.id !== rsvpId));
        showToast('success', 'RSVP removed');
      } else {
        showToast('danger', 'Failed to delete RSVP');
      }
    } catch (err) {
      showToast('danger', 'Error deleting RSVP');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
          Shubh<span>Kalyan</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading your dashboard...</div>
      </div>
    );
  }

  // Calculate guest count stats
  const attendingRsvps = rsvps.filter(r => r.attending === 1);
  const totalAttendingGuests = attendingRsvps.reduce((acc, curr) => acc + curr.guests_count, 0);
  const declinedCount = rsvps.filter(r => r.attending === 0).length;

  // Filter templates list
  const filteredTemplates = allTemplates.filter(t => {
    const matchesCategory = tplCategory === 'All' || t.category === tplCategory;
    const matchesSearch = t.name.toLowerCase().includes(tplSearch.toLowerCase()) ||
                          t.category.toLowerCase().includes(tplSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Current selected template details for preview rendering
  const activeTemplate = getTemplateById(templateId) || allTemplates[0];

  // Simulated live event object for preview
  const previewEvent = {
    id: event?.id,
    bride_name: brideName,
    groom_name: groomName,
    event_date: eventDate,
    venue: venue,
  };

  return (
    <div>
      {/* Dashboard Top Navbar */}
      <nav className="navbar">
        <div className="container navbar-container">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            <img src="/logo.png" alt="ShubhKalyan Logo" className="brand-logo" />
            <span className="hide-on-mobile" style={{ fontSize: '0.55em', opacity: 0.6, marginLeft: '0.75rem', color: 'var(--color-primary)', fontWeight: '500', fontFamily: 'var(--font-sans)', letterSpacing: '1px' }}>| HOST PORTAL</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {event?.status === 'published' && event?.slug && (
              <a 
                href={`/${event.slug}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-gold" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <ExternalLink size={14} /> <span className="hide-on-mobile">View Live Site</span>
              </a>
            )}
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Alert Notifications */}
      {alert && (
        <div 
          className={`alert alert-${alert.type}`} 
          style={{ 
            position: 'fixed', 
            top: '80px', 
            right: '20px', 
            zIndex: 1000, 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            animation: 'fadeInUp 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {alert.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />} {alert.message}
        </div>
      )}

      {/* Main Dashboard Portal Container */}
      <div className={styles.dashboardContainer}>
        
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          
          {/* Mobile Toggle Button */}
          <button 
            className={styles.mobileSidebarToggle}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'details' && <><Edit3 size={18} /> Event Details</>}
              {activeTab === 'templates' && <><Paintbrush size={18} /> Choose Template</>}
              {activeTab === 'photos' && <><ImageIcon size={18} /> Photo Gallery</>}
              {activeTab === 'rsvp' && <><Mail size={18} /> RSVPs</>}
              {activeTab === 'url' && <><LinkIcon size={18} /> Website Link</>}
            </span>
            <ChevronDown size={20} style={{ transform: isMobileSidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <div className={`${styles.sidebarMenu} ${isMobileSidebarOpen ? styles.sidebarMenuOpen : ''}`}>
            <button 
              onClick={() => { setActiveTab('details'); setIsMobileSidebarOpen(false); }} 
              className={`${styles.tabBtn} ${activeTab === 'details' ? styles.activeTabBtn : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Edit3 size={16} /> Event Details
            </button>
            <button 
              onClick={() => { setActiveTab('templates'); setIsMobileSidebarOpen(false); }} 
              className={`${styles.tabBtn} ${activeTab === 'templates' ? styles.activeTabBtn : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Paintbrush size={16} /> Choose Template
            </button>
            <button 
              onClick={() => { setActiveTab('photos'); setIsMobileSidebarOpen(false); }} 
              className={`${styles.tabBtn} ${activeTab === 'photos' ? styles.activeTabBtn : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ImageIcon size={16} /> Photo Gallery
            </button>
            <button 
              onClick={() => { setActiveTab('rsvp'); setIsMobileSidebarOpen(false); }} 
              className={`${styles.tabBtn} ${activeTab === 'rsvp' ? styles.activeTabBtn : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mail size={16} /> RSVPs ({rsvps.length})
            </button>
            <button 
              onClick={() => { setActiveTab('url'); setIsMobileSidebarOpen(false); }} 
              className={`${styles.tabBtn} ${activeTab === 'url' ? styles.activeTabBtn : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LinkIcon size={16} /> Website Link
            </button>

            <div style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Status: {event?.status === 'published' ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}><span className={styles.liveDot}></span>Published (Live)</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>● Draft (Offline)</span>
              )}
              {event?.slug && <div style={{ marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>/{event.slug}</div>}
            </div>
          </div>
        </aside>

        {/* Dynamic Tab Body */}
        <main className={styles.mainContent}>
          
          {/* TAB 1: Event Details */}
          {activeTab === 'details' && (
            <div className="animate-fade-in-up">
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Wedding Event Details</h2>
              </div>
              <p>Enter details of your special day. Updates reflect instantly on your live preview on the right.</p>

              <form onSubmit={saveDetails} className="card" style={{ marginTop: '1.5rem' }}>
                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="bride">Bride's Full Name</label>
                    <input 
                      type="text" 
                      id="bride" 
                      className="form-input" 
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g. Alice Smith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="groom">Groom's Full Name</label>
                    <input 
                      type="text" 
                      id="groom" 
                      className="form-input" 
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g. Bob Johnson"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" htmlFor="date">Wedding Date & Time</label>
                  <input 
                    type="datetime-local" 
                    id="date" 
                    className="form-input" 
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Background Music (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', border: '1px solid #ddd', padding: '0.6rem 1rem', borderRadius: '4px' }}>
                      <Music size={16} /> {uploadingAudio ? 'Uploading...' : 'Upload MP3 / WAV'}
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} disabled={uploadingAudio} />
                    </label>
                    {audioPath ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={14} /> Custom music loaded
                        <button type="button" onClick={() => setAudioPath(null)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}>Remove</button>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Theme default will play if no music is uploaded</span>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" htmlFor="venue">Celebration Venue Address</label>
                  <input 
                    type="text" 
                    id="venue" 
                    className="form-input" 
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Grand Imperial Ballroom, Mumbai"
                    required
                  />
                  
                  <div style={{ marginTop: '1rem', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> Interactive Map (Drag to pin)</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>Updates address automatically</span>
                    </div>
                    <div style={{ width: '100%', height: '100%', paddingTop: '30px', boxSizing: 'border-box' }}>
                      <MapPicker 
                        venue={venue} 
                        setVenue={setVenue} 
                        position={(venueLat !== null && venueLng !== null) ? [venueLat, venueLng] : null}
                        setPosition={(pos) => {
                          if (pos) {
                            setVenueLat(pos[0]);
                            setVenueLng(pos[1]);
                          } else {
                            setVenueLat(null);
                            setVenueLng(null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    disabled={savingDetails}
                  >
                    {savingDetails ? 'Saving...' : 'Save & Continue'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setActiveTab('templates'); window.scrollTo(0, 0); }}
                    className="btn btn-secondary" 
                  >
                    Skip &rarr;
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Choose Template */}
          {activeTab === 'templates' && (
            <div className="animate-fade-in-up">
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Browse templates</h2>
              </div>
              <p>Explore 120 unique style combinations. Select one to apply it to your website instantly.</p>

              {/* Filtering Controls */}
              <div className={styles.filterControls}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search template name..." 
                  value={tplSearch}
                  onChange={(e) => setTplSearch(e.target.value)}
                />
                <select 
                  className="form-input"
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  style={{ minWidth: '150px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Royal">Royal</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Floral">Floral</option>
                  <option value="Vintage">Vintage</option>
                </select>
              </div>

              {/* Template Card Listing */}
              <div className={styles.tplSelectorGrid}>
                {filteredTemplates.map((tpl) => (
                  <div 
                    key={tpl.id} 
                    className={`${styles.tplSelectorCard} ${templateId === tpl.id ? styles.activeTplCard : ''}`}
                    onClick={() => handleSelectTemplate(tpl.id)}
                  >
                    <div 
                      className={styles.tplPreviewThumb} 
                      style={{ 
                        backgroundImage: `url(${tpl.bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Dark Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.45))',
                        zIndex: 1
                      }} />
                      
                      {/* Inner Mini Border Card */}
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '85%',
                        height: '80%',
                        border: tpl.category === 'Royal' ? `2px double ${tpl.secondaryColor}` : `1px solid rgba(255,255,255,0.2)`,
                        borderRadius: tpl.category === 'Floral' ? '12px' : '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '0.45rem', 
                          letterSpacing: '1px', 
                          textTransform: 'uppercase', 
                          color: '#ffffff',
                          opacity: 0.8,
                          fontFamily: 'var(--font-sans)',
                          marginBottom: '0.05rem'
                        }}>{tpl.category === 'Royal' ? 'INVITATION' : 'SAVE THE DATE'}</span>
                        
                        <div style={{
                          fontFamily: tpl.fontNames,
                          fontSize: tpl.fontNames.includes('great-vibes') ? '1.55rem' : '0.85rem',
                          color: tpl.secondaryColor,
                          margin: '0.1rem 0',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          textTransform: tpl.fontNames.includes('great-vibes') ? 'none' : 'uppercase',
                          fontWeight: tpl.fontNames.includes('great-vibes') ? 'normal' : 'bold'
                        }}>
                          {tpl.coupleNames}
                        </div>
                      </div>
                    </div>
                    <div className={styles.tplCardInfo}>
                      <div className={styles.tplName}>{tpl.name}</div>
                      <div className={styles.tplMeta}>
                        <span className={styles.tplTag}>{tpl.category}</span>
                        <div className={styles.tplSwatches}>
                          <div className={styles.swatch} style={{ backgroundColor: tpl.primaryColor }} title="Primary" />
                          <div className={styles.swatch} style={{ backgroundColor: tpl.secondaryColor }} title="Secondary" />
                          <div className={styles.swatch} style={{ backgroundColor: tpl.bgColor }} title="Background" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTemplates.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No templates found matching your search.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => { setActiveTab('photos'); window.scrollTo(0, 0); }} className="btn btn-secondary">Skip &rarr;</button>
                <button type="button" onClick={() => { setActiveTab('photos'); window.scrollTo(0, 0); }} className="btn btn-primary">Continue to Photos &rarr;</button>
              </div>
            </div>
          )}

          {/* TAB 3: Photo Gallery */}
          {activeTab === 'photos' && (
            <div className="animate-fade-in-up">
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Gallery Photos</h2>
              </div>
              <p>Upload photos of you and your partner. They will be beautifully arranged in the gallery section.</p>

              {/* File Upload Box */}
              <div className="card" style={{ margin: '1.5rem 0' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Add New Photo</h3>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="caption">Photo Description / Caption</label>
                  <input 
                    type="text" 
                    id="caption" 
                    className="form-input" 
                    placeholder="e.g. Our Engagement Day" 
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                </div>

                <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                  <div className={styles.uploadIcon} style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}><UploadCloud size={48} /></div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {uploadingPhoto ? 'Uploading photo...' : 'Click to choose image'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG or JPEG up to 5MB</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </div>
              </div>

              {/* Stock Cover Grid */}
              <h3 style={{ fontSize: '1.2rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Or Choose a Premium Theme Cover</h3>
              <div className={styles.photoGrid}>
                {STOCK_COVERS.map((stock) => (
                  <div key={stock.name} className={styles.photoCard}>
                    <img src={stock.path} alt={stock.name} className={styles.photoThumb} />
                    <button 
                      onClick={() => handleSetStockCover(stock.path)} 
                      style={{ position: 'absolute', top: '8px', left: '8px', background: photos.find(p=>p.file_path===stock.path && p.is_cover) ? 'var(--color-primary)' : 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', zIndex: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {photos.find(p=>p.file_path===stock.path && p.is_cover) ? <><Star size={12} fill="currentColor" /> Cover</> : 'Set Cover'}
                    </button>
                    <div className={styles.photoCaption}>{stock.name}</div>
                  </div>
                ))}
              </div>

              {/* Uploaded Gallery Grid */}
              <h3 style={{ fontSize: '1.3rem', margin: '2rem 0 1rem 0' }}>Uploaded Gallery ({photos.length})</h3>
              <div className={styles.photoGrid}>
                {photos.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    <img src={photo.file_path} alt={photo.caption} className={styles.photoThumb} />
                    <button className={styles.photoDeleteBtn} onClick={() => handlePhotoDelete(photo.id)} title="Delete Photo">
                      ×
                    </button>
                    <button 
                      onClick={() => handleSetCover(photo.id)} 
                      style={{ position: 'absolute', top: '8px', left: '8px', background: photo.is_cover ? 'var(--color-primary)' : 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', zIndex: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      title="Set as Main Cover Photo"
                    >
                      {photo.is_cover ? <><Star size={12} fill="currentColor" /> Cover</> : 'Set Cover'}
                    </button>
                    {photo.caption && <div className={styles.photoCaption}>{photo.caption}</div>}
                  </div>
                ))}
                {photos.length === 0 && (
                  <div style={{ gridColumn: '1/-1' }} className={styles.emptyState}>
                    <ImageOff size={48} className={styles.emptyStateIcon} />
                    <h4 className={styles.emptyStateTitle}>Your Gallery is Empty</h4>
                    <p className={styles.emptyStateText}>
                      Start uploading beautiful moments of your journey to share with your loved ones. They will be beautifully arranged on your live website.
                    </p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => { setActiveTab('rsvp'); window.scrollTo(0, 0); }} className="btn btn-secondary">Skip &rarr;</button>
                <button type="button" onClick={() => { setActiveTab('rsvp'); window.scrollTo(0, 0); }} className="btn btn-primary">Continue to RSVPs &rarr;</button>
              </div>
            </div>
          )}

          {/* TAB 4: RSVPs */}
          {activeTab === 'rsvp' && (
            <div className="animate-fade-in-up">
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>RSVP Guestlist</h2>
              </div>
              <p>Manage responses from your wedding guests. They RSVP directly on your live website.</p>

              {/* Stats Counters */}
              <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{rsvps.length}</div>
                  <div className={styles.statLabel}>Total Responses</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{totalAttendingGuests}</div>
                  <div className={styles.statLabel}>Guests Attending</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNum}>{declinedCount}</div>
                  <div className={styles.statLabel}>Declined (Can't Attend)</div>
                </div>
              </div>

              {/* Guestlist Table */}
              <div className={styles.tableCard}>
                <table className={styles.rsvpTable}>
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Email</th>
                      <th>Attending?</th>
                      <th>Total Party</th>
                      <th>Message/Wishes</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id}>
                        <td style={{ fontWeight: '600' }}>{rsvp.name}</td>
                        <td>{rsvp.email || '-'}</td>
                        <td>
                          {rsvp.attending === 1 ? (
                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Attending</span>
                          ) : (
                            <span className={`${styles.badge} ${styles.badgeDanger}`}>Declined</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rsvp.guests_count}</td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '240px', overflowWrap: 'break-word' }}>
                          {rsvp.message || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>None</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteRsvp(rsvp.id)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rsvps.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: 0 }}>
                          <div className={styles.emptyState} style={{ border: 'none', margin: '2rem 0' }}>
                            <MailOpen size={48} className={styles.emptyStateIcon} />
                            <h4 className={styles.emptyStateTitle}>No Responses Yet</h4>
                            <p className={styles.emptyStateText}>
                              Once you share your live wedding URL, guests will be able to RSVP directly. Their responses and warm wishes will magically appear right here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => { setActiveTab('url'); window.scrollTo(0, 0); }} className="btn btn-primary">Continue to Website Link &rarr;</button>
              </div>
            </div>
          )}

          {/* TAB 5: Website URL Link */}
          {activeTab === 'url' && (
            <div className="animate-fade-in-up">
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Claim Your Wedding URL</h2>
              </div>
              <p>Claim a custom URL to host your invitation page. One user can claim exactly one URL at a time.</p>

              <div className={styles.urlClaimBox}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Customize Link</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Only alphanumeric characters and hyphens are allowed.
                </p>

                <form onSubmit={handleSaveUrl}>
                  <div className={styles.urlInputContainer}>
                    <div className={styles.urlDomainPrefix}>shubhkalyan.in/</div>
                    <input 
                      type="text" 
                      className={styles.urlInput}
                      placeholder="alicewedsbob"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn btn-gold" 
                      style={{ flex: 1 }}
                      disabled={savingUrl}
                    >
                      {savingUrl ? 'Updating link...' : event?.status === 'published' ? 'Rename URL Link' : 'Publish & Claim URL'}
                    </button>
                    
                    {event?.status === 'published' && (
                      <button 
                        type="button" 
                        onClick={handleTakeOffline} 
                        className="btn btn-secondary"
                        disabled={savingUrl}
                      >
                        Take Site Offline
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {event?.status === 'published' && event?.slug && (
                <div className="card alert alert-success" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>🎉 Your Wedding Site is Live!</h4>
                  <p style={{ fontSize: '0.95rem', margin: 0 }}>
                    Share this link with your family and friends:
                  </p>
                  <a 
                    href={`/${event.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)', textDecoration: 'underline' }}
                  >
                    shubhkalyan.in/{event.slug}
                  </a>
                </div>
              )}
            </div>
          )}

        </main>

        {/* Real-time Phone Frame Live Preview */}
        <aside className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Live Mobile Preview</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Updates in real-time as you edit details</p>
          </div>

          <div className={styles.deviceWrapper}>
            <div className={styles.deviceScreen}>
              <TemplateRenderer 
                event={previewEvent} 
                template={activeTemplate} 
                photos={photos} 
                previewMode={true} 
              />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
          Shubh<span>Kalyan</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading your dashboard...</div>
      </div>
    }>
      <DashboardPortal />
    </Suspense>
  );
}

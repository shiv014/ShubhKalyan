'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function PhotoLightbox({ photos, currentIndex, onClose, onNavigate, bride = 'Bride', groom = 'Groom' }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Prevent background scrolling when open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  if (!isClient || photos.length === 0 || currentIndex === null) return null;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const newIdx = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    onNavigate(newIdx);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const newIdx = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIdx);
  };

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    const photo = photos[currentIndex];
    if (!photo) return;
    
    try {
      const response = await fetch(photo.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wedding-${bride}-${groom}-${photo.id || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // Fallback: open image in a new tab if cors restriction prevents direct blob download
      window.open(photo.file_path, '_blank');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {/* Download Button */}
      <button 
        onClick={handleDownload}
        title="Download Photo"
        aria-label="Download Photo"
        style={{
          position: 'absolute', top: '20px', right: '80px',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: '#fff', borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s', zIndex: 10
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        <Download size={20} />
      </button>

      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: '#fff', borderRadius: '50%', width: '44px', height: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.2s', zIndex: 10
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        <X size={24} />
      </button>

      {photos.length > 1 && (
        <button 
          onClick={handlePrev}
          style={{
            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s', zIndex: 10
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      <div style={{ maxWidth: '90%', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <img 
          src={photos[currentIndex]?.file_path} 
          alt={photos[currentIndex]?.caption || 'Gallery Image'}
          style={{
            maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain',
            borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.3s ease-out'
          }}
        />
        {photos[currentIndex]?.caption && (
          <div style={{
            position: 'absolute', bottom: '-40px', left: 0, right: 0,
            textAlign: 'center', color: '#fff', fontSize: '1.1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {photos[currentIndex].caption}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <button 
          onClick={handleNext}
          style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', borderRadius: '50%', width: '56px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s', zIndex: 10
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
}

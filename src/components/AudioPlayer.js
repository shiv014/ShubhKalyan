'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';

export default function AudioPlayer({ src = "/audio/romantic-bg.mp3" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    let interactionHandled = false;

    const playAudio = async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        removeListeners();
      } catch (err) {
        console.log("Autoplay blocked. Waiting for user interaction...");
      }
    };

    const handleInteraction = () => {
      if (!interactionHandled) {
        interactionHandled = true;
        playAudio();
      }
    };

    const removeListeners = () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    // Attempt autoplay immediately
    playAudio();

    // Attach listeners to catch the first interaction
    document.addEventListener('click', handleInteraction);
    document.addEventListener('scroll', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction, { passive: true });

    return () => {
      removeListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  if (!isClient) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      zIndex: 9999
    }}>
      <button 
        onClick={togglePlay}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-primary, #7c2230)',
          position: 'relative',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {/* Pulsing ring when paused to attract attention */}
        {!isPlaying && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%',
            border: '2px solid var(--color-primary, #7c2230)',
            animation: 'pulseGlow 2s infinite',
            pointerEvents: 'none'
          }} />
        )}
        
        {isPlaying ? (
          <Pause size={24} fill="currentColor" />
        ) : (
          <div style={{ position: 'relative' }}>
            <Music size={24} />
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-primary, #7c2230)', color: '#fff', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>Play</div>
          </div>
        )}
      </button>
    </div>
  );
}

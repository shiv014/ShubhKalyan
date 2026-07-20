'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Volume2 } from 'lucide-react';

export default function AudioPlayer({ src = "/audio/shehnai-short.m4a" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

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

  // Adjust volume whenever state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    <div 
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: showVolume ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        padding: showVolume ? '6px 16px 6px 6px' : '0',
        borderRadius: '30px',
        boxShadow: showVolume ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
    >
      <button 
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: 'none',
          boxShadow: showVolume ? 'none' : '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--color-primary, #7c2230)',
          position: 'relative',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
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

      {showVolume && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.25s ease' }}>
          <Volume2 size={16} color="var(--text-secondary, #4a453f)" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '80px',
              height: '4px',
              borderRadius: '2px',
              background: '#e8d9c5',
              outline: 'none',
              cursor: 'pointer',
              accentColor: 'var(--color-primary, #7c2230)',
            }}
          />
        </div>
      )}
    </div>
  );
}

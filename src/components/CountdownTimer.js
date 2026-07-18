'use client';


import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [isClient, setIsClient] = useState(false);
  const [hasPassed, setHasPassed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!eventDate) return;

    const targetDate = new Date(eventDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setHasPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setHasPassed(false);
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  if (!isClient || !eventDate || hasPassed) return null;

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '2rem 0',
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        fontSize: '0.85rem', 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        color: 'inherit',
        opacity: 0.9,
        fontWeight: 'bold'
      }}>
        <Clock size={16} /> Counting Down
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((unit, idx) => (
          <div key={unit.label} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              fontFamily: 'var(--font-serif)',
              lineHeight: 1,
              minWidth: '46px'
            }}>
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '0.25rem',
              opacity: 0.7
            }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

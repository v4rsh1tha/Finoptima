import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const logoSvg = process.env.PUBLIC_URL + '/drawing1.svg';

/* ── Individual choice card ─────────────────────────────────────────── */
const ChoiceCard = ({ isBlue, emoji, heading, subtext, onClick, entranceDir, entranceDelay, fading }) => {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), entranceDelay);
    return () => clearTimeout(t);
  }, [entranceDelay]);

  const style = {
    flex: '1 1 280px',
    minWidth: 280,
    minHeight: 320,
    borderRadius: 24,
    padding: '44px 36px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.2s ease, opacity 0.25s ease',
    transform: !mounted
      ? `translateX(${entranceDir === 'left' ? '-60px' : '60px'})`
      : hovered ? 'translateY(-8px)' : 'translateY(0)',
    opacity: !mounted ? 0 : fading ? 0.35 : 1,
    willChange: 'transform, opacity',

    ...(isBlue ? {
      background: 'linear-gradient(135deg, #1C5BC0, #2A61C1)',
      border: 'none',
      boxShadow: hovered
        ? '0 32px 72px rgba(28,91,192,0.5)'
        : '0 8px 32px rgba(28,91,192,0.28)',
    } : {
      backgroundColor: '#FAFCFB',
      border: `2px solid ${hovered ? '#1C5BC0' : '#E8E8E8'}`,
      boxShadow: hovered
        ? '0 28px 64px rgba(28,91,192,0.12)'
        : '0 4px 20px rgba(0,0,0,0.05)',
    }),
  };

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Decorative rings on blue card */}
      {isBlue && <>
        <div style={{
          position: 'absolute', bottom: -56, right: -56,
          width: 200, height: 200, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -36, left: -36,
          width: 150, height: 150, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />
        {/* Shimmer sweep on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
            animation: 'shimmerSweep 0.6s ease forwards',
            pointerEvents: 'none',
          }} />
        )}
      </>}

      {/* Emoji icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        backgroundColor: isBlue ? 'rgba(255,255,255,0.15)' : 'rgba(28,91,192,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, lineHeight: 1,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'scale(1.15)' : 'scale(1)',
      }}>
        {emoji}
      </div>

      {/* Text */}
      <div>
        <h3 style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22,
          lineHeight: 1.2, color: isBlue ? 'white' : '#1A1A2E',
          marginBottom: 10, letterSpacing: '-0.01em',
        }}>
          {heading}
        </h3>
        <p style={{
          fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65,
          color: isBlue ? 'rgba(255,255,255,0.8)' : '#6A6B6B', margin: 0,
        }}>
          {subtext}
        </p>
      </div>

      {/* Arrow CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 14,
        color: isBlue ? 'rgba(255,255,255,0.9)' : '#1C5BC0',
        transition: 'gap 0.2s ease',
        ...(hovered ? { gap: 10 } : {}),
      }}>
        Get started
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </button>
  );
};

/* ── Page ───────────────────────────────────────────────────────────── */
const PUB = process.env.PUBLIC_URL;

const GoldenQuestion = ({ userName }) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [clicking, setClicking] = useState(null); // 'left' | 'right'

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const name = userName || 'there';

  const handleClick = (target, path) => {
    setClicking(target);
    setTimeout(() => navigate(path), 280);
  };

  const entranceStyle = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FAFCFB',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', position: 'relative',
    }}>

      {/* Subtle radial bg */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 860, height: 860, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(28,91,192,0.045) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 720 }}>

        {/* Logo + Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 52, ...entranceStyle(0) }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src={logoSvg} alt="Finoptima" style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 8 }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <span style={{ color: '#1C5BC0' }}>Fin</span>
              <span style={{ color: '#1A1A2E' }}>optima</span>
            </span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', marginTop: 2 }}>
            Every Swipe Optimized
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 52, ...entranceStyle(100) }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 36, color: '#1A1A2E',
            lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14,
          }}>
            Hi {name}, let's begin.
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 18, color: '#6A6B6B', lineHeight: 1.6 }}>
            What would you like to do today?
          </p>
        </div>

        {/* Illustration — choose card (small, decorative) */}
        <div style={{ textAlign: 'center', marginBottom: 36, ...entranceStyle(160) }}>
          <img
            src={PUB + '/illustrations/undraw_choose-card_es1o.svg'}
            alt="Choose a card"
            style={{ width: 160, height: 'auto', objectFit: 'contain', opacity: 0.85 }}
          />
        </div>

        {/* Choice cards */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          <ChoiceCard
            isBlue
            emoji="💳"
            heading="Find My Perfect Card"
            subtext="Discover the best card for your lifestyle"
            entranceDir="left"
            entranceDelay={200}
            fading={clicking === 'right'}
            onClick={() => handleClick('left', '/welcome')}
          />
          <ChoiceCard
            isBlue={false}
            emoji="⚡"
            heading="I Already Have a Card"
            subtext="Maximize rewards from your existing card"
            entranceDir="right"
            entranceDelay={320}
            fading={clicking === 'left'}
            onClick={() => handleClick('right', '/existing-card')}
          />
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', ...entranceStyle(480) }}>
          Takes less than 3 minutes · Free forever
        </p>

      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes shimmerSweep {
            from { transform: translateX(-100%); }
            to   { transform: translateX(200%); }
          }
        }
      `}</style>
    </div>
  );
};

export default GoldenQuestion;

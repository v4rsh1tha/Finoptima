import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Floating background card data */
const bgCards = [
  { top: '8%',  left: '5%',  w: 160, h: 100, rotate: -18, color: 'rgba(28,91,192,0.12)',  border: 'rgba(28,91,192,0.22)'  },
  { top: '12%', right: '6%', w: 140, h:  88, rotate:  14, color: 'rgba(224,158,66,0.07)', border: 'rgba(224,158,66,0.18)' },
  { top: '55%', left: '3%',  w: 150, h:  94, rotate:  10, color: 'rgba(224,158,66,0.08)', border: 'rgba(224,158,66,0.16)' },
  { top: '60%', right: '4%', w: 170, h: 107, rotate: -12, color: 'rgba(28,91,192,0.10)',  border: 'rgba(28,91,192,0.20)'  },
  { top: '80%', left: '20%', w: 130, h:  82, rotate:   8, color: 'rgba(28,91,192,0.07)',  border: 'rgba(28,91,192,0.14)'  },
];

const steps = [
  { label: 'Lifestyle',   num: '01', active: false },
  { label: 'Spending',    num: '02', active: false },
  { label: 'Preferences', num: '03', active: false },
];

/* Word-by-word span helper */
const WordByWord = ({ text, baseDelay, style: outerStyle }) => {
  const words = text.split(' ');
  return (
    <span style={outerStyle}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            animation: `wordIn 0.45s cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * 60}ms both`,
            marginRight: i < words.length - 1 ? '0.28em' : 0,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

const WelcomeAnimation = () => {
  const navigate = useNavigate();
  const [btnHov, setBtnHov] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 24px',
    }}>

      {/* Background card silhouettes — fix: use style var for rotate */}
      {bgCards.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: c.top, left: c.left, right: c.right,
          width: c.w, height: c.h,
          borderRadius: 12,
          backgroundColor: c.color,
          border: `1px solid ${c.border}`,
          transform: `rotate(${c.rotate}deg)`,
          pointerEvents: 'none',
          /* Animate only translateY; rotation is in base transform above */
          animation: `bgFloat ${4 + i * 0.7}s ease-in-out ${i * 0.4}s infinite alternate`,
        }}>
          <div style={{
            position: 'absolute', top: 12, left: 14,
            width: 22, height: 16, borderRadius: 3,
            backgroundColor: c.border, opacity: 0.5,
          }} />
          <svg style={{ position: 'absolute', top: 10, right: 12 }} width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 14 Q14 10 10 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M10 14 Q16 8 10 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.6)"/>
          </svg>
        </div>
      ))}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        maxWidth: 600, width: '100%',
      }}>

        {/* Wordmark — animates first (light bg logo doesn't render on dark, using text) */}
        <div style={{
          textAlign: 'center', marginBottom: 48,
          animation: 'logoIn 0.55s cubic-bezier(0.34,1.3,0.64,1) 0s both',
        }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
            <span style={{ color: '#4A8FEB' }}>Fin</span>
            <span style={{ color: 'rgba(255,255,255,0.92)' }}>optima</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Every Swipe Optimized
          </div>
        </div>

        {/* Heading — word by word animation */}
        <h1 style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
          fontSize: 'clamp(30px, 5vw, 42px)',
          color: 'white', lineHeight: 1.25,
          letterSpacing: '-0.02em', marginBottom: 20,
        }}>
          <WordByWord text="Let's find the card" baseDelay={300} />
          <br />
          <WordByWord
            text="built for you."
            baseDelay={540}
            style={{ color: '#1C5BC0' }}
          />
        </h1>

        {/* Subtext */}
        <p style={{
          fontFamily: 'Inter', fontSize: 18,
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          maxWidth: 460, marginBottom: 52,
          animation: 'fadeInUp 0.5s ease 0.8s both',
        }}>
          We'll ask you a few quick questions about your lifestyle.
          Takes less than 3 minutes.
        </p>

        {/* Progress step dots — improved active styling */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          marginBottom: 52,
          animation: 'fadeInUp 0.45s ease 1.0s both',
        }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                  fontSize: 12, color: 'rgba(255,255,255,0.3)',
                }}>
                  {step.num}
                </div>
                <span style={{
                  fontFamily: 'Inter', fontSize: 11,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 64, height: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  marginBottom: 24, flexShrink: 0,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA button */}
        <div style={{ position: 'relative', animation: 'fadeInUp 0.45s ease 1.2s both' }}>
          {/* Pulse ring */}
          {!btnHov && (
            <div style={{
              position: 'absolute', inset: -4,
              borderRadius: 16, border: '2px solid rgba(28,91,192,0.5)',
              animation: 'btnRing 2.2s ease-in-out 1.8s infinite',
              pointerEvents: 'none',
            }} />
          )}
          <button
            onClick={() => navigate('/survey/layer1')}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              backgroundColor: '#1C5BC0', color: 'white',
              border: 'none', borderRadius: 12,
              padding: '18px 48px',
              fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 17,
              cursor: 'pointer', letterSpacing: '0.01em',
              boxShadow: btnHov
                ? '0 12px 48px rgba(28,91,192,0.75)'
                : '0 8px 32px rgba(28,91,192,0.45)',
              transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.2s, box-shadow 0.25s',
              transform: btnHov ? 'translateY(-3px)' : 'translateY(0)',
              willChange: 'transform',
            }}
          >
            Let's Go →
          </button>
        </div>

      </div>

      <style>{`
        @keyframes logoIn {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-14px); }
        }
        @keyframes btnRing {
          0%   { opacity: 0.7; transform: scale(1); }
          70%  { opacity: 0;   transform: scale(1.18); }
          100% { opacity: 0;   transform: scale(1.18); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;

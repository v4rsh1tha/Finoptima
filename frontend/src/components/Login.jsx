import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const logoSvg = process.env.PUBLIC_URL + '/drawing1.svg';

/* Floating card silhouette data for the left panel */
const cardSilhouettes = [
  { top: '8%',  left: '12%', rotate: -14, w: 180, h: 113, color: 'rgba(28,91,192,0.28)',  border: 'rgba(28,91,192,0.55)',  delay: '0s'   },
  { top: '18%', left: '52%', rotate:  10, w: 150, h:  94, color: 'rgba(224,158,66,0.15)', border: 'rgba(224,158,66,0.45)', delay: '0.6s' },
  { top: '44%', left: '6%',  rotate:   6, w: 160, h: 100, color: 'rgba(224,158,66,0.18)', border: 'rgba(224,158,66,0.5)',  delay: '1.1s' },
  { top: '58%', left: '55%', rotate: -10, w: 170, h: 107, color: 'rgba(28,91,192,0.22)',  border: 'rgba(28,91,192,0.5)',   delay: '0.3s' },
  { top: '76%', left: '18%', rotate:  15, w: 140, h:  88, color: 'rgba(28,91,192,0.15)',  border: 'rgba(28,91,192,0.38)',  delay: '0.9s' },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auth logic will go here — for now navigate forward
    navigate('/golden-question');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFCFB',
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── LEFT PANEL ── */}
      <div
        className="login-left-panel"
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #1A1A2E 0%, #1C3A6E 60%, #1C5BC0 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Floating credit card silhouettes */}
        {cardSilhouettes.map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: c.top, left: c.left,
            width: c.w, height: c.h,
            borderRadius: 14,
            backgroundColor: c.color,
            border: `1.5px solid ${c.border}`,
            transform: `rotate(${c.rotate}deg)`,
            animation: `cardFloat 4s ease-in-out ${c.delay} infinite alternate`,
            backdropFilter: 'blur(1px)',
          }}>
            {/* Chip hint */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              width: 28, height: 20, borderRadius: 4,
              backgroundColor: c.border, opacity: 0.6,
            }} />
            {/* NFC symbol */}
            <svg style={{ position: 'absolute', top: 12, right: 12 }} width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 14 Q14 10 10 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M10 14 Q16 8 10 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.6)"/>
            </svg>
            {/* Stripe hint */}
            <div style={{
              position: 'absolute', bottom: 18, left: 16, right: 16,
              height: 2, borderRadius: 1,
              backgroundColor: c.border, opacity: 0.4,
            }} />
          </div>
        ))}

        {/* Tagline — middle */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 'clamp(28px, 3vw, 42px)', color: 'white',
            lineHeight: 1.2, marginBottom: 20,
          }}>
            Every swipe,<br />
            <span style={{ color: '#E09E42' }}>optimized.</span>
          </h2>
          <p style={{
            fontFamily: 'Inter', fontSize: 16,
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340,
          }}>
            The smartest way to find your perfect Indian credit card — matched to your spending, your lifestyle, and your goals.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { value: '50+',  label: 'Cards analysed' },
              { value: '₹50K', label: 'Avg. annual savings' },
              { value: '3 min', label: 'To your results' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, color: '#E09E42' }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }}>
          © 2025 Finoptima. All rights reserved.
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <img
              src={logoSvg}
              alt="Finoptima"
              onClick={() => navigate('/')}
              style={{ height: 52, width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
            />
            <span style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              fontSize: 22, color: '#1A1A2E', letterSpacing: '-0.01em',
            }}>
              Finoptima
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 30, color: '#1A1A2E', marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B', marginBottom: 32 }}>
            Log in to see your personalised card picks.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontFamily: 'Inter', fontWeight: 600,
                fontSize: 13, color: '#1A1A2E', marginBottom: 8,
              }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1.5px solid #E8E8E8', borderRadius: 10,
                  fontFamily: 'Inter', fontSize: 15, color: '#1A1A2E',
                  backgroundColor: '#FAFCFB', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#1C5BC0'}
                onBlur={e => e.target.style.borderColor = '#E8E8E8'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block', fontFamily: 'Inter', fontWeight: 600,
                fontSize: 13, color: '#1A1A2E', marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '14px 48px 14px 16px',
                    border: '1.5px solid #E8E8E8', borderRadius: 10,
                    fontFamily: 'Inter', fontSize: 15, color: '#1A1A2E',
                    backgroundColor: '#FAFCFB', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1C5BC0'}
                  onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6A6B6B', fontSize: 16, padding: 0,
                    display: 'flex', alignItems: 'center',
                    lineHeight: 1,
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Log In button */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '16px',
                backgroundColor: '#1C5BC0', color: 'white',
                border: 'none', borderRadius: 10,
                fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(28,91,192,0.28)',
                transition: 'all 0.2s', marginBottom: 20,
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2A61C1'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(28,91,192,0.36)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C5BC0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,91,192,0.28)'; }}
            >
              Log In →
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E8E8E8' }} />
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#E8E8E8' }} />
            </div>

            {/* Google button — prominent */}
            <button
              type="button"
              style={{
                width: '100%', padding: '14px 20px',
                backgroundColor: 'white', color: '#3C4043',
                border: '1.5px solid #DADCE0', borderRadius: 10,
                fontFamily: 'Inter', fontWeight: 600, fontSize: 15,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.18s',
                marginBottom: 32,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFF';
                e.currentTarget.style.borderColor = '#1C5BC0';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(28,91,192,0.16), 0 4px 16px rgba(28,91,192,0.10)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#DADCE0';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              {/* Official Google G */}
              <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>

          </form>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B' }}>
            Don't have an account?{' '}
            <Link to="/golden-question" style={{ color: '#1C5BC0', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}
            >
              Get started
            </Link>
          </p>

        </div>
      </div>

      <style>{`
        @keyframes cardFloat {
          from { transform: rotate(var(--r, 0deg)) translateY(0px); }
          to   { transform: rotate(var(--r, 0deg)) translateY(-12px); }
        }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;

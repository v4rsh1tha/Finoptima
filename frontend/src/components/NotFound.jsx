import React from 'react';
import { useNavigate } from 'react-router-dom';

const PUB = process.env.PUBLIC_URL;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FAFCFB',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 48, gap: 28, textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <img
        src={PUB + '/illustrations/undraw_page-not-found_6wni.svg'}
        alt="Page not found"
        style={{ width: 380, maxWidth: '80vw', height: 'auto', objectFit: 'contain' }}
      />
      <h1 style={{
        fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
        fontSize: 32, color: '#1A1A2E', margin: 0, letterSpacing: '-0.02em',
      }}>
        Page not found
      </h1>
      <p style={{
        fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B',
        maxWidth: 400, lineHeight: 1.6, margin: 0,
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#1C5BC0', color: 'white',
          border: 'none', borderRadius: 12, padding: '14px 32px',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
          cursor: 'pointer', marginTop: 4,
          boxShadow: '0 8px 24px rgba(28,91,192,0.3)',
          transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(28,91,192,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,91,192,0.3)'; }}
      >
        Go Home →
      </button>
    </div>
  );
};

export default NotFound;

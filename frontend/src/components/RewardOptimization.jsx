import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const logoSvg = process.env.PUBLIC_URL + '/drawing1.svg';

const RewardOptimization = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const card = location.state?.card;

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFCFB', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        padding: '12px 48px', borderBottom: '1px solid #E8E8E8',
        backgroundColor: 'white', display: 'flex', alignItems: 'center',
      }}>
        <img
          src={logoSvg} alt="Finoptima"
          onClick={() => navigate('/')}
          style={{ height: 64, width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
        />
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 48px', textAlign: 'center' }}>

        {card && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: 'rgba(28,91,192,0.08)', borderRadius: 100,
            padding: '8px 20px', marginBottom: 32,
          }}>
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1C5BC0', fontWeight: 600 }}>
              {card.bank} {card.name}
            </span>
          </div>
        )}

        <h1 style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
          fontSize: 32, color: '#1A1A2E', marginBottom: 16, letterSpacing: '-0.02em',
        }}>
          Maximizing Your Card Rewards
        </h1>

        <p style={{
          fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B',
          lineHeight: 1.6, maxWidth: 440, margin: '0 auto 48px',
        }}>
          Coming soon — personalized tips for your card
        </p>

        <button
          onClick={() => navigate('/existing-card')}
          style={{
            backgroundColor: 'white', color: '#1C5BC0',
            border: '2px solid #1C5BC0', borderRadius: 10, padding: '14px 32px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C5BC0'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#1C5BC0'; }}
        >
          ← Back
        </button>

      </div>
    </div>
  );
};

export default RewardOptimization;

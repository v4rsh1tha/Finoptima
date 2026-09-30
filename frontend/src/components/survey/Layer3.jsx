import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../../context/SurveyContext';

/* ── Value maps for API ─────────────────────────────────────────── */
const DOMESTIC_MAP  = { 'None': '0', '1–3': '1_3', '4–8': '4_8', '9+': '9_plus' };
const INTL_MAP      = { 'None': '0', '1–2': '1_2', '3–5': '3_5', '5+': '5_plus' };
const LOUNGE_MAP    = { "Don't need": '0', '1–2': '1_2', '3–4': '3_4', 'Unlimited': 'unlimited' };

const PUB = process.env.PUBLIC_URL;

/* ── Required single-select keys ────────────────────────────────── */
const REQUIRED = [
  'domesticFlights', 'intlFlights', 'airline', 'loungeVisits',
  'hotelStays',
  'concierge', 'golf', 'movies', 'ev', 'upiCreditCard',
  'cardRole', 'openToNewBanks',
];

/* ── Progress bar — all three filled ────────────────────────────── */
const ProgressBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
    {[
      { n: 1, label: 'Basics' },
      { n: 2, label: 'Spending' },
      { n: 3, label: 'Preferences' },
    ].map((step, i, arr) => (
      <React.Fragment key={step.n}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: '#1C5BC0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 12,
            color: 'white',
          }}>
            {i < 2 ? '✓' : step.n}
          </div>
          <span style={{
            fontFamily: 'Inter', fontSize: 11,
            color: '#1C5BC0', fontWeight: 600,
          }}>
            {step.label}
          </span>
        </div>
        {i < arr.length - 1 && (
          <div style={{ flex: 1, height: 2, backgroundColor: '#1C5BC0', margin: '0 8px', marginBottom: 20 }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ── Section label with horizontal rule ─────────────────────────── */
const SectionLabel = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
    <span style={{
      fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 11,
      color: '#1C5BC0', letterSpacing: '0.1em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {title}
    </span>
    <div style={{ flex: 1, height: 1.5, backgroundColor: '#E8E8E8' }} />
  </div>
);

/* ── Question block wrapper ──────────────────────────────────────── */
const QB = ({ label, hint, multi, children }) => (
  <div style={{ marginBottom: 36 }}>
    <p style={{
      fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
      fontSize: 17, color: '#1A1A2E',
      marginBottom: hint ? 6 : 16,
    }}>
      {label}
    </p>
    {hint && (
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', marginBottom: 14 }}>
        {hint}
      </p>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {children}
    </div>
    {multi && (
      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#ABABAB', marginTop: 10 }}>
        Select all that apply
      </p>
    )}
  </div>
);

/* ── Icon tile (emoji + label) ───────────────────────────────────── */
const Tile = ({ icon, label, selected, onClick }) => {
  const [hov, setHov] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 280);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 auto',
        border: `2px solid ${selected ? '#1C5BC0' : hov ? 'rgba(28,91,192,0.4)' : '#E8E8E8'}`,
        borderRadius: 12, padding: '16px 20px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.18s cubic-bezier(0.16,1,0.3,1)',
        transform: flash ? 'scale(0.93)' : selected ? 'scale(1.02)' : hov ? 'translateY(-2px)' : 'translateY(0)',
        willChange: 'transform',
        minWidth: 90,
      }}
    >
      {icon && (
        <span style={{
          fontSize: 22, lineHeight: 1,
          transition: 'transform 0.2s ease',
          transform: selected ? 'scale(1.15)' : 'scale(1)',
          display: 'inline-block',
        }}>{icon}</span>
      )}
      <span style={{
        fontFamily: 'Inter', fontSize: 14,
        color: selected ? '#1C5BC0' : '#1A1A2E',
        fontWeight: selected ? 600 : 400,
        textAlign: 'center', lineHeight: 1.35,
      }}>
        {selected && <span style={{ marginRight: 4, fontSize: 11 }}>✓</span>}
        {label}
      </span>
    </button>
  );
};

/* ── Sub-tile (icon + bold label + grey subtitle) ────────────────── */
const SubTile = ({ icon, label, sub, selected, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 auto',
        border: `2px solid ${selected ? '#1C5BC0' : hov ? 'rgba(28,91,192,0.4)' : '#E8E8E8'}`,
        borderRadius: 12, padding: '18px 20px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
        transform: hov && !selected ? 'translateY(-2px)' : 'translateY(0)',
        minWidth: 130,
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 14,
        color: selected ? '#1C5BC0' : '#1A1A2E',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'Inter', fontSize: 12,
        color: selected ? 'rgba(28,91,192,0.7)' : '#6A6B6B',
        lineHeight: 1.4,
      }}>
        {sub}
      </span>
    </button>
  );
};

/* ── Logo tile (for airlines / hotels — multi or single) ─────────── */
const LogoTile = ({ label, logo, selected, onClick, multi }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 auto',
        border: `2px solid ${selected ? '#1C5BC0' : hov ? 'rgba(28,91,192,0.4)' : '#E8E8E8'}`,
        borderRadius: 12, padding: '16px 20px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
        transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
        transform: hov && !selected ? 'translateY(-2px)' : 'translateY(0)',
        minWidth: 90, position: 'relative',
      }}
    >
      {/* Check badge for multi-select */}
      {multi && selected && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 18, height: 18, borderRadius: '50%',
          backgroundColor: '#1C5BC0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: 'white', fontWeight: 700,
        }}>
          ✓
        </div>
      )}
      {logo && !imgErr ? (
        <img
          src={logo} alt={label}
          style={{ height: 28, width: 'auto', maxWidth: 80, objectFit: 'contain' }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div style={{
          width: 40, height: 28, borderRadius: 6,
          backgroundColor: selected ? 'rgba(28,91,192,0.15)' : '#EEF2F8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 10,
          color: selected ? '#1C5BC0' : '#4A5568',
        }}>
          {label.substring(0, 2).toUpperCase()}
        </div>
      )}
      <span style={{
        fontFamily: 'Inter', fontSize: 13,
        color: selected ? '#1C5BC0' : '#1A1A2E',
        fontWeight: selected ? 600 : 400,
        textAlign: 'center', lineHeight: 1.35,
      }}>
        {label}
      </span>
    </button>
  );
};

/* ── Divider ─────────────────────────────────────────────────────── */
const Divider = () => (
  <div style={{ height: 1, backgroundColor: '#E8E8E8', margin: '8px 0 44px' }} />
);

/* ── Main page ───────────────────────────────────────────────────── */
const Layer3 = () => {
  const navigate = useNavigate();
  const { updateSurvey } = useSurvey();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const [answers, setAnswers] = useState({
    domesticFlights: null,
    intlFlights: null,
    airline: null,
    loungeVisits: null,
    hotelStays: null,
    hotelLoyalty: [],
    concierge: null,
    golf: null,
    movies: null,
    ev: null,
    upiCreditCard: null,
    cardRole: null,
    openToNewBanks: null,
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const set = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

  /* Hotel loyalty: "None" is exclusive */
  const toggleLoyalty = val => {
    if (val === 'None') {
      setAnswers(prev => ({
        ...prev,
        hotelLoyalty: prev.hotelLoyalty.includes('None') ? [] : ['None'],
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        hotelLoyalty: prev.hotelLoyalty.includes(val)
          ? prev.hotelLoyalty.filter(v => v !== val)
          : [...prev.hotelLoyalty.filter(v => v !== 'None'), val],
      }));
    }
  };

  const canContinue =
    REQUIRED.every(k => answers[k] !== null) &&
    answers.hotelLoyalty.length > 0;

  const handleFindCard = () => {
    if (!canContinue) return;
    const layerData = {
      domestic_flights:      DOMESTIC_MAP[answers.domesticFlights],
      international_flights: INTL_MAP[answers.intlFlights],
      airline:               answers.airline,
      lounge_visits_needed:  LOUNGE_MAP[answers.loungeVisits],
      hotel_stays:           answers.hotelStays,
      hotel_loyalty:         answers.hotelLoyalty,
      concierge:             answers.concierge === 'Yes, I use them',
      golf:                  answers.golf === 'Yes',
      card_purpose:          answers.cardRole === 'Primary Card' ? 'primary' : 'secondary',
      loading:               true,
      recommendations:       null,
      error:                 null,
    };
    console.log("LAYER3 SAVING TO CONTEXT:", layerData);
    updateSurvey(layerData);
    navigate('/results');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFCFB', fontFamily: 'Inter, sans-serif', paddingBottom: 120 }}>
      {/* Survey nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid #F0F0F0',
        backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <img src={PUB + '/drawing1.svg'} alt="Finoptima" style={{ height: 28, width: 28, objectFit: 'contain', borderRadius: 6 }} />
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1C5BC0' }}>Fin</span><span style={{ color: '#1A1A2E' }}>optima</span>
          </span>
        </div>
        <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', fontWeight: 500 }}>Step 3 of 3</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 48px 0' }}>

        <ProgressBar />

        <h1 style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
          fontSize: 32, color: '#1A1A2E', marginBottom: 8, letterSpacing: '-0.02em',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) 80ms',
        }}>
          Almost there!
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) 160ms',
        }}>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B', lineHeight: 1.6, flex: 1, margin: 0 }}>
            Tell us about your lifestyle and preferences
          </p>
          <img
            src={PUB + '/illustrations/undraw_credit-card-payments_y0vn.svg'}
            alt=""
            style={{ width: 88, height: 'auto', objectFit: 'contain', opacity: 0.75, flexShrink: 0 }}
          />
        </div>

        {/* ══════════ TRAVEL SECTION ══════════ */}
        <SectionLabel title="Your Travel Life" />

        {/* Q1 */}
        <QB label="Domestic flights per year?">
          {[
            { icon: '🚫', label: 'None' },
            { icon: '✈️', label: '1–3' },
            { icon: '✈️', label: '4–8' },
            { icon: '🏆', label: '9+' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.domesticFlights === o.label}
              onClick={() => set('domesticFlights', o.label)} />
          ))}
        </QB>

        {/* Q2 */}
        <QB label="International trips per year?">
          {[
            { icon: '🚫', label: 'None' },
            { icon: '🌏', label: '1–2' },
            { icon: '🌍', label: '3–5' },
            { icon: '🌐', label: '5+' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.intlFlights === o.label}
              onClick={() => set('intlFlights', o.label)} />
          ))}
        </QB>

        {/* Q3 — airline logo tiles */}
        <QB label="Preferred airline?">
          <LogoTile label="IndiGo"
            logo={PUB + '/logos/IndiGo/IndiGo_idcn9ykitF_9.png'}
            selected={answers.airline === 'IndiGo'}
            onClick={() => set('airline', 'IndiGo')} />
          <LogoTile label="Air India"
            logo={PUB + '/logos/Air India/Air India_Logo_1.png'}
            selected={answers.airline === 'Air India'}
            onClick={() => set('airline', 'Air India')} />
          <LogoTile label="Mix based on price" logo={null}
            selected={answers.airline === 'Mix based on price'}
            onClick={() => set('airline', 'Mix based on price')} />
          <LogoTile label="I rarely fly" logo={null}
            selected={answers.airline === 'I rarely fly'}
            onClick={() => set('airline', 'I rarely fly')} />
        </QB>

        {/* Q4 */}
        <QB label="Minimum lounge visits needed per quarter?">
          {[
            { icon: '🚫', label: "Don't need" },
            { icon: '☕', label: '1–2' },
            { icon: '🛋️', label: '3–4' },
            { icon: '♾️', label: 'Unlimited' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.loungeVisits === o.label}
              onClick={() => set('loungeVisits', o.label)} />
          ))}
        </QB>

        {/* Q5 */}
        <QB label="Hotel stays per year?">
          {[
            { icon: '🚫', label: 'None' },
            { icon: '🏨', label: '1–3' },
            { icon: '🏨', label: '4–8' },
            { icon: '🏨', label: '8+' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.hotelStays === o.label}
              onClick={() => set('hotelStays', o.label)} />
          ))}
        </QB>

        {/* Q6 — hotel loyalty multi-select */}
        <QB label="Existing hotel loyalty memberships?" multi>
          <LogoTile label="Taj Hotels"
            logo={PUB + '/logos/Taj Hotels/Taj Hotels_idpIt7VYbp_2.png'}
            selected={answers.hotelLoyalty.includes('Taj Hotels')}
            onClick={() => toggleLoyalty('Taj Hotels')}
            multi />
          <LogoTile label="Marriott Bonvoy"
            logo={PUB + '/logos/Marriott Bonvoy/Marriott Bonvoy_idjSN5F2Nq_0.png'}
            selected={answers.hotelLoyalty.includes('Marriott Bonvoy')}
            onClick={() => toggleLoyalty('Marriott Bonvoy')}
            multi />
          <LogoTile label="Accor"
            logo={PUB + '/logos/Accor/Accor_Logo_1.png'}
            selected={answers.hotelLoyalty.includes('Accor')}
            onClick={() => toggleLoyalty('Accor')}
            multi />
          <LogoTile label="None" logo={null}
            selected={answers.hotelLoyalty.includes('None')}
            onClick={() => toggleLoyalty('None')}
            multi />
        </QB>

        <Divider />

        {/* ══════════ LIFESTYLE SECTION ══════════ */}
        <SectionLabel title="Your Lifestyle" />

        {/* Q8 */}
        <QB label="Do you need concierge services?">
          {[
            { icon: '✅', label: 'Yes, I use them' },
            { icon: '❌', label: 'No, never' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.concierge === o.label}
              onClick={() => set('concierge', o.label)} />
          ))}
        </QB>

        {/* Q9 */}
        <QB label="Do you play golf?">
          {[
            { icon: '⛳', label: 'Yes' },
            { icon: '❌', label: 'No' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.golf === o.label}
              onClick={() => set('golf', o.label)} />
          ))}
        </QB>

        {/* Q10 */}
        <QB label="Movies per month?">
          {[
            { icon: '🎬', label: '0–1' },
            { icon: '🎬', label: '2–3' },
            { icon: '🎬', label: '4+' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.movies === o.label}
              onClick={() => set('movies', o.label)} />
          ))}
        </QB>

        {/* Q11 */}
        <QB label="Do you own an EV?">
          {[
            { icon: '⚡', label: 'Yes' },
            { icon: '❌', label: 'No' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.ev === o.label}
              onClick={() => set('ev', o.label)} />
          ))}
        </QB>

        {/* Q12 */}
        <QB label="Do you use UPI via credit card?">
          {[
            { icon: '✅', label: 'Yes' },
            { icon: '❌', label: 'No' },
            { icon: '❓', label: 'Not sure' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.upiCreditCard === o.label}
              onClick={() => set('upiCreditCard', o.label)} />
          ))}
        </QB>

        <Divider />

        {/* ══════════ CARD PREFERENCES SECTION ══════════ */}
        <SectionLabel title="Your Card Preferences" />

        {/* Q15 — card role (was Q16) */}
        <QB label="This card will be?">
          <SubTile icon="💳" label="Primary Card"   sub="My main card for everything"
            selected={answers.cardRole === 'Primary Card'}
            onClick={() => set('cardRole', 'Primary Card')} />
          <SubTile icon="🔄" label="Secondary Card" sub="I have a main card already"
            selected={answers.cardRole === 'Secondary Card'}
            onClick={() => set('cardRole', 'Secondary Card')} />
        </QB>

        {/* Q16 — open to new banks */}
        <QB label="Open to cards from banks you don't bank with?">
          {[
            { icon: '✅', label: 'Yes — show me all options' },
            { icon: '🏦', label: 'Only my existing banks' },
          ].map(o => (
            <Tile key={o.label} icon={o.icon} label={o.label}
              selected={answers.openToNewBanks === o.label}
              onClick={() => set('openToNewBanks', o.label)} />
          ))}
        </QB>

      </div>

      {/* ── Sticky CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, #FAFCFB 70%, rgba(250,252,251,0))',
        padding: '24px 48px 32px',
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <button
          disabled={!canContinue}
          onClick={handleFindCard}
          style={{
            pointerEvents: 'all',
            backgroundColor: canContinue ? '#E09E42' : '#C8D8EF',
            color: 'white',
            border: 'none', borderRadius: 12,
            padding: '16px 48px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            boxShadow: canContinue ? '0 8px 24px rgba(224,158,66,0.4)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            minWidth: 280,
            position: 'relative', overflow: 'hidden',
            willChange: 'transform',
          }}
          onMouseEnter={e => {
            if (!canContinue) return;
            e.currentTarget.style.backgroundColor = '#d4923b';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(224,158,66,0.5)';
            const shimmer = e.currentTarget.querySelector('.btn-shimmer');
            if (shimmer) shimmer.style.animation = 'btnShimmer 0.6s ease forwards';
          }}
          onMouseLeave={e => {
            if (!canContinue) return;
            e.currentTarget.style.backgroundColor = '#E09E42';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(224,158,66,0.4)';
            const shimmer = e.currentTarget.querySelector('.btn-shimmer');
            if (shimmer) shimmer.style.animation = 'none';
          }}
          onMouseDown={e => { if (canContinue) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { if (canContinue) e.currentTarget.style.transform = 'translateY(-2px) scale(1)'; }}
        >
          <span className="btn-shimmer" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)',
            animation: 'none',
          }} />
          Find My Perfect Card →
        </button>
      </div>
      <style>{`
        @keyframes btnShimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to   { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default Layer3;

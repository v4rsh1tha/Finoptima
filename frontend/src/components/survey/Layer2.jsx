import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../../context/SurveyContext';

const SPEND_TIER_MAP = {
  'Under ₹10K': 'under_10K', '₹10–20K': '10_20K', '₹20–40K': '20_40K',
  '₹40–75K': '40_75K', '₹75K+': '75K_plus',
};

const PUB = process.env.PUBLIC_URL;

/* ── Static data ─────────────────────────────────────────────────── */

const SPEND_TIERS = ['Under ₹10K', '₹10–20K', '₹20–40K', '₹40–75K', '₹75K+'];

const TOGGLE_DEFS = [
  { id: 'rent',      emoji: '🏠', label: 'Rent' },
  { id: 'education', emoji: '📚', label: 'Education Fees' },
  { id: 'tax',       emoji: '🧾', label: 'Tax Payments' },
  { id: 'insurance', emoji: '🛡️', label: 'Insurance' },
];

const mk = (id, emoji, label, steps, labels) => ({ id, emoji, label, steps, labels });

const ALWAYS_SLIDERS = [
  mk('foodDelivery',  '🍔', 'Food Delivery',
    [0, 500, 1000, 2000, 3000, 5000, 8000, 12000, 15000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹8K','₹12K','₹15K+']),
  mk('groceries',     '🛒', 'Groceries & Quick Commerce',
    [0, 500, 1000, 2000, 3000, 5000, 8000, 12000, 20000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹8K','₹12K','₹20K+']),
  mk('dining',        '🍽️', 'Dining Out',
    [0, 500, 1000, 2000, 3000, 5000, 8000, 10000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹8K','₹10K+']),
  mk('shopping',      '🛍️', 'Online Shopping',
    [0, 1000, 2000, 5000, 10000, 15000, 25000, 50000],
    ['₹0','₹1K','₹2K','₹5K','₹10K','₹15K','₹25K','₹50K+']),
  mk('fuel',          '⛽', 'Fuel',
    [0, 500, 1000, 2000, 3000, 5000, 8000, 10000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹8K','₹10K+']),
  mk('upi',           '📱', 'UPI Merchant Payments',
    [0, 1000, 2000, 5000, 10000, 20000, 30000, 50000],
    ['₹0','₹1K','₹2K','₹5K','₹10K','₹20K','₹30K','₹50K+']),
  mk('travel',        '✈️', 'Travel — Flights & Hotels',
    [0, 2000, 5000, 10000, 20000, 30000, 50000, 100000],
    ['₹0','₹2K','₹5K','₹10K','₹20K','₹30K','₹50K','₹1L+']),
  mk('entertainment', '🎬', 'Entertainment & Movies',
    [0, 200, 500, 1000, 2000, 3000, 5000],
    ['₹0','₹200','₹500','₹1K','₹2K','₹3K','₹5K+']),
  mk('pharmacy',      '💊', 'Pharmacy & Healthcare',
    [0, 500, 1000, 2000, 3000, 5000, 10000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹10K+']),
  mk('forex',         '🌍', 'International / Forex',
    [0, 2000, 5000, 10000, 20000, 50000, 100000, 200000],
    ['₹0','₹2K','₹5K','₹10K','₹20K','₹50K','₹1L','₹2L+']),
  mk('emi',           '💳', 'EMI Transactions',
    [0, 2000, 5000, 10000, 20000, 30000, 50000, 100000, 150000],
    ['₹0','₹2K','₹5K','₹10K','₹20K','₹30K','₹50K','₹1L','₹1.5L+']),
];

const GATED_SLIDERS = [
  mk('rent',      '🏠', 'Rent',
    [0, 5000, 8000, 10000, 15000, 20000, 30000, 50000],
    ['₹0','₹5K','₹8K','₹10K','₹15K','₹20K','₹30K','₹50K+']),
  mk('education', '📚', 'Education Fees',
    [0, 2000, 5000, 10000, 20000, 30000, 50000, 100000],
    ['₹0','₹2K','₹5K','₹10K','₹20K','₹30K','₹50K','₹1L+']),
  mk('tax',       '🧾', 'Tax Payments',
    [0, 2000, 5000, 10000, 20000, 50000, 100000, 200000],
    ['₹0','₹2K','₹5K','₹10K','₹20K','₹50K','₹1L','₹2L+']),
  mk('insurance', '🛡️', 'Insurance Premiums',
    [0, 500, 1000, 2000, 3000, 5000, 10000, 20000],
    ['₹0','₹500','₹1K','₹2K','₹3K','₹5K','₹10K','₹20K+']),
];

const initSliders = () => {
  const o = {};
  [...ALWAYS_SLIDERS, ...GATED_SLIDERS].forEach(s => { o[s.id] = 0; });
  return o;
};

/* ── Progress bar ────────────────────────────────────────────────── */
const ProgressBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
    {[
      { n: 1, label: 'Basics',      done: true,  active: false },
      { n: 2, label: 'Spending',    done: false, active: true  },
      { n: 3, label: 'Preferences', done: false, active: false },
    ].map((step, i, arr) => (
      <React.Fragment key={step.n}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: step.active ? '#1C5BC0' : step.done ? '#C8D8EF' : '#E8E8E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13,
            color: step.active ? 'white' : step.done ? '#1C5BC0' : '#ABABAB',
          }}>
            {step.done ? '✓' : step.n}
          </div>
          <span style={{
            fontFamily: 'Inter', fontSize: 11,
            color: step.active ? '#1C5BC0' : '#ABABAB',
            fontWeight: step.active ? 600 : 400,
          }}>
            {step.label}
          </span>
        </div>
        {i < arr.length - 1 && (
          <div style={{ flex: 1, height: 2, backgroundColor: '#E8E8E8', margin: '0 8px', marginBottom: 20 }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ── Spend tier tile ─────────────────────────────────────────────── */
const SpendTile = ({ label, selected, onClick }) => {
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
        border: `2px solid ${selected ? '#1C5BC0' : hov ? '#A8C4E8' : '#E8E8E8'}`,
        borderRadius: 10,
        padding: '14px 20px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        color: selected ? '#1C5BC0' : '#1A1A2E',
        fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
        cursor: 'pointer', outline: 'none',
        transition: 'border-color 0.18s, background-color 0.18s, color 0.18s, transform 0.15s cubic-bezier(0.16,1,0.3,1)',
        whiteSpace: 'nowrap', textAlign: 'center',
        transform: flash ? 'scale(0.94)' : selected ? 'scale(1.03)' : 'scale(1)',
        willChange: 'transform',
      }}
    >
      {selected && <span style={{ marginRight: 5, fontSize: 11 }}>✓</span>}
      {label}
    </button>
  );
};

/* ── Toggle switch ───────────────────────────────────────────────── */
const Toggle = ({ id, emoji, label, checked, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: '1 1 80px', minWidth: 80 }}>
    <div
      role="switch" aria-checked={checked}
      onClick={() => onChange(id, !checked)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        backgroundColor: checked ? '#1C5BC0' : '#E8E8E8',
        cursor: 'pointer', position: 'relative',
        transition: 'background-color 0.22s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 25 : 3,
        width: 20, height: 20, borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        transition: 'left 0.22s',
      }} />
    </div>
    <span style={{
      fontFamily: 'Inter', fontSize: 12,
      color: checked ? '#1C5BC0' : '#6A6B6B',
      fontWeight: checked ? 600 : 400,
      textAlign: 'center', lineHeight: 1.3,
    }}>
      {emoji} {label}
    </span>
  </div>
);

/* ── Stepped slider row ──────────────────────────────────────────── */
const SteppedSlider = ({ def, idx, onChange, children }) => {
  const { id, emoji, label, labels } = def;
  const maxIdx = def.steps.length - 1;
  const pct = maxIdx > 0 ? (idx / maxIdx) * 100 : 0;
  // Thumb-center offset correction: at pct=0 we shift +10px, at pct=100 we shift -10px
  const badgeLeft = `calc(${pct}% + ${10 - pct * 0.2}px)`;

  return (
    <div>
      {/* Row: label on left, amount on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#1A1A2E' }}>
          {emoji}&nbsp;{label}
        </span>
        <span style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
          color: idx > 0 ? '#1C5BC0' : '#ABABAB',
          minWidth: 60, textAlign: 'right',
        }}>
          {labels[idx]}
        </span>
      </div>

      {/* Badge space + slider */}
      <div style={{ position: 'relative', paddingTop: 26 }}>
        {/* Badge above thumb — visible only when idx > 0 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: badgeLeft,
          transform: 'translateX(-50%)',
          backgroundColor: idx > 0 ? '#1C5BC0' : 'transparent',
          color: 'white',
          borderRadius: 4,
          padding: idx > 0 ? '2px 8px' : '0',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 10,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'background-color 0.15s, left 0.12s',
          lineHeight: '18px',
          minHeight: 22,
        }}>
          {idx > 0 ? labels[idx] : ''}
        </div>

        <input
          type="range"
          min={0} max={maxIdx} step={1}
          value={idx}
          onChange={e => onChange(id, Number(e.target.value))}
          className="fin-slider"
          style={{
            width: '100%',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            height: 6,
            borderRadius: 3,
            outline: 'none',
            cursor: 'pointer',
            border: 'none',
            background: `linear-gradient(to right, #1C5BC0 ${pct}%, #E8E8E8 ${pct}%)`,
          }}
        />
      </div>

      {/* Follow-up questions */}
      {children}
    </div>
  );
};

/* ── Follow-up wrapper ───────────────────────────────────────────── */
const FollowUp = ({ label, children }) => (
  <div style={{ animation: 'slideDown 0.25s ease', marginTop: 14 }}>
    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B', fontWeight: 500, marginBottom: 8 }}>
      {label}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {children}
    </div>
  </div>
);

/* ── Pill (text / small-logo) ────────────────────────────────────── */
const Pill = ({ label, selected, onClick, logo, brandBg, brandText }) => (
  <button
    onClick={onClick}
    style={{
      border: `1.5px solid ${selected ? (brandBg || '#1C5BC0') : brandBg ? 'transparent' : '#E8E8E8'}`,
      borderRadius: 20, padding: '6px 16px',
      backgroundColor: selected ? (brandBg || '#1C5BC0') : brandBg ? brandBg : 'white',
      color: selected ? 'white' : brandBg ? (brandText || 'white') : '#1A1A2E',
      fontFamily: 'Inter', fontSize: 13, fontWeight: brandBg ? 600 : 400,
      cursor: 'pointer', outline: 'none',
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.15s',
      opacity: selected ? 1 : brandBg ? 0.85 : 1,
      boxShadow: selected && brandBg ? `0 0 0 2px white, 0 0 0 4px ${brandBg}` : 'none',
    }}
  >
    {logo && (
      <img
        src={logo} alt=""
        style={{ height: 18, width: 'auto', objectFit: 'contain', maxWidth: 40 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    )}
    {label}
  </button>
);

/* ── Logo tile (fuel / airline) ──────────────────────────────────── */
const LogoTile = ({ label, logo, selected, onClick }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `2px solid ${selected ? '#1C5BC0' : hov ? '#A8C4E8' : '#E8E8E8'}`,
        borderRadius: 10, padding: '10px 16px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        minWidth: 72, transition: 'all 0.18s',
      }}
    >
      {logo && !imgErr ? (
        <img
          src={logo} alt={label}
          style={{ height: 28, width: 'auto', maxWidth: 64, objectFit: 'contain' }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          backgroundColor: selected ? 'rgba(28,91,192,0.15)' : '#EEF2F8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 10,
          color: selected ? '#1C5BC0' : '#4A5568',
        }}>
          {label.substring(0, 2).toUpperCase()}
        </div>
      )}
      <span style={{
        fontFamily: 'Inter', fontSize: 12,
        color: selected ? '#1C5BC0' : '#6A6B6B',
        fontWeight: selected ? 600 : 400,
      }}>
        {label}
      </span>
    </button>
  );
};

/* ── Divider ─────────────────────────────────────────────────────── */
const Divider = () => (
  <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '20px 0' }} />
);

/* ── Section heading ─────────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <p style={{
    fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
    fontSize: 20, color: '#1A1A2E', marginBottom: 20,
  }}>
    {children}
  </p>
);

/* ── Main page ───────────────────────────────────────────────────── */
const Layer2 = () => {
  const navigate = useNavigate();
  const { updateSurvey } = useSurvey();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const [spendTier, setSpendTier] = useState(null);
  const [toggles, setToggles] = useState({ rent: false, education: false, tax: false, insurance: false });
  const [sliders, setSliders] = useState(initSliders());
  const [followUps, setFollowUps] = useState({
    foodPlatform: null,
    groceryApps: [],
    shoppingPlatforms: [],
    fuelBrand: null,
    domesticFlights: null,
    intlFlights: null,
    airline: null,
    hotelStays: null,
    hotelPref: null,
    upiTransactions: null,
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const setToggle = (id, val) => {
    setToggles(prev => ({ ...prev, [id]: val }));
    if (!val) setSliders(prev => ({ ...prev, [id]: 0 }));
  };

  const setSlider = (id, idx) => setSliders(prev => ({ ...prev, [id]: idx }));

  const setFU = (key, val) => setFollowUps(prev => ({ ...prev, [key]: val }));

  const toggleMulti = (key, val) =>
    setFollowUps(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter(v => v !== val)
        : [...prev[key], val],
    }));

  const canContinue = spendTier !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    const val = (allSliders, id) => {
      const def = allSliders.find(s => s.id === id);
      return def ? def.steps[sliders[id]] : 0;
    };
    const always = (id) => val(ALWAYS_SLIDERS, id);
    const gated  = (id) => val(GATED_SLIDERS, id);
    updateSurvey({
      total_spend_range:     SPEND_TIER_MAP[spendTier],
      food_delivery_spend:   always('foodDelivery'),
      groceries_spend:       always('groceries'),
      dining_spend:          always('dining'),
      online_shopping_spend: always('shopping'),
      fuel_spend:            always('fuel'),
      upi_spend:             always('upi'),
      travel_spend:          always('travel'),
      entertainment_spend:   always('entertainment'),
      pharmacy_spend:        always('pharmacy'),
      international_spend:   always('forex'),
      emi_spend:             always('emi'),
      rent_spend:      toggles.rent      ? gated('rent')      : 0,
      education_spend: toggles.education ? gated('education') : 0,
      tax_spend:       toggles.tax       ? gated('tax')       : 0,
      insurance_spend: toggles.insurance ? gated('insurance') : 0,
      food_platform:      followUps.foodPlatform,
      grocery_apps:       followUps.groceryApps,
      shopping_platforms: followUps.shoppingPlatforms,
      fuel_brand:         followUps.fuelBrand,
    });
    navigate('/survey/layer3');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFCFB', fontFamily: 'Inter, sans-serif', paddingBottom: 120 }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnShimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to   { transform: translateX(300%) skewX(-12deg); }
        }
        .fin-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #1C5BC0;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(28,91,192,0.2);
          transition: width 0.12s, height 0.12s;
        }
        .fin-slider:hover::-webkit-slider-thumb,
        .fin-slider:active::-webkit-slider-thumb {
          width: 24px; height: 24px;
        }
        .fin-slider::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #1C5BC0;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(28,91,192,0.2);
        }
        .fin-slider:focus { outline: none; }
      `}</style>

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
        <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', fontWeight: 500 }}>Step 2 of 3</span>
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
          How do you spend?
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) 160ms',
        }}>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B', lineHeight: 1.6, flex: 1, margin: 0 }}>
            Approximate is perfectly fine — just drag to what feels right
          </p>
          <img
            src={PUB + '/illustrations/undraw_business-analytics_y8m6.svg'}
            alt=""
            style={{ width: 88, height: 'auto', objectFit: 'contain', opacity: 0.75, flexShrink: 0 }}
          />
        </div>

        {/* ── Section 1: Total monthly spend ── */}
        <div style={{ marginBottom: 48 }}>
          <SectionTitle>What is your total monthly spend?</SectionTitle>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SPEND_TIERS.map(tier => (
              <SpendTile
                key={tier}
                label={tier}
                selected={spendTier === tier}
                onClick={() => setSpendTier(tier)}
              />
            ))}
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#E8E8E8', marginBottom: 48 }} />

        {/* ── Section 2: Optional payment toggles ── */}
        <div style={{ marginBottom: 48 }}>
          <SectionTitle>Do you pay any of these via card?</SectionTitle>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {TOGGLE_DEFS.map(t => (
              <Toggle
                key={t.id} id={t.id} emoji={t.emoji} label={t.label}
                checked={toggles[t.id]} onChange={setToggle}
              />
            ))}
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#E8E8E8', marginBottom: 48 }} />

        {/* ── Section 3: Spending sliders ── */}
        <div style={{ marginBottom: 40 }}>
          <SectionTitle>Where does your money go?</SectionTitle>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B', marginBottom: 28, marginTop: -12 }}>
            Drag each slider to approximate monthly spend
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {ALWAYS_SLIDERS.map((def, i) => (
              <React.Fragment key={def.id}>
                <SteppedSlider def={def} idx={sliders[def.id]} onChange={setSlider}>

                  {/* Food Delivery */}
                  {def.id === 'foodDelivery' && sliders.foodDelivery > 0 && (
                    <FollowUp label="Which platform do you use?">
                      {[
                        { label: 'Swiggy',       logo: PUB + '/logos/Swiggy/Swiggy_id8bItcgXR_1.svg' },
                        { label: 'Zomato',       logo: PUB + '/logos/Zomato/Zomato_Logo_0.svg' },
                        { label: 'Both equally', logo: null },
                      ].map(opt => (
                        <Pill key={opt.label} label={opt.label} logo={opt.logo}
                          selected={followUps.foodPlatform === opt.label}
                          onClick={() => setFU('foodPlatform', opt.label)} />
                      ))}
                    </FollowUp>
                  )}

                  {/* Groceries */}
                  {def.id === 'groceries' && sliders.groceries > 0 && (
                    <FollowUp label="Which apps do you use?">
                      <Pill label="Zepto" brandBg="#6B46C1" brandText="white"
                        selected={followUps.groceryApps.includes('Zepto')}
                        onClick={() => toggleMulti('groceryApps', 'Zepto')} />
                      <Pill label="Blinkit" brandBg="#F59E0B" brandText="white"
                        selected={followUps.groceryApps.includes('Blinkit')}
                        onClick={() => toggleMulti('groceryApps', 'Blinkit')} />
                      <Pill label="Instamart"
                        logo={PUB + '/logos/Swiggy/Swiggy_id8bItcgXR_1.svg'}
                        selected={followUps.groceryApps.includes('Instamart')}
                        onClick={() => toggleMulti('groceryApps', 'Instamart')} />
                      <Pill label="BigBasket"
                        logo={PUB + '/logos/Bigbasket.com/Bigbasket.com_idIKsM8ZJJ_6.svg'}
                        selected={followUps.groceryApps.includes('BigBasket')}
                        onClick={() => toggleMulti('groceryApps', 'BigBasket')} />
                      <Pill label="Mix"
                        selected={followUps.groceryApps.includes('Mix')}
                        onClick={() => toggleMulti('groceryApps', 'Mix')} />
                    </FollowUp>
                  )}

                  {/* Online Shopping */}
                  {def.id === 'shopping' && sliders.shopping > 0 && (
                    <FollowUp label="Your top platforms?">
                      {[
                        { label: 'Amazon',   logo: PUB + '/logos/Amazon/Amazon_Logo_0.svg' },
                        { label: 'Flipkart', logo: PUB + '/logos/Flipkart/Flipkart_Logo_0.svg' },
                        { label: 'Myntra',   logo: PUB + '/logos/MYNTRA/MYNTRA_idK3bhH6Jo_2.svg' },
                        { label: 'Others',   logo: null },
                      ].map(opt => (
                        <Pill key={opt.label} label={opt.label} logo={opt.logo}
                          selected={followUps.shoppingPlatforms.includes(opt.label)}
                          onClick={() => toggleMulti('shoppingPlatforms', opt.label)} />
                      ))}
                    </FollowUp>
                  )}

                  {/* Fuel */}
                  {def.id === 'fuel' && sliders.fuel > 0 && (
                    <FollowUp label="Which fuel brand mostly?">
                      <LogoTile label="BPCL"
                        logo={PUB + '/logos/Bharat Petroleum/Bharat Petroleum_idjbAcGkVm_1.svg'}
                        selected={followUps.fuelBrand === 'BPCL'}
                        onClick={() => setFU('fuelBrand', 'BPCL')} />
                      <LogoTile label="HPCL"
                        logo={PUB + '/logos/Hindustan Petroleum Corporation Limited/Hindustan Petroleum Corporation Limited_idDHSauz3l_0.jpeg'}
                        selected={followUps.fuelBrand === 'HPCL'}
                        onClick={() => setFU('fuelBrand', 'HPCL')} />
                      <LogoTile label="IOCL"
                        logo={PUB + '/logos/IndianOil/IndianOil_idXd5dgR9x_1.svg'}
                        selected={followUps.fuelBrand === 'IOCL'}
                        onClick={() => setFU('fuelBrand', 'IOCL')} />
                      <LogoTile label="Mix" logo={null}
                        selected={followUps.fuelBrand === 'Mix'}
                        onClick={() => setFU('fuelBrand', 'Mix')} />
                    </FollowUp>
                  )}

                  {/* UPI */}
                  {def.id === 'upi' && sliders.upi > 0 && (
                    <FollowUp label="Monthly UPI transactions?">
                      {['0–10', '10–30', '30–60', '60+'].map(opt => (
                        <Pill key={opt} label={opt}
                          selected={followUps.upiTransactions === opt}
                          onClick={() => setFU('upiTransactions', opt)} />
                      ))}
                    </FollowUp>
                  )}

                  {/* Travel */}
                  {def.id === 'travel' && sliders.travel > 0 && (
                    <FollowUp label="Preferred airline?">
                      <LogoTile label="IndiGo"
                        logo={PUB + '/logos/IndiGo/IndiGo_idcn9ykitF_8.svg'}
                        selected={followUps.airline === 'IndiGo'}
                        onClick={() => setFU('airline', 'IndiGo')} />
                      <LogoTile label="Air India"
                        logo={PUB + '/logos/Air India/Air India_Logo_1.png'}
                        selected={followUps.airline === 'Air India'}
                        onClick={() => setFU('airline', 'Air India')} />
                      <LogoTile label="Mix" logo={null}
                        selected={followUps.airline === 'Mix'}
                        onClick={() => setFU('airline', 'Mix')} />
                      <LogoTile label="No preference" logo={null}
                        selected={followUps.airline === 'No preference'}
                        onClick={() => setFU('airline', 'No preference')} />
                    </FollowUp>
                  )}

                </SteppedSlider>
                {i < ALWAYS_SLIDERS.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            {/* Toggle-gated sliders */}
            {GATED_SLIDERS.map(def => (
              toggles[def.id] && (
                <React.Fragment key={def.id}>
                  <Divider />
                  <div style={{ animation: 'slideDown 0.25s ease' }}>
                    <SteppedSlider def={def} idx={sliders[def.id]} onChange={setSlider} />
                  </div>
                </React.Fragment>
              )
            ))}

          </div>
        </div>

      </div>

      {/* ── Sticky Continue button ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, #FAFCFB 70%, rgba(250,252,251,0))',
        padding: '24px 48px 32px',
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          style={{
            pointerEvents: 'all',
            backgroundColor: canContinue ? '#1C5BC0' : '#C8D8EF',
            color: 'white',
            border: 'none', borderRadius: 12,
            padding: '16px 48px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            boxShadow: canContinue ? '0 8px 24px rgba(28,91,192,0.3)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            minWidth: 200,
            position: 'relative', overflow: 'hidden',
            willChange: 'transform',
          }}
          onMouseEnter={e => {
            if (!canContinue) return;
            e.currentTarget.style.backgroundColor = '#2A61C1';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(28,91,192,0.4)';
            const shimmer = e.currentTarget.querySelector('.btn-shimmer');
            if (shimmer) shimmer.style.animation = 'btnShimmer 0.6s ease forwards';
          }}
          onMouseLeave={e => {
            if (!canContinue) return;
            e.currentTarget.style.backgroundColor = '#1C5BC0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,91,192,0.3)';
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
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Layer2;

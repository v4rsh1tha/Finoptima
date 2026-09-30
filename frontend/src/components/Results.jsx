import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { API_ENDPOINTS } from '../config/api';

const PUB = process.env.PUBLIC_URL;
const logoSvg = PUB + '/drawing1.svg';

/* ── Static lookup maps ──────────────────────────────────────────── */
const BANK_LOGO_MAP = {
  'HDFC Bank':           PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg',
  'Axis Bank':           PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg',
  'ICICI Bank':          PUB + '/logos/ICICI Bank/ICICI Bank_id_NFCjbgj_1.svg',
  'State Bank of India': PUB + '/logos/State Bank of India/State Bank of India_id95r1JSPJ_1.svg',
  'Kotak Mahindra':      PUB + '/logos/Kotak Mahindra Bank/Kotak Mahindra Bank_idVNFKKm-u_1.svg',
  'IDFC FIRST Bank':     PUB + '/logos/IDFC FIRST Bank/IDFC FIRST Bank_idqoD2MEzc_2.svg',
  'YES BANK':            PUB + '/logos/YES BANK/YES BANK_idcP_Yq02L_1.svg',
  'American Express':    PUB + '/logos/American Express/American Express_Logo_0.svg',
  'Standard Chartered':  PUB + '/logos/Standard Chartered/Standard Chartered_Logo_3.svg',
  'HSBC':                PUB + '/logos/HSBC/HSBC_idEhxu60Ia_1.svg',
  'Federal Bank':        PUB + '/logos/Federal Bank/Federal Bank_idOdzymMUm_1.svg',
  'RBL Bank':            PUB + '/logos/The Ratnakar Bank/The Ratnakar Bank_idCG4v49Ii_2.png',
};

const NETWORK_LOGO_MAP = {
  'visa':       PUB + '/logos/Visa Inc/Visa Inc._idDUM8TcN7_1.svg',
  'mastercard': PUB + '/logos/Mastercard/Mastercard_Logo_0.svg',
  'amex':       PUB + '/logos/American Express/American Express_Symbol_6.svg',
  'diners':     PUB + '/logos/Diners Club/Diners Club_idkGrCEGaE_2.svg',
  'rupay':      PUB + '/logos/Rupay/RuPay.svg',
};

const CARD_GRADIENTS = {
  'hdfc_regalia':       'linear-gradient(135deg, #1a1a2e 0%, #003087 100%)',
  'hdfc_millennia':     'linear-gradient(135deg, #0d3b6e 0%, #1a5276 100%)',
  'icici_amazon_pay':   'linear-gradient(135deg, #131921 0%, #232f3e 100%)',
  'axis_atlas':         'linear-gradient(135deg, #3a006b 0%, #7b00e0 100%)',
  'hdfc_diners_black':  'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)',
  'sbi_prime':          'linear-gradient(135deg, #003366 0%, #0066cc 100%)',
  'amex_mrcc':          'linear-gradient(135deg, #003087 0%, #0057b8 100%)',
  'axis_ace':           'linear-gradient(135deg, #004d40 0%, #00897b 100%)',
  'idfc_first_classic': 'linear-gradient(135deg, #b84400 0%, #ff8c00 100%)',
  'sbi_simply_click':   'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
};
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a2e 0%, #1C5BC0 100%)';

/* ── Helpers ─────────────────────────────────────────────────────── */
const fmt    = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;
const fmtFee = (val) => `₹${val.toLocaleString('en-IN')}`;

/* Star rating: rank 1→5★, 2→4.5★, 3→4★, 4→3.5★, 5→3★ */
const rankToStars = (rank) => {
  const map = {1: 5, 2: 4.5, 3: 4, 4: 3.5, 5: 3};
  return map[rank] || Math.max(3, 5.5 - rank * 0.5);
};

/* Derive card type badge from id/name */
const deriveCardType = (cardId, cardName) => {
  const id = (cardId || '').toLowerCase();
  const name = (cardName || '').toLowerCase();
  if (id.includes('diners') || name.includes('diners')) return 'Diners Club';
  if (id.includes('amazon') || name.includes('amazon') || id.includes('flipkart') || name.includes('flipkart')) return 'Co-Branded';
  if (id.includes('atlas') || id.includes('vistara') || id.includes('intermiles') || id.includes('miles') || name.includes('miles') || name.includes('travel')) return 'Travel';
  if (id.includes('cashback') || name.includes('cashback') || id.includes('ace') || id.includes('simply')) return 'Cashback';
  if (id.includes('black') || id.includes('infinite') || id.includes('solitaire') || id.includes('regalia') || id.includes('magnus') || name.includes('ultra') || name.includes('signature')) return 'Premium';
  if (name.includes('lifestyle') || id.includes('neo') || id.includes('move') || id.includes('swiggy') || id.includes('zomato')) return 'Lifestyle';
  return 'Rewards';
};

const CARD_TYPE_COLORS = {
  'Co-Branded':   { bg: 'rgba(255,107,53,0.1)',   text: '#FF6B35' },
  'Travel':       { bg: 'rgba(28,91,192,0.1)',     text: '#1C5BC0' },
  'Cashback':     { bg: 'rgba(5,150,105,0.1)',     text: '#059669' },
  'Premium':      { bg: 'rgba(26,26,46,0.08)',     text: '#1A1A2E' },
  'Rewards':      { bg: 'rgba(224,158,66,0.1)',    text: '#B8762E' },
  'Lifestyle':    { bg: 'rgba(124,58,237,0.1)',    text: '#7C3AED' },
  'Diners Club':  { bg: 'rgba(26,26,46,0.08)',     text: '#1A1A2E' },
};

const toDisplayCard = (apiCard, rank) => ({
  rank,
  card_id:      apiCard.card_id,
  name:         apiCard.card_name,
  bank:         apiCard.bank_name,
  bankLogo:     BANK_LOGO_MAP[apiCard.bank_name] || '',
  fee:          fmtFee(apiCard.annual_fee),
  joiningFee:   fmtFee(apiCard.joining_fee || 0),
  feeRaw:       apiCard.annual_fee,
  feeLifetime:  apiCard.is_lifetime_free,
  reward:       fmt(apiCard.estimated_annual_reward),
  rewardRaw:    apiCard.estimated_annual_reward,
  rewardRate:   apiCard.reward_rate || '1x',
  network:      apiCard.network,
  networkLogo:  NETWORK_LOGO_MAP[apiCard.network] || '',
  gradient:     CARD_GRADIENTS[apiCard.card_id] || DEFAULT_GRADIENT,
  reasons:      apiCard.reasons || [],
  benefitFlags: apiCard.benefit_flags || {},
  bestFor:      Array.isArray(apiCard.best_for)
                  ? apiCard.best_for.map(s => s.replace(/_/g, ' ')).join(', ')
                  : (apiCard.best_for
                      ? String(apiCard.best_for).replace(/_/g, ' ')
                      : (apiCard.card_tier ? apiCard.card_tier.replace(/_/g, ' ') : '')),
  stars:        rankToStars(rank),
  cardType:     deriveCardType(apiCard.card_id, apiCard.card_name),
});

const matchesBank = (cardBankName, bankAccount) =>
  cardBankName.toLowerCase().includes(bankAccount.toLowerCase()) ||
  bankAccount.toLowerCase().includes(cardBankName.toLowerCase());

/* ── Loading screen ──────────────────────────────────────────────── */
const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0,
    backgroundColor: '#1A1A2E',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 28,
  }}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity:0.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
    `}</style>
    <img
      src={logoSvg} alt="Finoptima"
      style={{ height: 72, width: 72, objectFit: 'contain', animation: 'pulse 2s ease-in-out infinite' }}
    />
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.15)',
      borderTop: '3px solid #E09E42',
      animation: 'spin 0.9s linear infinite',
    }} />
    <p style={{
      fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 17,
      color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em',
    }}>
      Finding your perfect cards…
    </p>
  </div>
);

/* ── Error screen ────────────────────────────────────────────────── */
const ErrorScreen = ({ message, onRetry }) => (
  <div style={{
    minHeight: '100vh', backgroundColor: '#FAFCFB',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 48, gap: 24, textAlign: 'center',
  }}>
    <img
      src={PUB + '/illustrations/undraw_server-error_syuz.svg'}
      alt="Server error"
      style={{ width: 240, height: 'auto', objectFit: 'contain', marginBottom: 8 }}
    />
    <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 24, color: '#1A1A2E', margin: 0 }}>
      Something went wrong
    </h2>
    <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B', maxWidth: 400, lineHeight: 1.6 }}>
      We couldn't retrieve your recommendations. Please try again.
    </p>
    {message && (
      <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#ABABAB', maxWidth: 400 }}>{message}</p>
    )}
    <button
      onClick={onRetry}
      style={{
        backgroundColor: '#1C5BC0', color: 'white',
        border: 'none', borderRadius: 10, padding: '14px 36px',
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
        cursor: 'pointer',
      }}
    >
      Try Again
    </button>
  </div>
);

/* ── Card silhouette visual ──────────────────────────────────────── */
const CardVisual = ({ card, large }) => {
  const W = large ? 220 : 200;
  const H = large ? 132 : 120;
  return (
    <div style={{
      width: W, height: H, borderRadius: 14,
      background: card.gradient,
      position: 'relative', flexShrink: 0,
      boxShadow: large ? '0 16px 48px rgba(0,0,0,0.38)' : '0 6px 18px rgba(0,0,0,0.22)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 14, left: 14,
        width: 30, height: 22, borderRadius: 4,
        background: 'linear-gradient(145deg, #f5d060 0%, #d4920a 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '28%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,60,0,0.3)' }} />
        <div style={{ position: 'absolute', top: '56%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,60,0,0.3)' }} />
        <div style={{ position: 'absolute', left: '38%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(100,60,0,0.25)' }} />
      </div>
      <div style={{ position: 'absolute', top: 13, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M10 14 Q14 10 10 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M10 14 Q16 8 10 2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.6)"/>
        </svg>
        <img
          src={card.bankLogo} alt={card.bank}
          style={{ height: 22, width: 'auto', maxWidth: 58, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>
      <div style={{
        position: 'absolute', bottom: 12, left: 14,
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 9,
        color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em',
        textTransform: 'uppercase', maxWidth: '60%', lineHeight: 1.2,
      }}>
        {card.name}
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12 }}>
        <img
          src={card.networkLogo} alt={card.network}
          style={{ height: 17, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>
    </div>
  );
};

/* ── Star rating display ─────────────────────────────────────────── */
const StarRating = ({ stars }) => {
  const full  = Math.floor(stars);
  const half  = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array(full).fill(0).map((_, i) => (
        <svg key={`f${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#E09E42"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
      {half && (
        <svg key="h" width="14" height="14" viewBox="0 0 24 24"><defs><linearGradient id="hg"><stop offset="50%" stopColor="#E09E42"/><stop offset="50%" stopColor="#E8E8E8"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#hg)"/></svg>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <svg key={`e${i}`} width="14" height="14" viewBox="0 0 24 24" fill="#E8E8E8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
      <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#6A6B6B', marginLeft: 4 }}>{stars}</span>
    </div>
  );
};

/* ── Benefit pill ────────────────────────────────────────────────── */
const BenefitPill = ({ label, icon, active }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 20,
    backgroundColor: active ? 'rgba(28,91,192,0.08)' : '#F4F6FA',
    border: `1px solid ${active ? 'rgba(28,91,192,0.2)' : '#E8E8E8'}`,
    fontFamily: 'Inter', fontSize: 12, fontWeight: active ? 600 : 400,
    color: active ? '#1C5BC0' : '#ABABAB',
    opacity: active ? 1 : 0.6,
    transition: 'all 0.15s',
  }}>
    <span style={{ fontSize: 12 }}>{icon}</span>
    {label}
  </div>
);

/* ── Stat column ─────────────────────────────────────────────────── */
const StatCol = ({ label, value, highlight }) => (
  <div style={{
    flex: 1, textAlign: 'center',
    padding: '12px 8px',
    borderRight: '1px solid #F0F0F0',
  }}>
    <div style={{
      fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
      color: highlight ? '#22C55E' : '#1A1A2E', marginBottom: 3, lineHeight: 1.2,
    }}>
      {value}
    </div>
    <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#ABABAB', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

/* ── Single result card (PDF-inspired layout) ────────────────────── */
const ResultCard = ({ card, selected, onToggle, disabled, animIndex = 0 }) => {
  const isTop = card.rank === 1;
  const [hov, setHov]           = useState(false);
  const [expanded, setExpanded] = useState(isTop); // top card expanded by default
  const typeStyle = CARD_TYPE_COLORS[card.cardType] || CARD_TYPE_COLORS['Rewards'];

  const bf = card.benefitFlags || {};
  const pills = [
    { label: 'Welcome Bonus', icon: '🎁', active: !!bf.welcome_bonus },
    { label: 'Travel',        icon: '✈️', active: !!bf.travel || !!bf.lounge },
    { label: 'Fuel',          icon: '⛽', active: !!bf.fuel },
    { label: 'Rewards',       icon: '💎', active: true }, // always show rewards
    { label: 'Shopping',      icon: '🛍️', active: !!bf.shopping },
  ];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: 'white',
        border: `1.5px solid ${selected ? '#1C5BC0' : isTop ? '#E09E42' : hov ? '#C8D8EF' : '#E8E8E8'}`,
        borderRadius: 18,
        boxShadow: selected
          ? '0 6px 28px rgba(28,91,192,0.12)'
          : isTop
            ? '0 8px 40px rgba(224,158,66,0.15)'
            : hov ? '0 4px 20px rgba(0,0,0,0.07)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.2s',
        transform: hov && !selected ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        animation: `cardSlideIn 0.55s cubic-bezier(0.16,1,0.3,1) ${animIndex * 110}ms both`,
        willChange: 'transform',
        overflow: 'hidden',
      }}
    >
      {/* Top banner */}
      {isTop && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #E09E42, #F5C842)',
        }} />
      )}
      {isTop && (
        <div style={{
          position: 'absolute', top: 3, right: 20,
          backgroundColor: '#E09E42', color: 'white',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 10,
          padding: '3px 12px', borderRadius: '0 0 8px 8px',
          letterSpacing: '0.06em',
        }}>
          BEST MATCH
        </div>
      )}

      <div style={{ padding: isTop ? '28px 24px 0' : '22px 24px 0' }}>

        {/* ── Row 1: Card visual + name/stars/badge ── */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Rank badge */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: isTop ? '#E09E42' : '#1C5BC0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 12, color: 'white',
            }}>
              {card.rank}
            </div>
            <CardVisual card={card} large={isTop} />
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingRight: 40 }}>
            {/* Name + star rating */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <h3 style={{
                fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                fontSize: isTop ? 20 : 18, color: '#1A1A2E', lineHeight: 1.2, margin: 0,
              }}>
                {card.name}
              </h3>
              <StarRating stars={card.stars} />
            </div>

            {/* Bank + card type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B' }}>{card.bank}</span>
              <span style={{
                fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
                padding: '2px 8px', borderRadius: 12,
                backgroundColor: typeStyle.bg, color: typeStyle.text,
              }}>
                {card.cardType}
              </span>
              {card.bestFor && (
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#ABABAB' }}>
                  · Best for: <span style={{ color: '#6A6B6B', fontWeight: 500 }}>{card.bestFor}</span>
                </span>
              )}
            </div>

            {/* Benefit pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {pills.map(p => <BenefitPill key={p.label} {...p} />)}
            </div>
          </div>
        </div>

        {/* ── Row 2: Stat bar ── */}
        <div style={{
          display: 'flex', borderRadius: 12, overflow: 'hidden',
          border: '1px solid #F0F0F0', backgroundColor: '#FAFCFB',
          marginBottom: 0,
        }}>
          <StatCol label="Reward Rate" value={card.rewardRate} />
          <StatCol label="Joining Fee" value={card.feeLifetime ? 'Free' : card.joiningFee} />
          <StatCol label="Annual Fee"  value={card.feeLifetime ? 'Lifetime Free' : card.fee} highlight={card.feeLifetime} />
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, color: '#22C55E', marginBottom: 3 }}>
              {card.reward}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#ABABAB', fontWeight: 500 }}>
              Est. Rewards/yr
            </div>
          </div>
        </div>

        {/* ── Row 3: See Benefits toggle ── */}
        <div
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0',
            cursor: 'pointer',
            borderTop: '1px solid #F5F5F5',
            marginTop: 0,
          }}
        >
          <span style={{
            fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#1C5BC0',
          }}>
            {expanded ? 'Hide Benefits' : 'See Benefits'}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#1C5BC0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Expandable reasons ── */}
      {expanded && card.reasons.length > 0 && (
        <div style={{
          padding: '0 24px 20px',
          borderTop: '1px solid #F0F0F0',
          animation: 'expandIn 0.22s ease',
        }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {card.reasons.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontFamily: 'Inter', fontSize: 13, color: '#4A5568', lineHeight: 1.55,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: 'rgba(28,91,192,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#1C5BC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Compare checkbox (bottom-right) ── */}
      <div style={{
        position: 'absolute', top: isTop ? 32 : 18, right: 18,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div
          onClick={e => { e.stopPropagation(); if (!disabled) onToggle(); }}
          title={disabled ? 'Max 3 cards' : selected ? 'Remove' : 'Compare'}
          style={{
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${selected ? '#1C5BC0' : '#E8E8E8'}`,
            backgroundColor: selected ? '#1C5BC0' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: disabled ? 0.35 : 1, transition: 'all 0.15s',
          }}
        >
          {selected && (
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Section divider ─────────────────────────────────────────────── */
const SectionDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0' }}>
    <div style={{ flex: 1, height: 1, backgroundColor: '#E8E8E8' }} />
    <span style={{
      fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B',
      padding: '0 16px', backgroundColor: '#FAFCFB', whiteSpace: 'nowrap',
    }}>
      Other top picks for your profile
    </span>
    <div style={{ flex: 1, height: 1, backgroundColor: '#E8E8E8' }} />
  </div>
);

/* ── Empty home bank dialog ──────────────────────────────────────── */
const EmptyBankDialog = ({ homeBanks, onShowAll }) => (
  <div style={{
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 24,
  }}>
    <div style={{
      backgroundColor: 'white', borderRadius: 20,
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      padding: '48px 40px', maxWidth: 420, width: '100%',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>🏦</div>
      <h2 style={{
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 22,
        color: '#1A1A2E', marginBottom: 14, lineHeight: 1.3,
      }}>
        No cards found from your bank
      </h2>
      <p style={{
        fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B',
        lineHeight: 1.6, marginBottom: 32,
      }}>
        We couldn't find cards from {homeBanks.join(', ')} that match your
        profile. Here are the best cards available for you.
      </p>
      <button
        onClick={onShowAll}
        style={{
          width: '100%', backgroundColor: '#1C5BC0', color: 'white',
          border: 'none', borderRadius: 12, padding: '16px 0',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Show best cards for me →
      </button>
    </div>
  </div>
);

/* ── Toggle switch ───────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: 44, height: 24, borderRadius: 12,
      backgroundColor: checked ? '#1C5BC0' : '#D1D5DB',
      position: 'relative', cursor: 'pointer',
      transition: 'background-color 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute',
      top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%',
      backgroundColor: 'white',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      transition: 'left 0.2s',
    }} />
  </div>
);

/* ── Main Results page ───────────────────────────────────────────── */
const Results = () => {
  const navigate = useNavigate();
  const { survey, updateSurvey, resetSurvey } = useSurvey();

  const [showOnlyHomeBank, setShowOnlyHomeBank]       = useState(false);
  const [showAllCards, setShowAllCards]               = useState(false);
  const [emptyDialogDismissed, setEmptyDialogDismissed] = useState(false);
  const [selectedCards, setSelectedCards]             = useState([]);  // array of card_ids
  const [maxMsgVisible, setMaxMsgVisible]             = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  /* Auto-hide max message after 2 s */
  useEffect(() => {
    if (!maxMsgVisible) return;
    const t = setTimeout(() => setMaxMsgVisible(false), 2000);
    return () => clearTimeout(t);
  }, [maxMsgVisible]);

  /* Fire API when loading flag is set */
  useEffect(() => {
    if (!survey.loading) return;

    const payload = {
      profile: {
        income:                survey.income,
        credit_score:          survey.credit_score,
        employment:            survey.employment,
        existing_cards:        survey.existing_cards,
        fee_preference:        survey.fee_preference,
        bank_accounts:         survey.bank_accounts,
        total_spend_range:     survey.total_spend_range,
        domestic_flights:      survey.domestic_flights,
        international_flights: survey.international_flights,
        lounge_visits_needed:  survey.lounge_visits_needed,
        hotel_preference:      survey.hotel_preference,
        concierge:             survey.concierge,
        golf:                  survey.golf,
        card_preference:       survey.card_purpose,
      },
      spend: {
        total_spend_range:     survey.total_spend_range,
        food_delivery_spend:   survey.food_delivery_spend   || 0,
        groceries_spend:       survey.groceries_spend       || 0,
        dining_spend:          survey.dining_spend          || 0,
        online_shopping_spend: survey.online_shopping_spend || 0,
        fuel_spend:            survey.fuel_spend            || 0,
        upi_spend:             survey.upi_spend             || 0,
        travel_spend:          survey.travel_spend          || 0,
        entertainment_spend:   survey.entertainment_spend   || 0,
        pharmacy_spend:        survey.pharmacy_spend        || 0,
        international_spend:   survey.international_spend   || 0,
        emi_spend:             survey.emi_spend             || 0,
        rent_spend:            survey.rent_spend            || 0,
        education_spend:       survey.education_spend       || 0,
        tax_spend:             survey.tax_spend             || 0,
        insurance_spend:       survey.insurance_spend       || 0,
      },
    };

    console.log("SENDING TO API:", JSON.stringify(payload));

    fetch(API_ENDPOINTS.recommend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        console.log("API RESPONSE:", JSON.stringify(data));
        if (data.success) {
          updateSurvey({
            loading: false,
            recommendations: data.recommendations,
            detected_intent: data.detected_intent,
            error: null,
          });
        } else {
          updateSurvey({ loading: false, error: data.error || 'Unknown error' });
        }
      })
      .catch(err => {
        updateSurvey({ loading: false, error: err.message || 'Network error' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey.loading]);

  if (survey.loading) return <LoadingScreen />;

  if (survey.error) {
    return (
      <ErrorScreen
        message={survey.error}
        onRetry={() => navigate('/survey/layer3')}
      />
    );
  }

  if (!survey.recommendations) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#FAFCFB',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 48, gap: 24, textAlign: 'center',
      }}>
        <img
          src={PUB + '/illustrations/undraw_questions_52ic.svg'}
          alt="Complete the survey"
          style={{ width: 260, height: 'auto', objectFit: 'contain', marginBottom: 8 }}
        />
        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 24, color: '#1A1A2E', margin: 0 }}>
          No results yet
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B', maxWidth: 400, lineHeight: 1.6 }}>
          Complete the survey to get your personalised card recommendations.
        </p>
        <button
          onClick={() => navigate('/survey/layer1')}
          style={{
            backgroundColor: '#1C5BC0', color: 'white',
            border: 'none', borderRadius: 10, padding: '14px 36px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Start Survey
        </button>
      </div>
    );
  }

  /* ── Split cards into sections ─────────────────────────────────── */
  const rawRecs   = survey.recommendations;
  const homeBanks = survey.bank_accounts || [];

  const homeBankCards = rawRecs
    .filter(c => homeBanks.some(b => matchesBank(c.bank_name, b)))
    .map((c, i) => toDisplayCard(c, i + 1));

  const otherCards = rawRecs
    .filter(c => !homeBanks.some(b => matchesBank(c.bank_name, b)))
    .map((c, i) => toDisplayCard(c, i + 1));

  const allCards = rawRecs.map((c, i) => toDisplayCard(c, i + 1));

  const showEmptyDialog =
    homeBanks.length > 0 &&
    homeBankCards.length === 0 &&
    !emptyDialogDismissed &&
    !showAllCards;

  const hasTwoBankSections =
    !showOnlyHomeBank &&
    homeBankCards.length > 0 &&
    otherCards.length > 0;

  /* ── Selection helpers ─────────────────────────────────────────── */
  const handleToggle = (cardId) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    } else {
      if (selectedCards.length >= 3) {
        setMaxMsgVisible(true);
        return;
      }
      setSelectedCards(prev => [...prev, cardId]);
    }
  };

  const cardProps = (card) => ({
    selected: selectedCards.includes(card.card_id),
    onToggle: () => handleToggle(card.card_id),
    disabled: !selectedCards.includes(card.card_id) && selectedCards.length >= 3,
  });

  const handleCompare = () => {
    const cardsToCompare = allCards.filter(c => selectedCards.includes(c.card_id));
    navigate('/compare', {
      state: {
        selectedCards: cardsToCompare,
        detectedIntent: survey.detected_intent,
      },
    });
  };

  const barVisible = selectedCards.length >= 2;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFCFB', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeOutMsg {
          0%   { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Empty home bank dialog */}
      {showEmptyDialog && (
        <EmptyBankDialog
          homeBanks={homeBanks}
          onShowAll={() => { setEmptyDialogDismissed(true); setShowAllCards(true); }}
        />
      )}

      {/* Sticky compare bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E8E8E8',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        padding: '16px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transform: barVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 200,
        pointerEvents: barVisible ? 'auto' : 'none',
      }}>
        <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B' }}>
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={handleCompare}
          style={{
            backgroundColor: '#1C5BC0', color: 'white',
            border: 'none', borderRadius: 10, padding: '12px 28px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Compare Cards →
        </button>
      </div>

      {/* Navbar */}
      <nav style={{
        padding: '14px 48px', borderBottom: '1px solid #EEEEEE',
        backgroundColor: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <img src={logoSvg} alt="Finoptima" style={{ height: 30, width: 30, objectFit: 'contain', borderRadius: 6 }} />
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1C5BC0' }}>Fin</span>
            <span style={{ color: '#1A1A2E' }}>optima</span>
          </span>
        </div>
        <button
          onClick={() => { resetSurvey(); navigate('/survey/layer1'); }}
          style={{
            background: 'none', border: '1.5px solid #E8E8E8', borderRadius: 8,
            padding: '7px 16px', fontFamily: 'Inter', fontWeight: 500, fontSize: 13,
            color: '#6A6B6B', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1C5BC0'; e.currentTarget.style.color = '#1C5BC0'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.color = '#6A6B6B'; }}
        >
          ← Retake Survey
        </button>
      </nav>

      <div style={{
        maxWidth: 860, margin: '0 auto',
        paddingTop: 40, paddingLeft: 48, paddingRight: 48,
        paddingBottom: barVisible ? 120 : 80,
      }}>

        {/* Compact heading with illustration accent */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          marginBottom: 32, padding: '20px 24px',
          backgroundColor: 'white', borderRadius: 16,
          border: '1px solid #E8E8E8',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <img
            src={PUB + '/illustrations/undraw_make-it-rain_vyg9.svg'}
            alt="Your card matches"
            style={{ width: 80, height: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <h1 style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              fontSize: 26, color: '#1A1A2E', marginBottom: 6, letterSpacing: '-0.02em',
            }}>
              Your Perfect Cards
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B', lineHeight: 1.55 }}>
              {survey.detected_intent
                ? `Matched for your ${survey.detected_intent.replace(/_/g, ' ')} profile — ranked by estimated annual reward value`
                : 'Based on your spending profile — ranked by estimated annual reward value'}
            </p>
          </div>
        </div>

        {/* Bank filter bar */}
        {!showAllCards && homeBanks.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
            backgroundColor: 'white', border: '1px solid #E8E8E8',
            borderRadius: 14, padding: '14px 20px',
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B', flexShrink: 0 }}>
                Your banks:
              </span>
              {homeBanks.map(bank => (
                <span key={bank} style={{
                  fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
                  color: '#1C5BC0', backgroundColor: 'rgba(28,91,192,0.08)',
                  borderRadius: 20, padding: '4px 12px',
                }}>
                  {bank}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#1A1A2E' }}>
                Show only my banks
              </span>
              <ToggleSwitch
                checked={showOnlyHomeBank}
                onChange={() => setShowOnlyHomeBank(v => !v)}
              />
            </div>
          </div>
        )}

        {/* Max selection message */}
        {maxMsgVisible && (
          <p style={{
            fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B',
            textAlign: 'center', marginBottom: 16,
            animation: 'fadeOutMsg 2s ease forwards',
          }}>
            Maximum 3 cards can be compared
          </p>
        )}

        {/* Select hint — shown when 1 card selected */}
        {selectedCards.length === 1 && (
          <p style={{
            fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B',
            textAlign: 'center', marginBottom: 16,
          }}>
            Select one more card to compare
          </p>
        )}

        {/* ── FLAT LIST (after empty bank dialog dismissal) ─────── */}
        {showAllCards && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {allCards.map((card, i) => (
              <ResultCard key={card.card_id} card={card} {...cardProps(card)} animIndex={i} />
            ))}
          </div>
        )}

        {/* ── SECTIONED LIST ────────────────────────────────────── */}
        {!showAllCards && (
          <>
            {homeBankCards.length > 0 && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{
                    fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                    fontSize: 18, color: '#1A1A2E', marginBottom: 4,
                  }}>
                    Cards from your banks
                  </h2>
                  <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B' }}>
                    Recommended cards from {homeBanks.join(', ')}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {homeBankCards.map((card, i) => (
                    <ResultCard key={card.card_id} card={card} {...cardProps(card)} animIndex={i} />
                  ))}
                </div>
              </>
            )}

            {hasTwoBankSections && <SectionDivider />}

            {!showOnlyHomeBank && otherCards.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {otherCards.map((card, i) => (
                  <ResultCard key={card.card_id} card={card} {...cardProps(card)} animIndex={homeBankCards.length + i} />
                ))}
              </div>
            )}

            {showOnlyHomeBank && homeBankCards.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
              }}>
                <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B' }}>
                  No cards from your banks match your profile
                </p>
                <button
                  onClick={() => setShowOnlyHomeBank(false)}
                  style={{
                    backgroundColor: 'transparent', border: '2px solid #1C5BC0',
                    borderRadius: 10, padding: '10px 28px', color: '#1C5BC0',
                    fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Turn off filter
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom actions */}
        <div style={{
          marginTop: 40, paddingTop: 28,
          borderTop: '1px solid #E8E8E8',
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', gap: 32,
        }}>
          <button
            onClick={() => navigate('/existing-card')}
            style={{
              background: 'none', border: 'none',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#1C5BC0',
              cursor: 'pointer', padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            I already have one of these →
          </button>
        </div>

      </div>
    </div>
  );
};

export default Results;

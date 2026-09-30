import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PUB = process.env.PUBLIC_URL;
const logoSvg = PUB + '/drawing1.svg';

/* ── Shared lookup maps ──────────────────────────────────────────── */
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

/* ── Static card detail data ─────────────────────────────────────── */
// domesticLounge / intlLounge: use 999 = Unlimited
const CARD_DETAIL_MAP = {
  hdfc_regalia: {
    baseRewardRate:   '4 pts / ₹150',
    bestCategory:     'Travel & Dining',
    bestCategoryRate: '5× on dining & travel',
    welcomeBonus:     2500,
    milestoneBonus:   5000,
    joiningFee:       2500,
    feeWaiver:        '₹3L annual spend',
    forexMarkup:      2,
    domesticLounge:   12,
    intlLounge:       6,
    loungeNetwork:    'Priority Pass',
    travelInsurance:  true,
    airlinePartner:   null,
    movie:            null,
    golf:             '2/month',
    dining:           null,
    concierge:        true,
    ott:              null,
    minIncome:        '₹12L/year',
    minCreditScore:   750,
  },
  hdfc_millennia: {
    baseRewardRate:   '5% cashback (online)',
    bestCategory:     'Online Shopping',
    bestCategoryRate: '5% on major platforms',
    welcomeBonus:     1000,
    milestoneBonus:   1000,
    joiningFee:       1000,
    feeWaiver:        '₹1L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   8,
    intlLounge:       0,
    loungeNetwork:    'DreamFolks',
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            '2 free/month',
    golf:             null,
    dining:           null,
    concierge:        false,
    ott:              null,
    minIncome:        '₹3L/year',
    minCreditScore:   700,
  },
  icici_amazon_pay: {
    baseRewardRate:   '1% cashback',
    bestCategory:     'Amazon Shopping',
    bestCategoryRate: '5% on Amazon (Prime members)',
    welcomeBonus:     750,
    milestoneBonus:   null,
    joiningFee:       0,
    feeWaiver:        'Lifetime Free',
    forexMarkup:      3.5,
    domesticLounge:   0,
    intlLounge:       0,
    loungeNetwork:    null,
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            null,
    golf:             null,
    dining:           null,
    concierge:        false,
    ott:              null,
    minIncome:        '₹3L/year',
    minCreditScore:   680,
  },
  axis_atlas: {
    baseRewardRate:   '2 EDGE Miles / ₹100',
    bestCategory:     'Travel',
    bestCategoryRate: '5 Miles / ₹100 on travel',
    welcomeBonus:     5000,
    milestoneBonus:   10000,
    joiningFee:       5000,
    feeWaiver:        '₹7.5L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   999,
    intlLounge:       4,
    loungeNetwork:    'DreamFolks',
    travelInsurance:  true,
    airlinePartner:   'Multiple partners',
    movie:            null,
    golf:             null,
    dining:           null,
    concierge:        true,
    ott:              null,
    minIncome:        '₹15L/year',
    minCreditScore:   750,
  },
  hdfc_diners_black: {
    baseRewardRate:   '5 pts / ₹150',
    bestCategory:     'All Spends',
    bestCategoryRate: 'Consistent 5× across all',
    welcomeBonus:     2000,
    milestoneBonus:   15000,
    joiningFee:       10000,
    feeWaiver:        '₹8L annual spend',
    forexMarkup:      2,
    domesticLounge:   999,
    intlLounge:       999,
    loungeNetwork:    'Priority Pass',
    travelInsurance:  true,
    airlinePartner:   null,
    movie:            '1 free/month',
    golf:             '6/month',
    dining:           'Good Food Trail',
    concierge:        true,
    ott:              'Netflix, Zomato Gold',
    minIncome:        '₹21L/year',
    minCreditScore:   780,
  },
  sbi_prime: {
    baseRewardRate:   '2 pts / ₹100',
    bestCategory:     'Retail & Departmental',
    bestCategoryRate: '10× on departmental stores',
    welcomeBonus:     3000,
    milestoneBonus:   7500,
    joiningFee:       2999,
    feeWaiver:        '₹3L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   8,
    intlLounge:       4,
    loungeNetwork:    'Priority Pass',
    travelInsurance:  true,
    airlinePartner:   'Air India',
    movie:            '2 free/month',
    golf:             null,
    dining:           null,
    concierge:        true,
    ott:              null,
    minIncome:        '₹6L/year',
    minCreditScore:   730,
  },
  amex_mrcc: {
    baseRewardRate:   '1 MR pt / ₹50',
    bestCategory:     'Dining & Partners',
    bestCategoryRate: '5× on Amex dining partners',
    welcomeBonus:     4000,
    milestoneBonus:   5000,
    joiningFee:       1500,
    feeWaiver:        '₹1.5L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   0,
    intlLounge:       0,
    loungeNetwork:    null,
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            null,
    golf:             null,
    dining:           'Amex Dining Programme',
    concierge:        false,
    ott:              null,
    minIncome:        '₹6L/year',
    minCreditScore:   720,
  },
  axis_ace: {
    baseRewardRate:   '2% flat cashback',
    bestCategory:     'Bill Payments',
    bestCategoryRate: '5% via Google Pay bills',
    welcomeBonus:     500,
    milestoneBonus:   null,
    joiningFee:       499,
    feeWaiver:        '₹2L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   4,
    intlLounge:       0,
    loungeNetwork:    'DreamFolks',
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            '2 free/month',
    golf:             null,
    dining:           null,
    concierge:        false,
    ott:              null,
    minIncome:        '₹3L/year',
    minCreditScore:   700,
  },
  idfc_first_classic: {
    baseRewardRate:   '10× on weekends',
    bestCategory:     'Weekend Dining & Shopping',
    bestCategoryRate: '10× on weekends',
    welcomeBonus:     500,
    milestoneBonus:   null,
    joiningFee:       0,
    feeWaiver:        'Lifetime Free',
    forexMarkup:      3.5,
    domesticLounge:   4,
    intlLounge:       0,
    loungeNetwork:    'DreamFolks',
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            '1 free/month',
    golf:             null,
    dining:           null,
    concierge:        false,
    ott:              null,
    minIncome:        '₹3L/year',
    minCreditScore:   680,
  },
  sbi_simply_click: {
    baseRewardRate:   '1 pt / ₹100',
    bestCategory:     'Online Shopping Partners',
    bestCategoryRate: '10× on Flipkart, Amazon+',
    welcomeBonus:     500,
    milestoneBonus:   2000,
    joiningFee:       499,
    feeWaiver:        '₹1L annual spend',
    forexMarkup:      3.5,
    domesticLounge:   0,
    intlLounge:       0,
    loungeNetwork:    null,
    travelInsurance:  false,
    airlinePartner:   null,
    movie:            null,
    golf:             null,
    dining:           null,
    concierge:        false,
    ott:              'Amazon Prime (1 year)',
    minIncome:        '₹3L/year',
    minCreditScore:   680,
  },
};

/* ── Comparison table groups & rows ─────────────────────────────── */
const TABLE_GROUPS = [
  {
    key: 'rewards', label: 'REWARDS & VALUE',
    rows: [
      {
        label: 'Estimated Annual Reward',
        getValue: (c, d) => c.reward + '/yr',
        getNum:   (c, d) => c.rewardRaw,
        winnerDir: 'max',
      },
      {
        label: 'Base Reward Rate',
        getValue: (c, d) => d.baseRewardRate || '—',
        winnerDir: null,
      },
      {
        label: 'Best Category Rate',
        getValue: (c, d) => d.bestCategoryRate || '—',
        winnerDir: null,
      },
      {
        label: 'Welcome Bonus',
        getValue: (c, d) => d.welcomeBonus ? `₹${d.welcomeBonus.toLocaleString('en-IN')}` : '—',
        getNum:   (c, d) => d.welcomeBonus || 0,
        winnerDir: 'max',
      },
      {
        label: 'Annual Milestone Bonus',
        getValue: (c, d) => d.milestoneBonus ? `₹${d.milestoneBonus.toLocaleString('en-IN')}` : 'None',
        getNum:   (c, d) => d.milestoneBonus || 0,
        winnerDir: 'max',
      },
    ],
  },
  {
    key: 'fees', label: 'FEES',
    rows: [
      {
        label: 'Annual Fee',
        getValue: (c, d) => c.feeLifetime ? 'Lifetime Free' : c.fee,
        getNum:   (c, d) => c.feeLifetime ? -1 : c.feeRaw,
        winnerDir: 'min',
      },
      {
        label: 'Joining Fee',
        getValue: (c, d) => {
          const fee = d.joiningFee;
          if (c.feeLifetime || fee === 0) return 'Nil';
          return `₹${(fee ?? c.feeRaw ?? 0).toLocaleString('en-IN')}`;
        },
        getNum:   (c, d) => c.feeLifetime ? 0 : (d.joiningFee ?? c.feeRaw ?? 0),
        winnerDir: 'min',
      },
      {
        label: 'Fee Waiver',
        getValue: (c, d) => c.feeLifetime ? 'N/A (Lifetime Free)' : (d.feeWaiver || 'Not Available'),
        winnerDir: null,
      },
      {
        label: 'Forex Markup',
        getValue: (c, d) => d.forexMarkup != null ? `${d.forexMarkup}%` : '3.5%',
        getNum:   (c, d) => d.forexMarkup ?? 3.5,
        winnerDir: 'min',
      },
    ],
  },
  {
    key: 'travel', label: 'TRAVEL',
    rows: [
      {
        label: 'Domestic Lounge',
        getValue: (c, d) => {
          if (!d.domesticLounge) return 'None';
          return d.domesticLounge >= 999 ? 'Unlimited' : `${d.domesticLounge}/year`;
        },
        getNum:   (c, d) => d.domesticLounge || 0,
        winnerDir: 'max',
      },
      {
        label: 'International Lounge',
        getValue: (c, d) => {
          if (!d.intlLounge) return 'None';
          return d.intlLounge >= 999 ? 'Unlimited' : `${d.intlLounge}/year`;
        },
        getNum:   (c, d) => d.intlLounge || 0,
        winnerDir: 'max',
      },
      {
        label: 'Lounge Network',
        getValue: (c, d) => d.loungeNetwork || 'None',
        winnerDir: null,
      },
      {
        label: 'Travel Insurance',
        getValue: (c, d) => d.travelInsurance ? 'Yes' : 'No',
        getNum:   (c, d) => d.travelInsurance ? 1 : 0,
        winnerDir: 'max',
      },
      {
        label: 'Airline Partner',
        getValue: (c, d) => d.airlinePartner || 'None',
        winnerDir: null,
      },
    ],
  },
  {
    key: 'lifestyle', label: 'LIFESTYLE',
    rows: [
      {
        label: 'Movie Benefits',
        getValue: (c, d) => d.movie || 'None',
        winnerDir: null,
      },
      {
        label: 'Golf',
        getValue: (c, d) => d.golf || 'None',
        winnerDir: null,
      },
      {
        label: 'Dining Programme',
        getValue: (c, d) => d.dining || 'None',
        winnerDir: null,
      },
      {
        label: 'Concierge',
        getValue: (c, d) => d.concierge ? 'Yes' : 'No',
        getNum:   (c, d) => d.concierge ? 1 : 0,
        winnerDir: 'max',
      },
      {
        label: 'OTT Subscriptions',
        getValue: (c, d) => d.ott || 'None',
        winnerDir: null,
      },
    ],
  },
  {
    key: 'eligibility', label: 'ELIGIBILITY',
    rows: [
      {
        label: 'Min Income Required',
        getValue: (c, d) => d.minIncome || '—',
        winnerDir: null,
      },
      {
        label: 'Min Credit Score',
        getValue: (c, d) => d.minCreditScore ? String(d.minCreditScore) : '—',
        winnerDir: null,
      },
      {
        label: 'Network',
        getValue: (c, d) => c.network ? (c.network.charAt(0).toUpperCase() + c.network.slice(1)) : '—',
        winnerDir: null,
      },
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
const d = (card) => CARD_DETAIL_MAP[card.card_id] || {};

const getWinners = (row, cards) => {
  if (!row.winnerDir || !row.getNum) return null;
  const nums = cards.map(c => row.getNum(c, d(c)));
  if (nums.some(n => n === null || n === undefined || isNaN(n))) return null;
  const best = row.winnerDir === 'max' ? Math.max(...nums) : Math.min(...nums);
  const winners = nums.reduce((acc, n, i) => n === best ? [...acc, i] : acc, []);
  if (winners.length === cards.length) return null; // all tied
  return winners;
};

const shouldShowRow = (row, cards) => {
  const vals = cards.map(c => row.getValue(c, d(c)));
  return !vals.every(v => v === vals[0]);
};

const getCardHighlights = (card, allCards) => {
  const det  = d(card);
  const hits = [];

  const maxReward = Math.max(...allCards.map(c => c.rewardRaw));
  if (card.rewardRaw === maxReward) {
    hits.push(`Highest estimated return (${card.reward}/yr)`);
  }

  if (card.feeLifetime) {
    hits.push('Zero annual fee, lifetime');
  } else {
    const nonLtf = allCards.filter(c => !c.feeLifetime);
    if (nonLtf.length > 1) {
      const minFee = Math.min(...nonLtf.map(c => c.feeRaw));
      if (card.feeRaw === minFee) hits.push(`Lowest annual fee (${card.fee})`);
    }
  }

  const maxLounge = Math.max(...allCards.map(c => (d(c)).domesticLounge || 0));
  if (maxLounge > 0 && (det.domesticLounge || 0) === maxLounge) {
    const label = det.domesticLounge >= 999 ? 'Unlimited' : `${det.domesticLounge}/year`;
    hits.push(`Most domestic lounge access (${label})`);
  }

  if (det.bestCategory) hits.push(`Best for ${det.bestCategory}`);

  if (det.concierge && !allCards.every(c => !!(d(c)).concierge)) {
    hits.push('24/7 Concierge service');
  }

  if (det.ott && allCards.some(c => !(d(c)).ott)) {
    hits.push(`Includes ${det.ott}`);
  }

  return hits.slice(0, 3);
};

const getRecommLine = (card, allCards) => {
  const det = d(card);
  const maxReward = Math.max(...allCards.map(c => c.rewardRaw));
  const maxLounge = Math.max(...allCards.map(c => (d(c)).domesticLounge || 0));

  if (card.rewardRaw === maxReward) return 'you want maximum annual returns from your spending';
  if (card.feeLifetime)             return 'you prefer zero annual fees with no commitment';
  if ((det.domesticLounge || 0) === maxLounge && maxLounge > 0)
    return 'travel perks and lounge access matter most to you';
  if (det.bestCategory)
    return `you spend heavily on ${det.bestCategory.toLowerCase()}`;

  const minFee = Math.min(...allCards.map(c => c.feeRaw));
  if (card.feeRaw === minFee) return 'you want an affordable, low-commitment card';

  return 'your lifestyle aligns with a well-rounded everyday card';
};

/* ── Card mini visual (150×90) ───────────────────────────────────── */
const CardMiniVisual = ({ card }) => {
  const gradient = CARD_GRADIENTS[card.card_id] || DEFAULT_GRADIENT;
  const bankLogo = BANK_LOGO_MAP[card.bank] || '';
  const netLogo  = NETWORK_LOGO_MAP[card.network] || '';
  return (
    <div style={{
      width: 150, height: 90, borderRadius: 10,
      background: gradient,
      position: 'relative', flexShrink: 0,
      boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 10, left: 10,
        width: 22, height: 16, borderRadius: 3,
        background: 'linear-gradient(145deg, #f5d060 0%, #d4920a 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,60,0,0.3)' }} />
        <div style={{ position: 'absolute', top: '62%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,60,0,0.3)' }} />
      </div>
      {bankLogo && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <img src={bankLogo} alt={card.bank}
            style={{ height: 16, width: 'auto', maxWidth: 42, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 8, left: 10,
        fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 7,
        color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em',
        textTransform: 'uppercase', maxWidth: '65%', lineHeight: 1.2,
      }}>
        {card.name}
      </div>
      {netLogo && (
        <div style={{ position: 'absolute', bottom: 7, right: 8 }}>
          <img src={netLogo} alt={card.network}
            style={{ height: 12, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};

/* ── Main CardComparison page ────────────────────────────────────── */
const CardComparison = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { selectedCards, detectedIntent } = location.state || {};

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Guard — no state */
  if (!selectedCards || selectedCards.length < 2) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#FAFCFB',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 48, gap: 20, textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 24, color: '#1A1A2E', margin: 0 }}>
          No cards to compare
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B' }}>
          Please complete the survey first to compare cards.
        </p>
        <button
          onClick={() => navigate('/results')}
          style={{
            backgroundColor: '#1C5BC0', color: 'white',
            border: 'none', borderRadius: 10, padding: '14px 32px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          View My Results
        </button>
      </div>
    );
  }

  /* ── Verdict calculation ──────────────────────────────────────── */
  const sorted     = [...selectedCards].sort((a, b) => b.rewardRaw - a.rewardRaw);
  const winner     = sorted[0];
  const runnerUp   = sorted[1];
  const diff       = winner.rewardRaw - runnerUp.rewardRaw;
  const isClose    = diff < 500;
  const diffFmt    = `₹${Math.round(diff).toLocaleString('en-IN')}`;

  /* ── Table: filter to only rows with differing values ────────── */
  let globalRowIdx = 0;
  const processedGroups = TABLE_GROUPS.map(group => ({
    ...group,
    visibleRows: group.rows
      .filter(row => shouldShowRow(row, selectedCards))
      .map(row => ({ ...row, _idx: globalRowIdx++ })),
  })).filter(g => g.visibleRows.length > 0);

  /* ── Subtitle ─────────────────────────────────────────────────── */
  const subtitle = 'Comparing ' + selectedCards.map(c => c.name).join(' vs ');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes verdictPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.01); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        padding: '12px 48px', borderBottom: '1px solid #E8E8E8',
        backgroundColor: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#6A6B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Results
        </button>
        <img
          src={logoSvg} alt="Finoptima"
          onClick={() => navigate('/')}
          style={{ height: 48, width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
        />
        <div style={{ width: 120 }} />
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 48px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 32,
            color: '#1A1A2E', marginBottom: 10, letterSpacing: '-0.02em',
          }}>
            Card Comparison
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B', lineHeight: 1.6 }}>
            {subtitle}
          </p>
        </div>

        {/* ── SECTION 1: THE VERDICT ─────────────────────────────── */}
        <div style={{
          backgroundColor: 'rgba(28,91,192,0.04)',
          border: '1px solid rgba(28,91,192,0.12)',
          borderRadius: 16, padding: 32, marginBottom: 48,
          animation: mounted ? 'verdictPulse 0.6s ease 0.3s both' : 'none',
        }}>
          <p style={{
            fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
            color: '#1C5BC0', letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            The Verdict
          </p>
          {isClose ? (
            <p style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20,
              color: '#1A1A2E', lineHeight: 1.5, margin: 0,
            }}>
              <span style={{ color: '#1C5BC0' }}>{winner.name}</span> and{' '}
              <span style={{ color: '#1C5BC0' }}>{runnerUp.name}</span> offer nearly
              identical value for your profile. The difference comes down to lifestyle perks.
            </p>
          ) : (
            <p style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20,
              color: '#1A1A2E', lineHeight: 1.5, margin: 0,
            }}>
              For your spending profile,{' '}
              <span style={{ color: '#1C5BC0' }}>{winner.name}</span> earns you{' '}
              <span style={{ color: '#22C55E' }}>{diffFmt} more per year</span> than{' '}
              {runnerUp.name}.
            </p>
          )}
          {detectedIntent && (
            <p style={{
              fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B',
              marginTop: 12, marginBottom: 0,
            }}>
              Based on your {detectedIntent.replace(/_/g, ' ')} spending profile.
            </p>
          )}
        </div>

        {/* ── SECTION 2: WHERE EACH CARD STANDS OUT ─────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18,
            color: '#1A1A2E', marginBottom: 24,
          }}>
            Where each card stands out
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${selectedCards.length}, 1fr)`,
            gap: 20,
          }}>
            {selectedCards.map((card, idx) => {
              const highlights = getCardHighlights(card, selectedCards);
              return (
                <div
                  key={card.card_id}
                  style={{
                    backgroundColor: '#FAFCFB',
                    border: '1px solid #E8E8E8',
                    borderRadius: 14, padding: 24,
                    display: 'flex', flexDirection: 'column', gap: 14,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(32px)',
                    transition: `opacity 0.3s ease ${idx * 0.1}s, transform 0.3s ease ${idx * 0.1}s`,
                  }}
                >
                  <CardMiniVisual card={card} />
                  <div>
                    <p style={{
                      fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 15,
                      color: '#1A1A2E', marginBottom: 2,
                    }}>
                      {card.name}
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B' }}>
                      {card.bank}
                    </p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {highlights.map((h, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          backgroundColor: '#1C5BC0', flexShrink: 0, marginTop: 5,
                        }} />
                        <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1A1A2E', lineHeight: 1.5 }}>
                          {h}
                        </span>
                      </li>
                    ))}
                    {highlights.length === 0 && (
                      <li style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B' }}>
                        Check table below for details
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 3: SIDE BY SIDE TABLE ─────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18,
            color: '#1A1A2E', marginBottom: 24,
          }}>
            Side by side
          </h2>

          <div style={{ border: '1px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>

            {/* Table header — card names */}
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: 'white',
              borderBottom: '2px solid #E8E8E8',
              padding: '16px 0',
            }}>
              <div style={{ width: 200, flexShrink: 0, padding: '0 20px' }} />
              {selectedCards.map((card, idx) => (
                <div key={card.card_id} style={{
                  flex: 1, padding: '0 16px',
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.3s ease ${idx * 0.08}s`,
                }}>
                  <p style={{
                    fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 14,
                    color: '#1A1A2E', marginBottom: 2,
                  }}>
                    {card.name}
                  </p>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#6A6B6B' }}>
                    {card.bank}
                  </p>
                </div>
              ))}
            </div>

            {/* Grouped rows */}
            {processedGroups.map(group => (
              <div key={group.key}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  backgroundColor: '#F5F7FF',
                  padding: '10px 20px',
                  borderTop: '1px solid #E8E8E8',
                }}>
                  <span style={{
                    fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
                    color: '#1C5BC0', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {group.label}
                  </span>
                </div>

                {/* Data rows */}
                {group.visibleRows.map((row, rowIdx) => {
                  const winners = getWinners(row, selectedCards);
                  return (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex', alignItems: 'center',
                        minHeight: 52,
                        backgroundColor: rowIdx % 2 === 0 ? 'white' : '#FAFCFB',
                        borderBottom: '1px solid #F0F0F0',
                        opacity: mounted ? 1 : 0,
                        transition: `opacity 0.3s ease ${row._idx * 0.04}s`,
                      }}
                    >
                      <div style={{
                        width: 200, flexShrink: 0,
                        fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B',
                        padding: '12px 20px',
                      }}>
                        {row.label}
                      </div>
                      {selectedCards.map((card, colIdx) => {
                        const val      = row.getValue(card, d(card));
                        const isWinner = winners && winners.includes(colIdx);
                        const isLoser  = winners && !winners.includes(colIdx);
                        return (
                          <div key={card.card_id} style={{
                            flex: 1,
                            fontFamily: isWinner ? 'Plus Jakarta Sans' : 'Inter',
                            fontWeight: isWinner ? 600 : 400,
                            fontSize: 14,
                            color: isWinner ? '#1C5BC0' : isLoser ? '#6A6B6B' : '#1A1A2E',
                            padding: '12px 16px',
                          }}>
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 4: OUR TAKE ───────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18,
            color: '#1A1A2E', marginBottom: 20,
          }}>
            Our take
          </h2>
          <div style={{
            backgroundColor: '#F8F8F8',
            borderRadius: 12, padding: 28,
          }}>
            {selectedCards.map((card) => (
              <p key={card.card_id} style={{
                fontFamily: 'Inter', fontSize: 15, color: '#1A1A2E',
                lineHeight: 1.8, margin: '0 0 4px',
              }}>
                Pick{' '}
                <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600, color: '#1C5BC0' }}>
                  {card.name}
                </span>{' '}
                if {getRecommLine(card, selectedCards)}.
              </p>
            ))}
          </div>
        </div>

        {/* Bottom link */}
        <div style={{ textAlign: 'center' }}>
          <NotInResultsLink onClick={() => navigate('/compare-all')} />
        </div>

      </div>
    </div>
  );
};

const NotInResultsLink = ({ onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'Inter', fontSize: 13, color: '#6A6B6B',
        cursor: 'pointer',
        textDecoration: hov ? 'underline' : 'none',
      }}
    >
      Not in your results? View all cards →
    </span>
  );
};

export default CardComparison;

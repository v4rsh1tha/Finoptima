import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../../context/SurveyContext';

/* ── Value maps for API ─────────────────────────────────────────── */
const INCOME_MAP = {
  'Below ₹3L': 'below_3L', '₹3–6L': '3_6L', '₹6–10L': '6_10L',
  '₹10–25L': '10_25L', 'Above ₹25L': 'above_25L',
};
const CREDIT_MAP = {
  'Below 650': 'below_650', '650–700': '650_700', '700–750': '700_750',
  '750–800': '750_800', 'Above 800': 'above_800', "Don't Know": 'dont_know',
};
const EMPLOYMENT_MAP = {
  'Salaried': 'salaried', 'Self Employed': 'self_employed',
  'Business Owner': 'business_owner', 'Student': 'student', 'Other': 'other',
};
const CARD_COUNT_MAP = { '0': 0, '1': 1, '2': 2, '3+': 3 };
const FEE_MAP = {
  'Zero fee only': 'zero_only', 'Up to ₹1,000': 'up_to_1000',
  'Up to ₹5,000': 'up_to_5000',
  "Fee doesn't matter if value is good": 'fee_doesnt_matter',
};
const BANK_ID_TO_NAME = {
  hdfc: 'HDFC Bank', axis: 'Axis Bank', icici: 'ICICI Bank',
  sbi: 'State Bank of India', kotak: 'Kotak Mahindra', idfc: 'IDFC FIRST Bank',
  yes: 'YES BANK', amex: 'American Express', sc: 'Standard Chartered', hsbc: 'HSBC',
  rbl: 'RBL Bank', au: 'AU Small Finance', federal: 'Federal Bank',
  bandhan: 'Bandhan Bank', pnb: 'Punjab National', union: 'Union Bank',
  bob: 'Bank of Baroda', equitas: 'Equitas SFB', citi: 'Citi Bank',
};

/* ── Static data ────────────────────────────────────────────────────── */
const PUB = process.env.PUBLIC_URL;
const QUESTIONS = [
  {
    id: 'income',
    label: 'What is your annual income?',
    options: ['Below ₹3L', '₹3–6L', '₹6–10L', '₹10–25L', 'Above ₹25L'],
  },
  {
    id: 'age',
    label: 'What is your age?',
    options: ['Below 21', '21–25', '26–35', '36–50', '50+'],
  },
  {
    id: 'creditScore',
    label: 'What is your credit score?',
    options: ['Below 650', '650–700', '700–750', '750–800', 'Above 800', "Don't Know"],
  },
  {
    id: 'employment',
    label: 'Employment type?',
    options: ['Salaried', 'Self Employed', 'Business Owner', 'Student', 'Other'],
  },
  {
    id: 'cityType',
    label: 'City type?',
    options: ['Metro', 'Tier 2', 'Tier 3'],
  },
];

const BANKS = [
  { id: 'hdfc',  name: 'HDFC Bank',          logo: PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg' },
  { id: 'axis',  name: 'Axis Bank',           logo: PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg' },
  { id: 'icici', name: 'ICICI Bank',          logo: PUB + '/logos/ICICI Bank/ICICI Bank_id_NFCjbgj_1.svg' },
  { id: 'sbi',   name: 'State Bank of India', logo: PUB + '/logos/State Bank of India/State Bank of India_id95r1JSPJ_1.svg' },
  { id: 'kotak', name: 'Kotak Mahindra',      logo: PUB + '/logos/Kotak Mahindra Bank/Kotak Mahindra Bank_idVNFKKm-u_1.svg' },
  { id: 'idfc',  name: 'IDFC FIRST Bank',     logo: PUB + '/logos/IDFC FIRST Bank/IDFC FIRST Bank_idqoD2MEzc_2.svg' },
  { id: 'yes',   name: 'YES BANK',            logo: PUB + '/logos/YES BANK/YES BANK_idcP_Yq02L_1.svg' },
  { id: 'amex',  name: 'American Express',    logo: PUB + '/logos/American Express/American Express_Logo_0.svg' },
  { id: 'sc',    name: 'Standard Chartered',  logo: PUB + '/logos/Standard Chartered/Standard Chartered_idi6-Df9Fm_5.svg' },
  { id: 'hsbc',  name: 'HSBC',               logo: PUB + '/logos/HSBC/HSBC_idEhxu60Ia_1.svg' },
];

const EXTRA_BANKS = [
  { id: 'rbl',     name: 'RBL Bank',          logo: PUB + '/logos/The Ratnakar Bank/The Ratnakar Bank_idCG4v49Ii_2.png' },
  { id: 'au',      name: 'AU Small Finance',  logo: PUB + '/logos/AU Small Finance Bank/idYy-xoUWw_logos.png' },
  { id: 'federal', name: 'Federal Bank',      logo: PUB + '/logos/Federal Bank/Federal Bank_idOdzymMUm_2.png' },
  { id: 'bandhan', name: 'Bandhan Bank',      logo: PUB + '/logos/Bandhan Bank/Bandhan Bank_idCnFj2ln5_4.png' },
  { id: 'pnb',     name: 'Punjab National',   logo: PUB + '/logos/Punjab National Bank/Punjab National Bank_idD_x-bb8g_3.png' },
  { id: 'union',   name: 'Union Bank',        logo: PUB + '/logos/Union Bank of India/Union Bank of India_idJNzj5iQp_1.jpeg' },
  { id: 'bob',     name: 'Bank of Baroda',    logo: PUB + '/logos/Bank of Baroda/Bank of Baroda_idILUIUEgx_2.png' },
  { id: 'equitas', name: 'Equitas SFB',       logo: PUB + '/logos/Equitas Small Finance Bank/Equitas Small Finance Bank_idH95931TO_0.png' },
  { id: 'citi',    name: 'Citi Bank',         logo: PUB + '/logos/Citi Bank/Citi Bank_Logo_1.png' },
];

const CARD_COUNT = ['0', '1', '2', '3+'];

const ANNUAL_FEE = [
  'Zero fee only',
  'Up to ₹1,000',
  'Up to ₹5,000',
  "Fee doesn't matter if value is good",
];

const SINGLE_SELECT_IDS = ['income', 'age', 'creditScore', 'employment', 'cityType', 'cardCount', 'annualFee'];

/* ── Option tile (single-select) ────────────────────────────────────── */
const OptionTile = ({ label, selected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${selected ? '#1C5BC0' : hovered ? '#A8C4E8' : '#E8E8E8'}`,
        borderRadius: 10,
        padding: '12px 20px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        color: selected ? '#1C5BC0' : '#1A1A2E',
        fontFamily: 'Inter', fontSize: 15,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'border-color 0.18s, background-color 0.18s, color 0.18s, transform 0.15s',
        outline: 'none',
        whiteSpace: 'nowrap',
        transform: flash ? 'scale(0.94)' : hovered && !selected ? 'scale(1.02)' : 'scale(1)',
        willChange: 'transform',
      }}
    >
      {selected && (
        <span style={{ marginRight: 6, fontSize: 12 }}>✓</span>
      )}
      {label}
    </button>
  );
};

/* ── Bank tile (multi-select) ───────────────────────────────────────── */
const BankTile = ({ bank, selected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showAvatar = !bank.logo || imgError;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${selected ? '#1C5BC0' : hovered ? '#A8C4E8' : '#E8E8E8'}`,
        borderRadius: 10,
        padding: '14px 12px',
        backgroundColor: selected ? 'rgba(28,91,192,0.06)' : 'white',
        cursor: 'pointer',
        transition: 'border-color 0.18s, background-color 0.18s',
        outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, minWidth: 96, flex: '1 1 96px', maxWidth: 120,
      }}
    >
      {!showAvatar ? (
        <img
          src={bank.logo}
          alt={bank.name}
          style={{ height: 32, width: 'auto', maxWidth: 72, objectFit: 'contain' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{
          height: 32, width: 32, borderRadius: '50%',
          backgroundColor: selected ? 'rgba(28,91,192,0.15)' : '#EEF2F8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 11,
          color: selected ? '#1C5BC0' : '#4A5568',
        }}>
          {bank.name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <span style={{
        fontFamily: 'Inter', fontSize: 11,
        color: selected ? '#1C5BC0' : '#6A6B6B',
        textAlign: 'center', lineHeight: 1.3, fontWeight: selected ? 600 : 400,
      }}>
        {bank.name}
      </span>
    </button>
  );
};

/* ── Progress bar ───────────────────────────────────────────────────── */
const ProgressBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
    {[
      { num: 1, label: 'Basics',      active: true  },
      { num: 2, label: 'Spending',    active: false },
      { num: 3, label: 'Preferences', active: false },
    ].map((step, i, arr) => (
      <React.Fragment key={step.num}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: step.active ? '#1C5BC0' : '#E8E8E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13,
            color: step.active ? 'white' : '#ABABAB',
          }}>
            {step.num}
          </div>
          <span style={{
            fontFamily: 'Inter', fontSize: 11,
            color: step.active ? '#1C5BC0' : '#ABABAB',
            fontWeight: step.active ? 600 : 400,
            letterSpacing: '0.02em',
          }}>
            {step.label}
          </span>
        </div>
        {i < arr.length - 1 && (
          <div style={{
            flex: 1, height: 2, backgroundColor: '#E8E8E8',
            margin: '0 8px', marginBottom: 20,
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ── Question block wrapper ─────────────────────────────────────────── */
const QuestionBlock = ({ label, children }) => (
  <div style={{ marginBottom: 40 }}>
    <p style={{
      fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
      fontSize: 17, color: '#1A1A2E', marginBottom: 16,
    }}>
      {label}
    </p>
    {children}
  </div>
);

/* ── Survey top nav ─────────────────────────────────────────────────── */
const SurveyNav = ({ navigate, step }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 48px',
    borderBottom: '1px solid #F0F0F0',
    backgroundColor: 'white',
    position: 'sticky', top: 0, zIndex: 100,
  }}>
    <div
      onClick={() => navigate('/')}
      style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
    >
      <img
        src={process.env.PUBLIC_URL + '/drawing1.svg'}
        alt="Finoptima"
        style={{ height: 28, width: 28, objectFit: 'contain', borderRadius: 6 }}
      />
      <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
        <span style={{ color: '#1C5BC0' }}>Fin</span>
        <span style={{ color: '#1A1A2E' }}>optima</span>
      </span>
    </div>
    <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', fontWeight: 500 }}>
      Step {step} of 3
    </span>
  </div>
);

/* ── Main page ──────────────────────────────────────────────────────── */
const Layer1 = () => {
  const navigate = useNavigate();
  const { updateSurvey } = useSurvey();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const [answers, setAnswers] = useState({
    income: null, age: null, creditScore: null,
    employment: null, cityType: null,
    banks: [],
    cardCount: null, annualFee: null,
  });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const select = (key, value) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const toggleBank = (id) =>
    setAnswers(prev => ({
      ...prev,
      banks: prev.banks.includes(id)
        ? prev.banks.filter(b => b !== id)
        : [...prev.banks, id],
    }));

  const canContinue = SINGLE_SELECT_IDS.every(k => answers[k] !== null);

  const handleContinue = () => {
    if (!canContinue) return;
    updateSurvey({
      income:         INCOME_MAP[answers.income],
      credit_score:   CREDIT_MAP[answers.creditScore],
      employment:     EMPLOYMENT_MAP[answers.employment],
      existing_cards: CARD_COUNT_MAP[answers.cardCount],
      fee_preference: FEE_MAP[answers.annualFee],
      bank_accounts:  answers.banks
        .filter(id => id !== 'none')
        .map(id => BANK_ID_TO_NAME[id] || id),
    });
    navigate('/survey/layer2');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFCFB',
      fontFamily: 'Inter, sans-serif',
      paddingBottom: 120,
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnShimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to   { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>

      <SurveyNav navigate={navigate} step="1" />

      <div style={{
        maxWidth: 680, margin: '0 auto',
        padding: '40px 48px 0',
      }}>

        {/* Progress bar */}
        <ProgressBar />

        {/* Heading */}
        <h1 style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
          fontSize: 32, color: '#1A1A2E', marginBottom: 8,
          letterSpacing: '-0.02em',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) 80ms',
        }}>
          Tell us about yourself
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) 160ms',
        }}>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B', lineHeight: 1.6, flex: 1, margin: 0 }}>
            Helps us filter cards you actually qualify for.
          </p>
          <img
            src={PUB + '/illustrations/undraw_personal-information_h7kf.svg'}
            alt=""
            style={{ width: 90, height: 'auto', objectFit: 'contain', opacity: 0.75, flexShrink: 0 }}
          />
        </div>

        {/* ── Q1–Q5 single-select questions ── */}
        {QUESTIONS.map(q => (
          <QuestionBlock key={q.id} label={q.label}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {q.options.map(opt => (
                <OptionTile
                  key={opt}
                  label={opt}
                  selected={answers[q.id] === opt}
                  onClick={() => select(q.id, opt)}
                />
              ))}
            </div>
          </QuestionBlock>
        ))}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#E8E8E8', marginBottom: 40 }} />

        {/* ── Q6 Bank multi-select ── */}
        <QuestionBlock label="Which banks do you have accounts with?">
          <p style={{
            fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', marginBottom: 16,
          }}>
            Select all that apply
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {BANKS.map(bank => (
              <BankTile
                key={bank.id}
                bank={bank}
                selected={answers.banks.includes(bank.id)}
                onClick={() => toggleBank(bank.id)}
              />
            ))}

            {/* Others toggle — expands extra banks, not selectable */}
            <button
              onClick={() => setShowMore(v => !v)}
              style={{
                border: `2px dashed ${showMore ? '#1C5BC0' : '#C8D8EF'}`,
                borderRadius: 10,
                padding: '14px 12px',
                backgroundColor: showMore ? 'rgba(28,91,192,0.04)' : 'white',
                cursor: 'pointer',
                transition: 'border-color 0.18s, background-color 0.18s',
                outline: 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8, minWidth: 96, flex: '1 1 96px', maxWidth: 120,
              }}
            >
              <div style={{ fontSize: 18, color: showMore ? '#1C5BC0' : '#ABABAB', lineHeight: 1 }}>
                {showMore ? '▲' : '+'}
              </div>
              <span style={{
                fontFamily: 'Inter', fontSize: 11,
                color: showMore ? '#1C5BC0' : '#ABABAB',
                fontWeight: 500,
              }}>
                {showMore ? 'Show Less' : 'Others'}
              </span>
            </button>

            {/* None tile */}
            <BankTile
              bank={{ id: 'none', name: 'None', logo: null }}
              selected={answers.banks.includes('none')}
              onClick={() => toggleBank('none')}
            />
          </div>

          {/* Extra banks — slide in when showMore */}
          {showMore && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              marginTop: 10,
              animation: 'slideDown 0.25s ease',
            }}>
              {EXTRA_BANKS.map(bank => (
                <BankTile
                  key={bank.id}
                  bank={bank}
                  selected={answers.banks.includes(bank.id)}
                  onClick={() => toggleBank(bank.id)}
                />
              ))}
            </div>
          )}
        </QuestionBlock>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: '#E8E8E8', marginBottom: 40 }} />

        {/* ── Q7 Card count ── */}
        <QuestionBlock label="How many credit cards do you own?">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {CARD_COUNT.map(opt => (
              <OptionTile
                key={opt}
                label={opt}
                selected={answers.cardCount === opt}
                onClick={() => select('cardCount', opt)}
              />
            ))}
          </div>
        </QuestionBlock>

        {/* ── Q8 Annual fee ── */}
        <QuestionBlock label="Annual fee preference?">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ANNUAL_FEE.map(opt => (
              <OptionTile
                key={opt}
                label={opt}
                selected={answers.annualFee === opt}
                onClick={() => select('annualFee', opt)}
              />
            ))}
          </div>
        </QuestionBlock>

      </div>

      {/* ── Sticky continue button ── */}
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
          onMouseDown={e => { if (canContinue) e.currentTarget.style.transform = 'translateY(0) scale(0.97)'; }}
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

export default Layer1;

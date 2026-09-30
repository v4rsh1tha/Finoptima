import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PUB = process.env.PUBLIC_URL;
const logoSvg = PUB + '/drawing1.svg';

/* ── Card catalog ────────────────────────────────────────────────── */
const CATALOG = [
  // HDFC
  { id: 'hdfc-regalia',   bank: 'HDFC Bank',    name: 'Regalia',          fee: '₹2,500',        logo: PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg' },
  { id: 'hdfc-millennia', bank: 'HDFC Bank',    name: 'Millennia',        fee: '₹1,000',        logo: PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg' },
  { id: 'hdfc-diners',    bank: 'HDFC Bank',    name: 'Diners Black',     fee: '₹10,000',       logo: PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg' },
  // Axis
  { id: 'axis-magnus',    bank: 'Axis Bank',    name: 'Magnus',           fee: '₹12,500',       logo: PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg' },
  { id: 'axis-atlas',     bank: 'Axis Bank',    name: 'Atlas',            fee: '₹5,000',        logo: PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg' },
  { id: 'axis-ace',       bank: 'Axis Bank',    name: 'Ace',              fee: '₹499',          logo: PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg' },
  // ICICI
  { id: 'icici-amazon',   bank: 'ICICI Bank',   name: 'Amazon Pay',       fee: 'Lifetime Free', logo: PUB + '/logos/ICICI Bank/ICICI Bank_id_NFCjbgj_1.svg' },
  { id: 'icici-emeralde', bank: 'ICICI Bank',   name: 'Emeralde',         fee: '₹12,000',       logo: PUB + '/logos/ICICI Bank/ICICI Bank_id_NFCjbgj_1.svg' },
  // SBI
  { id: 'sbi-click',      bank: 'SBI Card',     name: 'SimplyCLICK',      fee: '₹499',          logo: PUB + '/logos/State Bank of India/SBI_Card_logo.png' },
  { id: 'sbi-bpcl',       bank: 'SBI Card',     name: 'BPCL',             fee: '₹499',          logo: PUB + '/logos/State Bank of India/SBI_Card_logo.png' },
  // Kotak
  { id: 'kotak-811',      bank: 'Kotak Bank',   name: '811',              fee: 'Lifetime Free', logo: PUB + '/logos/Kotak Mahindra Bank/Kotak Mahindra Bank_idVNFKKm-u_1.svg' },
  { id: 'kotak-league',   bank: 'Kotak Bank',   name: 'League',           fee: '₹499',          logo: PUB + '/logos/Kotak Mahindra Bank/Kotak Mahindra Bank_idVNFKKm-u_1.svg' },
  // AmEx
  { id: 'amex-mrcc',      bank: 'Amex',         name: 'MRCC',             fee: '₹1,500',        logo: PUB + '/logos/American Express/American Express_Logo_0.svg' },
  { id: 'amex-plat',      bank: 'Amex',         name: 'Platinum Travel',  fee: '₹5,000',        logo: PUB + '/logos/American Express/American Express_Logo_0.svg' },
  // IDFC
  { id: 'idfc-wealth',    bank: 'IDFC FIRST',   name: 'First Wealth',     fee: 'Lifetime Free', logo: PUB + '/logos/IDFC FIRST Bank/IDFC FIRST Bank_idqoD2MEzc_2.svg' },
  { id: 'idfc-select',    bank: 'IDFC FIRST',   name: 'First Select',     fee: 'Lifetime Free', logo: PUB + '/logos/IDFC FIRST Bank/IDFC FIRST Bank_idqoD2MEzc_2.svg' },
  // Others
  { id: 'scapia',         bank: 'Federal Bank', name: 'Scapia',           fee: 'Lifetime Free', logo: PUB + '/logos/Scapia/Scapia_idFkJNUmtK_0.png' },
  { id: 'kiwi',           bank: 'SBM Bank',     name: 'Kiwi',             fee: 'Lifetime Free', logo: PUB + '/logos/Kiwi/Kiwi_idFfGQGOK8_0.png' },
];

/* ── Catalog tile ────────────────────────────────────────────────── */
const CatalogTile = ({ card, selected, onClick }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `2px solid ${selected ? '#1C5BC0' : hov ? '#A8C4E8' : '#E8E8E8'}`,
        borderRadius: 12, padding: '16px 12px 14px',
        backgroundColor: selected ? 'rgba(28,91,192,0.05)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 8,
        transition: 'border-color 0.18s, background-color 0.18s, transform 0.18s',
        transform: hov && !selected ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative', textAlign: 'center',
      }}
    >
      {selected && (
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
      {!imgErr ? (
        <img
          src={card.logo} alt={card.bank}
          style={{ height: 30, width: 'auto', maxWidth: 80, objectFit: 'contain' }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div style={{
          width: 48, height: 30, borderRadius: 6,
          backgroundColor: selected ? 'rgba(28,91,192,0.12)' : '#EEF2F8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 10,
          color: selected ? '#1C5BC0' : '#4A5568',
        }}>
          {card.bank.substring(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <div style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 13,
          color: selected ? '#1C5BC0' : '#1A1A2E',
          lineHeight: 1.3, marginBottom: 3,
        }}>
          {card.name}
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#ABABAB' }}>
          {card.bank}
        </div>
        <div style={{
          fontFamily: 'Inter', fontSize: 11, marginTop: 3,
          color: card.fee === 'Lifetime Free' ? '#22C55E' : '#6A6B6B',
          fontWeight: card.fee === 'Lifetime Free' ? 600 : 400,
        }}>
          {card.fee}
        </div>
      </div>
    </button>
  );
};

/* ── Action tile ─────────────────────────────────────────────────── */
const ActionTile = ({ icon, heading, subtext, cta, primary, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        border: primary ? 'none' : `2px solid ${hov ? '#1C5BC0' : '#E8E8E8'}`,
        borderRadius: 16, padding: '32px 28px',
        background: primary
          ? hov ? 'linear-gradient(135deg, #2A61C1, #1a55b8)' : 'linear-gradient(135deg, #1C5BC0, #2A61C1)'
          : hov ? 'rgba(28,91,192,0.04)' : 'white',
        cursor: 'pointer', outline: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', gap: 10,
        transition: 'all 0.2s',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: primary
          ? hov ? '0 12px 40px rgba(28,91,192,0.35)' : '0 8px 28px rgba(28,91,192,0.22)'
          : hov ? '0 6px 20px rgba(0,0,0,0.08)' : 'none',
        textAlign: 'left', minWidth: 0,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: primary ? 'rgba(255,255,255,0.18)' : 'rgba(28,91,192,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18,
          color: primary ? 'white' : '#1A1A2E', marginBottom: 6,
        }}>
          {heading}
        </div>
        <div style={{
          fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55,
          color: primary ? 'rgba(255,255,255,0.78)' : '#6A6B6B',
        }}>
          {subtext}
        </div>
      </div>
      <div style={{
        marginTop: 4,
        fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
        color: primary ? 'rgba(255,255,255,0.9)' : '#1C5BC0',
      }}>
        {cta} →
      </div>
    </button>
  );
};

/* ── Search icon ─────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6.5" cy="6.5" r="5" stroke="#ABABAB" strokeWidth="1.5" />
    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#ABABAB" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Main page ───────────────────────────────────────────────────── */
const ExistingCard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const filtered = CATALOG.filter(c =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFCFB', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        padding: '12px 48px', borderBottom: '1px solid #E8E8E8',
        backgroundColor: 'white', display: 'flex', alignItems: 'center',
      }}>
        <img
          src={logoSvg} alt="Finoptima"
          onClick={() => navigate('/')}
          style={{ height: 40, width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
        />
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '52px 48px 80px' }}>

        {/* Heading */}
        <div style={{ marginBottom: 44 }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 32, color: '#1A1A2E', marginBottom: 8, letterSpacing: '-0.02em',
          }}>
            You Already Have a Card
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 16, color: '#6A6B6B', lineHeight: 1.6 }}>
            Select your card and we'll show you how to maximize it
          </p>
        </div>

        {/* ── Section 1: Card selection ── */}
        <div style={{
          backgroundColor: 'white', border: '2px solid #E8E8E8',
          borderRadius: 16, padding: '28px', marginBottom: 32,
        }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: '2px solid #E8E8E8', borderRadius: 10,
            padding: '10px 14px', marginBottom: 24, backgroundColor: '#FAFCFB',
          }}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search your card..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'Inter', fontSize: 15, color: '#1A1A2E', width: '100%',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, color: '#ABABAB', fontSize: 18, lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}>
            {filtered.map(card => (
              <CatalogTile
                key={card.id}
                card={card}
                selected={selected?.id === card.id}
                onClick={() => setSelected(prev => prev?.id === card.id ? null : card)}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', padding: '32px 0', textAlign: 'center',
                fontFamily: 'Inter', fontSize: 14, color: '#ABABAB',
              }}>
                No cards found for "{search}"
              </div>
            )}
          </div>

          {/* Selection indicator */}
          {selected && (
            <div style={{
              marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0',
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'slideUp 0.2s ease',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1A1A2E' }}>
                Selected: <strong>{selected.bank} {selected.name}</strong>
              </span>
              <button
                onClick={() => setSelected(null)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', cursor: 'pointer', padding: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Section 2: Action tiles — slides in on selection ── */}
        {selected && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'Plus Jakarta Sans', fontWeight: 700,
                fontSize: 24, color: '#1A1A2E', marginBottom: 6,
              }}>
                What do you want to do?
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B' }}>
                Choose what you'd like to do with your {selected.bank} {selected.name}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <ActionTile
                icon="⚡"
                heading="Maximize My Rewards"
                subtext="See how to get maximum value from this card based on your spending habits"
                cta="Optimize"
                primary
                onClick={() => navigate('/reward-optimization', { state: { card: selected } })}
              />
              <ActionTile
                icon="💳"
                heading="Find a Second Card"
                subtext="Get a complementary card that fills the gaps in your current card's rewards"
                cta="Find Second Card"
                primary={false}
                onClick={() => navigate('/survey/layer1')}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExistingCard;

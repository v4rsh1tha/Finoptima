import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const logoSvg = process.env.PUBLIC_URL + '/drawing1.svg';
const PUB = process.env.PUBLIC_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);
  const [catsVisible, setCatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState({ cards: 0, banks: 0, savings: 0, time: 0 });
  const statsRef = useRef(null);
  const stepsRef = useRef(null);
  const catsRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(t); };
  }, []);

  /* Scroll-aware navbar shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Stats count-up via IntersectionObserver */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStatsVisible(true);
      const duration = 1600;
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setStatCounts({
          cards: Math.floor(ease * 46),
          banks: Math.floor(ease * 15),
          savings: Math.floor(ease * 50),
          time: Math.floor(ease * 3) || (p > 0.1 ? 1 : 0),
        });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Steps scroll-in */
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStepsVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Categories scroll-in */
  useEffect(() => {
    const el = catsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setCatsVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bankLogos = [
    { name: 'HDFC Bank',          logo: PUB + '/logos/HDFC Bank/HDFC Bank_id6pGb_xHe_1.svg' },
    { name: 'Axis Bank',          logo: PUB + '/logos/Axis Bank/Axis Bank_idHcfGpT5s_0.svg' },
    { name: 'ICICI Bank',         logo: PUB + '/logos/ICICI Bank/ICICI Bank_id_NFCjbgj_1.svg' },
    { name: 'SBI Card',           logo: PUB + '/logos/State Bank of India/SBI_Card_logo.png' },
    { name: 'Kotak Mahindra',     logo: PUB + '/logos/Kotak Mahindra Bank/Kotak Mahindra Bank_idVNFKKm-u_1.svg' },
    { name: 'American Express',   logo: PUB + '/logos/American Express/American Express_Logo_0.svg' },
    { name: 'HSBC',               logo: PUB + '/logos/HSBC/HSBC_idEhxu60Ia_1.svg' },
    { name: 'IDFC FIRST Bank',    logo: PUB + '/logos/IDFC FIRST Bank/IDFC FIRST Bank_idqoD2MEzc_2.svg' },
    { name: 'YES BANK',           logo: PUB + '/logos/YES BANK/YES BANK_idcP_Yq02L_1.svg' },
    { name: 'Standard Chartered', logo: PUB + '/logos/Standard Chartered/Standard Chartered_idi6-Df9Fm_5.svg' },
  ];

  const categories = [
    { icon: '✈️', name: 'Travel',       desc: 'Flights & Hotels', bg: '#EBF2FC', accent: '#1C5BC0' },
    { icon: '🍔', name: 'Food & Dining', desc: 'Swiggy & Zomato', bg: '#FFF3E6', accent: '#FF6B35' },
    { icon: '⛽', name: 'Fuel',          desc: 'BPCL, HPCL, IOCL', bg: '#FDF5E8', accent: '#E09E42' },
    { icon: '🛍️', name: 'Shopping',      desc: 'Amazon & Flipkart', bg: '#F3EEFF', accent: '#7C3AED' },
    { icon: '📱', name: 'UPI Payments',  desc: 'Scan & Pay',        bg: '#E8F8F0', accent: '#059669' },
    { icon: '💎', name: 'Premium',       desc: 'Ultra Luxury Cards', bg: '#EEEDF2', accent: '#1A1A2E' },
  ];

  const steps = [
    { num: '01', title: 'Tell Us About You', desc: 'Share your income, spending habits, and lifestyle in under 3 minutes.', illustration: PUB + '/illustrations/undraw_personal-information_h7kf.svg' },
    { num: '02', title: 'We Analyze', desc: 'Our engine scores 46 cards across intent, fit, eligibility, and rupee value.', illustration: PUB + '/illustrations/undraw_business-analytics_y8m6.svg' },
    { num: '03', title: 'Get Your Card', desc: 'Receive your top 5 personalized recommendations with reward estimates.', illustration: PUB + '/illustrations/undraw_credit-card-payments_y0vn.svg' },
  ];

  const heroStyle = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#FAFCFB', color: '#1A1A2E' }}>

      {/* NAVBAR — scroll-aware with shadow */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(250,252,251,0.98)' : 'rgba(250,252,251,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(28,91,192,0.10)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(26,26,46,0.06)' : 'none',
        padding: scrolled ? '12px 48px' : '18px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        ...heroStyle(0),
      }}>
        {/* Logo + Wordmark */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <img
            src={logoSvg}
            alt="Finoptima"
            style={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 8 }}
          />
          <span style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            <span style={{ color: '#1C5BC0' }}>Fin</span>
            <span style={{ color: '#1A1A2E' }}>optima</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['How It Works', 'Categories', 'Partners'].map(item => (
            <button key={item} type="button" style={{
              fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B',
              textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s',
              letterSpacing: '0.01em', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
              onMouseEnter={e => e.target.style.color = '#1C5BC0'}
              onMouseLeave={e => e.target.style.color = '#6A6B6B'}
            >{item}</button>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{
            backgroundColor: 'transparent', color: '#1C5BC0',
            border: 'none', padding: '10px 16px',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', transition: 'color 0.2s',
            letterSpacing: '0.01em',
          }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => e.target.style.color = '#2A61C1'}
            onMouseLeave={e => e.target.style.color = '#1C5BC0'}
          >
            Log In
          </button>
          <button style={{
            backgroundColor: '#1C5BC0', color: 'white',
            border: 'none', borderRadius: 10, padding: '10px 22px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 2px 8px rgba(28,91,192,0.25)',
            letterSpacing: '0.01em',
          }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2A61C1'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(28,91,192,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C5BC0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(28,91,192,0.25)'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION — Animated gradient background */}
      <section style={{
        minHeight: '100vh', padding: '120px 48px 80px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 48, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(28,91,192,0.08) 0%, transparent 60%)',
        animation: mounted ? 'heroGlow 8s ease-in-out infinite alternate' : 'none',
      }}>
        {/* Gold glow overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 70% 60%, rgba(224,158,66,0.05) 0%, transparent 50%)',
          animation: mounted ? 'goldDrift 12s ease-in-out infinite alternate' : 'none',
        }} />

        {/* Floating circles behind illustration */}
        <div className="hero-illustration" style={{
          position: 'absolute', top: '12%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(28,91,192,0.06)',
          animation: mounted ? 'floatCircle1 7s ease-in-out infinite alternate' : 'none',
          pointerEvents: 'none',
        }} />
        <div className="hero-illustration" style={{
          position: 'absolute', top: '55%', right: '22%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(224,158,66,0.07)',
          animation: mounted ? 'floatCircle2 9s ease-in-out infinite alternate' : 'none',
          pointerEvents: 'none',
        }} />
        <div className="hero-illustration" style={{
          position: 'absolute', top: '35%', right: '5%',
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(28,91,192,0.04)',
          animation: mounted ? 'floatCircle3 6s ease-in-out 1s infinite alternate' : 'none',
          pointerEvents: 'none',
        }} />

        {/* Left — Text */}
        <div style={{ flex: 1, maxWidth: 540, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 'clamp(36px, 4.5vw, 56px)', lineHeight: 1.12,
            color: '#1A1A2E', marginBottom: 24, letterSpacing: '-0.02em',
          }}>
            <div style={heroStyle(160)}>Stop getting sold.</div>
            <div style={heroStyle(280)}>Find your <span style={{ color: '#1C5BC0' }}>perfect card.</span></div>
          </h1>

          <p style={{
            fontFamily: 'Inter', fontSize: 18, color: '#6A6B6B',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 440,
            ...heroStyle(400),
          }}>
            Answer a few questions about how you spend.
            We'll find the card actually built for your life.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', ...heroStyle(480) }}>
            <button style={{
              backgroundColor: '#1C5BC0', color: 'white',
              border: 'none', borderRadius: 12, padding: '16px 32px',
              fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(28,91,192,0.3)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              willChange: 'transform',
            }}
              onClick={() => navigate('/login')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(28,91,192,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,91,192,0.3)'; }}
            >
              Find My Card →
            </button>
            <button style={{
              backgroundColor: 'transparent', color: '#1A1A2E',
              border: '2px solid #E8E8E8', borderRadius: 12, padding: '16px 32px',
              fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fontSize: 16,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1C5BC0'; e.currentTarget.style.color = '#1C5BC0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.color = '#1A1A2E'; }}
            >
              How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 48, ...heroStyle(560) }}>
            {['100% Free', '3 Minutes', '46+ Cards Analyzed'].map((text, i) => (
              <React.Fragment key={text}>
                {i > 0 && <div style={{ width: 1, height: 16, backgroundColor: '#E8E8E8' }} />}
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#ABABAB', fontWeight: 500 }}>{text}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right — Hero Illustration with scale-in */}
        <div className="hero-illustration" style={{
          flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
          position: 'relative', zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 350ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 350ms',
        }}>
          <img
            src={PUB + '/illustrations/undraw_choose-card_es1o.svg'}
            alt="Person choosing the right credit card"
            style={{ width: '100%', maxWidth: 480, height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </section>

      {/* STATS BAR — gradient top border */}
      <section ref={statsRef} style={{
        backgroundColor: '#1A1A2E', padding: '56px 48px',
        display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap',
        position: 'relative',
      }}>
        {/* 3px gradient top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #1C5BC0, #E09E42)',
        }} />
        {[
          { value: `${statCounts.cards}+`, label: 'Credit Cards' },
          { value: `${statCounts.banks}+`, label: 'Bank Partners' },
          { value: `₹${statCounts.savings}K`, label: 'Avg Annual Savings' },
          { value: statCounts.time > 0 ? `${statCounts.time} Min` : '0 Min', label: 'To Get Results' },
        ].map(stat => (
          <div key={stat.label} style={{
            textAlign: 'center',
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <div style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              fontSize: 48, color: '#E09E42', lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>{stat.value}</div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section ref={stepsRef} style={{ padding: '100px 48px', backgroundColor: '#FAFCFB' }}>
        <div style={{
          textAlign: 'center', marginBottom: 64,
          opacity: stepsVisible ? 1 : 0,
          transform: stepsVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 42, color: '#1A1A2E', marginBottom: 16 }}>
            How Finoptima Works
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 18, color: '#6A6B6B', maxWidth: 480, margin: '0 auto' }}>
            Three simple steps to find the card that makes every rupee count.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              backgroundColor: '#FBFBFD', borderRadius: 20, padding: 32,
              maxWidth: 300, flex: '1 1 260px',
              border: '1px solid #E8E8E8',
              borderTop: '3px solid #1C5BC0',
              boxShadow: '0 4px 24px rgba(28,91,192,0.06)',
              position: 'relative', overflow: 'hidden',
              transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 140}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 140}ms, box-shadow 0.2s`,
              opacity: stepsVisible ? 1 : 0,
              transform: stepsVisible ? 'translateY(0)' : 'translateY(48px)',
              willChange: 'transform',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(28,91,192,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = stepsVisible ? 'translateY(0)' : 'translateY(48px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(28,91,192,0.06)'; }}
            >
              <div style={{
                position: 'absolute', top: -10, right: -10,
                fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
                fontSize: 48, color: 'rgba(28,91,192,0.08)', lineHeight: 1,
              }}>{step.num}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <img
                  src={step.illustration}
                  alt={step.title}
                  style={{ width: 160, height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#1A1A2E' }}>{step.title}</h3>
              <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#6A6B6B', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CARD CATEGORIES — Colored tiles */}
      <section ref={catsRef} style={{ padding: '80px 48px', backgroundColor: '#FBFBFD' }}>
        <div style={{
          textAlign: 'center', marginBottom: 56,
          opacity: catsVisible ? 1 : 0,
          transform: catsVisible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 42, color: '#1A1A2E', marginBottom: 16 }}>
            Cards For Every Lifestyle
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 18, color: '#6A6B6B' }}>
            Whatever you spend on, we have the perfect card for it.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat, i) => (
            <div key={i} style={{
              backgroundColor: cat.bg, borderRadius: 16, padding: '28px 24px',
              minWidth: 160, flex: '1 1 150px', maxWidth: 200,
              border: `1.5px solid transparent`, textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: `all 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
              willChange: 'transform',
              opacity: catsVisible ? 1 : 0,
              transform: catsVisible ? 'translateY(0)' : 'translateY(24px)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = cat.accent;
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
                e.currentTarget.style.boxShadow = `0 16px 40px ${cat.accent}22`;
                const icon = e.currentTarget.querySelector('.cat-icon');
                if (icon) icon.style.animation = 'iconBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                const icon = e.currentTarget.querySelector('.cat-icon');
                if (icon) icon.style.animation = 'none';
              }}
            >
              <div className="cat-icon" style={{ fontSize: 36, marginBottom: 12, display: 'inline-block', willChange: 'transform' }}>{cat.icon}</div>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, color: cat.accent, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#6A6B6B' }}>{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BANK PARTNERS — Marquee with logos */}
      <section style={{ padding: '64px 0', backgroundColor: '#FAFCFB', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 36, padding: '0 48px' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6A6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Cards from India's leading banks
          </p>
        </div>
        <div
          style={{ display: 'flex', width: 'max-content', animation: 'marquee 32s linear infinite' }}
          onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
        >
          {[...bankLogos, ...bankLogos].map((bank, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 20px',
              border: '1px solid #E8E8E8', borderRadius: 12,
              backgroundColor: 'white', whiteSpace: 'nowrap',
              marginRight: 16, cursor: 'default',
              transition: 'all 0.2s',
              minWidth: 120,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1C5BC0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8E8'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img
                src={bank.logo} alt={bank.name}
                style={{ height: 28, width: 'auto', maxWidth: 90, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION — with illustration */}
      <section style={{
        margin: '0 48px 80px',
        background: 'linear-gradient(135deg, #1C5BC0 0%, #0d3b8a 50%, #2A61C1 100%)',
        backgroundSize: '200% 200%',
        animation: 'ctaGradient 8s ease infinite',
        borderRadius: 24, padding: '80px 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(224,158,66,0.15)', animation: 'bgShape 6s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -30, width: 250, height: 250, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        {/* CTA text — left */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 42, color: 'white', marginBottom: 16 }}>
            Ready to optimize every swipe?
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 40 }}>
            Join thousands of Indians who found their perfect credit card with Finoptima.
          </p>
          <button style={{
            backgroundColor: '#E09E42', color: 'white',
            border: 'none', borderRadius: 12, padding: '18px 40px',
            fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(224,158,66,0.45)',
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            willChange: 'transform',
          }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(224,158,66,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(224,158,66,0.45)'; }}
          >
            Get Started — It's Free →
          </button>
        </div>

        {/* CTA illustration — right */}
        <div className="cta-illustration" style={{ position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
          <img
            src={PUB + '/illustrations/undraw_make-it-rain_vyg9.svg'}
            alt="Financial rewards"
            style={{ width: 280, height: 'auto', objectFit: 'contain', opacity: 0.9 }}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#1A1A2E', padding: '40px 48px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 24,
      }}>
        <div>
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8, cursor: 'pointer' }}
          >
            <img
              src={logoSvg}
              alt="Finoptima"
              style={{ height: 32, width: 32, objectFit: 'contain', borderRadius: 7 }}
            />
            <span style={{
              fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
              fontSize: 18, letterSpacing: '-0.02em',
            }}>
              <span style={{ color: '#1C5BC0' }}>Fin</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>optima</span>
            </span>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Every Swipe Optimized.</p>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Privacy Policy', 'Terms of Use', 'About', 'Contact'].map(link => (
            <button key={link} type="button" style={{
              fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none', transition: 'color 0.2s',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >{link}</button>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Finoptima. All rights reserved.
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-illustration { display: none !important; }
          .cta-illustration { display: none !important; }
          .nav-links { display: none !important; }
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes heroGlow {
            0% { background: radial-gradient(ellipse at 30% 50%, rgba(28,91,192,0.08) 0%, transparent 60%); }
            100% { background: radial-gradient(ellipse at 70% 50%, rgba(28,91,192,0.10) 0%, transparent 60%); }
          }
          @keyframes goldDrift {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes floatCircle1 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(-20px, 15px) scale(1.05); }
          }
          @keyframes floatCircle2 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(15px, -20px) scale(0.95); }
          }
          @keyframes floatCircle3 {
            from { transform: translate(0, 0) scale(1); }
            to   { transform: translate(-10px, -15px) scale(1.08); }
          }
          @keyframes bgShape {
            from { transform: translateY(0px) scale(1); }
            to   { transform: translateY(-22px) scale(1.04); }
          }
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes ctaGradient {
            0%, 100% { background-position: 0% 50%; }
            50%       { background-position: 100% 50%; }
          }
          @keyframes iconBounce {
            0%   { transform: scale(1) translateY(0); }
            40%  { transform: scale(1.3) translateY(-6px); }
            70%  { transform: scale(0.95) translateY(2px); }
            100% { transform: scale(1) translateY(0); }
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

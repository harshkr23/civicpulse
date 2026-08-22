import { useEffect, useRef, useState } from 'react';

/* ── Animated counter ──────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const started = useRef(false);
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const run = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) raf.current = requestAnimationFrame(run);
        };
        raf.current = requestAnimationFrame(run);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf.current); };
  }, [to, duration]);

  return <span ref={elRef}>{val.toLocaleString()}{suffix}</span>;
}

const STATS = [
  { value: 2400, suffix: '+', label: 'Issues Resolved'  },
  { value: 18,   suffix: ' cities', label: 'Districts Active' },
  { value: 98,   suffix: '%', label: 'AI Accuracy'     },
  { value: 4.2,  suffix: 'x', label: 'Faster Response' },
];

export default function Hero() {
  return (
    <>
      <style>{`
        .hero-bg {
          background: #080d1a;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 60%,  rgba(139,92,246,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 15% 80%,  rgba(99,102,241,0.1)  0%, transparent 50%);
        }
        .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        @keyframes hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .hero-float { animation: hero-float 5s ease-in-out infinite; }
        @keyframes hero-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
        .hero-glow { animation: hero-glow 3s ease-in-out infinite; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          border-radius: 999px;
          border: 1px solid rgba(34,211,238,0.25);
          background: rgba(34,211,238,0.07);
          padding: .35rem 1rem;
          font-size: .75rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: #67e8f9;
        }
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: .6rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
          padding: .9rem 2rem;
          font-size: 1rem; font-weight: 700; color: #fff;
          box-shadow: 0 0 40px rgba(6,182,212,.3), 0 4px 20px rgba(0,0,0,.4);
          transition: opacity .2s, box-shadow .2s, transform .2s;
        }
        .hero-cta-primary:hover {
          opacity: .9;
          box-shadow: 0 0 56px rgba(6,182,212,.45), 0 4px 20px rgba(0,0,0,.4);
          transform: translateY(-1px);
        }
        .hero-cta-secondary {
          display: inline-flex; align-items: center; gap: .5rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          padding: .875rem 1.75rem;
          font-size: 1rem; font-weight: 600; color: #94a3b8;
          transition: border-color .2s, color .2s, background .2s;
        }
        .hero-cta-secondary:hover {
          border-color: rgba(255,255,255,0.22);
          color: #e2e8f0;
          background: rgba(255,255,255,0.07);
        }
        .hero-stat-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          text-align: center;
          transition: border-color .2s, background .2s;
        }
        .hero-stat-card:hover {
          border-color: rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.04);
        }
        .hero-orb {
          position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none;
        }
        @keyframes hero-enter { from {opacity:0;transform:translateY(24px)} to {opacity:1;transform:translateY(0)} }
        .he0 { animation: hero-enter 700ms 0ms   cubic-bezier(.22,1,.36,1) both; }
        .he1 { animation: hero-enter 700ms 100ms cubic-bezier(.22,1,.36,1) both; }
        .he2 { animation: hero-enter 700ms 200ms cubic-bezier(.22,1,.36,1) both; }
        .he3 { animation: hero-enter 700ms 340ms cubic-bezier(.22,1,.36,1) both; }
        .he4 { animation: hero-enter 700ms 480ms cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <section className="hero-bg relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
        {/* Grid overlay */}
        <div className="hero-grid absolute inset-0 opacity-100" />

        {/* Orbs */}
        <div className="hero-orb hero-glow" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'rgba(6,182,212,0.15)' }} />
        <div className="hero-orb" style={{ top: '30%', right: '-5%', width: 450, height: 450, background: 'rgba(139,92,246,0.1)' }} />
        <div className="hero-orb" style={{ bottom: '0%', left: '-5%', width: 400, height: 400, background: 'rgba(99,102,241,0.08)' }} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-7 he0 flex justify-center">
              <span className="hero-badge">
                <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#22d3ee', boxShadow:'0 0 8px #22d3ee', animation:'hero-glow 1.8s ease-in-out infinite' }} />
                Powered by Google Gemini
              </span>
            </div>

            {/* Headline */}
            <h1
              className="he1"
              style={{
                fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-.03em',
                lineHeight: 1.06,
                color: '#fff',
              }}
            >
              Your City,{' '}
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 55%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Smarter
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="he2 mx-auto mt-6"
              style={{ maxWidth: 540, fontSize: '1.15rem', lineHeight: 1.7, color: '#94a3b8' }}
            >
              Report civic issues in seconds. Gemini AI classifies,
              prioritizes and routes them to the right department — automatically.
            </p>

            {/* CTA buttons */}
            <div className="he3 mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="#report-form" className="hero-cta-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Report an Issue
              </a>
              <a href="#how-it-works" className="hero-cta-secondary">
                How it works
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            {/* Trust line */}
            <p className="he3 mt-5" style={{ fontSize: '.8rem', color: '#475569' }}>
              Free · No account needed · AI-powered triage in under 5 seconds
            </p>
          </div>

          {/* Stats row */}
          <div
            className="he4 mx-auto mt-20 grid max-w-3xl gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat-card">
                <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p style={{ marginTop: 6, fontSize: '.72rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#475569' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(to bottom, transparent, #080d1a)',
            pointerEvents: 'none',
          }}
        />
      </section>
    </>
  );
}

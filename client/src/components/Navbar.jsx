import { useState, useEffect } from 'react';

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features',     href: '#features'     },
  ];

  return (
    <>
      <style>{`
        .nb-glass {
          background: rgba(8, 13, 26, ${scrolled ? '0.92' : '0.6'});
          border-bottom: 1px solid rgba(255,255,255,${scrolled ? '0.08' : '0.04'});
          backdrop-filter: blur(20px);
          box-shadow: ${scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none'};
          transition: background .3s, border-color .3s, box-shadow .3s;
        }
        .nb-link {
          position: relative;
          color: #94a3b8;
          font-size: .875rem;
          font-weight: 500;
          transition: color .2s;
          padding-bottom: 2px;
        }
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1.5px;
          border-radius: 99px;
          background: linear-gradient(to right, #22d3ee, #a78bfa);
          transition: width .25s cubic-bezier(.22,1,.36,1);
        }
        .nb-link:hover { color: #e2e8f0; }
        .nb-link:hover::after { width: 100%; }
        .nb-cta {
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          border-radius: 999px;
          padding: .5rem 1.25rem;
          font-size: .875rem;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 0 24px rgba(6,182,212,.25);
          transition: opacity .2s, box-shadow .2s;
        }
        .nb-cta:hover { opacity: .88; box-shadow: 0 0 32px rgba(6,182,212,.4); }
        .nb-admin {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: .375rem .875rem;
          font-size: .8rem;
          font-weight: 600;
          color: #64748b;
          transition: border-color .2s, color .2s, background .2s;
        }
        .nb-admin:hover { border-color: rgba(99,102,241,.5); color: #a5b4fc; background: rgba(99,102,241,.08); }
        @keyframes nb-slide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .nb-drawer { animation: nb-slide 220ms cubic-bezier(.22,1,.36,1) both; }
        .nb-drawer-link {
          display: block;
          padding: .625rem .75rem;
          border-radius: 10px;
          color: #94a3b8;
          font-size: .875rem;
          font-weight: 500;
          transition: color .2s, background .2s;
          text-decoration: none;
        }
        .nb-drawer-link:hover, .nb-drawer-link:focus { color: #e2e8f0; background: rgba(255,255,255,0.06); }
        .nb-drawer-link:active { background: rgba(255,255,255,0.1); }
      `}</style>

      <nav className="nb-glass fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">

          {/* Logo */}
          <a href="/" aria-label="CivicPulse home" className="flex items-center gap-2.5">
            <div style={{
              width: 34, height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(34,211,238,.3)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="none"/>
              </svg>
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>
              Civic<span style={{ color: '#22d3ee' }}>Pulse</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-7 md:flex">
            {links.map(l => (
              <a key={l.href} href={l.href} className="nb-link">{l.label}</a>
            ))}
            <a href="/admin" className="nb-admin">Admin</a>
            <a href="#report-form" className="nb-cta">Report an Issue</a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: '#94a3b8',
              transition: 'background .2s',
            }}
            className="md:hidden"
          >
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="nb-drawer md:hidden" style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,13,26,0.97)',
            padding: '1rem 1.25rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="nb-drawer-link"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/admin"
                onClick={() => setOpen(false)}
                className="nb-drawer-link"
                style={{ color: '#64748b' }}
              >
                Admin
              </a>
              <a
                href="#report-form"
                onClick={() => setOpen(false)}
                className="nb-cta"
                style={{ textAlign: 'center', marginTop: 4 }}
              >
                Report an Issue
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

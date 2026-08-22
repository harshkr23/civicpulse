export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Features',    href: '#features'     },
        { label: 'Report Issue', href: '#report-form' },
      ],
    },
    {
      heading: 'Admin',
      links: [
        { label: 'Dashboard',  href: '/admin'         },
        { label: 'Issue Map',  href: '/admin'         },
        { label: 'AI Reports', href: '/admin'         },
      ],
    },
  ];

  return (
    <>
      <style>{`
        .ft-root {
          background: #050a14;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ft-link {
          color: #475569;
          font-size: .875rem;
          transition: color .18s;
        }
        .ft-link:hover { color: #e2e8f0; }
        .ft-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(34,211,238,0.2);
          background: rgba(34,211,238,0.07);
          padding: 5px 12px;
          font-size: .72rem; font-weight: 700;
          letter-spacing: .07em; color: #67e8f9;
        }
      `}</style>

      <footer className="ft-root">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-12 sm:grid-cols-[1fr_auto_auto]">

            {/* Brand column */}
            <div style={{ maxWidth: 300 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(34,211,238,.25)',
                }}>
                  <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/>
                  </svg>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>
                  Civic<span style={{ color: '#22d3ee' }}>Pulse</span>
                </span>
              </div>

              <p style={{ fontSize: '.85rem', lineHeight: 1.7, color: '#475569', marginBottom: 16 }}>
                AI-powered civic intelligence for smarter cities.
                Report problems. Let AI understand them. Help communities respond faster.
              </p>

              <span className="ft-badge">
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
                Powered by Google Gemini
              </span>
            </div>

            {/* Link columns */}
            {cols.map((col) => (
              <div key={col.heading}>
                <p style={{
                  fontSize: '.7rem', fontWeight: 800,
                  letterSpacing: '.12em', textTransform: 'uppercase',
                  color: '#334155', marginBottom: 14,
                }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="ft-link">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <p style={{ fontSize: '.8rem', color: '#334155' }}>
              © {year} CivicPulse · Built for smarter cities
            </p>
            <p style={{ fontSize: '.8rem', color: '#334155' }}>
              Made with ♥ for Buxar, Bihar
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

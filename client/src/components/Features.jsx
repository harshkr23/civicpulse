const FEATURES = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
    color: '#22d3ee', glow: 'rgba(34,211,238,0.18)',
    title: 'Easy Reporting',
    description: 'Describe any civic issue in plain language, voice, or photo. No forms, no bureaucracy.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    ),
    color: '#a78bfa', glow: 'rgba(167,139,250,0.18)',
    title: 'AI Categorization',
    description: 'Gemini automatically classifies complaints, assigns priority, and extracts key details.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    ),
    color: '#34d399', glow: 'rgba(52,211,153,0.18)',
    title: 'Smart Routing',
    description: 'Issues are routed to the right department — sanitation, roads, utilities — automatically.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
    color: '#fb923c', glow: 'rgba(251,146,60,0.18)',
    title: 'Real-Time Tracking',
    description: 'Follow your complaint from submission to resolution with live status updates.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    color: '#f43f5e', glow: 'rgba(244,63,94,0.18)',
    title: 'Admin Intelligence',
    description: 'City officials get an AI-powered dashboard with live maps, analytics, and daily Gemini reports.',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    ),
    color: '#fbbf24', glow: 'rgba(251,191,36,0.18)',
    title: 'Voice Input',
    description: 'Hold to speak your complaint aloud. Gemini transcribes and analyses it instantly.',
  },
];

export default function Features() {
  return (
    <>
      <style>{`
        .feat-section {
          background: #080d1a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 96px 0 112px;
          position: relative;
          overflow: hidden;
        }
        .feat-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .feat-label {
          display: inline-block;
          font-size: .7rem; font-weight: 800;
          letter-spacing: .15em; text-transform: uppercase;
          color: #a78bfa; margin-bottom: 12px;
        }
        .feat-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
          transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
        }
        .feat-card::after {
          content: '';
          position: absolute;
          inset: 0; border-radius: 20px;
          background: radial-gradient(ellipse at 50% 0%, var(--glow) 0%, transparent 65%);
          opacity: 0;
          transition: opacity .3s;
        }
        .feat-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.4);
        }
        .feat-card:hover::after { opacity: 1; }
        .feat-icon-wrap {
          display: inline-flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          margin-bottom: 1rem;
          transition: box-shadow .25s;
        }
        .feat-card:hover .feat-icon-wrap {
          box-shadow: 0 0 24px var(--glow);
        }
      `}</style>

      <section id="features" className="feat-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">

          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="feat-label">Capabilities</span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800, letterSpacing: '-.02em',
                color: '#fff', lineHeight: 1.15,
              }}
            >
              Built for Modern Cities
            </h2>
            <p style={{ marginTop: 14, color: '#64748b', fontSize: '.95rem', lineHeight: 1.7 }}>
              Everything a city needs to collect, triage and act on citizen feedback — fast.
            </p>
          </div>

          {/* Grid */}
          <div
            className="mt-14"
            style={{
              display: 'grid',
              gap: '1.25rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="feat-card"
                style={{ '--glow': f.glow }}
              >
                <div
                  className="feat-icon-wrap"
                  style={{
                    background: f.glow,
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  <svg
                    style={{ width: 22, height: 22, color: f.color }}
                    fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth="1.6"
                  >
                    {f.icon}
                  </svg>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '.85rem', color: '#64748b', lineHeight: 1.65 }}>
                  {f.description}
                </p>

                {/* Bottom accent line */}
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2, borderRadius: '0 0 20px 20px',
                    background: `linear-gradient(to right, transparent, ${f.color}50, transparent)`,
                    opacity: 0,
                    transition: 'opacity .3s',
                  }}
                  className="feat-accent"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const steps = [
  {
    num: '01',
    emoji: '🎤',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.2)',
    title: 'Speak or Type',
    description: 'Describe the problem in your own words, record your voice, or upload a photo. No forms, no jargon.',
  },
  {
    num: '02',
    emoji: '🧠',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
    title: 'Gemini Analyses',
    description: 'Our AI reads your report, identifies the civic issue type, severity level, and the right department.',
  },
  {
    num: '03',
    emoji: '📍',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
    title: 'Routed Instantly',
    description: 'The complaint is logged, geo-tagged, and forwarded — officials see it on the admin dashboard in real time.',
  },
];

export default function HowItWorks() {
  return (
    <>
      <style>{`
        .hiw-section {
          background: #080d1a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 96px 0;
        }
        .hiw-label {
          display: inline-block;
          font-size: .7rem; font-weight: 800;
          letter-spacing: .15em; text-transform: uppercase;
          color: #22d3ee;
          margin-bottom: 12px;
        }
        .hiw-card {
          display: flex; align-items: flex-start; gap: 1.5rem;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 1.75rem;
          transition: border-color .25s, background .25s, transform .25s;
          position: relative;
          overflow: hidden;
        }
        .hiw-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
        }
        .hiw-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          transform: translateY(-3px);
        }
        .hiw-num {
          font-size: .65rem; font-weight: 800;
          letter-spacing: .12em; text-transform: uppercase;
        }
        .hiw-connector {
          display: flex; align-items: center; justify-content: center;
          height: 40px;
        }
      `}</style>

      <section id="how-it-works" className="hiw-section">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {/* Header */}
          <div className="mx-auto max-w-xl text-center">
            <span className="hiw-label">Process</span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 800, letterSpacing: '-.02em',
                color: '#fff', lineHeight: 1.15,
              }}
            >
              How CivicPulse Works
            </h2>
            <p style={{ marginTop: 14, color: '#64748b', fontSize: '.95rem', lineHeight: 1.7 }}>
              From problem to action in three simple steps — powered by Gemini AI.
            </p>
          </div>

          {/* Steps */}
          <div
            className="mx-auto mt-16 max-w-2xl"
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            {steps.map((step, i) => (
              <div key={step.num}>
                <div className="hiw-card">
                  {/* Icon circle */}
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.6rem',
                      background: step.glow,
                      border: `1px solid ${step.color}30`,
                      boxShadow: `0 0 20px ${step.glow}`,
                    }}
                  >
                    {step.emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="hiw-num" style={{ color: step.color }}>Step {step.num}</div>
                    <h3
                      style={{
                        fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9',
                        marginTop: 4, marginBottom: 6,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '.875rem', color: '#64748b', lineHeight: 1.65 }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Step number watermark */}
                  <div
                    style={{
                      position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                      fontSize: '4rem', fontWeight: 900, opacity: .04, color: '#fff',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="hiw-connector">
                    <svg viewBox="0 0 24 24" fill="none" stroke={steps[i + 1].color}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ width: 20, height: 20, opacity: .6 }}>
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

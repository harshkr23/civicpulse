import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

/* ── Recharts CDN loader ──────────────────────────────────────── */
function loadRecharts() {
  if (window.Recharts) return Promise.resolve(window.Recharts);
  window.React = React;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/recharts@2.15.1/umd/Recharts.js';
    script.onload = () => resolve(window.Recharts);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ── Severity config ──────────────────────────────────────────── */
const SEV_CONFIG = {
  critical: {
    label: 'Critical',
    color: '#f43f5e',
    track: 'rgba(244,63,94,0.12)',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/20',
    bar: 'from-rose-600 to-rose-400',
    icon: '🔴',
  },
  high: {
    label: 'High',
    color: '#fb923c',
    track: 'rgba(251,146,60,0.12)',
    badge: 'bg-orange-500/15 text-orange-300 ring-orange-500/20',
    bar: 'from-orange-500 to-amber-400',
    icon: '🟠',
  },
  medium: {
    label: 'Medium',
    color: '#fbbf24',
    track: 'rgba(251,191,36,0.12)',
    badge: 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
    bar: 'from-amber-500 to-yellow-400',
    icon: '🟡',
  },
  low: {
    label: 'Low',
    color: '#34d399',
    track: 'rgba(52,211,153,0.12)',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
    bar: 'from-emerald-500 to-teal-400',
    icon: '🟢',
  },
};

/* ── Animated counter ─────────────────────────────────────────── */
function Counter({ target, duration = 800 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const t0 = performance.now();
    const run = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return <>{val}</>;
}

/* ── Animated bar fill ────────────────────────────────────────── */
function AnimBar({ pct, gradient, track, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: track }}>
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient}`}
        style={{ width: `${width}%`, transition: 'width 700ms cubic-bezier(.22,1,.36,1)' }}
      />
    </div>
  );
}

/* ── Custom dark tooltip for donut ───────────────────────────── */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,13,26,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '8px 12px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
      fontFamily: 'Inter,system-ui,sans-serif',
      fontSize: 12,
      color: '#e2e8f0',
    }}>
      {payload[0].name}: <strong style={{ color: '#34d399' }}>{payload[0].value}%</strong>
    </div>
  );
}

/* ── Skeleton loader ─────────────────────────────────────────── */
function Skel() {
  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[70, 50, 35, 20].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="civic-shimmer" style={{ width: 60, height: 13, borderRadius: 6, flexShrink: 0 }} />
          <div className="civic-shimmer" style={{ flex: 1, height: 8, borderRadius: 99 }} />
          <div className="civic-shimmer" style={{ width: 28, height: 13, borderRadius: 6, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function SeverityResolution({ complaints }) {
  const [RC, setRC] = useState(window.Recharts);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadRecharts().then(setRC).catch(() => setFailed(true));
  }, []);

  /* Derived data */
  const sevKeys = ['critical', 'high', 'medium', 'low'];
  const counts = Object.fromEntries(
    sevKeys.map(k => [k, complaints.filter(c => c.severity === k).length])
  );
  const maxCount = Math.max(1, ...Object.values(counts));

  const total    = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const pending  = complaints.filter(c => c.status === 'pending').length;
  const inProg   = complaints.filter(c => c.status === 'in_progress').length;
  const rate     = total ? Math.round((resolved / total) * 100) : 0;

  /* Donut data for Recharts */
  const donutData = [
    { name: 'Resolved',    value: rate,       fill: '#34d399' },
    { name: 'Remaining',   value: 100 - rate, fill: 'rgba(255,255,255,0.06)' },
  ];

  return (
    <section className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

      {/* ── Severity breakdown ─────────────────── */}
      <div className="ad-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-white">Severity</h2>
            <p className="mt-0.5 text-sm text-slate-500">Open and recently reported complaints</p>
          </div>
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
            {total} total
          </span>
        </div>

        {/* Rows */}
        <div className="mt-6 space-y-4">
          {sevKeys.map((key, i) => {
            const cfg = SEV_CONFIG[key];
            const count = counts[key];
            const pct = Math.round((count / maxCount) * 100);
            const sharePct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                {/* Label */}
                <div className="flex w-[72px] shrink-0 items-center gap-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className="text-xs font-semibold text-slate-300">{cfg.label}</span>
                </div>

                {/* Bar */}
                <AnimBar pct={pct} gradient={cfg.bar} track={cfg.track} delay={i * 80} />

                {/* Count + share */}
                <div className="flex w-[52px] shrink-0 items-center justify-end gap-1.5">
                  <span className="text-sm font-bold text-white">
                    <Counter target={count} duration={700} />
                  </span>
                  {sharePct > 0 && (
                    <span className="text-[10px] font-medium text-slate-500">{sharePct}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stacked mini bar (visual summary) */}
        {total > 0 && (
          <div className="mt-6 flex h-2 overflow-hidden rounded-full border border-white/5">
            {sevKeys.map(key => {
              const pct = (counts[key] / total) * 100;
              if (!pct) return null;
              return (
                <div
                  key={key}
                  title={`${SEV_CONFIG[key].label}: ${counts[key]}`}
                  style={{
                    width: `${pct}%`,
                    background: SEV_CONFIG[key].color,
                    transition: 'width 800ms cubic-bezier(.22,1,.36,1)',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Legend badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {sevKeys.map(key => {
            const cfg = SEV_CONFIG[key];
            return counts[key] > 0 ? (
              <span
                key={key}
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cfg.badge}`}
              >
                {cfg.label} · {counts[key]}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* ── Resolution rate ────────────────────── */}
      <div className="ad-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-white">Resolution rate</h2>
            <p className="mt-0.5 text-sm text-slate-500">Resolved / Total</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <span className="ad-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        </div>

        {/* Donut + big number */}
        <div className="relative mt-4 flex items-center justify-center">
          {!RC || failed ? (
            /* Fallback CSS ring when Recharts hasn't loaded */
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="48" fill="none"
                  stroke="#34d399" strokeWidth="12"
                  strokeDasharray={`${(rate / 100) * 301.6} 301.6`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)' }}
                />
              </svg>
              <div className="text-center">
                <p className="text-3xl font-bold text-white"><Counter target={rate} /></p>
                <p className="text-xs text-slate-500 mt-0.5">percent</p>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <RC.ResponsiveContainer width="100%" height="100%">
                <RC.PieChart>
                  <RC.Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={68}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={rate > 0 && rate < 100 ? 3 : 0}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={0}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {donutData.map((d) => (
                      <RC.Cell key={d.name} fill={d.fill} />
                    ))}
                  </RC.Pie>
                  <RC.Tooltip content={<DonutTooltip />} />
                </RC.PieChart>
              </RC.ResponsiveContainer>
              {/* Centre text */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  <Counter target={rate} />%
                </p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>resolved</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar (secondary visual) */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            style={{ width: `${rate}%`, transition: 'width 900ms cubic-bezier(.22,1,.36,1)' }}
          />
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Resolved', value: resolved, color: 'text-emerald-400' },
            { label: 'Pending',  value: pending,  color: 'text-amber-400'   },
            { label: 'Active',   value: inProg,   color: 'text-violet-400'  },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/5 px-2 py-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>
                <Counter target={s.value} duration={700} />
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-4 border-t border-white/5 pt-3 text-xs text-slate-500">
          {total - resolved > 0
            ? `${total - resolved} complaint${total - resolved !== 1 ? 's' : ''} still need attention.`
            : total > 0
            ? '✓ All complaints resolved.'
            : 'No complaints submitted yet.'}
        </p>
      </div>
    </section>
  );
}

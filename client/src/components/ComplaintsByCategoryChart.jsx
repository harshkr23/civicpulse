import * as React from 'react';
import { useEffect, useState } from 'react';

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

/* ── Per-category colour palette ─────────────────────────────── */
const PALETTE = [
  { grad: ['#6366f1', '#818cf8'], light: '#6366f120' }, // indigo
  { grad: ['#f43f5e', '#fb7185'], light: '#f43f5e20' }, // rose
  { grad: ['#f59e0b', '#fbbf24'], light: '#f59e0b20' }, // amber
  { grad: ['#10b981', '#34d399'], light: '#10b98120' }, // emerald
  { grad: ['#8b5cf6', '#a78bfa'], light: '#8b5cf620' }, // violet
  { grad: ['#06b6d4', '#22d3ee'], light: '#06b6d420' }, // cyan
  { grad: ['#ec4899', '#f472b6'], light: '#ec489920' }, // pink
  { grad: ['#f97316', '#fb923c'], light: '#f9731620' }, // orange
];

/* ── Category icons ───────────────────────────────────────────── */
const ICONS = {
  Road: '🛣️', Roads: '🛣️',
  Garbage: '🗑️', Waste: '🗑️', Sanitation: '🗑️',
  Water: '💧', 'Water Supply': '💧',
  Lighting: '💡', Streetlight: '💡', Electricity: '⚡',
  Drainage: '🌊', Sewage: '🌊',
  Park: '🌳', Garden: '🌳',
  Noise: '🔊',
  Traffic: '🚦',
  Building: '🏗️',
  Health: '🏥',
};
const iconFor = (cat) => ICONS[cat] ?? '📋';

/* ── Custom bar label (count + %) ────────────────────────────── */
function BarLabel({ x, y, width, height, value, total }) {
  if (!value || width < 32) return null;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
      fill="#94a3b8"
    >
      {value}
      <tspan fill="#475569" fontWeight={400}> · {pct}%</tspan>
    </text>
  );
}

/* ── Custom tooltip ───────────────────────────────────────────── */
function DarkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, complaints: count } = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(8,13,26,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, margin: 0 }}>
        {iconFor(category)} {category}
      </p>
      <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>
        <span style={{ color: '#818cf8', fontWeight: 700, fontSize: 18 }}>{count}</span>
        {' '}complaint{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

/* ── Shimmer skeleton ─────────────────────────────────────────── */
function Skeleton() {
  const widths = [88, 68, 52, 38, 30];
  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {widths.map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* label pill */}
          <div className="civic-shimmer" style={{ width: 72, height: 14, borderRadius: 6, flexShrink: 0 }} />
          {/* bar */}
          <div className="civic-shimmer" style={{ width: `${w}%`, height: 22, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}

/* ── Gradient defs injected into SVG ─────────────────────────── */
function GradientDefs({ data }) {
  return (
    <defs>
      {data.map((_, i) => {
        const p = PALETTE[i % PALETTE.length];
        return (
          <linearGradient key={i} id={`ccg-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.grad[0]} />
            <stop offset="100%" stopColor={p.grad[1]} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function ComplaintsByCategoryChart({ complaints }) {
  const [RC, setRC] = useState(window.Recharts);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadRecharts().then(setRC).catch(() => setFailed(true));
  }, []);

  /* Build sorted data */
  const raw = complaints.reduce((acc, c) => {
    const cat = c.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(raw)
    .map(([category, complaints]) => ({ category, complaints }))
    .sort((a, b) => b.complaints - a.complaints);

  const total = data.reduce((s, d) => s + d.complaints, 0);
  const maxVal = data[0]?.complaints || 1;

  /* Dynamic bar height so chart grows with data */
  const barH = 28;
  const gap  = 10;
  const chartH = Math.max(200, data.length * (barH + gap));

  /* right margin to give room for label text */
  const rightMargin = 64;

  return (
    <div className="ad-card civic-enter mt-7 rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Complaints by category</h2>
          <p className="mt-0.5 text-sm text-slate-500">Active complaints across Buxar</p>
        </div>
        {total > 0 && (
          <span className="shrink-0 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            {total} total
          </span>
        )}
      </div>

      {/* States */}
      {failed && (
        <div className="py-14 text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-rose-500/10 text-xl">⚠</div>
          <p className="font-semibold text-slate-300">Chart unavailable</p>
          <p className="mt-1 text-sm text-slate-500">Please check your connection and reload.</p>
        </div>
      )}

      {!failed && !RC && <Skeleton />}

      {!failed && RC && data.length === 0 && (
        <div className="py-14 text-center">
          <div className="mx-auto mb-3 text-3xl">📋</div>
          <p className="font-semibold text-slate-400">No complaints yet</p>
          <p className="mt-1 text-sm text-slate-500">Submit a civic report to see category breakdown.</p>
        </div>
      )}

      {!failed && RC && data.length > 0 && (
        <>
          {/* Recharts horizontal bar chart */}
          <div style={{ marginTop: 20, height: chartH }}>
            <RC.ResponsiveContainer width="100%" height="100%">
              <RC.BarChart
                data={data}
                layout="vertical"
                margin={{ top: 2, right: rightMargin, left: 0, bottom: 2 }}
                barCategoryGap={gap}
              >
                <GradientDefs data={data} />

                <RC.XAxis
                  type="number"
                  hide
                  domain={[0, maxVal * 1.15]}
                />

                <RC.YAxis
                  type="category"
                  dataKey="category"
                  width={82}
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload, index }) => {
                    const p = PALETTE[index % PALETTE.length];
                    return (
                      <text x={x} y={y} textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight={600} fill="#94a3b8">
                        {iconFor(payload.value)} {payload.value.length > 9 ? payload.value.slice(0, 9) + '…' : payload.value}
                      </text>
                    );
                  }}
                />

                <RC.Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }}
                  content={<DarkTooltip />}
                />

                <RC.Bar
                  dataKey="complaints"
                  radius={[0, 6, 6, 0]}
                  barSize={barH}
                  label={<BarLabel total={total} />}
                >
                  {data.map((_, i) => (
                    <RC.Cell
                      key={i}
                      fill={`url(#ccg-${i})`}
                    />
                  ))}
                </RC.Bar>
              </RC.BarChart>
            </RC.ResponsiveContainer>
          </div>

          {/* Legend row — top-N chips */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
            {data.slice(0, 5).map((d, i) => {
              const p = PALETTE[i % PALETTE.length];
              const pct = Math.round((d.complaints / total) * 100);
              return (
                <span
                  key={d.category}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: p.light, color: p.grad[1] }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: p.grad[0] }}
                  />
                  {d.category} · {pct}%
                </span>
              );
            })}
            {data.length > 5 && (
              <span className="flex items-center rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-500">
                +{data.length - 5} more
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

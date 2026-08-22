import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Severity config ───────────────────────────────────────────── */
const SEV = {
  critical: { color: '#f43f5e', ring: 'rgba(244,63,94,0.35)', label: 'Critical', text: 'text-rose-400',   badge: 'bg-rose-500/15 text-rose-300',    dot: '#f43f5e' },
  high:     { color: '#fb923c', ring: 'rgba(251,146,60,0.35)',  label: 'High',     text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-300',  dot: '#fb923c' },
  medium:   { color: '#fbbf24', ring: 'rgba(251,191,36,0.35)',  label: 'Medium',   text: 'text-amber-400',  badge: 'bg-amber-500/15 text-amber-300',    dot: '#fbbf24' },
  low:      { color: '#34d399', ring: 'rgba(52,211,153,0.35)',  label: 'Low',      text: 'text-emerald-400',badge: 'bg-emerald-500/15 text-emerald-300', dot: '#34d399' },
};

const STATUS_BADGE = {
  pending:     'bg-amber-500/15 text-amber-300',
  in_progress: 'bg-violet-500/15 text-violet-300',
  resolved:    'bg-emerald-500/15 text-emerald-300',
  assigned:    'bg-blue-500/15 text-blue-300',
};

/* ── Leaflet loader ────────────────────────────────────────────── */
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('leaflet-css');
    if (!existing) {
      const css = document.createElement('link');
      css.id = 'leaflet-css'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ── SVG pin marker factory ────────────────────────────────────── */
function makePinHtml(color, ring, pulse = false) {
  return `
    <div style="position:relative;width:36px;height:44px;display:flex;align-items:flex-start;justify-content:center;">
      ${pulse ? `<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:36px;height:36px;border-radius:50%;background:${ring};animation:cp-pulse 1.8s ease-in-out infinite;"></div>` : ''}
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 12px ${ring});">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="17" r="7" fill="white" fill-opacity="0.92"/>
        <circle cx="18" cy="17" r="4" fill="${color}"/>
      </svg>
    </div>
  `;
}

/* ── Detail panel ──────────────────────────────────────────────── */
function DetailPanel({ complaint, onClose }) {
  if (!complaint) return null;
  const sev  = SEV[complaint.severity] || SEV.low;
  const sk   = (complaint.status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const time = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : '—';

  return (
    <div
      className="cp-panel civic-enter absolute right-4 top-4 z-[500] w-[min(300px,calc(100%-2rem))] overflow-hidden rounded-2xl"
      role="dialog"
      aria-label="Complaint details"
    >
      <div className="relative flex items-start justify-between gap-3 p-4" style={{ background: sev.color + '22', borderBottom: `1px solid ${sev.color}30` }}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}` }} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: sev.color }}>{sev.label} severity</p>
            <h3 className="mt-0.5 text-sm font-bold text-white leading-snug">{complaint.category || 'Complaint'}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close detail panel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          {complaint.summary || complaint.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[complaint.status] || STATUS_BADGE.pending}`}>
              {sk || 'Pending'}
            </span>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Severity</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${sev.badge}`}>
              {sev.label}
            </span>
          </div>
        </div>

        {complaint.location && (
          <div className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs text-slate-300 leading-relaxed">{complaint.location}</p>
          </div>
        )}

        {complaint.suggestedDepartment && (
          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-slate-500">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs text-slate-300">{complaint.suggestedDepartment}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-white/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reported {time}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export default function ComplaintMap({ complaints }) {
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(null);

  const mapped = complaints.filter(c => Number.isFinite(c.latitude) && Number.isFinite(c.longitude));
  const counts = { critical:0, high:0, medium:0, low:0 };
  mapped.forEach(c => { if (counts[c.severity] !== undefined) counts[c.severity]++; });

  const buildMap = useCallback((L) => {
    if (!mapRef.current) return;
    if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([25.5668, 83.9762], 14);

    mapInst.current = map;
    L.control.attribution({ prefix: false, position: 'bottomleft' })
      .addAttribution('<a href="https://www.openstreetmap.org/copyright" style="color:#475569;font-size:10px">© OSM</a>')
      .addTo(map);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    if (!document.getElementById('cp-styles')) {
      const style = document.createElement('style');
      style.id = 'cp-styles';
      style.textContent = `
        @keyframes cp-pulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:.2;transform:scale(1.6)} }
        .cp-marker-wrap { background:none!important; border:none!important; }
        .leaflet-popup-content-wrapper { display:none!important; }
        .leaflet-popup-tip-container { display:none!important; }
        .leaflet-control-attribution { background:transparent!important; }
        .cp-panel { background:rgba(10,15,30,0.92); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(20px); box-shadow:0 25px 50px rgba(0,0,0,0.5); }
        .leaflet-control-zoom a { background:rgba(10,15,30,0.9)!important; color:#94a3b8!important; border:1px solid rgba(255,255,255,0.1)!important; }
        .leaflet-control-zoom a:hover { background:rgba(255,255,255,0.1)!important; color:#fff!important; }
      `;
      document.head.appendChild(style);
    }

    mapped.forEach((item) => {
      const cfg   = SEV[item.severity] || SEV.low;
      const pulse = item.severity === 'critical';
      const icon  = L.divIcon({
        className:  'cp-marker-wrap',
        iconSize:   [36, 44],
        iconAnchor: [18, 44],
        html: makePinHtml(cfg.color, cfg.ring, pulse),
      });

      const marker = L.marker([item.latitude, item.longitude], { icon, zIndexOffset: pulse ? 1000 : 0 });
      marker.addTo(map);
      marker.on('click', () => {
        setSelected(item);
        map.panTo([item.latitude, item.longitude], { animate: true, duration: 0.4 });
      });
    });

    setReady(true);
  }, [attempt, mapped.length]);

  useEffect(() => {
    setReady(false);
    loadLeaflet()
      .then(buildMap)
      .catch(() => { setError(true); setReady(true); });

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    };
  }, [attempt, buildMap]);

  useEffect(() => {
    if (!mapInst.current || !window.L) return;
    const L = window.L;
    mapInst.current.eachLayer(layer => {
      if (layer instanceof L.Marker) mapInst.current.removeLayer(layer);
    });
    mapped.forEach((item) => {
      const cfg   = SEV[item.severity] || SEV.low;
      const pulse = item.severity === 'critical';
      const icon  = L.divIcon({
        className:  'cp-marker-wrap',
        iconSize:   [36, 44],
        iconAnchor: [18, 44],
        html: makePinHtml(cfg.color, cfg.ring, pulse),
      });
      const marker = L.marker([item.latitude, item.longitude], { icon, zIndexOffset: pulse ? 1000 : 0 });
      marker.addTo(mapInst.current);
      marker.on('click', () => {
        setSelected(item);
        mapInst.current.panTo([item.latitude, item.longitude], { animate: true, duration: 0.4 });
      });
    });
  }, [complaints, mapped]);

  const retry = () => { setSelected(null); setError(false); setReady(false); setAttempt(v => v + 1); };

  return (
    <section className="ad-card overflow-hidden rounded-2xl civic-enter">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6 border-b border-white/5">
        <div>
          <h2 className="font-semibold text-white">Complaint Map</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Click a marker to view the reported complaint.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {[
            { key:'critical', label:'Critical', color:'bg-rose-500'   },
            { key:'high',     label:'High',     color:'bg-orange-400' },
            { key:'medium',   label:'Medium',   color:'bg-amber-400'  },
            { key:'low',      label:'Low',       color:'bg-emerald-400'},
          ].map(({ key, label, color }) => (
            <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {label}
              {counts[key] > 0 && (
                <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                  {counts[key]}
                </span>
              )}
            </span>
          ))}
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            {mapped.length} mapped
          </span>
        </div>
      </div>

      <div className="relative" style={{ background: '#0a0f1e' }}>
        {!ready && !error && (
          <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-4" style={{ background:'rgba(8,13,26,0.9)' }}>
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-white/5 animate-pulse" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="absolute inset-0 m-auto h-6 w-6 text-indigo-400">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Loading live complaint map…</p>
          </div>
        )}

        {error && ready && (
          <div className="grid h-[540px] place-items-center px-5 text-center" style={{ background:'rgba(8,13,26,0.95)' }}>
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-2xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 text-rose-400">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mt-4 font-semibold text-white">Map unavailable</p>
              <p className="mt-1.5 max-w-xs text-sm text-slate-500">Check your internet connection, then try loading the map again.</p>
              <button
                onClick={retry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!error && (
          <div
            ref={mapRef}
            className="w-full"
            style={{ height: 'min(580px, 68vh)', minHeight: '380px' }}
            aria-label="Interactive complaint map of Buxar"
          />
        )}

        {ready && !error && mapped.length === 0 && complaints.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-[400] -translate-x-1/2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-center backdrop-blur-md">
              <p className="text-xs font-semibold text-slate-300">No geo-tagged complaints yet</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Location must be shared when submitting.</p>
            </div>
          </div>
        )}

        <DetailPanel complaint={selected} onClose={() => setSelected(null)} />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/5 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="ad-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
          Live data · refreshes every 15 s
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span>Buxar District, Bihar</span>
          <span className="opacity-30">·</span>
          <span>{mapped.length} / {complaints.length} with location</span>
        </div>
      </div>
    </section>
  );
}

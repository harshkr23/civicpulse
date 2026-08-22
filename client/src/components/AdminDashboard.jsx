import { useEffect, useRef, useState, useCallback } from 'react';
import Logo from './Logo';
import ComplaintMap from './ComplaintMap';
import ComplaintsByCategoryChart from './ComplaintsByCategoryChart';
import SeverityResolution from './SeverityResolution';
import { getComplaints, updateComplaint as persistComplaint } from '../api/complaints';

/* ─── Icon Helper ─────────────────────────────────────────────── */
const Icon = ({ name, className = 'h-5 w-5' }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    issues: <><path d="M12 8v4" /><path d="M12 16h.01" /><path d="M10.3 3.8 2.8 17a2 2 0 0 0 1.75 3h14.9a2 2 0 0 0 1.75-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.66 18.66a1.7 1.7 0 0 0-1.88.34l-.06.06L6.6 16.94l.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.04h-.08v-3h.08A1.7 1.7 0 0 0 7 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06L8.72 5.86l.06.06A1.7 1.7 0 0 0 10.66 6.26 1.7 1.7 0 0 0 11.7 4.7v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    close: <><path d="M18 6 6 18M6 6l12 12" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></>,
    spark: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></>,
    arrow_up: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

/* ─── Animated Number Counter ─────────────────────────────────── */
function Counter({ target, duration = 1000 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return <>{val}</>;
}

/* ─── Constants ───────────────────────────────────────────────── */
const STATUS_DARK = {
  Pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/25',
  Assigned: 'bg-blue-500/15 text-blue-300 ring-blue-500/25',
  'In Progress': 'bg-violet-500/15 text-violet-300 ring-violet-500/25',
  Resolved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
};

const SEV = {
  critical: { color: 'text-rose-400', dot: 'bg-rose-500', glow: 'shadow-rose-500/30' },
  high:     { color: 'text-orange-400', dot: 'bg-orange-400', glow: 'shadow-orange-400/30' },
  medium:   { color: 'text-amber-400', dot: 'bg-amber-400', glow: 'shadow-amber-400/30' },
  low:      { color: 'text-emerald-400', dot: 'bg-emerald-400', glow: 'shadow-emerald-400/30' },
};

const FALLBACK_REPORT = {
  headline: "TODAY'S CIVIC REPORT",
  complaintsReceived: 47,
  mostReported: 'Road infrastructure',
  criticalIssues: 5,
  mostAffectedArea: 'Buxar East Ward',
  recommendedPriorities: ['School road repair', 'Water leakage fix', 'Streetlights on NH-84'],
};

const NAV = [['Overview', 'grid'], ['Issues', 'issues'], ['Map', 'pin'], ['Analytics', 'chart'], ['Residents', 'users']];
const BAR_H = [38, 56, 45, 75, 61, 90, 70];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ─── Activity Feed ───────────────────────────────────────────── */
function ActivityFeed({ complaints }) {
  const recent = [...complaints].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,7);
  const timeAgo = (d) => {
    const m = Math.floor((Date.now()-new Date(d))/60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m/60)}h ago`;
    return `${Math.floor(m/1440)}d ago`;
  };
  const dotColor = { critical:'bg-rose-500', high:'bg-orange-400', medium:'bg-amber-400', low:'bg-emerald-400' };
  return (
    <div className="ad-card rounded-2xl p-5 flex flex-col">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-white">Live Feed</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest civic reports</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          <span className="ad-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
          Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {recent.length === 0
          ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-500">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-400">No reports yet</p>
            <p className="mt-1 text-xs text-slate-600">Live activity will appear here.</p>
            </div>
          )
          : recent.map(c => (
            <div key={c._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor[c.severity]||'bg-slate-500'} shadow-sm`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-200">{c.category||'Complaint'}</p>
                  <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{c.summary||c.description||'No description'}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ─── Notification Panel ──────────────────────────────────────── */
function NotifPanel({ onClose }) {
  const items = [
    { icon:'issues', bg:'bg-rose-500/10', color:'text-rose-400', text:'3 new critical complaints in Ward 4', time:'2 min ago' },
    { icon:'check',  bg:'bg-emerald-500/10', color:'text-emerald-400', text:'Water issue #124 marked resolved', time:'18 min ago' },
    { icon:'shield', bg:'bg-violet-500/10', color:'text-violet-400', text:'AI report generated successfully', time:'1 hr ago' },
  ];
  return (
    <div className="civic-enter absolute right-0 top-[calc(100%+8px)] z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <p className="text-sm font-semibold text-white">Notifications</p>
        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">3 new</span>
      </div>
      {items.map((it,i) => (
        <div key={i} className="flex gap-3 border-b border-white/5 px-4 py-3 hover:bg-white/5 transition-colors last:border-0">
          <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${it.bg}`}>
            <Icon name={it.icon} className={`h-4 w-4 ${it.color}`} />
          </div>
          <div>
            <p className="text-sm text-slate-300">{it.text}</p>
            <p className="mt-0.5 text-xs text-slate-500">{it.time}</p>
          </div>
        </div>
      ))}
      <div className="px-4 py-2.5">
        <button onClick={onClose} className="w-full rounded-xl py-2 text-xs font-semibold text-indigo-400 hover:bg-white/5 transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
}

/* ─── AI Report Modal ────────────────────────────────────────── */
function AiReportModal({ report, onClose }) {
  const stats = [
    { label: 'Complaints received', value: report.complaintsReceived, big: true, color: '#818cf8' },
    { label: 'Most reported',       value: report.mostReported,       big: false, color: '#e2e8f0' },
    { label: 'Critical issues',     value: report.criticalIssues,     big: true,  color: '#f43f5e' },
    { label: 'Most affected area',  value: report.mostAffectedArea,   big: false, color: '#e2e8f0' },
  ];
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="civic-enter relative w-full max-w-2xl overflow-hidden rounded-3xl"
        style={{
          background: '#0c1120',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden px-6 pt-7 pb-6">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.18) 50%, rgba(217,70,239,0.12) 100%)' }}
          />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='0.8' fill='%23fff'/%3E%3C/svg%3E\")" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                Gemini AI · Generated
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{report.headline}</h2>
            <p className="mt-1 text-sm text-indigo-300/70">{new Date().toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {stats.map(s => (
            <div key={s.label} className="px-6 py-5" style={{ background: '#0c1120' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{s.label}</p>
              <p
                className={`mt-2 font-bold leading-none ${s.big ? 'text-4xl' : 'text-xl'}`}
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recommended priorities */}
        <div className="px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-4">Recommended priorities</p>
          <ol className="space-y-3">
            {report.recommendedPriorities.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-200">{p}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-xs text-slate-500">Powered by Google Gemini · CivicPulse AI</p>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function AdminDashboard() {
  const [active, setActive] = useState('Overview');
  const [notif, setNotif] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('Newest');
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const notifRef = useRef(null);

  const loadComplaints = useCallback(async () => {
    try { setComplaints(await getComplaints()); } catch { setComplaints([]); }
  }, []);

  useEffect(() => {
    loadComplaints();
    const id = window.setInterval(loadComplaints, 15000);
    return () => window.clearInterval(id);
  }, [loadComplaints]);

  useEffect(() => {
    if (!notif) return;
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotif(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notif]);

  const titleCase = (v='') => v.replace(/_/g,' ').replace(/\b\w/g, l=>l.toUpperCase());

  const stats = [
    { label:'Total Issues',   value:complaints.length,   icon:'inbox',    grad:'from-indigo-500 to-violet-600', trend:12  },
    { label:'High Priority',  value:complaints.filter(c=>['high','critical'].includes(c.severity)).length, icon:'issues',  grad:'from-rose-500 to-pink-600',    trend:-5  },
    { label:'Pending Review', value:complaints.filter(c=>c.status==='pending').length,  icon:'activity', grad:'from-amber-500 to-orange-500', trend:8   },
    { label:'Resolved',       value:complaints.filter(c=>c.status==='resolved').length, icon:'check',    grad:'from-emerald-400 to-teal-500', trend:22  },
  ];

  const categories = [...new Set(complaints.map(c=>c.category).filter(Boolean))];

  const filtered = complaints
    .filter(c => (category==='All categories'||c.category===category)
      && `${c.category} ${c.location} ${c.summary||c.description}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort==='Severity'
      ? ({critical:4,high:3,medium:2,low:1}[b.severity]||0)-({critical:4,high:3,medium:2,low:1}[a.severity]||0)
      : new Date(b.createdAt)-new Date(a.createdAt));

  const updateStatus = async (id, status) => {
    const s = status.toLowerCase().replace(/ /g,'_');
    setComplaints(cur => cur.map(c => c._id===id ? {...c,status:s} : c));
    try { await persistComplaint(id,{status:s}); } catch { loadComplaints(); }
  };

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const r = await fetch('/api/ai/report',{method:'POST'});
      const d = await r.json();
      setReport(d.success ? d.data : FALLBACK_REPORT);
    } catch { setReport(FALLBACK_REPORT); }
    finally { setReportLoading(false); }
  };

  const today = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const highCount = complaints.filter(c=>['high','critical'].includes(c.severity)).length;

  return (
    <>
      <style>{`
        /* ── Base ── */
        .ad-bg {
          background: #080d1a;
          background-image:
            radial-gradient(ellipse at 5% 0%, rgba(99,102,241,0.13) 0%, transparent 55%),
            radial-gradient(ellipse at 95% 100%, rgba(139,92,246,0.09) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 70%);
          min-height: 100vh;
        }
        /* ── Sidebar ── */
        .ad-sidebar {
          background: rgba(8,13,26,0.96);
          border-right: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
        }
        /* ── Header ── */
        .ad-header {
          background: rgba(8,13,26,0.88);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
        }
        /* ── Card ── */
        .ad-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
        }
        /* ── Stat Card ── */
        .ad-stat {
          background: linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }
        /* ── Nav button active accent ── */
        .ad-nav-active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 20px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to bottom, #22d3ee, #a78bfa);
        }
        .ad-nav-btn { position: relative; }
        /* ── Selects & Inputs ── */
        .ad-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #94a3b8;
          cursor: pointer;
          transition: border-color .15s, background .15s;
        }
        .ad-select:hover, .ad-select:focus { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.08); color: #e2e8f0; outline: none; }
        .ad-select option { background: #0f1729; color: #e2e8f0; }
        .ad-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e8f0;
          transition: border-color .15s, box-shadow .15s;
        }
        .ad-input::placeholder { color: #475569; }
        .ad-input:focus { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); outline: none; }
        /* ── Bar chart ── */
        .ad-bar { background: linear-gradient(to top, #4f46e5, #818cf8); border-radius: 4px 4px 0 0; transition: opacity .2s; }
        .ad-bar:hover { opacity: .75; }
        /* ── Table ── */
        .ad-thead { background: rgba(255,255,255,0.025); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .ad-row { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background .15s; }
        .ad-row:last-child { border-bottom: none; }
        .ad-row:hover { background: rgba(255,255,255,0.03); }
        /* ── Live pulse ── */
        @keyframes ad-pulse { 50% { opacity: .2; } }
        .ad-pulse { animation: ad-pulse 1.8s ease-in-out infinite; }
        /* ── AI Banner ── */
        .ad-ai-banner {
          border: 1px solid rgba(99,102,241,0.35);
          box-shadow: 0 0 80px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.05);
          overflow: hidden;
          border-radius: 1rem;
        }
        /* ── Mobile nav ── */
        .ad-mobile-nav {
          background: rgba(8,13,26,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
        }
      `}</style>

      <div className="ad-bg text-slate-200">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="ad-sidebar fixed inset-y-0 left-0 hidden w-[240px] flex-col lg:flex">
          {/* Logo */}
          <div className="px-5 pt-6 pb-8">
            <a href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30">
                <Icon name="zap" className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Civic<span className="text-cyan-400">Pulse</span>
              </span>
            </a>
          </div>

          {/* Nav */}
          <div className="px-3 flex-1 overflow-y-auto">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <nav className="space-y-0.5">
              {NAV.map(([label, icon]) => (
                <button
                  key={label}
                  onClick={() => setActive(label)}
                  className={`ad-nav-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active === label
                      ? 'ad-nav-active bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon name={icon} className="h-[18px] w-[18px] shrink-0" />
                  {label}
                  {label === 'Issues' && highCount > 0 && (
                    <span className="ml-auto rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                      {highCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom */}
          <div className="shrink-0 border-t border-white/5 px-3 pt-4 pb-5">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
              <Icon name="settings" className="h-[18px] w-[18px]" />
              Settings
            </button>
            <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
                AM
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Alex Morgan</p>
                <p className="text-xs text-slate-500">City Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────── */}
        <main className="lg:ml-[240px]">

          {/* Header */}
          <header className="ad-header sticky top-0 z-30 flex h-[68px] items-center justify-between px-5 sm:px-8">
            <span className="hidden text-sm text-slate-500 lg:block">{today}</span>
            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
                <Icon name="zap" className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">Civic<span className="text-cyan-400">Pulse</span></span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={loadComplaints} title="Refresh" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                <Icon name="refresh" className="h-4 w-4" />
              </button>

              {/* Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotif(v => !v)}
                  className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Icon name="bell" className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#080d1a] bg-rose-500" />
                </button>
                {notif && <NotifPanel onClose={() => setNotif(false)} />}
              </div>

              <button className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors">
                Export
              </button>

              <button
                onClick={generateReport}
                disabled={reportLoading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:cursor-wait disabled:opacity-60 transition-opacity"
              >
                <Icon name="spark" className="h-4 w-4" />
                <span className="hidden sm:inline">{reportLoading ? 'Generating…' : 'AI Report'}</span>
              </button>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="ad-mobile-nav civic-enter flex gap-1 overflow-x-auto px-4 py-2 lg:hidden">
            {NAV.map(([label, icon]) => (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  active === label ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon name={icon} className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Page body */}
          <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">

            {/* Title row */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Civic Operations</p>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">CivicPulse Admin</h1>
                <p className="mt-1.5 text-sm text-slate-500">Here's what's happening across your city today.</p>
              </div>
              <button
                onClick={() => setActive('Issues')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon name="inbox" className="h-4 w-4" />
                View all issues
              </button>
            </div>

            {/* AI Report Modal */}
            {report && <AiReportModal report={report} onClose={() => setReport(null)} />}

            {/* Stat cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((s,i) => (
                <article key={s.label} className="ad-stat civic-enter rounded-2xl p-5" style={{animationDelay:`${i*60}ms`}}>
                  {/* glow blob */}
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-15 bg-gradient-to-br ${s.grad}`} />
                  <div className="relative flex items-start justify-between">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.grad} shadow-lg`}>
                      <Icon name={s.icon} className="h-5 w-5 text-white" />
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.trend>=0?'bg-emerald-500/10 text-emerald-400':'bg-rose-500/10 text-rose-400'}`}>
                      <Icon name="arrow_up" className={`h-3 w-3 ${s.trend<0?'rotate-180':''}`} />
                      {Math.abs(s.trend)}%
                    </span>
                  </div>
                  <p className="relative mt-5 text-4xl font-bold tracking-tight text-white">
                    <Counter target={s.value} />
                  </p>
                  <p className="relative mt-1 text-sm font-medium text-slate-400">{s.label}</p>
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${s.grad} opacity-50`} />
                </article>
              ))}
            </section>

            {/* Map view */}
            {active === 'Map' ? (
              <div className="mt-7"><ComplaintMap complaints={complaints} /></div>
            ) : (
              <>
                {/* Charts row */}
                <section className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                  {/* Bar chart */}
                  <div className="ad-card rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-white">Issue Activity</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Reports received over the last 7 days</p>
                      </div>
                      <select className="ad-select rounded-lg px-3 py-1.5 text-xs font-medium">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                      </select>
                    </div>
                    <div className="mt-7 flex h-52 items-end gap-2 pb-1 sm:gap-3">
                      {BAR_H.map((h,i) => (
                        <div key={i} className="group flex h-full flex-1 flex-col justify-end gap-1.5">
                          <div className="ad-bar" style={{height:`${h}%`}} />
                          <span className="text-center text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">{DAYS[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-5 text-xs text-slate-500">
                      <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />New issues</span>
                      <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />Resolved issues</span>
                    </div>
                  </div>
                  <ComplaintsByCategoryChart complaints={complaints} />
                </section>

                {/* Severity + Resolution */}
                <SeverityResolution complaints={complaints} />

                {/* Issues table + Activity Feed */}
                <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">

                  {/* Issues table */}
                  <section className="ad-card overflow-hidden rounded-2xl">
                    <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:px-6">
                      <div>
                        <h2 className="font-semibold text-white">Complaint Table</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Review and update reports from Buxar residents.</p>
                      </div>
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                        {filtered.length} complaints
                      </span>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-2.5 border-t border-white/5 px-4 py-3 sm:flex-row sm:px-6">
                      <label className="relative min-w-0 flex-1">
                        <span className="sr-only">Search complaints</span>
                        <input
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Search complaints…"
                          className="ad-input w-full rounded-xl px-3 py-2 pl-9 text-sm"
                        />
                        <svg className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
                      </label>
                      <select value={category} onChange={e=>setCategory(e.target.value)} className="ad-select rounded-xl px-3 py-2 text-sm outline-none">
                        <option>All categories</option>
                        {categories.map(c=><option key={c}>{c}</option>)}
                      </select>
                      <select value={sort} onChange={e=>setSort(e.target.value)} className="ad-select rounded-xl px-3 py-2 text-sm outline-none">
                        <option>Newest</option>
                        <option>Severity</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="ad-thead">
                          <tr>
                            {['Category','Severity','Location','Status','Reported','Action'].map(h=>(
                              <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${h==='Action'?'text-right':''}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(c => {
                            const s = SEV[c.severity] || SEV.low;
                            const sk = titleCase(c.status);
                            return (
                              <tr key={c._id} className="ad-row">
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-slate-200">{c.category}</p>
                                  <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-500">{c.summary||c.description}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${s.color}`}>
                                    <i className={`h-2 w-2 rounded-full ${s.dot} shadow-sm ${s.glow}`} />
                                    {titleCase(c.severity)}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-400">{c.location||'—'}</td>
                                <td className="px-5 py-4">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_DARK[sk]||STATUS_DARK.Pending}`}>
                                    {sk}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-500">
                                  {new Date(c.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <label className="sr-only" htmlFor={`st-${c._id}`}>Update {c.category}</label>
                                  <select
                                    id={`st-${c._id}`}
                                    value={sk}
                                    onChange={e=>updateStatus(c._id,e.target.value)}
                                    className="ad-select rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                                  >
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                          {filtered.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-6 py-20 text-center">
                                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-indigo-400">
                                    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="m16 16 4 4" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <p className="font-semibold text-slate-300">No complaints found</p>
                                <p className="mt-1.5 text-sm text-slate-500">
                                  {search || category !== 'All categories'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Civic reports will appear here once submitted.'}
                                </p>
                                {(search || category !== 'All categories') && (
                                  <button
                                    onClick={() => { setSearch(''); setCategory('All categories'); }}
                                    className="mt-4 rounded-xl bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                  >
                                    Clear filters
                                  </button>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Activity feed */}
                  <ActivityFeed complaints={complaints} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

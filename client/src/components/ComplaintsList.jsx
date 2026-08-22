import { useEffect, useState } from 'react';
import { getComplaints } from '../api/complaints';

const severityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export default function ComplaintsList({ refreshKey }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints()
      .then(setComplaints)
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center text-slate-400">Loading complaints...</div>
      </section>
    );
  }

  if (complaints.length === 0) return null;

  return (
    <section className="border-t border-white/5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Recent Reports
        </h2>

        <div className="mt-10 space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-500/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-white">{c.category}</p>
                <span className={`text-sm font-medium capitalize ${severityColors[c.severity] || 'text-slate-400'}`}>
                  {c.severity}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{c.summary || c.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>{c.suggestedDepartment}</span>
                <span className="capitalize">{c.status}</span>
                {c.incident?.reportCount > 1 && (
                  <span className="font-medium text-violet-300">✨ {c.incident.reportCount} reports, one incident</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

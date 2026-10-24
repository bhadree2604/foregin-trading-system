/**
 * KPI stat card for dashboards.
 * @param {string} label
 * @param {string|number} value
 * @param {React.ReactNode} icon
 * @param {string} color - Tailwind color class for icon bg, e.g. 'bg-blue-100 text-blue-600'
 * @param {string} [trend] - e.g. '+12%'
 * @param {'up'|'down'|null} [trendDir]
 * @param {string} [subtitle]
 */
export default function StatCard({ label, value, icon, color = 'bg-blue-100 text-blue-600', trend, trendDir, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <span
            className={`text-xs font-medium mt-1 inline-block ${
              trendDir === 'up' ? 'text-emerald-600' : trendDir === 'down' ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : ''} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

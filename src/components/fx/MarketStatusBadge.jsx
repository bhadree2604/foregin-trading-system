import React from 'react';

const STATUS_CONFIG = {
  LIVE:        { label: 'LIVE',       bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500 animate-pulse', border: 'border-emerald-200' },
  DELAYED:     { label: 'DELAYED',    bg: 'bg-amber-500/15',   text: 'text-amber-600',   dot: 'bg-amber-500',                 border: 'border-amber-200' },
  STALE:       { label: 'STALE',      bg: 'bg-orange-500/15',  text: 'text-orange-600',  dot: 'bg-orange-500',                border: 'border-orange-200' },
  STALE_CACHE: { label: 'STALE',      bg: 'bg-orange-500/15',  text: 'text-orange-600',  dot: 'bg-orange-500',                border: 'border-orange-200' },
  OFFLINE:     { label: 'OFFLINE',    bg: 'bg-red-500/15',     text: 'text-red-600',     dot: 'bg-red-500',                   border: 'border-red-200' },
  UNAVAILABLE: { label: 'UNAVAILABLE',bg: 'bg-red-500/15',     text: 'text-red-600',     dot: 'bg-red-500',                   border: 'border-red-200' },
  OK:          { label: 'LIVE',       bg: 'bg-emerald-500/15', text: 'text-emerald-600', dot: 'bg-emerald-500 animate-pulse', border: 'border-emerald-200' },
  LOADING:     { label: 'LOADING',    bg: 'bg-slate-100',      text: 'text-slate-500',   dot: 'bg-slate-400 animate-pulse',   border: 'border-slate-200' },
};

export default function MarketStatusBadge({ status = 'LOADING', size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.LOADING;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

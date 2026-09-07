import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  growthLabel?: string;
  icon: React.ReactNode;
  accentColor?: 'amber' | 'emerald' | 'sky' | 'indigo' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  growth,
  growthLabel = 'from yesterday',
  icon,
  accentColor = 'amber',
}) => {
  const isPositive = growth !== undefined && growth >= 0;

  const colorStyles = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    sky: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>

        <div className={clsx('p-3 rounded-xl border', colorStyles[accentColor])}>
          {icon}
        </div>
      </div>

      {growth !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs">
          <span
            className={clsx(
              'inline-flex items-center font-bold px-1.5 py-0.5 rounded',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isPositive ? `+${growth}%` : `${growth}%`}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{growthLabel}</span>
        </div>
      )}
    </div>
  );
};

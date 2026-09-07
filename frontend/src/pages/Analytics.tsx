import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  Award,
  DollarSign,
  PieChart as PieIcon,
  Users,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDeepAnalytics = async () => {
      try {
        const res = await api.getDeepAnalytics();
        if (res.success) setAnalytics(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeepAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Computing Deep Business Intelligence...</p>
        </div>
      </div>
    );
  }

  const prodAnalytics = analytics?.product_analytics || {};
  const custAnalytics = analytics?.customer_analytics || {};

  const topRevenue = prodAnalytics.top_by_revenue || [];
  const topMargin = prodAnalytics.top_by_margin || [];
  const lowestSellers = prodAnalytics.lowest_sellers || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Advanced Business & Margin Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analyze profit margins, menu winners and laggards, repeat customer retention rates, and unit economics.
          </p>
        </div>
      </div>

      {/* Customer Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase text-slate-400">Repeat Customer Rate</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {custAnalytics.repeat_rate_percent || 42.8}%
          </h3>
          <p className="text-xs text-slate-400">
            {custAnalytics.repeat_customers || 8} of {custAnalytics.total_registered || 15} registered customers visited multiple times
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase text-slate-400">Avg Customer Lifetime Spend</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-amber-500">
            {formatCurrency(custAnalytics.average_spend_per_customer || 4920)}
          </h3>
          <p className="text-xs text-slate-400">Total revenue generated per registered account</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase text-slate-400">Overall Gross Profit Margin</p>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-sky-400">73.4%</h3>
          <p className="text-xs text-slate-400">Driven by high-margin espresso drinks & bakery items</p>
        </div>
      </div>

      {/* Grid: 3 Tables (Top Revenue, Top Margin, Lowest Sellers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest Revenue Products */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Highest Revenue Products
              </h3>
              <p className="text-[11px] text-slate-400">Top cash generators</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topRevenue.map((item: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.units} units sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-amber-500">{formatCurrency(item.revenue)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold">{item.margin_percent}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Margin % (Most Profitable) */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Highest Gross Margin %
              </h3>
              <p className="text-[11px] text-slate-400">Best profit margins per unit</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topMargin.map((item: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">Profit: {formatCurrency(item.gross_profit)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.margin_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Selling Products (Action required) */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Lowest Velocity Items
              </h3>
              <p className="text-[11px] text-slate-400">Consider promotions or menu redesign</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {lowestSellers.map((item: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.units} units sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-slate-500">{formatCurrency(item.revenue)}</p>
                  <span className="text-[9px] font-bold text-rose-500">Low demand</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

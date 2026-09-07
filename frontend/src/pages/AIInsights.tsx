import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  TrendingUp,
  Package,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  Coffee,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await api.getAIInsights();
        if (res.success) setInsights(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAI();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Generating AI Forecasting Models...</p>
        </div>
      </div>
    );
  }

  const forecast = insights?.sales_forecast;
  const demandList = insights?.demand_predictions || [];
  const inventoryRisks = insights?.inventory_risks || [];
  const recommendations = insights?.recommendations || [];
  const productInsights = insights?.product_insights || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-indigo-500/15 p-6 rounded-3xl border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Business Insights & Demand Forecasting
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Intelligent statistical forecasting algorithms predicting next-day revenue, raw ingredient depletion, and revenue growth opportunities.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shrink-0">
          <Zap className="w-3.5 h-3.5 fill-current" /> Active Prediction Engine
        </span>
      </div>

      {/* 1. SALES FORECAST HERO */}
      {forecast && (
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Next-Day Sales Revenue Forecast
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {forecast.confidenceScore}% Confidence Interval
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Expected Sales Tomorrow</p>
              <p className="text-2xl font-black text-amber-500">
                {formatCurrency(forecast.predictedRevenueTomorrow.min)} – {formatCurrency(forecast.predictedRevenueTomorrow.max)}
              </p>
              <p className="text-[11px] text-slate-500">Baseline Likely: {formatCurrency(forecast.predictedRevenueTomorrow.likely)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Projected Orders Volume</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {forecast.predictedOrdersTomorrow.min} – {forecast.predictedOrdersTomorrow.max} Bills
              </p>
              <p className="text-[11px] text-emerald-500 font-semibold">+{forecast.growthFactor}% vs weekly average</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Traffic Rush Window</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                {forecast.dayOfWeekPattern}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEMAND PREDICTIONS & INVENTORY RUNOUT FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Predictions */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Item Demand Spike Predictions
              </h3>
              <p className="text-[11px] text-slate-400">Projected tomorrow based on consumption patterns</p>
            </div>
          </div>

          <div className="space-y-3">
            {demandList.map((item: any, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{item.productName}</p>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.velocityTrend === 'SURGING'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.velocityTrend} ({item.expectedUnits} cups)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.reason}</p>
                <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Peak Window: {item.peakTimeSlot}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Exhaustion Risk */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Raw Material Runout Risk Timeline
                </h3>
                <p className="text-[11px] text-slate-400">Estimated days until exhaustion at current burn rate</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-amber-500 font-bold hover:underline"
            >
              Restock
            </button>
          </div>

          <div className="space-y-3">
            {inventoryRisks.slice(0, 5).map((risk: any, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{risk.ingredientName}</p>
                  <p className="text-[11px] text-slate-400">
                    Stock: <span className="font-bold text-slate-700 dark:text-slate-300">{risk.currentStock} {risk.unit}</span> (Burn: ~{risk.dailyBurnRate} {risk.unit}/day)
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                      risk.urgency === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                        : risk.urgency === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    ~{risk.estimatedDaysRemaining} Days Left
                  </span>
                  <p className="text-[9px] text-slate-500 mt-0.5">Reorder: {risk.recommendedReorderQty} {risk.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRODUCT INSIGHTS CALLOUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productInsights.map((pi: any, idx: number) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
          >
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {pi.badge}
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pi.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pi.insight}</p>
          </div>
        ))}
      </div>

      {/* 4. BUSINESS ACTION RECOMMENDATIONS */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Actionable Business Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec: any) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    {rec.category}
                  </span>
                  <Badge variant={rec.impact === 'HIGH' ? 'critical' : 'warning'}>
                    {rec.impact} IMPACT
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[240px]">
                  💡 {rec.actionableStep}
                </span>
                <button
                  onClick={() => {
                    if (rec.category === 'INVENTORY') navigate('/inventory');
                    else if (rec.category === 'REVENUE' || rec.category === 'PRICING') navigate('/pos');
                    else navigate('/dashboard');
                  }}
                  className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1 shrink-0"
                >
                  Take Action <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

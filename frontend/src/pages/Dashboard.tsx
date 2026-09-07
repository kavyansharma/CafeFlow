import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Invoice } from '../types';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [aiInsights, setAIInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, salesRes, aiRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getSalesSummary({ range: '7d' }),
          api.getAIInsights(),
        ]);

        if (dashRes.success) setData(dashRes);
        if (salesRes.success) setSalesSummary(salesRes);
        if (aiRes.success) setAIInsights(aiRes.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Loading Dashboard Telemetry...</p>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {
    today_revenue: 28450,
    revenue_growth: 12.5,
    today_orders: 42,
    orders_growth: 8.2,
    average_order_value: 185,
    aov_growth: 4.1,
    total_customers: 1245,
    customer_growth: 6.8,
  };

  const topProducts = data?.top_selling_products || [];
  const lowStock = data?.low_stock_alerts || [];
  const recentTxns = data?.recent_transactions || [];
  const hourlyData = data?.hourly_pattern || [];
  const categoryPerf = salesSummary?.category_performance || [];
  const paymentMethods = salesSummary?.payment_methods || [];
  const forecast = aiInsights?.sales_forecast;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase">
              Live POS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time business health, hourly revenue velocity, stock thresholds, and AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pos')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" /> Open POS Billing (F2)
          </button>
        </div>
      </div>

      {/* AI Quick Alert Bar */}
      {forecast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-amber-500/10 border border-sky-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Sales Forecast for Tomorrow:</span>
                <span className="text-amber-500 font-extrabold">
                  {formatCurrency(forecast.predictedRevenueTomorrow.min)} – {formatCurrency(forecast.predictedRevenueTomorrow.max)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold">
                  {forecast.confidenceScore}% Confidence
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {forecast.dayOfWeekPattern}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai-insights')}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold shrink-0 flex items-center gap-1"
          >
            View Insights <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(kpi.today_revenue)}
          growth={kpi.revenue_growth}
          growthLabel="from yesterday"
          icon={<IndianRupee className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatCard
          title="Today's Orders"
          value={`${kpi.today_orders} Orders`}
          growth={kpi.orders_growth}
          growthLabel="from last week"
          icon={<ShoppingBag className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(kpi.average_order_value)}
          growth={kpi.aov_growth}
          growthLabel="vs monthly average"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="sky"
        />
        <StatCard
          title="Total Customers"
          value={kpi.total_customers.toLocaleString()}
          growth={kpi.customer_growth}
          growthLabel="loyalty registrations"
          icon={<Users className="w-5 h-5" />}
          accentColor="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Over Time / Hourly Curve */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Pattern & Hourly Rush</h3>
              <p className="text-xs text-slate-400">Intraday transaction volume and peak hour trends</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Peak: 6:00 PM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c3242" opacity={0.3} />
                <XAxis dataKey="hour" stroke="#8f9bb3" fontSize={11} />
                <YAxis stroke="#8f9bb3" fontSize={11} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b24', borderColor: '#2c3242', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category (Donut) */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue by Category</h3>
            <p className="text-xs text-slate-400">Sales volume contribution</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {categoryPerf.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerf}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="revenue"
                  >
                    {categoryPerf.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181b24', borderColor: '#2c3242', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No category breakdown data</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryPerf.slice(0, 4).map((cat: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-500 dark:text-slate-400 truncate">{cat.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cat.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Top Selling Products
              </h3>
              <p className="text-xs text-slate-400">High velocity items by units sold and revenue</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
            >
              View Menu <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5 text-center">Units Sold</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {topProducts.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-amber-500 font-black">
                        {idx + 1}
                      </span>
                      {p.name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{p.category}</td>
                    <td className="py-3 text-center font-bold text-slate-900 dark:text-white">{p.units}</td>
                    <td className="py-3 text-right font-black text-amber-500">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Low Stock Alerts
              </h3>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold"
            >
              Inventory
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
            {lowStock.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-500 font-bold">
                All inventory items above safety thresholds!
              </div>
            ) : (
              lowStock.map((alert: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{alert.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {alert.remaining} remaining (Min: {alert.threshold})
                    </p>
                  </div>
                  <Badge variant={alert.status === 'Critical' ? 'critical' : 'warning'}>
                    {alert.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">Latest completed POS billing invoices</p>
          </div>
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1"
          >
            All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Invoice #</th>
                <th className="py-2.5">Customer</th>
                <th className="py-2.5">Payment Method</th>
                <th className="py-2.5">Time</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTxns.map((txn: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors font-medium">
                  <td className="py-3 font-mono font-bold text-amber-500">{txn.invoice_number}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{txn.customer}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                      {txn.payment_method === 'UPI' && <QrCode className="w-3.5 h-3.5 text-sky-400" />}
                      {txn.payment_method === 'CASH' && <Banknote className="w-3.5 h-3.5 text-emerald-400" />}
                      {txn.payment_method === 'CARD' && <CreditCard className="w-3.5 h-3.5 text-amber-400" />}
                      {txn.payment_method}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{formatDateTime(txn.time)}</td>
                  <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant="success">PAID</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.getInvoiceById(txn.invoice_number);
                          if (res.success) setSelectedInvoice(res.data);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-[11px] text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

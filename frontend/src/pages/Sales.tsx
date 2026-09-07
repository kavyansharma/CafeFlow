import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  BarChart3,
  Calendar,
  Download,
  IndianRupee,
  ShoppingBag,
  Percent,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Sales: React.FC = () => {
  const [range, setRange] = useState<string>('7d');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSalesSummary({
        range,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [range]);

  const handleExportCSV = () => {
    window.open('/api/sales/export', '_blank');
  };

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  const summary = data?.summary || {
    gross_sales: 0,
    total_tax: 0,
    total_discounts: 0,
    net_sales: 0,
    total_orders: 0,
    average_order_value: 0,
  };

  const trends = data?.trends || [];
  const paymentMethods = data?.payment_methods || [];
  const categoryPerformance = data?.category_performance || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sales & Revenue Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit tax invoices, discounts, net gross earnings, payment modes, and export data for accounting.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV Spreadsheet
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#181b24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
          {[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Custom Range', value: 'custom' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === opt.value
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
            <button
              onClick={fetchSalesData}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* 6 Key Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Gross Sales</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(summary.gross_sales)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-emerald-500">Discounts</p>
          <p className="text-lg font-black text-emerald-500">-{formatCurrency(summary.total_discounts)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">GST / Taxes</p>
          <p className="text-lg font-black text-slate-700 dark:text-slate-300">+{formatCurrency(summary.total_tax)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-transparent border border-amber-500/30 space-y-1">
          <p className="text-[10px] uppercase font-bold text-amber-500">Net Revenue</p>
          <p className="text-lg font-black text-amber-500">{formatCurrency(summary.net_sales)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Orders</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{summary.total_orders}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Avg Ticket (AOV)</p>
          <p className="text-lg font-black text-sky-400">{formatCurrency(summary.average_order_value)}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Sales Trajectory</h3>
            <p className="text-xs text-slate-400">Daily net billings over selected time horizon</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c3242" opacity={0.3} />
                <XAxis dataKey="date" stroke="#8f9bb3" fontSize={11} tickFormatter={d => formatDate(d)} />
                <YAxis stroke="#8f9bb3" fontSize={11} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b24', borderColor: '#2c3242', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                  labelFormatter={l => formatDate(String(l))}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Method Distribution</h3>
            <p className="text-xs text-slate-400">Share of Cash vs UPI vs Card</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {paymentMethods.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#181b24', borderColor: '#2c3242', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {paymentMethods.map((pm: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{pm.method}</span>
                  <span className="text-[10px] text-slate-400">({pm.orders} bills)</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">{formatCurrency(pm.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance Bar Chart */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Category Revenue Performance
          </h3>
          <p className="text-xs text-slate-400">Total sales amount generated per product department</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3242" opacity={0.3} />
              <XAxis dataKey="name" stroke="#8f9bb3" fontSize={11} />
              <YAxis stroke="#8f9bb3" fontSize={11} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#181b24', borderColor: '#2c3242', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

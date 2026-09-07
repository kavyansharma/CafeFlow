import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CafeSettings } from '../types';
import { useNotifications } from '../context/NotificationContext';
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CafeSettings>({
    cafe_name: 'CAFEFLOW Coffee & Roastery',
    tagline: 'Smart Billing. Smarter Cafe.',
    address: 'Shop 4-5, Ground Floor, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    phone: '+91 80 4123 9876',
    email: 'hello@cafeflow.com',
    gstin: '29ABCDE1234F1Z5',
    currency: '₹',
    invoice_prefix: 'CF-2026-',
    default_gst_rate: 5,
    loyalty_spend_per_point: 100,
    loyalty_point_value: 1.0,
    max_discount_percent: 30,
    enable_ai_insights: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success) setSettings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        showToast('success', 'Settings Saved', 'Cafe profile and billing preferences updated');
      }
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System & Cafe Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure cafe branding, invoice numbering, default GST tax rates, and customer loyalty reward tiers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Cafe Profile */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Store className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Cafe Profile & Tax Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cafe Outlet Name *</label>
              <input
                type="text"
                required
                value={settings.cafe_name}
                onChange={e => setSettings({ ...settings, cafe_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GSTIN (Tax Registration)</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={e => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Store Address (Printed on Invoices)</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Billing & Invoicing Preferences */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Billing & Tax Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={settings.invoice_prefix}
                onChange={e => setSettings({ ...settings, invoice_prefix: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={settings.default_gst_rate}
                onChange={e => setSettings({ ...settings, default_gst_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Allowable Discount (%)</label>
              <input
                type="number"
                value={settings.max_discount_percent}
                onChange={e => setSettings({ ...settings, max_discount_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. Loyalty Program Rules */}
        <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Loyalty Rewards Program
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Spend Required per 1 Loyalty Point (₹)
              </label>
              <input
                type="number"
                value={settings.loyalty_spend_per_point}
                onChange={e => setSettings({ ...settings, loyalty_spend_per_point: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">e.g. ₹100 spent = 1 point earned</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Point Redemption Cash Value (₹ per pt)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.loyalty_point_value}
                onChange={e => setSettings({ ...settings, loyalty_point_value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">e.g. 1 point = ₹1.00 discount on billing</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

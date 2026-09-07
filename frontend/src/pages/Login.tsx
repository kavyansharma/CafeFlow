import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Shield, Sparkles, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('owner@cafeflow.com');
  const [password, setPassword] = useState('owner123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: Role, demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      navigate(role === 'CASHIER' ? '/pos' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0c10] bg-radial flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 font-black shadow-glow-amber mb-2">
            <Coffee className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wider flex items-center justify-center gap-2">
            CAFEFLOW
          </h1>
          <p className="text-xs font-semibold text-amber-500/90 tracking-widest uppercase">
            Smart Billing. Smarter Cafe.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#141720]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@cafeflow.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                Remember me
              </label>
              <span className="text-amber-500 hover:underline cursor-pointer text-[11px]">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Verifying Session...</span>
              ) : (
                <>
                  <span>Sign In to POS System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Instant Demo Role Access
              </p>
              <span className="text-[10px] text-slate-500">1-Click Login</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('OWNER', 'owner@cafeflow.com', 'owner123')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 transition-all text-left group"
              >
                <p className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300">Owner</p>
                <p className="text-[9px] text-slate-500">Full System</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('MANAGER', 'manager@cafeflow.com', 'manager123')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 transition-all text-left group"
              >
                <p className="text-[11px] font-bold text-sky-400 group-hover:text-sky-300">Manager</p>
                <p className="text-[9px] text-slate-500">Inventory & Sales</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('CASHIER', 'cashier@cafeflow.com', 'cashier123')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 transition-all text-left group"
              >
                <p className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">Cashier</p>
                <p className="text-[9px] text-slate-500">Fast POS Billing</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          CAFEFLOW POS v1.0.0 Commercial Edition • All Rights Reserved
        </p>
      </div>
    </div>
  );
};

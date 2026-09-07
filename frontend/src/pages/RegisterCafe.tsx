import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Coffee,
  Building2,
  MapPin,
  Utensils,
  CreditCard,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

export const RegisterCafe: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form State
  const [cafeName, setCafeName] = useState('');
  const [tagline, setTagline] = useState('Artisanal Brews & Fresh Bakes');
  const [concept, setConcept] = useState<'roastery' | 'bakery' | 'bistro' | 'tea'>('roastery');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [gstin, setGstin] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [defaultGstRate, setDefaultGstRate] = useState(5);
  const [loyaltySpendPerPoint, setLoyaltySpendPerPoint] = useState(100);
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const { registerCafe } = useAuth();
  const navigate = useNavigate();

  const handleCafeNameChange = (val: string) => {
    setCafeName(val);
    if (!invoicePrefix || invoicePrefix.length <= 4) {
      const prefix = val.trim().substring(0, 3).toUpperCase();
      setInvoicePrefix(prefix ? `${prefix}-2026-` : 'CF-2026-');
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!cafeName.trim()) {
        setError('Please enter your cafe name.');
        return;
      }
    } else if (step === 2) {
      if (!address.trim() || !phone.trim()) {
        setError('Please provide cafe address and contact phone number.');
        return;
      }
    } else if (step === 4) {
      if (!invoicePrefix.trim()) {
        setError('Please specify an invoice prefix for POS bills.');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all owner account details.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCafe({
        cafe_name: cafeName,
        owner_name: ownerName,
        email,
        phone,
        password,
        address: `${address}, ${city}`,
        gstin,
        currency,
        invoice_prefix: invoicePrefix,
        business_type: concept,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register cafe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0c10] bg-radial flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      {/* Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 my-8">
        {/* Brand */}
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black shadow-glow-amber mb-1">
            <Coffee className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            Register New Cafe Tenant
          </h1>
          <p className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
            5-Step Fast SaaS Onboarding
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { num: 1, label: 'Identity', icon: Building2 },
            { num: 2, label: 'Location', icon: MapPin },
            { num: 3, label: 'Concept', icon: Utensils },
            { num: 4, label: 'Billing', icon: CreditCard },
            { num: 5, label: 'Owner', icon: UserCheck },
          ].map(s => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="text-center space-y-1">
                <div
                  className={clsx(
                    'h-1.5 rounded-full transition-all',
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800'
                  )}
                />
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={clsx(
                      'text-[10px] font-bold',
                      isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-slate-600'
                    )}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="bg-[#141720]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Cafe Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>Cafe Name & Branding</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Give your cafe an identity. This will appear on all invoices, POS receipts, and kitchen tickets.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cafe / Business Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cafeName}
                  onChange={e => handleCafeNameChange(e.target.value)}
                  placeholder="e.g., Mountain Roast Espresso Bar"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tagline / Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g., Artisanal Coffee & Fresh Sourdough"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tenant URL Preview</label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 truncate">
                  https://cafeflow.app/tenant/
                  <span className="text-white font-bold">
                    {cafeName ? cafeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'your-cafe'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Contact */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span>Location & Contact Details</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your physical cafe address and phone number for invoice printouts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Physical Store Address <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g., Shop 12, 100ft Road, Indiranagar"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g., Bengaluru"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Phone Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">GSTIN / Tax Registration (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g., 29ABCDE1234F1Z5"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Concept & Starter Menu */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  <span>Cafe Concept & Starter Menu</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your concept to automatically generate starter categories, recipes, and raw materials.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'roastery',
                    title: 'Specialty Coffee & Roastery',
                    desc: 'Espresso, pour overs, cold brews, and artisan coffee beans.',
                  },
                  {
                    id: 'bakery',
                    title: 'Bakery & Viennoiserie',
                    desc: 'Croissants, sourdough breads, cheesecakes, and pastries.',
                  },
                  {
                    id: 'bistro',
                    title: 'Cafe & All-Day Bistro',
                    desc: 'Paninis, pasta bowls, salads, shakes, and gourmet bites.',
                  },
                  {
                    id: 'tea',
                    title: 'Chai & Tea Lounge',
                    desc: 'Specialty masala chais, green teas, and finger snacks.',
                  },
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConcept(c.id as any)}
                    className={clsx(
                      'p-4 rounded-2xl border text-left transition-all relative',
                      concept === c.id
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    )}
                  >
                    {concept === c.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 absolute top-3 right-3" />
                    )}
                    <p className="text-xs font-bold text-white">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>We will auto-populate 5 starter menu items with COGS recipe calculations.</span>
              </div>
            </div>
          )}

          {/* STEP 4: POS & Billing Setup */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span>POS & Billing Configurations</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure tax rates, invoice sequencing, and loyalty point rewards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Invoice Prefix <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoicePrefix}
                    onChange={e => setInvoicePrefix(e.target.value.toUpperCase())}
                    placeholder="e.g., MR-2026-"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Default GST Rate (%)</label>
                  <select
                    value={defaultGstRate}
                    onChange={e => setDefaultGstRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={5}>5% (Standard Cafe & F&B)</option>
                    <option value={12}>12% (Packaged Beverages)</option>
                    <option value={18}>18% (Commercial Goods)</option>
                    <option value={0}>0% (Tax Exempt)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Currency Symbol</label>
                <div className="flex gap-2">
                  {['₹', '$', '€', '£', 'AED'].map(curr => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={clsx(
                        'flex-1 py-2 rounded-xl text-xs font-bold border transition-colors',
                        currency === curr
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Owner Account & Confirmation */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  <span>Master Owner Account</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create your administrator credentials to manage your cafe's POS and billing system.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Owner Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g., Tanya Sen"
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Owner Email <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tanya@mycafe.com"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 chars"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Summary recap */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Review Configuration</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Cafe:</span> <span className="text-white font-bold">{cafeName || 'My Cafe'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Prefix:</span> <span className="text-white font-mono">{invoicePrefix || 'CF-2026-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span> <span className="text-white">{city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tax Rate:</span> <span className="text-white">{defaultGstRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="agree" className="text-xs text-slate-400 cursor-pointer">
                  I agree to create an isolated CAFEFLOW tenant database and master owner credentials.
                </label>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors"
              >
                ← Back to Login
              </Link>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !agreeTerms}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all ml-auto cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Initializing Tenant...</span>
                ) : (
                  <>
                    <span>Launch Cafe POS</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strict Tenant Isolation • Isolated Products, Orders, & Shifts</span>
        </div>
      </div>
    </div>
  );
};

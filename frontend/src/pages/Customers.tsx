import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Customer } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import {
  Users,
  Search,
  UserPlus,
  Award,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  History,
  TrendingUp,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Add Customer Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const { setCustomer: setCartCustomer } = useCart();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers(searchQuery);
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleOpenDetail = async (c: Customer) => {
    try {
      const res = await api.getCustomerById(c.id);
      if (res.success) {
        setSelectedCustomer(res.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const res = await api.createCustomer({ name, phone, email, notes });
      if (res.success) {
        showToast('success', 'Customer Added', `${name} registered with loyalty program`);
        setIsAddOpen(false);
        setName('');
        setPhone('');
        setEmail('');
        setNotes('');
        fetchCustomers();
      }
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const handleStartOrderForCustomer = (cust: Customer) => {
    setCartCustomer(cust);
    setIsDetailOpen(false);
    navigate('/pos');
    showToast('info', 'Customer Attached', `Switched active POS cart to ${cust.name}`);
  };

  const totalLoyaltyPoints = customers.reduce((acc, c) => acc + c.loyalty_points, 0);
  const totalCustomerSpend = customers.reduce((acc, c) => acc + c.total_spent, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Relationship & Loyalty
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track customer visit frequency, purchase lifetime value, preferences, and reward point balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Profiles</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{customers.length} Members</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Active Points</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{totalLoyaltyPoints.toLocaleString()} Pts</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Lifetime Value</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalCustomerSpend)}</h3>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative bg-white dark:bg-[#181b24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search customers by name, phone (10 digits), or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Loyalty Points</th>
                <th className="py-3.5 px-4 text-center">Total Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-right">Avg Order Value</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">No customers found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs">
                        {c.name.charAt(0)}
                      </div>
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{c.phone}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.email || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-full text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Award className="w-3 h-3" /> {c.loyalty_points} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">{c.total_orders}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-semibold">
                      {formatCurrency(c.average_order_value || (c.total_orders > 0 ? c.total_spent / c.total_orders : 0))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{c.last_visit ? formatDateTime(c.last_visit) : 'Never'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleStartOrderForCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shadow-sm transition-colors"
                        >
                          POS Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCustomer?.name || 'Customer Profile'}
        subtitle={`Phone: ${selectedCustomer?.phone}`}
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Loyalty Points</p>
                <p className="text-xl font-black text-amber-500">{selectedCustomer.loyalty_points} pts</p>
                <p className="text-[9px] text-slate-500">Worth {formatCurrency(selectedCustomer.loyalty_points)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(selectedCustomer.total_spent)}
                </p>
                <p className="text-[9px] text-slate-500">{selectedCustomer.total_orders} Orders</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Average Order</p>
                <p className="text-xl font-black text-emerald-500">
                  {formatCurrency(selectedCustomer.average_order_value)}
                </p>
              </div>
            </div>

            {/* Favorite Items */}
            {selectedCustomer.favorite_products && selectedCustomer.favorite_products.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Favorite Products
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.favorite_products.map((fav: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                      {fav}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Recent Purchase History
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {selectedCustomer.order_history?.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No orders recorded yet</p>
                ) : (
                  selectedCustomer.order_history?.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono font-bold text-amber-500">{ord.invoice_number}</p>
                        <p className="text-[10px] text-slate-400">{formatDateTime(ord.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">{formatCurrency(ord.total_amount)}</p>
                        <p className="text-[10px] text-slate-500">{ord.payment_method}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleStartOrderForCustomer(selectedCustomer)}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" /> Start New Bill for {selectedCustomer.name}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer"
        subtitle="Add customer to loyalty program and begin tracking points"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (10 digits) *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9820011223"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. vikram@gmail.com"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferences / Coffee Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Prefers oat milk latte, regular work from cafe customer"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

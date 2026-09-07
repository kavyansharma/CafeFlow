import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Role } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';
import { formatDateTime } from '../utils/formatters';
import {
  UserCog,
  UserPlus,
  ShieldCheck,
  Lock,
  History,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
} from 'lucide-react';

export const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'staff' | 'logs'>('staff');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('CASHIER');
  const [password, setPassword] = useState('password123');
  const [isActive, setIsActive] = useState(true);

  const { showToast } = useNotifications();

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        api.getStaff(),
        api.getAuditLogs(),
      ]);
      if (sRes.success) setStaffList(sRes.data);
      if (aRes.success) setAuditLogs(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('');
    setRole('CASHIER');
    setPassword('password123');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingStaff(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role);
    setPassword('');
    setIsActive(user.is_active !== undefined ? user.is_active : true);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      if (editingStaff) {
        const payload: any = { name, phone, role, is_active: isActive };
        if (password) payload.password = password;
        const res = await api.updateStaff(editingStaff.id, payload);
        if (res.success) {
          showToast('success', 'Staff Updated', `${name}'s account updated`);
        }
      } else {
        const res = await api.createStaff({ name, email, phone, role, password });
        if (res.success) {
          showToast('success', 'Staff Member Added', `${name} created with role ${role}`);
        }
      }
      setIsModalOpen(false);
      fetchStaffData();
    } catch (err: any) {
      showToast('error', 'Operation Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff & Role-Based Access Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage cafe employees, assign granular POS permissions, and inspect system audit logs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UserCog className="w-3.5 h-3.5" /> Team Members ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Security & Activity Log ({auditLogs.length})
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {activeTab === 'staff' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 text-center">Assigned Role</th>
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading staff...</td>
                  </tr>
                ) : (
                  staffList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-amber-500 flex items-center justify-center font-black">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{u.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'OWNER'
                              ? 'bg-amber-500 text-slate-950'
                              : u.role === 'MANAGER'
                              ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {u.is_active !== false ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="critical">Deactivated</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDateTime(u.created_at)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          Edit Role / Pass
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{formatDateTime(log.created_at)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.user_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-500">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? `Edit: ${editingStaff.name}` : 'Add New Staff Member'}
        subtitle="Manage login access and role permissions"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sen"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address (Login) *</label>
            <input
              type="email"
              required
              disabled={Boolean(editingStaff)}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. rahul@cafeflow.com"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role & Permissions *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            >
              <option value="CASHIER">CASHIER (POS Billing, Customers, Shift, Invoices)</option>
              <option value="MANAGER">MANAGER (+ Products, Inventory, Recipes, Reports, Analytics)</option>
              <option value="OWNER">OWNER (+ Full Access, Staff Management, Settings, AI)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {editingStaff ? 'Reset Password (Leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingStaff}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={editingStaff ? 'Enter new password...' : '••••••••'}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {editingStaff && (
            <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              Account Active
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              {editingStaff ? 'Update Staff Account' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Coffee,
  Package,
  BookOpen,
  Users,
  UserCog,
  Clock,
  BarChart3,
  TrendingUp,
  Receipt,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Coffee as CafeLogo,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles: Role[];
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'POS Billing',
      path: '/pos',
      icon: <CreditCard className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
      badge: 'F2 Live',
    },
    {
      name: 'Products',
      path: '/products',
      icon: <Coffee className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <Package className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Recipes / BOM',
      path: '/recipes',
      icon: <BookOpen className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Staff & Roles',
      path: '/staff',
      icon: <UserCog className="w-5 h-5" />,
      allowedRoles: ['OWNER'],
    },
    {
      name: 'Shifts',
      path: '/shifts',
      icon: <Clock className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'Sales Reports',
      path: '/sales',
      icon: <BarChart3 className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      name: 'Invoices',
      path: '/invoices',
      icon: <Receipt className="w-5 h-5" />,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      name: 'AI Insights',
      path: '/ai-insights',
      icon: <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />,
      allowedRoles: ['OWNER', 'MANAGER'],
      badge: 'AI',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <SettingsIcon className="w-5 h-5" />,
      allowedRoles: ['OWNER'],
    },
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.allowedRoles));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#181b24] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen select-none transition-all">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-glow-amber">
            <CafeLogo className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">CAFEFLOW</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                POS
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight">Smart Billing. Smarter Cafe.</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Main Navigation
        </div>
        {filteredNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className={clsx(isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-500 transition-colors')}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider',
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Role Switcher Demo Bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
          <span>Quick Role Switch</span>
          <ShieldCheck className="w-3 h-3 text-amber-500" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['OWNER', 'MANAGER', 'CASHIER'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => switchDemoRole(r)}
              className={clsx(
                'px-1 py-1 rounded text-[10px] font-bold transition-all truncate text-center',
                user?.role === r
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {r.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#181b24]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-amber-500 shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Staff'}</p>
            <span className="inline-block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {user?.role || 'CASHIER'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

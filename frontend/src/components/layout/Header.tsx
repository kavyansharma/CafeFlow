import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Check,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useShift } from '../../context/ShiftContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { currentShift, hasActiveShift } = useShift();
  const { user, currentCafe, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCafeDropdownOpen, setIsCafeDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const cafeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (cafeRef.current && !cafeRef.current.contains(e.target as Node)) {
        setIsCafeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 bg-white dark:bg-[#181b24] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 transition-colors">
      {/* Active Cafe Tenant Indicator & Dropdown */}
      <div className="relative flex items-center gap-3" ref={cafeRef}>
        <button
          onClick={() => setIsCafeDropdownOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all shadow-sm"
        >
          <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-extrabold tracking-wide max-w-[200px] truncate">
            {currentCafe?.name || 'Sunrise Cafe & Roastery'}
          </span>
          <ChevronDown className={clsx("w-3.5 h-3.5 text-amber-500/70 transition-transform", isCafeDropdownOpen && "rotate-180")} />
        </button>

        {isCafeDropdownOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-up">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Switch Tenant Environment
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  switchDemoRole('OWNER', 'sunrise-cafe');
                  setIsCafeDropdownOpen(false);
                }}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors",
                  currentCafe?.slug === 'sunrise-cafe'
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div>
                  <p className="font-bold">☕ Sunrise Cafe & Roastery</p>
                  <p className={clsx("text-[10px]", currentCafe?.slug === 'sunrise-cafe' ? "text-slate-900" : "text-slate-400")}>
                    Bengaluru • Specialty Coffee & Bakes
                  </p>
                </div>
                {currentCafe?.slug === 'sunrise-cafe' && <Check className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  switchDemoRole('OWNER', 'bean-theory');
                  setIsCafeDropdownOpen(false);
                }}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors",
                  currentCafe?.slug === 'bean-theory'
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div>
                  <p className="font-bold">🌿 Bean Theory Specialty Coffee</p>
                  <p className={clsx("text-[10px]", currentCafe?.slug === 'bean-theory' ? "text-slate-900" : "text-slate-400")}>
                    Mumbai • Pour Overs & Viennoiserie
                  </p>
                </div>
                {currentCafe?.slug === 'bean-theory' && <Check className="w-4 h-4" />}
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
              <button
                onClick={() => {
                  setIsCafeDropdownOpen(false);
                  navigate('/register-cafe');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
              >
                <span>+ Onboard New Cafe</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative max-w-xs w-full hidden lg:block ml-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in this cafe..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Active Shift Indicator */}
        <button
          onClick={() => navigate('/shifts')}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
            hasActiveShift
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 animate-pulse'
          )}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {hasActiveShift
              ? `Shift Active: ${formatCurrency(currentShift?.total_sales || 0)} (${currentShift?.total_orders || 0} bills)`
              : 'No Shift Active (Open Shift)'}
          </span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-amber-500 hover:text-amber-600 font-semibold transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications at this time</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) {
                          navigate(n.link);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={clsx(
                        'p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3',
                        !n.is_read && 'bg-amber-500/5 dark:bg-amber-500/5'
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'LOW_STOCK' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'AI_INSIGHT' && <Sparkles className="w-4 h-4 text-sky-400" />}
                        {n.type === 'PAYMENT' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'SHIFT' && <Clock className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {formatDateTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user?.name || 'Aarav Sharma'}</p>
            <p className="text-[10px] font-semibold text-amber-500 leading-none">{user?.role || 'OWNER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

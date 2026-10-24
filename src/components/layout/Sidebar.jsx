import { NavLink, useNavigate } from 'react-router-dom';
import {
  Globe, LayoutDashboard, Package, ShoppingCart, CreditCard, Truck,
  FileText, Bell, User, BarChart3, Users, Building2, Shield,
  Settings, FileCheck, Anchor, X, LogOut,
  TrendingUp, Star, ArrowRightLeft, Activity, Server, BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

const NAV_CONFIG = {
  [ROLES.BUYER]: [
    { to: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Browse Products' },
    { to: '/buyer/orders', icon: ShoppingCart, label: 'My Orders' },
    { to: '/buyer/payments', icon: CreditCard, label: 'Payments' },
    { to: '/buyer/invoices', icon: FileText, label: 'Invoices' },
    { to: '/buyer/shipments', icon: Truck, label: 'Shipments' },
    { to: '/buyer/documents', icon: FileCheck, label: 'Documents' },
    { to: '/buyer/notifications', icon: Bell, label: 'Notifications' },
    { to: '/buyer/profile', icon: User, label: 'Profile' },
    { divider: true, label: 'FX Markets' },
    { to: '/markets', icon: TrendingUp, label: 'FX Markets' },
    { to: '/converter', icon: ArrowRightLeft, label: 'Converter' },
    { to: '/markets/watchlist', icon: Star, label: 'Watchlist' },
    { to: '/paper-trading', icon: Activity, label: 'Paper Trading' },
    { to: '/positions', icon: BookOpen, label: 'Positions' },
    { to: '/markets/alerts', icon: Bell, label: 'Market Alerts' },
  ],
  [ROLES.EXPORTER]: [
    { to: '/exporter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/exporter/products', icon: Package, label: 'My Products' },
    { to: '/exporter/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/exporter/shipments', icon: Truck, label: 'Shipments' },
    { to: '/exporter/documents', icon: FileCheck, label: 'Documents' },
    { to: '/exporter/revenue', icon: BarChart3, label: 'Revenue' },
    { to: '/exporter/profile', icon: User, label: 'Profile' },
    { divider: true, label: 'FX Markets' },
    { to: '/markets', icon: TrendingUp, label: 'FX Markets' },
    { to: '/converter', icon: ArrowRightLeft, label: 'Converter' },
    { to: '/markets/watchlist', icon: Star, label: 'Watchlist' },
    { to: '/paper-trading', icon: Activity, label: 'Paper Trading' },
  ],
  [ROLES.LOGISTICS]: [
    { to: '/logistics/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/logistics/shipments', icon: Truck, label: 'Shipments' },
    { to: '/logistics/profile', icon: User, label: 'Profile' },
    { divider: true, label: 'FX Markets' },
    { to: '/markets', icon: TrendingUp, label: 'FX Markets' },
    { to: '/converter', icon: ArrowRightLeft, label: 'Converter' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/admin/shipments', icon: Truck, label: 'Shipments' },
    { to: '/admin/documents', icon: FileCheck, label: 'Documents' },
    { to: '/admin/customs', icon: Anchor, label: 'Customs' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { divider: true, label: 'FX Market' },
    { to: '/admin/market-data', icon: Server, label: 'Market Data' },
    { to: '/markets', icon: TrendingUp, label: 'FX Terminal' },
  ],
};

const ROLE_COLORS = {
  [ROLES.BUYER]: 'bg-blue-600',
  [ROLES.EXPORTER]: 'bg-emerald-600',
  [ROLES.LOGISTICS]: 'bg-orange-600',
  [ROLES.ADMIN]: 'bg-purple-600',
};

const ROLE_LABELS = {
  [ROLES.BUYER]: 'Buyer Portal',
  [ROLES.EXPORTER]: 'Exporter Portal',
  [ROLES.LOGISTICS]: 'Logistics Portal',
  [ROLES.ADMIN]: 'Admin Portal',
};

export default function Sidebar({ open, onClose }) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!userProfile) return null;

  const links = NAV_CONFIG[userProfile.role] || [];
  const roleColor = ROLE_COLORS[userProfile.role] || 'bg-blue-600';
  const roleLabel = ROLE_LABELS[userProfile.role] || 'Portal';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (_) {}
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto lg:flex
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-4 ${roleColor}`}>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <div>
              <p className="text-sm font-bold leading-tight">FTS</p>
              <p className="text-xs opacity-80">{roleLabel}</p>
            </div>
          </div>
          <button
            className="lg:hidden text-white/80 hover:text-white"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white">
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {links.map((item, idx) => {
            // Section divider
            if (item.divider) {
              return (
                <div key={`divider-${idx}`} className="px-3 pt-4 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {item.label}
                  </p>
                </div>
              );
            }

            const { to, icon: Icon, label } = item;
            return (
              <NavLink
                key={to}
                to={to}
                end={to.endsWith('dashboard')}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

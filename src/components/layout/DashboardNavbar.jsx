import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ROLE_LABELS } from '../../constants/roles';
import { formatRelativeTime } from '../../utils/dateUtils';

export default function DashboardNavbar({ onMenuClick }) {
  const { userProfile, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (_) {}
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markRead(notif.notificationId);
    setNotifOpen(false);
    if (notif.resourceId && notif.type) {
      const role = userProfile?.role;
      const routeMap = {
        ORDER_CREATED: `/${role}/orders/${notif.resourceId}`,
        ORDER_ACCEPTED: `/${role}/orders/${notif.resourceId}`,
        ORDER_REJECTED: `/${role}/orders/${notif.resourceId}`,
        PAYMENT_SUCCESS: `/${role}/payments`,
        SHIPMENT_CREATED: `/${role}/shipments/${notif.resourceId}`,
        SHIPMENT_UPDATED: `/${role}/shipments/${notif.resourceId}`,
      };
      const path = routeMap[notif.type];
      if (path) navigate(path);
    }
  };

  const roleLabel = userProfile ? ROLE_LABELS[userProfile.role] || '' : '';

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs text-slate-400 font-medium hidden sm:block">{roleLabel}</span>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <button
                      key={n.notificationId}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <div className={!n.read ? '' : 'pl-4'}>
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          {n.createdAt && (
                            <p className="text-xs text-slate-400 mt-1">
                              {formatRelativeTime(n.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <Link
                  to={`/${userProfile?.role}/notifications`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">
              {(userProfile?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-28 truncate">
              {userProfile?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <Link
                to={`/${userProfile?.role}/profile`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setUserMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              )}
              <hr className="my-1 border-slate-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Bell, CheckCheck, Clock, ArrowRight, Package, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/feedback/EmptyState';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDateTime } from '../../utils/dateUtils';

export default function BuyerNotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
      case 'ORDER_ACCEPTED':
      case 'ORDER_REJECTED':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_FAILED':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'SHIPMENT_CREATED':
      case 'SHIPMENT_UPDATED':
      case 'DELIVERY_COMPLETED':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Notifications & Alerts"
          subtitle="Real-time notifications regarding trade orders, milestone releases, and payments"
          action={
            unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )
          }
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No notifications"
                description="You are completely caught up! New order and tracking alerts will appear here."
              />
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notificationId}
                onClick={() => !n.read && markRead(n.notificationId)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  !n.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-2xs text-slate-400 shrink-0">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                  {n.resourceId && (
                    <div className="mt-2">
                      <Link
                        to={`/buyer/orders/${n.resourceId}`}
                        className="inline-flex items-center gap-1 text-2xs font-bold text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Resource</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, Package, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto py-16">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Payment Cancelled</h1>
            <p className="text-xs text-slate-500 mt-2">
              The payment session was aborted or not completed. Your purchase order remains preserved in PAYMENT_PENDING status. You can retry payment at any time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {orderId ? (
              <Link
                to={`/buyer/orders/${orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Order</span>
              </Link>
            ) : (
              <Link
                to="/buyer/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>View Purchase Orders</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

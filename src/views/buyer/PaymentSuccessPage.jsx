import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowRight, Package, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const { orderId, invoiceNumber } = location.state || {};

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-600">
              Payment Authorization Verified
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Settlement Successful</h1>
            <p className="text-xs text-slate-500 mt-2">
              Your payment has been cryptographically confirmed and recorded on the trade ledger.
              The exporter has been notified to proceed with cargo dispatch and customs manifests.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Trade Order:</span>
                <span className="font-mono font-bold text-slate-900">#{orderId.substring(0, 10).toUpperCase()}</span>
              </div>
            )}
            {invoiceNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial Invoice:</span>
                <span className="font-bold text-blue-600">{invoiceNumber}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Security:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Webhook Validated
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {orderId && (
              <Link
                to={`/buyer/orders/${orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>View Order Details</span>
              </Link>
            )}

            <Link
              to="/buyer/invoices"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Invoices Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

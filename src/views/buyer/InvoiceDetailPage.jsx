import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, Printer, ArrowLeft, Download, ShieldCheck, Building, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import ErrorState from '../../components/feedback/ErrorState';
import { getInvoice } from '../../firebase/invoices';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const inv = await getInvoice(invoiceId);
        setInvoice(inv);
      } catch (err) {
        console.warn('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Rendering official commercial invoice..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <ErrorState
            title="Invoice Not Found"
            message="Could not locate this commercial invoice record."
            action={{ label: 'Return to Invoices', onClick: () => navigate('/buyer/invoices') }}
          />
        </div>
      </DashboardLayout>
    );
  }

  const items = invoice.items || [
    {
      name: 'Trade Order Items',
      quantity: 1,
      unitPrice: invoice.subtotal || invoice.totalAmount,
      total: invoice.subtotal || invoice.totalAmount,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Screen controls (hidden when printing) */}
        <div className="no-print flex items-center justify-between">
          <Link
            to="/buyer/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Official Commercial Invoice Paper Layout */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 font-sans">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-8 border-b-2 border-slate-900 gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-black text-xl tracking-tight">
                <Building className="w-6 h-6" />
                <span>FOREIGN TRADING SYSTEM</span>
              </div>
              <p className="text-2xs text-slate-500 uppercase tracking-widest mt-1">
                Official International Commercial Invoice
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Invoice Number</span>
              <p className="text-xl font-mono font-black text-slate-900">
                {invoice.invoiceNumber || `INV-${invoice.invoiceId.substring(0, 8).toUpperCase()}`}
              </p>
              <p className="text-xs text-slate-500">
                Issued: {formatDate(invoice.generatedAt || invoice.createdAt)}
              </p>
            </div>
          </div>

          {/* Parties: Exporter & Importer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200 text-xs">
            <div className="space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                Exporter / Shipper (Seller)
              </span>
              <p className="text-sm font-bold text-slate-900">ABC Electronics India Ltd</p>
              <p className="text-slate-600">Industrial Tech Park, Chennai Port Corridor, India</p>
              <p className="text-slate-600">Tax ID / GSTIN: 33AAACR1234F1Z5</p>
            </div>

            <div className="space-y-2 sm:text-right">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                Consignee / Importer (Buyer)
              </span>
              <p className="text-sm font-bold text-slate-900">XYZ GmbH Germany</p>
              <p className="text-slate-600">HafenCity Terminal 4, Hamburg, Germany</p>
              <p className="text-slate-600">VAT ID: DE 814 592 103</p>
              <p className="text-slate-600 font-mono">Order Ref: #{invoice.orderId ? invoice.orderId.substring(0, 10).toUpperCase() : 'N/A'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-8">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-300 uppercase tracking-wider text-2xs font-bold text-slate-600">
                <tr>
                  <th className="py-3 px-2">Item Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Unit Price</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 px-2 font-medium text-slate-900">
                      {item.name}
                      <span className="block text-2xs text-slate-400 font-mono mt-0.5">
                        HS CODE: {item.hsCode || '9031.80.80'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">{Number(item.quantity).toLocaleString()}</td>
                    <td className="py-4 px-2 text-right">
                      {formatCurrency(item.unitPrice, invoice.currency || 'USD')}
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-slate-900">
                      {formatCurrency(item.total || Number(item.quantity) * Number(item.unitPrice), invoice.currency || 'USD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Total Box */}
          <div className="border-t border-slate-200 pt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(invoice.subtotal || invoice.totalAmount, invoice.currency || 'USD')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Handling:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(invoice.shippingCost || 3000, invoice.currency || 'USD')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customs Duties & Taxes:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(invoice.taxAmount || 1500, invoice.currency || 'USD')}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between font-black text-base text-slate-900">
                <span>Total Invoice:</span>
                <span className="text-blue-700 font-display">
                  {formatCurrency(invoice.totalAmount, invoice.currency || 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Confirmation Stamp */}
          <div className="mt-12 p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">PAID & SETTLED IN FULL</span>
                <span className="text-2xs text-emerald-700">
                  Settled on {formatDateTime(invoice.paidAt || invoice.createdAt)} via Authorized Gateway
                </span>
              </div>
            </div>
            <span className="font-mono text-2xs font-bold uppercase tracking-wider text-emerald-700">
              Provider Auth ID: {invoice.paymentId ? invoice.paymentId.substring(0, 10).toUpperCase() : 'VERIFIED'}
            </span>
          </div>

          {/* Legal Certification Footer */}
          <div className="mt-12 pt-6 border-t border-slate-100 text-2xs text-slate-400 text-center leading-relaxed">
            I hereby certify that this invoice is true and correct, and that the value of the goods conforms to the binding purchase agreement between exporter and importer.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

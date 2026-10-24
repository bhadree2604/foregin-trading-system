import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ArrowLeft,
  Building,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, getProduct } from '../../firebase/products';
import { createOrder } from '../../firebase/orders';
import { createNotification } from '../../firebase/notifications';
import { writeAuditLog } from '../../firebase/auditLogs';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function BuyerCreateOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const prefill = location.state || {};

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(prefill.productId || '');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(prefill.quantity || 100);
  const [destinationCountry, setDestinationCountry] = useState(prefill.destinationCountry || 'Germany');
  const [deliveryAddress, setDeliveryAddress] = useState(
    userProfile?.address || 'Terminal 4, Port of Hamburg Logistics Hub, Germany'
  );
  const [shippingMethod, setShippingMethod] = useState(prefill.shippingMethod || 'Ocean Freight');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const items = await getProducts({ limitCount: 20 });
        setProducts(items || []);
        if (prefill.productId) {
          const match = items.find((p) => p.productId === prefill.productId);
          if (match) setSelectedProduct(match);
          else {
            const single = await getProduct(prefill.productId);
            if (single) setSelectedProduct(single);
          }
        } else if (items.length > 0) {
          setSelectedProductId(items[0].productId);
          setSelectedProduct(items[0]);
          setQuantity(items[0].minimumOrderQuantity || 50);
        }
      } catch (err) {
        console.warn('Failed to load products list for order creation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, [prefill.productId]);

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.productId === prodId);
    if (prod) {
      setSelectedProduct(prod);
      setQuantity(prod.minimumOrderQuantity || 1);
    }
  };

  // Authoritative calculations
  const unitPrice = Number(selectedProduct?.price || prefill.unitPrice || 500);
  const currency = selectedProduct?.currency || prefill.currency || 'USD';
  const subtotal = unitPrice * Number(quantity);
  const shippingCost = shippingMethod === 'Air Cargo Express' ? 6500 : 3000;
  const taxAmount = 1500;
  const totalAmount = subtotal + shippingCost + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct && !prefill.productName) {
      toast.error('Please select a merchandise item.');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero.');
      return;
    }

    const moq = selectedProduct?.minimumOrderQuantity || 1;
    if (quantity < moq) {
      toast.error(`Quantity cannot be less than minimum order quantity of ${moq}.`);
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        buyerId: currentUser.uid,
        buyerCompanyId: userProfile?.companyId || currentUser.uid,
        buyerCompanyName: userProfile?.companyName || 'Corporate Buyer',
        exporterId: selectedProduct?.exporterId || prefill.exporterId || 'exporter_demo_001',
        exporterCompanyId: selectedProduct?.companyId || 'company_exporter_001',
        exporterCompany: selectedProduct?.exporterCompany || prefill.exporterCompany || 'ABC Electronics India Ltd',
        productId: selectedProduct?.productId || selectedProductId || 'demo-prod-001',
        productName: selectedProduct?.name || prefill.productName || 'Industrial Micro-Sensor Modules',
        items: [
          {
            name: selectedProduct?.name || prefill.productName || 'Industrial Micro-Sensor Modules',
            productId: selectedProduct?.productId || selectedProductId,
            quantity: Number(quantity),
            unitPrice: unitPrice,
            total: subtotal,
            hsCode: selectedProduct?.hsCode || '9031.80.80',
          },
        ],
        quantity: Number(quantity),
        unitPrice: unitPrice,
        originCountry: selectedProduct?.countryOfOrigin || prefill.originCountry || 'India',
        destinationCountry,
        deliveryAddress,
        shippingMethod,
        carrier: 'Global Ocean Freight Alliance',
        subtotal,
        shippingCost,
        taxAmount,
        otherFees: 0,
        totalAmount,
        currency,
        status: 'PENDING',
      };

      const orderId = await createOrder(orderPayload);

      // Create notification to Exporter
      if (orderPayload.exporterId) {
        await createNotification({
          userId: orderPayload.exporterId,
          title: 'New Trade Purchase Order',
          message: `Received purchase order #${orderId.substring(0, 8)} for ${quantity} units from ${userProfile?.companyName || 'Buyer'}.`,
          type: 'ORDER_CREATED',
          resourceId: orderId,
        });
      }

      // Record Audit Log
      await writeAuditLog({
        actorId: currentUser.uid,
        actorRole: 'buyer',
        action: 'ORDER_CREATED',
        resourceType: 'order',
        resourceId: orderId,
        result: 'SUCCESS',
        metadata: { totalAmount, currency, quantity },
      });

      toast.success('Trade purchase order submitted successfully! Awaiting exporter confirmation.');
      navigate(`/buyer/orders/${orderId}`);
    } catch (err) {
      console.error('Failed to submit order:', err);
      toast.error(err.message || 'Failed to submit trade order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Configuring order parameters and stock quotas..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Create International Trade Order"
          subtitle="Initiate a binding cross-border purchase order with formal trade specifications"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Input parameters */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Selection */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Merchandise Selection</span>
                </h3>

                {products.length > 0 ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Choose Export Product *
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                    >
                      {products.map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.name} — {formatCurrency(p.price, p.currency || 'USD')} (Origin: {p.countryOfOrigin || 'Intl'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {prefill.productName || 'Industrial Sensor (USD 500)'}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Order Quantity *</span>
                      <span className="text-slate-400">
                        MOQ: {selectedProduct?.minimumOrderQuantity || 50}
                      </span>
                    </div>
                    <input
                      type="number"
                      required
                      min={selectedProduct?.minimumOrderQuantity || 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit Contract Price
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(unitPrice, currency)}
                      className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Routing */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Logistics & Port Terms</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Destination Country *
                    </label>
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Germany">Germany (Port of Hamburg)</option>
                      <option value="United States">United States (Long Beach / Newark)</option>
                      <option value="United Kingdom">United Kingdom (Felixstowe)</option>
                      <option value="Singapore">Singapore (Jurong Port)</option>
                      <option value="Japan">Japan (Yokohama)</option>
                      <option value="United Arab Emirates">UAE (Jebel Ali, Dubai)</option>
                      <option value="India">India (Nhava Sheva / Chennai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Shipping Method *
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Ocean Freight">Ocean Freight (Standard FCL/LCL)</option>
                      <option value="Air Cargo Express">Air Cargo Express (Expedited)</option>
                      <option value="Multimodal Sea-Air">Multimodal Sea-Air Hybrid</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consignee Final Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street address, city, postal code, country"
                      className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary calculation & submit */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md sticky top-24 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Authoritative Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Merchandise ({quantity} × {formatCurrency(unitPrice, currency)}):
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(subtotal, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Logistics Freight Assessment:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(shippingCost, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Customs Declarations & Tariffs:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(taxAmount, currency)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Order Commitment:</span>
                    <span className="text-blue-600 font-display">
                      {formatCurrency(totalAmount, currency)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-2xs text-blue-800 leading-relaxed">
                  Upon submission, order status will enter <strong>PENDING</strong> for exporter acceptance.
                  Settlement occurs once confirmed.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submitting ? 'Creating Order...' : 'CONFIRM PURCHASE ORDER'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

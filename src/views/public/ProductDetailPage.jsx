import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Globe,
  Building,
  Scale,
  Maximize2,
  Clock,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import ErrorState from '../../components/feedback/ErrorState';
import { getProduct } from '../../firebase/products';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

// Fallback demo product for demo preview
const DEMO_PRODUCT_MAP = {
  'demo-prod-001': {
    productId: 'demo-prod-001',
    name: 'Industrial Micro-Sensor Modules (Precision Grade)',
    description: 'High precision multi-axis acceleration and temperature sensors designed for industrial machinery, heavy manufacturing plants, and IoT monitoring arrays. Built with MIL-STD ruggedized shielding and cross-talk suppression.',
    category: 'Electronics',
    hsCode: '9031.80.80',
    price: 500,
    currency: 'USD',
    quantity: 1200,
    minimumOrderQuantity: 50,
    countryOfOrigin: 'India',
    exporterId: 'exporter_demo_001',
    exporterCompany: 'ABC Electronics India Ltd',
    weight: '0.25 kg/unit',
    dimensions: '12 x 8 x 4 cm',
    shippingOptions: ['Ocean Freight (FCL/LCL)', 'Air Cargo Express', 'Multimodal Rail/Sea'],
    estimatedShippingTime: '12-18 business days (Ocean) / 3-5 business days (Air)',
    imageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'],
    status: 'active',
  },
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Order configuration state
  const [quantity, setQuantity] = useState(1);
  const [destinationCountry, setDestinationCountry] = useState('Germany');
  const [shippingMethod, setShippingMethod] = useState('Ocean Freight');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const prod = await getProduct(productId);
        if (prod) {
          setProduct(prod);
          setQuantity(prod.minimumOrderQuantity || 1);
        } else if (DEMO_PRODUCT_MAP[productId]) {
          setProduct(DEMO_PRODUCT_MAP[productId]);
          setQuantity(DEMO_PRODUCT_MAP[productId].minimumOrderQuantity || 1);
        } else {
          // Generate a sensible default if exploring any ID
          setProduct({
            productId,
            name: 'Industrial Grade Trade Merchandise',
            description: 'Certified export merchandise meeting international quality and customs compliance standards.',
            category: 'Industrial',
            hsCode: '8471.60.00',
            price: 500,
            currency: 'USD',
            quantity: 1000,
            minimumOrderQuantity: 50,
            countryOfOrigin: 'India',
            exporterCompany: 'ABC Electronics India Ltd',
            weight: '1.2 kg/unit',
            dimensions: '30 x 20 x 15 cm',
            shippingOptions: ['Standard Ocean Freight', 'Air Cargo Express'],
            estimatedShippingTime: '14-21 Business Days',
            imageUrls: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80'],
            status: 'active',
          });
          setQuantity(50);
        }
      } catch (err) {
        console.warn('Could not fetch product from Firestore, using fallback:', err);
        setProduct(DEMO_PRODUCT_MAP['demo-prod-001']);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  const handleOrderInitiation = () => {
    if (!currentUser) {
      toast.error('Please sign in as a Buyer to initiate a trade order.');
      navigate('/login?redirect=/products/' + productId);
      return;
    }

    if (userProfile?.role !== 'buyer') {
      toast.error('Only registered Importers/Buyers can create trade purchase orders.');
      return;
    }

    const moq = product.minimumOrderQuantity || 1;
    if (quantity < moq) {
      toast.error(`Order quantity must be at least minimum order quantity of ${moq}.`);
      return;
    }

    if (quantity > (product.quantity || 999999)) {
      toast.error(`Requested quantity exceeds available stock of ${product.quantity}.`);
      return;
    }

    // Pass details to Buyer Create Order page
    navigate('/buyer/orders/create', {
      state: {
        productId: product.productId,
        productName: product.name,
        unitPrice: product.price,
        currency: product.currency || 'USD',
        quantity: Number(quantity),
        originCountry: product.countryOfOrigin,
        destinationCountry,
        shippingMethod,
        exporterId: product.exporterId,
        exporterCompany: product.exporterCompany || product.companyName,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <LoadingSpinner message="Retrieving product specifications & export data..." />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <ErrorState
            title="Product Not Found"
            message="The requested trade product could not be located in our catalog."
            action={{ label: 'Return to Catalog', onClick: () => navigate('/products') }}
          />
        </div>
      </div>
    );
  }

  const subtotal = Number(product.price) * Number(quantity);
  const displayImage =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumb back */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Wholesale Catalog</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Images & Specifications */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
              <div className="aspect-16/10 bg-slate-100 relative">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Description & Trade Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  HS CODE: <span className="font-semibold text-slate-800">{product.hsCode || 'Not Specified'}</span>
                </p>
              </div>

              <div className="prose prose-sm text-slate-600 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">
                  Trade & Logistics Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Country of Origin</span>
                    </div>
                    <p className="font-bold text-slate-900">{product.countryOfOrigin || 'International'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Scale className="w-3.5 h-3.5" />
                      <span>Unit Weight</span>
                    </div>
                    <p className="font-bold text-slate-900">{product.weight || 'Standard'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Dimensions</span>
                    </div>
                    <p className="font-bold text-slate-900">{product.dimensions || 'Standard Cargo'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Package className="w-3.5 h-3.5" />
                      <span>Available Stock</span>
                    </div>
                    <p className="font-bold text-slate-900">{Number(product.quantity).toLocaleString()} Units</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Min Order Quantity</span>
                    </div>
                    <p className="font-bold text-slate-900">{product.minimumOrderQuantity || 1} Units</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lead Time</span>
                    </div>
                    <p className="font-bold text-slate-900">7-14 Days Prep</p>
                  </div>
                </div>
              </div>

              {/* Exporter Credentials */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xs uppercase tracking-wider text-blue-600 font-bold">Verified Exporter</span>
                    <p className="text-sm font-bold text-slate-900">
                      {product.exporterCompany || product.companyName || 'ABC Electronics India Ltd'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  KYC Verified
                </span>
              </div>
            </div>
          </div>

          {/* Right: Order Configuration Box */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md sticky top-24 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wholesale Unit Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900 font-display">
                    {formatCurrency(product.price, product.currency || 'USD')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ unit</span>
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Order Quantity (Units) *</span>
                    <span className="text-slate-400">MOQ: {product.minimumOrderQuantity || 1}</span>
                  </div>
                  <input
                    type="number"
                    min={product.minimumOrderQuantity || 1}
                    max={product.quantity || 999999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Country *
                  </label>
                  <select
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white cursor-pointer"
                  >
                    <option value="Germany">Germany (Hamburg Port)</option>
                    <option value="United States">United States (Los Angeles / Newark)</option>
                    <option value="United Kingdom">United Kingdom (Felixstowe)</option>
                    <option value="Singapore">Singapore (Port of Singapore)</option>
                    <option value="Japan">Japan (Yokohama)</option>
                    <option value="United Arab Emirates">UAE (Jebel Ali, Dubai)</option>
                    <option value="India">India (Nhava Sheva / Chennai)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Freight / Shipping Method *
                  </label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white cursor-pointer"
                  >
                    <option value="Ocean Freight">Ocean Freight (Standard FCL/LCL)</option>
                    <option value="Air Cargo Express">Air Cargo Express (Priority)</option>
                    <option value="Multimodal Sea-Air">Multimodal Sea-Air Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Live Cost Estimation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Merchandise Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal, product.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Freight & Handling:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(shippingMethod === 'Air Cargo Express' ? 6500 : 3000, product.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Customs & Tariff Assessment:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(1500, product.currency || 'USD')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Estimated Total Commitment:</span>
                  <span className="text-blue-600 font-display">
                    {formatCurrency(subtotal + (shippingMethod === 'Air Cargo Express' ? 6500 : 3000) + 1500, product.currency || 'USD')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOrderInitiation}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:translate-y-[-1px] cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>CREATE TRADE ORDER</span>
              </button>

              <p className="text-2xs text-center text-slate-400">
                Formal commercial invoices and authorized payment sessions will be initiated upon exporter confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

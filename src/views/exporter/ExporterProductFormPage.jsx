import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, getProduct, updateProduct } from '../../firebase/products';
import toast from 'react-hot-toast';

export default function ExporterProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const isEditing = Boolean(productId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    hsCode: '',
    price: '',
    currency: 'USD',
    quantity: '',
    minimumOrderQuantity: '10',
    countryOfOrigin: userProfile?.country || 'India',
    weight: '0.5 kg/unit',
    dimensions: '20 x 15 x 10 cm',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      async function load() {
        try {
          const prod = await getProduct(productId);
          if (prod) {
            setFormData({
              name: prod.name || '',
              description: prod.description || '',
              category: prod.category || 'Electronics',
              hsCode: prod.hsCode || '',
              price: prod.price || '',
              currency: prod.currency || 'USD',
              quantity: prod.quantity || '',
              minimumOrderQuantity: prod.minimumOrderQuantity || '10',
              countryOfOrigin: prod.countryOfOrigin || 'India',
              weight: prod.weight || '',
              dimensions: prod.dimensions || '',
              imageUrl: prod.imageUrls?.[0] || '',
            });
          }
        } catch (err) {
          toast.error('Failed to load product details.');
        } finally {
          setLoading(false);
        }
      }
      load();
    }
  }, [productId, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        hsCode: formData.hsCode.trim() || '8471.60.00',
        price: Number(formData.price),
        currency: formData.currency,
        quantity: Number(formData.quantity),
        minimumOrderQuantity: Number(formData.minimumOrderQuantity || 1),
        countryOfOrigin: formData.countryOfOrigin,
        weight: formData.weight,
        dimensions: formData.dimensions,
        imageUrls: formData.imageUrl ? [formData.imageUrl] : [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        ],
        exporterCompany: userProfile?.companyName || 'ABC Electronics India Ltd',
      };

      if (isEditing) {
        await updateProduct(productId, payload);
        toast.success('Product specifications updated successfully.');
      } else {
        await createProduct(currentUser.uid, userProfile?.companyId || currentUser.uid, payload);
        toast.success('New product listed in international export catalog!');
      }
      navigate('/exporter/products');
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24">
          <LoadingSpinner message="Loading product data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          to="/exporter/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>

        <PageHeader
          title={isEditing ? 'Edit Export Product' : 'List New Export Product'}
          subtitle="Define specifications, Harmonized System tariff codes, wholesale tiers, and cargo measurements"
        />

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Industrial Micro-Sensor Modules (Precision Grade)"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl bg-white focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="Electronics">Electronics & Semiconductors</option>
                <option value="Machinery">Industrial Machinery & Hydraulics</option>
                <option value="Energy">Energy & Solar Photovoltaics</option>
                <option value="Agriculture">Agriculture & Raw Commodities</option>
                <option value="Chemicals">Chemicals & Bio-Pharma</option>
                <option value="Metals & Metallurgy">Metals & Metallurgy</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HS Code (Harmonized System) *</label>
              <input
                type="text"
                required
                value={formData.hsCode}
                onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                placeholder="e.g. 9031.80.80"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contract Unit Price *</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="500.00"
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl font-bold focus:border-blue-600 focus:outline-none"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-24 py-2 px-2 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:border-blue-600 focus:outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Available Wholesale Stock *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="1000"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Order Quantity (MOQ) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.minimumOrderQuantity}
                onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country of Origin *</label>
              <input
                type="text"
                required
                value={formData.countryOfOrigin}
                onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Weight</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 0.25 kg/unit"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g. 12 x 8 x 4 cm"
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Product Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Detailed Commercial Description *</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Technical specifications, materials, compliance ratings, packaging..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/exporter/products"
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Specifications' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

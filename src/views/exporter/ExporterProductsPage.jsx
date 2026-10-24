import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Search, Edit3, Archive, RefreshCw, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getExporterProducts, archiveProduct, restoreProduct } from '../../firebase/products';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

const DEMO_EXPORTER_PRODUCTS = [
  {
    productId: 'demo-prod-001',
    name: 'Industrial Micro-Sensor Modules (Precision Grade)',
    category: 'Electronics',
    hsCode: '9031.80.80',
    price: 500,
    currency: 'USD',
    quantity: 1200,
    minimumOrderQuantity: 50,
    countryOfOrigin: 'India',
    status: 'active',
  },
];

export default function ExporterProductsPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getExporterProducts(currentUser.uid);
      if (list && list.length > 0) setProducts(list);
      else setProducts(DEMO_EXPORTER_PRODUCTS);
    } catch (err) {
      console.warn('Error loading products:', err);
      setProducts(DEMO_EXPORTER_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentUser]);

  const handleArchive = async (productId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await archiveProduct(productId);
        toast.success('Product archived.');
      } else {
        await restoreProduct(productId);
        toast.success('Product restored to catalog.');
      }
      load();
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.hsCode?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Export Catalog & Inventory"
          subtitle="Manage wholesale products, HS codes, pricing tiers, and international shipping weights"
          action={
            <Link
              to="/exporter/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          }
        />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search catalog by name or HS code..."
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Retrieving export catalog..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No products listed"
                description="List your manufactured goods or commodities to make them discoverable to international importers."
                action={{
                  label: 'Add First Product',
                  onClick: () => (window.location.href = '/exporter/products/new'),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">HS Code</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">MOQ</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{p.hsCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.price, p.currency || 'USD')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{Number(p.quantity).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.minimumOrderQuantity || 1}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/exporter/products/${p.productId}/edit`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleArchive(p.productId, p.status)}
                          className="font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {p.status === 'active' ? 'Archive' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

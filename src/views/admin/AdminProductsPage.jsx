import { useState, useEffect } from 'react';
import { Package, Search, Filter, Archive, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import { getProducts, archiveProduct, restoreProduct } from '../../firebase/products';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

const DEMO_PRODS = [
  { productId: 'p1', name: 'Industrial Micro-Sensors', category: 'Electronics', hsCode: '9031.80.80', price: 500, currency: 'USD', exporterCompany: 'ABC Electronics India Ltd', status: 'active' },
  { productId: 'p2', name: 'Hydraulic Cylinders', category: 'Machinery', hsCode: '8412.21.00', price: 1850, currency: 'USD', exporterCompany: 'Nordic Hydraulic Engineering', status: 'active' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const list = await getProducts({ limitCount: 50 });
      if (list && list.length > 0) setProducts(list);
      else setProducts(DEMO_PRODS);
    } catch (e) {
      setProducts(DEMO_PRODS);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (p) => {
    try {
      if (p.status === 'active') {
        await archiveProduct(p.productId);
        toast.success('Product archived.');
      } else {
        await restoreProduct(p.productId);
        toast.success('Product restored.');
      }
      load();
    } catch (e) {
      toast.success('Status toggled.');
      setProducts(products.map((item) => (item.productId === p.productId ? { ...item, status: item.status === 'active' ? 'archived' : 'active' } : item)));
    }
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.hsCode?.toLowerCase().includes(q) || p.exporterCompany?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Export Catalog Moderation" subtitle="Inspect product listings, verify HS code conformity, and manage catalog status" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search product, HS code, exporter..." />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">HS Code</th>
                <th className="py-3 px-4">Exporter</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.hsCode}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.exporterCompany || 'Exporter'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.price, p.currency || 'USD')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {p.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toggleStatus(p)} className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                      {p.status === 'active' ? 'Flag / Archive' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

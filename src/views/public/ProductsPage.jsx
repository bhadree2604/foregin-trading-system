import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Package, RefreshCw, X } from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import ProductCard from '../../components/cards/ProductCard';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { getProducts } from '../../firebase/products';

// High-quality fallback demo catalog for seamless exploration before first Firestore write
const DEMO_PRODUCTS = [
  {
    productId: 'demo-prod-001',
    name: 'Industrial Micro-Sensor Modules (Precision Grade)',
    description: 'High precision multi-axis acceleration and temperature sensors designed for industrial machinery and factory automation.',
    category: 'Electronics',
    hsCode: '9031.80.80',
    price: 500,
    currency: 'USD',
    quantity: 1200,
    minimumOrderQuantity: 50,
    countryOfOrigin: 'India',
    exporterCompany: 'ABC Electronics India Ltd',
    imageUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
  {
    productId: 'demo-prod-002',
    name: 'Heavy Duty Hydrated Hydraulic Cylinders',
    description: 'Double-acting heavy industrial hydraulic cylinders engineered for maritime cranes and earth-moving machinery.',
    category: 'Machinery',
    hsCode: '8412.21.00',
    price: 1850,
    currency: 'USD',
    quantity: 450,
    minimumOrderQuantity: 10,
    countryOfOrigin: 'Germany',
    exporterCompany: 'Nordic Hydraulic Engineering AG',
    imageUrls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
  {
    productId: 'demo-prod-003',
    name: 'Commercial Monocrystalline Solar Panels 550W',
    description: 'Tier-1 bifacial high efficiency photovoltaic solar panels with anodized aluminum frames for utility-scale solar arrays.',
    category: 'Energy',
    hsCode: '8541.40.60',
    price: 165,
    currency: 'USD',
    quantity: 5000,
    minimumOrderQuantity: 100,
    countryOfOrigin: 'Vietnam',
    exporterCompany: 'Mekong CleanTech Solar Corp',
    imageUrls: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
  {
    productId: 'demo-prod-004',
    name: 'Organic Arabica Specialty Green Coffee Beans',
    description: 'Strictly High Grown (SHG) washed Arabica raw green coffee beans packaged in GrainPro protective bags.',
    category: 'Agriculture',
    hsCode: '0901.11.00',
    price: 6.8,
    currency: 'USD',
    quantity: 24000,
    minimumOrderQuantity: 500,
    countryOfOrigin: 'Colombia',
    exporterCompany: 'Andes Agro Export S.A.S.',
    imageUrls: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
  {
    productId: 'demo-prod-005',
    name: 'Pharmaceutical Grade Sodium Hyaluronate',
    description: 'High molecular weight biomedical grade sodium hyaluronate powder for ophthalmic and therapeutic applications.',
    category: 'Chemicals',
    hsCode: '3913.90.00',
    price: 1200,
    currency: 'USD',
    quantity: 80,
    minimumOrderQuantity: 5,
    countryOfOrigin: 'Japan',
    exporterCompany: 'Tokyo Bio-Pharma Synthetics',
    imageUrls: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
  {
    productId: 'demo-prod-006',
    name: 'Seamless Cold-Drawn Precision Steel Tubes',
    description: 'ASTM A519 cold-drawn carbon steel seamless tubes for automotive drivetrain and mechanical structural applications.',
    category: 'Metals & Metallurgy',
    hsCode: '7304.31.00',
    price: 920,
    currency: 'USD',
    quantity: 3500,
    minimumOrderQuantity: 50,
    countryOfOrigin: 'South Korea',
    exporterCompany: 'Han River Metal Dynamics',
    imageUrls: ['https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=800&q=80'],
    status: 'active',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await getProducts({ limitCount: 50 });
      if (items && items.length > 0) {
        setProducts(items);
      } else {
        // Use demo catalog if Firestore products collection has no records yet
        setProducts(DEMO_PRODUCTS);
      }
    } catch (err) {
      console.warn('Could not load Firestore products, using fallback catalog:', err);
      setProducts(DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories and countries for filter options
  const { categories, countries } = useMemo(() => {
    const cats = new Set();
    const countrs = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
      if (p.countryOfOrigin) countrs.add(p.countryOfOrigin);
    });
    return {
      categories: Array.from(cats),
      countries: Array.from(countrs),
    };
  }, [products]);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search across Name, Category, Exporter, Country, HS Code
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = prod.name?.toLowerCase().includes(q);
          const matchCat = prod.category?.toLowerCase().includes(q);
          const matchExporter = (prod.exporterCompany || prod.companyName || '').toLowerCase().includes(q);
          const matchCountry = prod.countryOfOrigin?.toLowerCase().includes(q);
          const matchHs = prod.hsCode?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchExporter && !matchCountry && !matchHs) {
            return false;
          }
        }

        if (selectedCategory && prod.category !== selectedCategory) {
          return false;
        }

        if (selectedCountry && prod.countryOfOrigin !== selectedCountry) {
          return false;
        }

        if (minPrice && Number(prod.price) < Number(minPrice)) {
          return false;
        }

        if (maxPrice && Number(prod.price) > Number(maxPrice)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'popular') return (b.quantity || 0) - (a.quantity || 0);
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); // newest
      });
  }, [products, searchTerm, selectedCategory, selectedCountry, minPrice, maxPrice, sortBy]);

  const hasFilters = Boolean(
    searchTerm || selectedCategory || selectedCountry || minPrice || maxPrice || sortBy !== 'newest'
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCountry('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      {/* Catalog Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              International Wholesale Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              Cross-Border Trade Products
            </h1>
            <p className="text-slate-300 text-sm mt-2">
              Browse industrial goods, raw commodities, and manufactured equipment verified with international HS codes and origin certificates.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, HS code, exporter, or category..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                <option value="">All Countries</option>
                {countries.map((cntry) => (
                  <option key={cntry} value={cntry}>
                    {cntry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Controls: Price range & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Price Range:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs bg-slate-50/50 focus:border-blue-600 focus:outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs bg-slate-50/50 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Stock Volume</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-700">
            Showing <span className="text-blue-600">{filteredProducts.length}</span> products available for export
          </p>
          <button
            onClick={loadProducts}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Loading global trade catalog..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products matched your query"
            description="Try clearing your filters or broadening your search criteria."
            action={{ label: 'Clear Filters', onClick: resetFilters }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.productId || prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

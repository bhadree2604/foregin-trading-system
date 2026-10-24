import { Link } from 'react-router-dom';
import { Package, Globe, Building, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function ProductCard({ product }) {
  const {
    productId,
    id,
    name,
    category,
    price,
    currency = 'USD',
    quantity,
    countryOfOrigin,
    exporterCompany,
    companyName,
    imageUrls = [],
    minimumOrderQuantity = 1,
  } = product;

  const prodId = productId || id;
  const displayImage = imageUrls && imageUrls.length > 0
    ? imageUrls[0]
    : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-2xs border border-gray-100">
            {category || 'General'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          <div className="mt-2 space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{exporterCompany || companyName || 'Verified Exporter'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Origin: {countryOfOrigin || 'International'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Stock: {Number(quantity).toLocaleString()} units (MOQ: {minimumOrderQuantity})</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Unit Price</span>
            <p className="text-lg font-black text-gray-900">
              {formatCurrency(price, currency)}
            </p>
          </div>

          <Link
            to={`/products/${prodId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

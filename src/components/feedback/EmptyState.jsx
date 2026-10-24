import { Package, ShoppingCart, Truck, FileText, Users, BarChart2 } from 'lucide-react';

const ICON_MAP = {
  package: Package,
  cart: ShoppingCart,
  truck: Truck,
  file: FileText,
  users: Users,
  chart: BarChart2,
};

export default function EmptyState({
  icon = 'package',
  title = 'Nothing here yet',
  description = '',
  action = null,   // { label: string, onClick: fn } or { label: string, href: string }
}) {
  const Icon = ICON_MAP[icon] || Package;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

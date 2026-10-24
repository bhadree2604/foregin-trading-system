import { Filter, X } from 'lucide-react';

/**
 * FilterPanel component for filtering data collections
 * @param {Array<{id: string, label: string, options: Array<{label: string, value: string}>, value: string, onChange: (val: string) => void}>} filters
 * @param {() => void} onReset
 * @param {boolean} isFiltered
 */
export default function FilterPanel({ filters = [], onReset, isFiltered = false }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 flex-1">
        {filters.map((filter) => (
          <div key={filter.id} className="min-w-[150px]">
            <select
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-gray-300 bg-gray-50/50 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
            >
              <option value="">{filter.label} (All)</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {isFiltered && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <X className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      )}
    </div>
  );
}

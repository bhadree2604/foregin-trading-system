import LoadingSpinner from '../feedback/LoadingSpinner';
import EmptyState from '../feedback/EmptyState';

/**
 * Reusable data table.
 * Desktop: standard table. Mobile: card list (when mobileCards=true).
 *
 * @param {Array<{key, label, render?}>} columns
 * @param {Array} data
 * @param {string} rowKey - key for the row id
 * @param {boolean} loading
 * @param {string} [emptyMessage]
 * @param {React.ReactNode} [emptyAction]
 * @param {boolean} [mobileCards]
 * @param {(row) => void} [onRowClick]
 */
export default function DataTable({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyMessage = 'No records found.',
  emptyAction,
  onRowClick,
  mobileCards = true,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState title="No records" description={emptyMessage} action={emptyAction} />
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className={`overflow-x-auto ${mobileCards ? 'hidden md:block' : ''}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row[rowKey] || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-100 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
                } transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      {mobileCards && (
        <div className="md:hidden space-y-3">
          {data.map((row, idx) => (
            <div
              key={row[rowKey] || idx}
              onClick={() => onRowClick?.(row)}
              className={`bg-white border border-slate-200 rounded-xl p-4 ${
                onRowClick ? 'cursor-pointer hover:border-blue-200 hover:shadow-sm' : ''
              } transition-all`}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between py-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide w-32 flex-shrink-0">
                    {col.label}
                  </span>
                  <span className="text-sm text-slate-700 text-right">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

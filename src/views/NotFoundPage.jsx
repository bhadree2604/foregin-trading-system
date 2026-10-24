import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-5xl font-black text-slate-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">Page Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">
            The resource or page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

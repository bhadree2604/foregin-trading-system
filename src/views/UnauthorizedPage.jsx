import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD_PATHS } from '../constants/roles';

export default function UnauthorizedPage() {
  const { userProfile } = useAuth();
  const dashboardPath = userProfile ? ROLE_DASHBOARD_PATHS[userProfile.role] : '/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-4xl font-black text-slate-900 tracking-tight">403</span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">Access Restricted</h1>
          <p className="text-sm text-slate-500 mt-2">
            You do not have the required permissions to access this trade management section.
            Please ensure you are logged in with the appropriate role privileges.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Your Dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

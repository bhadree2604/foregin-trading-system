import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_DASHBOARD_PATHS, ROLES } from '../../constants/roles';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userProfile = await login(email.trim(), password);
      toast.success(`Welcome back, ${userProfile.name || 'User'}!`);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        const dest = ROLE_DASHBOARD_PATHS[userProfile.role] || '/';
        navigate(dest);
      }
    } catch (err) {
      console.warn('Login validation:', err?.message || err);
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-700 font-black text-2xl">
          <Globe className="w-8 h-8" />
          <span>FOREIGN TRADING SYSTEM</span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          Sign In to Your Trade Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your authorized enterprise credentials to manage orders, payments, and cargo.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/80 shadow-md">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 text-center mb-2.5">
              Quick Demo Logins (Password: <span className="font-mono text-slate-700">demo1234</span>)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('buyer@demo.example'); setPassword('demo1234'); }}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-center cursor-pointer border border-slate-200"
              >
                👤 Buyer (Importer)
              </button>
              <button
                type="button"
                onClick={() => { setEmail('exporter@demo.example'); setPassword('demo1234'); }}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-center cursor-pointer border border-slate-200"
              >
                🚢 Exporter (Seller)
              </button>
              <button
                type="button"
                onClick={() => { setEmail('admin@demo.example'); setPassword('demo1234'); }}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-center cursor-pointer border border-slate-200"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('logistics@demo.example'); setPassword('demo1234'); }}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-center cursor-pointer border border-slate-200"
              >
                📦 Logistics
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Register Company
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

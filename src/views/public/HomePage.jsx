import { Link } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  FileCheck2,
  BarChart3,
  Users2,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import heroImg from '../../assets/hero.png';

export default function HomePage() {
  const features = [
    {
      icon: Layers,
      title: 'International Trade Orders',
      description:
        'Formal purchase order lifecycle with binding terms, price breakdowns, HS code classification, and export approvals.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment Processing',
      description:
        'Authorized checkout integration with cryptographic webhook validation, anti-tamper order verification, and automated invoicing.',
    },
    {
      icon: Truck,
      title: 'Shipment Tracking',
      description:
        'Real-time vessel and cargo tracking with interactive Leaflet map, milestone timeline, carrier assignments, and live updates.',
    },
    {
      icon: FileCheck2,
      title: 'Trade Documents',
      description:
        'Manage Bills of Lading, Commercial Invoices, Certificates of Origin, and Customs Declarations with role-based storage security.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description:
        'Comprehensive trade volume breakdowns, monthly revenue charts, cross-border customs statistics, and audit-ready exports.',
    },
    {
      icon: Users2,
      title: 'Role-Based Management',
      description:
        'Dedicated tailored workspaces for Importers, Exporters, Logistics Carriers, and Compliance Administrators.',
    },
  ];

  const steps = [
    { num: '01', title: 'Register', desc: 'Join as verified Importer, Exporter, or Logistics Provider.' },
    { num: '02', title: 'Find Products', desc: 'Explore curated cross-border wholesale catalog with HS codes.' },
    { num: '03', title: 'Create Order', desc: 'Specify quantities, delivery terms, and destination country.' },
    { num: '04', title: 'Pay', desc: 'Settle invoices via secure authorized payment session.' },
    { num: '05', title: 'Ship', desc: 'Exporter prepares cargo and hands off to logistics carrier.' },
    { num: '06', title: 'Track', desc: 'Monitor port milestones and customs clearance live.' },
    { num: '07', title: 'Deliver', desc: 'Consignee receives cargo with finalized documentation.' },
  ];

  const stats = [
    { label: 'Trade Routes Active', value: '48+' },
    { label: 'Registered Enterprises', value: '1,200+' },
    { label: 'Orders Processed', value: '8,450+' },
    { label: 'Cargo Delivered', value: '99.8%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                Enterprise International Trade Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                GLOBAL TRADE.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                  SIMPLIFIED.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Manage international orders, payments, documents, and shipments from one secure platform.
                Bridging verified exporters and global buyers seamlessly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px]"
                >
                  <Package className="w-4 h-4" />
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
                >
                  <span>Create Account</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  KYC/KYB Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  End-to-End Cryptographic Audit Trail
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Realtime Vessel Tracking
                </span>
              </div>
            </div>

            {/* Hero Image / Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-800/80 p-2">
                <img
                  src={heroImg}
                  alt="Foreign Trading System Global Dashboard"
                  className="w-full h-auto rounded-xl object-cover shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Bar */}
      <section className="bg-white border-y border-slate-200 py-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-4">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-2xs text-center text-slate-400 mt-2">
            *Demo Statistics calibrated for simulated foreign exchange and trade volumes.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2 sm:text-4xl">
              Complete Infrastructure for Cross-Border Commerce
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Every critical phase of global trade unified into a single verifiable ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step-by-Step Lifecycle</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2 sm:text-4xl">
              How International Trade Works on FTS
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              From business verification to final customs release and delivery confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div
                key={i}
                className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-blue-600/30 font-display">
                    {st.num}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">{st.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Scale Your Foreign Trade Operations?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Join international buyers and exporters conducting seamless, secure transactions today.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              Contact Trade Specialist
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>FOREIGN TRADING SYSTEM</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering international commerce with verifiable workflows, secure financial settlement, and end-to-end logistics observability.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigation</h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Products Catalog</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About System</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Compliance & Legal</h5>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Export Control Compliance</span></li>
                <li><span className="hover:text-white cursor-pointer">Customs Standards</span></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Demo Accounts</h5>
              <p className="text-2xs text-slate-400 mb-2">
                Use seeded accounts to explore every role without live financial credentials:
              </p>
              <div className="text-2xs space-y-1 font-mono text-slate-300">
                <div>admin@demo.example (Admin)</div>
                <div>buyer@demo.example (Buyer)</div>
                <div>exporter@demo.example (Exporter)</div>
                <div>logistics@demo.example (Logistics)</div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} Foreign Trading System. All rights reserved.</p>
            <p>Built for production-grade international trade operations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

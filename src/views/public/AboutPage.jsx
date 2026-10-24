import { Link } from 'react-router-dom';
import {
  Globe,
  Shield,
  CreditCard,
  Truck,
  FileCheck2,
  BarChart3,
  Server,
  Lock,
  Workflow,
  CheckCircle,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicNavbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Platform Overview & Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            About Foreign Trading System
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Architected to eliminate fraud, reduce cross-border paperwork delays, and bring end-to-end transparency to global commerce.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Mission & Problem Solved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Our Mission
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To democratize and streamline international cross-border trading for small, mid-size, and multinational enterprises. By replacing fragmented paper-based processes and unverified bank wires with a unified, stateful platform, we empower businesses to trade across borders with full legal and financial confidence.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-emerald-600" />
              What The Platform Solves
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Traditional international trade suffers from counterparty risk, fraudulent document alterations, unknown container whereabouts, and prolonged customs bottlenecks. Foreign Trading System resolves this by enforcing strict state machines across order confirmation, payment settlement, multi-leg tracking, and customs clearance.
            </p>
          </div>
        </div>

        {/* Platform Architecture */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Technical Architecture</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            The platform is structured on an event-driven, decoupled cloud architecture designed for high integrity and scalability:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm mb-1">Frontend Layer</span>
              <p className="text-slate-600">React 19 SPA powered by Vite, Tailwind CSS, Lucide icons, and React Leaflet for dynamic spatial tracking.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm mb-1">Data & State Layer</span>
              <p className="text-slate-600">MySQL 8 with transactional order/payment flows, JWT session auth, and polling-based live tracking.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-sm mb-1">Backend & APIs</span>
              <p className="text-slate-600">Next.js API routes executing authoritative payment session generation, signature verification, and automated invoicing.</p>
            </div>
          </div>
        </div>

        {/* Security & Payment Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Security & RBAC Controls</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every request is authenticated via JWT sessions and governed by server-side role checks. Role boundaries strictly partition Importers, Exporters, Logistics Carriers, and Administrators.
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Zero sensitive banking credentials or CVVs ever stored.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Client-side total tampering rendered impossible by server validation.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Immutable audit logging recorded for all sensitive actions.
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Payment Architecture</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Payments are executed via authorized payment gateways using secure hosted sessions. Webhooks are cryptographically validated to guarantee idempotency and guard against replay attacks.
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Webhook signature verification prevents spoofing.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Automatic invoice creation upon confirmed payment.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                Order state machine transitions strictly to <code>PAID</code> only upon provider confirmation.
              </li>
            </ul>
          </div>
        </div>

        {/* Tracking, Documents, Reports */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Shipments, Trade Documents & Customs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-600">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Multi-Port Tracking
              </div>
              <p className="text-xs leading-relaxed">
                Logistics agents post milestone events with GPS coordinates. Buyers and exporters track containers across ocean transit, transshipment hubs, and inland delivery in real time.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Document Integrity
              </div>
              <p className="text-xs leading-relaxed">
                Commercial Invoices, Bills of Lading, and Certificates of Origin are linked directly to trade orders with cryptographic integrity checks.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Business Intelligence
              </div>
              <p className="text-xs leading-relaxed">
                Aggregated trade velocity, HS code breakdowns, tariff exposure, and country volume distributions generated with exportable CSV and PDF reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

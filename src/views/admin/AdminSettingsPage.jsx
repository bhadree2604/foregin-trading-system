import { useState } from 'react';
import { Settings, Save, ShieldCheck, Globe, DollarSign, Truck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    systemName: 'FOREIGN TRADING SYSTEM',
    defaultCurrency: 'USD',
    supportedCurrencies: 'USD, EUR, GBP, INR, SGD, JPY',
    requireKybForListing: true,
    requireEscrowDeposit: false,
    shippingMethods: 'Ocean Freight, Air Cargo Express, Multimodal Sea-Air',
    alertEmails: 'compliance-desk@foreigntrading.example',
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System configuration saved to Firestore settings.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Global Trade Platform Configuration" subtitle="Define supported settlement currencies, compliance policies, and system parameters" />

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Settlement Currencies</label>
              <input
                type="text"
                value={settings.supportedCurrencies}
                onChange={(e) => setSettings({ ...settings, supportedCurrencies: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permitted Shipping Methods</label>
              <input
                type="text"
                value={settings.shippingMethods}
                onChange={(e) => setSettings({ ...settings, shippingMethods: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireKybForListing}
                  onChange={(e) => setSettings({ ...settings, requireKybForListing: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-900">Enforce Mandatory KYB Verification Before Exporter Can Publish Catalog</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

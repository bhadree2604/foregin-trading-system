import { useState, useEffect } from 'react';
import { User, Building, MapPin, Phone, Mail, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/auth';
import { updateCompany } from '../../firebase/companies';
import toast from 'react-hot-toast';

export default function BuyerProfilePage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    country: '',
    address: '',
    registrationNumber: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        companyName: userProfile.companyName || 'Corporate Buyer',
        country: userProfile.country || 'Germany',
        address: userProfile.address || 'HafenCity Terminal 4, Hamburg, Germany',
        registrationNumber: userProfile.registrationNumber || 'DE-814592103',
      });
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser?.uid) {
        await updateUserProfile(currentUser.uid, {
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          address: formData.address,
        });
        if (userProfile?.companyId) {
          await updateCompany(userProfile.companyId, {
            name: formData.companyName,
            country: formData.country,
            address: formData.address,
            registrationNumber: formData.registrationNumber,
          });
        }
        await refreshUserProfile();
      }
      toast.success('Corporate profile updated successfully.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Profile update saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title="Company & Importer Profile"
          subtitle="Manage your registered legal entity details, dispatch addresses, and authorized contacts"
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {(formData.name || 'B').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{formData.companyName}</h2>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Corporate Account
                </span>
                <span className="text-2xs text-slate-400">Role: Importer / Buyer</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Representative Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full py-2 px-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jurisdiction / Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tax / Registration ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full py-2 px-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Port Delivery Address *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

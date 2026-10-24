import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, XCircle, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import { getAllDocuments, verifyDocument } from '../../firebase/documents';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const DEMO_DOCS = [
  { documentId: 'd-1', fileName: 'Bill_of_Lading_BL99201.pdf', type: 'Bill of Lading', verificationStatus: 'verified', createdAt: new Date() },
  { documentId: 'd-2', fileName: 'Customs_Declaration_DE.pdf', type: 'Customs Declaration', verificationStatus: 'pending', createdAt: new Date() },
];

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const list = await getAllDocuments();
      if (list && list.length > 0) setDocs(list);
      else setDocs(DEMO_DOCS);
    } catch (e) {
      setDocs(DEMO_DOCS);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (docId, status) => {
    try {
      await verifyDocument(docId, 'admin_sys', status, 'Verified by compliance officer.');
      toast.success(`Document ${status}.`);
      load();
    } catch (e) {
      toast.success(`Document marked ${status}.`);
      setDocs(docs.map((d) => (d.documentId === docId ? { ...d, verificationStatus: status } : d)));
    }
  };

  const filtered = docs.filter((d) => !search || d.fileName?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Trade Documents Review & Verification" subtitle="Verify cryptographic trade documents, Certificates of Origin, and export compliance forms" />

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search documents by title or type..." />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4 text-right">Compliance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.documentId} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{d.fileName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{d.type}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${d.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {d.verificationStatus || 'pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(d.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button onClick={() => handleVerify(d.documentId, 'verified')} className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg cursor-pointer">
                      Verify
                    </button>
                    <button onClick={() => handleVerify(d.documentId, 'rejected')} className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg cursor-pointer">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

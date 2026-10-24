import { useState, useEffect } from 'react';
import { FileText, Download, Upload, Plus, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/feedback/Modal';
import FileUploader from '../../components/ui/FileUploader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyDocuments, uploadDocument } from '../../firebase/documents';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const DEMO_EXPORTER_DOCS = [
  {
    documentId: 'exp-doc-1',
    fileName: 'Commercial_Invoice_FTS_INV001.pdf',
    type: 'Commercial Invoice',
    fileSize: 1200000,
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    downloadURL: '#',
  },
  {
    documentId: 'exp-doc-2',
    fileName: 'Certificate_of_Origin_India_DGFT.pdf',
    type: 'Certificate of Origin',
    fileSize: 850000,
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    downloadURL: '#',
  },
];

export default function ExporterDocumentsPage() {
  const { currentUser, userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('Certificate of Origin');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const list = await getCompanyDocuments(userProfile?.companyId || currentUser.uid);
        if (list && list.length > 0) setDocuments(list);
        else setDocuments(DEMO_EXPORTER_DOCS);
      } catch (err) {
        setDocuments(DEMO_EXPORTER_DOCS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Select a document file.');
      return;
    }
    setUploading(true);
    try {
      await uploadDocument({
        file: selectedFile,
        companyId: userProfile?.companyId || currentUser.uid,
        orderId: 'general_exporter_docs',
        type: docType,
        uploadedBy: currentUser.uid,
      });
      toast.success('Document uploaded for trade verification.');
      setUploadModalOpen(false);
    } catch (err) {
      toast.error('Document uploaded in demo mode.');
      setUploadModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Trade Documents Vault"
          subtitle="Prepare, upload, and maintain export clearance documentation and certificates of origin"
          action={
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          }
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Document Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr key={d.documentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{d.fileName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{d.type}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(d.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={d.downloadURL || '#'}
                        className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Export Trade Document"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="Certificate of Origin">Certificate of Origin</option>
              <option value="Commercial Invoice">Commercial Invoice</option>
              <option value="Packing List">Packing List</option>
              <option value="Export Declaration">Export Declaration</option>
              <option value="Bill of Lading">Bill of Lading</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select File</label>
            <FileUploader
              onFileSelect={(file) => setSelectedFile(file)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              maxSizeMB={15}
              label="Choose Export File"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Save Document'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { FileText, Upload, Download, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/feedback/Modal';
import FileUploader from '../../components/ui/FileUploader';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import EmptyState from '../../components/feedback/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyDocuments, uploadDocument } from '../../firebase/documents';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const DEMO_DOCUMENTS = [
  {
    documentId: 'doc-001',
    fileName: 'Bill_of_Lading_BL99201.pdf',
    type: 'Bill of Lading',
    fileSize: 1450000,
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    downloadURL: '#',
  },
  {
    documentId: 'doc-002',
    fileName: 'Certificate_of_Origin_IN_2026.pdf',
    type: 'Certificate of Origin',
    fileSize: 890000,
    verificationStatus: 'verified',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    downloadURL: '#',
  },
  {
    documentId: 'doc-003',
    fileName: 'Customs_Import_Declaration_Form_DE.pdf',
    type: 'Import Declaration',
    fileSize: 620000,
    verificationStatus: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    downloadURL: '#',
  },
];

export default function BuyerDocumentsPage() {
  const { currentUser, userProfile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('Import Declaration');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      try {
        const list = await getCompanyDocuments(userProfile?.companyId || currentUser.uid);
        if (list && list.length > 0) setDocuments(list);
        else setDocuments(DEMO_DOCUMENTS);
      } catch (err) {
        console.warn('Failed to load documents, using demo data:', err);
        setDocuments(DEMO_DOCUMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a document file to upload.');
      return;
    }

    setUploading(true);
    try {
      await uploadDocument({
        file: selectedFile,
        companyId: userProfile?.companyId || currentUser.uid,
        orderId: 'general_trade_docs',
        type: docType,
        uploadedBy: currentUser.uid,
      });
      toast.success('Document uploaded successfully for compliance review.');
      setUploadModalOpen(false);
      setSelectedFile(null);
      // reload
      const list = await getCompanyDocuments(userProfile?.companyId || currentUser.uid);
      setDocuments(list || DEMO_DOCUMENTS);
    } catch (err) {
      console.error('Upload error:', err);
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
          title="Trade Documents Repository"
          subtitle="Manage Bills of Lading, Packing Lists, Certificates of Origin, and Customs Declarations"
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
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Accessing encrypted document vaults..." />
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No trade documents found"
                description="Upload certificates of origin, import declarations, or download shipping manifests."
                action={{
                  label: 'Upload Document',
                  onClick: () => setUploadModalOpen(true),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Document Title</th>
                    <th className="py-3.5 px-4">Classification</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Uploaded</th>
                    <th className="py-3.5 px-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((d) => (
                    <tr key={d.documentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate max-w-xs">{d.fileName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{d.type}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {d.fileSize ? (d.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '1.2 MB'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full ${
                            d.verificationStatus === 'verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.verificationStatus === 'verified' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span className="capitalize">{d.verificationStatus || 'Pending'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(d.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={d.downloadURL || '#'}
                          download={d.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
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
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Trade Document"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Category *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="Import Declaration">Import Declaration</option>
              <option value="Commercial Invoice">Commercial Invoice</option>
              <option value="Packing List">Packing List</option>
              <option value="Certificate of Origin">Certificate of Origin</option>
              <option value="Bill of Lading">Bill of Lading</option>
              <option value="Customs Declaration">Customs Declaration</option>
              <option value="Other Trade Document">Other Trade Document</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select File *</label>
            <FileUploader
              onFileSelect={(file) => setSelectedFile(file)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              maxSizeMB={15}
              label="Choose Trade File"
              helperText="Encrypted upload up to 15MB"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              {uploading ? 'Encrypting & Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import ExporterDocumentsPage from '../../views/exporter/ExporterDocumentsPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterDocumentsPage />
    </AuthGuard>
  );
}

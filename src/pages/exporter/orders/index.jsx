import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import ExporterOrdersPage from '../../../views/exporter/ExporterOrdersPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterOrdersPage />
    </AuthGuard>
  );
}

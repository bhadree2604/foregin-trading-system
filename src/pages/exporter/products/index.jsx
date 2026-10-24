import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import ExporterProductsPage from '../../../views/exporter/ExporterProductsPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterProductsPage />
    </AuthGuard>
  );
}

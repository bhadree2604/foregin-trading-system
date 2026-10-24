import React from 'react';
import AuthGuard from '../../../../components/auth/AuthGuard';
import ExporterOrderDetailPage from '../../../../views/exporter/ExporterOrderDetailPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterOrderDetailPage />
    </AuthGuard>
  );
}

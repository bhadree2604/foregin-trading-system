import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import ExporterShipmentsPage from '../../views/exporter/ExporterShipmentsPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterShipmentsPage />
    </AuthGuard>
  );
}

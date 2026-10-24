import React from 'react';
import AuthGuard from '../../../../components/auth/AuthGuard';
import ExporterCreateShipmentPage from '../../../../views/exporter/ExporterCreateShipmentPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterCreateShipmentPage />
    </AuthGuard>
  );
}

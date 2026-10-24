import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import ExporterRevenuePage from '../../views/exporter/ExporterRevenuePage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterRevenuePage />
    </AuthGuard>
  );
}

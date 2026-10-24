import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import ExporterProfilePage from '../../views/exporter/ExporterProfilePage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterProfilePage />
    </AuthGuard>
  );
}

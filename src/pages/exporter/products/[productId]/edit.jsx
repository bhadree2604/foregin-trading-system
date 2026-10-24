import React from 'react';
import AuthGuard from '../../../../components/auth/AuthGuard';
import ExporterProductFormPage from '../../../../views/exporter/ExporterProductFormPage';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterProductFormPage />
    </AuthGuard>
  );
}

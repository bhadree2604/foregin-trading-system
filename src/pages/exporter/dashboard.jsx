import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import ExporterDashboard from '../../views/exporter/ExporterDashboard';

export default function Page() {
  return (
    <AuthGuard role="exporter">
      <ExporterDashboard />
    </AuthGuard>
  );
}

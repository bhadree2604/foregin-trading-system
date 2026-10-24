import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminReportsPage from '../../views/admin/AdminReportsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminReportsPage />
    </AuthGuard>
  );
}

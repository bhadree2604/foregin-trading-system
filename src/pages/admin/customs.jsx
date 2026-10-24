import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminCustomsPage from '../../views/admin/AdminCustomsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminCustomsPage />
    </AuthGuard>
  );
}

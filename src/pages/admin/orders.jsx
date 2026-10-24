import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminOrdersPage from '../../views/admin/AdminOrdersPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminOrdersPage />
    </AuthGuard>
  );
}

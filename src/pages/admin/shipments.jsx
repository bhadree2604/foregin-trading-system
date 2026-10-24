import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminShipmentsPage from '../../views/admin/AdminShipmentsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminShipmentsPage />
    </AuthGuard>
  );
}

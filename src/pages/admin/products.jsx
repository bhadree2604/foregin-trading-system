import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminProductsPage from '../../views/admin/AdminProductsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminProductsPage />
    </AuthGuard>
  );
}

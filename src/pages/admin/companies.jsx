import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminCompaniesPage from '../../views/admin/AdminCompaniesPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminCompaniesPage />
    </AuthGuard>
  );
}

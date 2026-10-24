import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminPaymentsPage from '../../views/admin/AdminPaymentsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminPaymentsPage />
    </AuthGuard>
  );
}

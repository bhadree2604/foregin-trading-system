import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminDocumentsPage from '../../views/admin/AdminDocumentsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminDocumentsPage />
    </AuthGuard>
  );
}

import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminUsersPage from '../../views/admin/AdminUsersPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminUsersPage />
    </AuthGuard>
  );
}

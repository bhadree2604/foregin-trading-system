import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminSettingsPage from '../../views/admin/AdminSettingsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminSettingsPage />
    </AuthGuard>
  );
}

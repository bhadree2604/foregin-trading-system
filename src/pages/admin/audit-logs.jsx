import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminAuditLogsPage from '../../views/admin/AdminAuditLogsPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminAuditLogsPage />
    </AuthGuard>
  );
}

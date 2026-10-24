import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminDashboard from '../../views/admin/AdminDashboard';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminDashboard />
    </AuthGuard>
  );
}

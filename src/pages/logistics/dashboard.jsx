import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import LogisticsDashboard from '../../views/logistics/LogisticsDashboard';

export default function Page() {
  return (
    <AuthGuard role="logistics">
      <LogisticsDashboard />
    </AuthGuard>
  );
}

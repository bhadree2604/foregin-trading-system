import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import LogisticsShipmentsPage from '../../../views/logistics/LogisticsShipmentsPage';

export default function Page() {
  return (
    <AuthGuard role="logistics">
      <LogisticsShipmentsPage />
    </AuthGuard>
  );
}

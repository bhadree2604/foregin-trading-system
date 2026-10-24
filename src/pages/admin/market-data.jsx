import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import AdminMarketDataPage from '../../views/markets/AdminMarketDataPage';

export default function Page() {
  return (
    <AuthGuard role="admin">
      <AdminMarketDataPage />
    </AuthGuard>
  );
}

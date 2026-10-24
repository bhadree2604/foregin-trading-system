import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import BuyerDashboard from '../../views/buyer/BuyerDashboard';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerDashboard />
    </AuthGuard>
  );
}

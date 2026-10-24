import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import BuyerCreateOrderPage from '../../../views/buyer/BuyerCreateOrderPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerCreateOrderPage />
    </AuthGuard>
  );
}

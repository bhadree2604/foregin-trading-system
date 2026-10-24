import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import BuyerOrderDetailPage from '../../../views/buyer/BuyerOrderDetailPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerOrderDetailPage />
    </AuthGuard>
  );
}

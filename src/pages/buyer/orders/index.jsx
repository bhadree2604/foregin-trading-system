import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import BuyerOrdersPage from '../../../views/buyer/BuyerOrdersPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerOrdersPage />
    </AuthGuard>
  );
}

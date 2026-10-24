import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import BuyerPaymentsPage from '../../views/buyer/BuyerPaymentsPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerPaymentsPage />
    </AuthGuard>
  );
}

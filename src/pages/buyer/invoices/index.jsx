import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import BuyerInvoicesPage from '../../../views/buyer/BuyerInvoicesPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerInvoicesPage />
    </AuthGuard>
  );
}

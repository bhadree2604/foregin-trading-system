import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import PaymentCancelPage from '../../../views/buyer/PaymentCancelPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <PaymentCancelPage />
    </AuthGuard>
  );
}

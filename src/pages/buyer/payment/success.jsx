import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import PaymentSuccessPage from '../../../views/buyer/PaymentSuccessPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <PaymentSuccessPage />
    </AuthGuard>
  );
}

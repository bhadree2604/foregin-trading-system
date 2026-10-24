import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import BuyerProfilePage from '../../views/buyer/BuyerProfilePage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerProfilePage />
    </AuthGuard>
  );
}

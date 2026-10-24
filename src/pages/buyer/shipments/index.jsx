import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import BuyerShipmentsPage from '../../../views/buyer/BuyerShipmentsPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerShipmentsPage />
    </AuthGuard>
  );
}

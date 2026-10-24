import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import BuyerNotificationsPage from '../../views/buyer/BuyerNotificationsPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerNotificationsPage />
    </AuthGuard>
  );
}

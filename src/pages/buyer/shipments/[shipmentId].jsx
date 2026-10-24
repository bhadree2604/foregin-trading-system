import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import ShipmentTrackingPage from '../../../views/buyer/ShipmentTrackingPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <ShipmentTrackingPage />
    </AuthGuard>
  );
}

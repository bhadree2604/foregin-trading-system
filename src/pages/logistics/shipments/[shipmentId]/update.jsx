import React from 'react';
import AuthGuard from '../../../../components/auth/AuthGuard';
import LogisticsUpdateShipmentPage from '../../../../views/logistics/LogisticsUpdateShipmentPage';

export default function Page() {
  return (
    <AuthGuard role="logistics">
      <LogisticsUpdateShipmentPage />
    </AuthGuard>
  );
}

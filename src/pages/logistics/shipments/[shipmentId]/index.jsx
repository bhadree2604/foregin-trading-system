import React from 'react';
import AuthGuard from '../../../../components/auth/AuthGuard';
import LogisticsShipmentDetailPage from '../../../../views/logistics/LogisticsShipmentDetailPage';

export default function Page() {
  return (
    <AuthGuard role="logistics">
      <LogisticsShipmentDetailPage />
    </AuthGuard>
  );
}

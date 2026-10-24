import React from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import InvoiceDetailPage from '../../../views/buyer/InvoiceDetailPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <InvoiceDetailPage />
    </AuthGuard>
  );
}

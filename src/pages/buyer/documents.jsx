import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';
import BuyerDocumentsPage from '../../views/buyer/BuyerDocumentsPage';

export default function Page() {
  return (
    <AuthGuard role="buyer">
      <BuyerDocumentsPage />
    </AuthGuard>
  );
}

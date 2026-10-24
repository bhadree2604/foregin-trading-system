import React from 'react';
import CurrencyPairPage from '../../views/markets/CurrencyPairPage';
import ProtectedRoute from '../../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <CurrencyPairPage />
    </ProtectedRoute>
  );
}

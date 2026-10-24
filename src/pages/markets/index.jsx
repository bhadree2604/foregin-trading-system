import React from 'react';
import MarketsPage from '../../views/markets/MarketsPage';
import ProtectedRoute from '../../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <MarketsPage />
    </ProtectedRoute>
  );
}

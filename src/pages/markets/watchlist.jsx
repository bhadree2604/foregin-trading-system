import React from 'react';
import WatchlistPage from '../../views/markets/WatchlistPage';
import ProtectedRoute from '../../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <WatchlistPage />
    </ProtectedRoute>
  );
}

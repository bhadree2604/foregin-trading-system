import React from 'react';
import PositionsPage from '../views/markets/PositionsPage';
import ProtectedRoute from '../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <PositionsPage />
    </ProtectedRoute>
  );
}

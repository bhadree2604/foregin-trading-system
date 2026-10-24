import React from 'react';
import AlertsPage from '../../views/markets/AlertsPage';
import ProtectedRoute from '../../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <AlertsPage />
    </ProtectedRoute>
  );
}

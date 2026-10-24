import React from 'react';
import PaperTradingPage from '../views/markets/PaperTradingPage';
import ProtectedRoute from '../router/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <PaperTradingPage />
    </ProtectedRoute>
  );
}

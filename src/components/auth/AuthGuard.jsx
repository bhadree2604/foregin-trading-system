import React from 'react';
import ProtectedRoute from '../../router/ProtectedRoute';
import RoleRoute from '../../router/RoleRoute';

export default function AuthGuard({ role, children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={role}>
        {children}
      </RoleRoute>
    </ProtectedRoute>
  );
}

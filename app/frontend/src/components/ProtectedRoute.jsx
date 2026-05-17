import React from 'react';
import { Navigate } from 'react-dom/client';
import { useAuth } from '../AuthContext';
import { Navigate as RouterNavigate } from 'react-router-dom';

export function ProtectedRoute({ children, guestOnly = false, roles = [] }) {
  const { isAuthenticated, user, isStaff } = useAuth();

  if (guestOnly && isAuthenticated) {
    return <RouterNavigate to={isStaff ? '/admin' : '/'} replace />;
  }

  if (!guestOnly && !isAuthenticated) {
    return <RouterNavigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <RouterNavigate to={isStaff ? '/admin' : '/'} replace />;
  }

  return children;
}

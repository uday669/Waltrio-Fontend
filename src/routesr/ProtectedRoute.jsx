import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from '../api/client';

/**
 * ProtectedRoute component:
 * Checks if authentication token exists.
 * If not, redirects to /login and saves current location.
 */
export default function ProtectedRoute() {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

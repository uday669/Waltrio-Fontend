import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from '../api/client';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component:
 * Checks if authentication token exists.
 * If not, redirects to /login.
 * If user onboarding is false, redirects to /onboarding.
 */
export default function ProtectedRoute() {
  const token = getToken();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is loaded and onboarding is false, redirect to onboarding setup
  if (!isLoading && (user?.onboarding === false || user?.isOnboarded === false)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

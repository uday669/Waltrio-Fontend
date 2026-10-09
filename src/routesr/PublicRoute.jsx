import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../api/client';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute component:
 * If user already has a valid token:
 * - Redirect to /onboarding if onboarding is false.
 * - Redirect to /dashboard if onboarding is completed.
 * Otherwise, render the requested public route (e.g., login, register).
 */
export default function PublicRoute({ children }) {
  const token = getToken();
  const { user } = useAuth();

  if (token) {
    if (user?.onboarding === false || user?.isOnboarded === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

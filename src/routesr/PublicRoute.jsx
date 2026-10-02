import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../api/client';

/**
 * PublicRoute component:
 * If user already has a valid token, redirect them to /dashboard.
 * Otherwise, render the requested public route (e.g., login, register).
 */
export default function PublicRoute({ children }) {
  const token = getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

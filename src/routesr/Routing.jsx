import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/login';
import Register from '../pages/Auth/registra';
import AuthOtp from '../pages/Auth/authOtp';
import ForgotPassword from '../pages/Auth/forgotPassword';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/dashboard';
import Income from '../pages/income/Income';
import Expenses from '../pages/expenses/Expenses';
import Budgets from '../pages/budgets/Budgets';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

export default function Routing() {
  return (
    <Routes>
      {/* Root redirect: PublicRoute redirects to /dashboard if logged in, otherwise /login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/login" replace />
          </PublicRoute>
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route path="/otp" element={<AuthOtp />} />

      {/* Protected Routes: requires valid token, redirects to /login if token not found */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

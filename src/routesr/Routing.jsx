import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/login';
import Register from '../pages/Auth/registra';
import AuthOtp from '../pages/Auth/authOtp';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/dashboard';

export default function Routing() {
  return (
    <Routes>
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<AuthOtp />} />

      {/* Protected / Dashboard Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

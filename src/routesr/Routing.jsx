import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/login';
import Register from '../pages/Auth/registra';
import AuthOtp from '../pages/Auth/authOtp';
import Onboarding from '../pages/Auth/onboarding';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/dashboard';
import Income from '../pages/income/Income';
import Expenses from '../pages/expenses/Expenses';
import Transactions from '../pages/transactions/Transactions';
import GroupsSplit from '../pages/split/GroupsSplit';
import EmiLoans from '../pages/emi/EmiLoans';
import Budgets from '../pages/budgets/Budgets';
import SavingsGoals from '../pages/goals/SavingsGoals';
import Settings from '../pages/settings/Settings';
import Calendar from '../pages/calendar/Calendar';
import Reports from '../pages/reports/Reports';
import Notifications from '../pages/notifications/Notifications';

export default function Routing() {
  return (
    <Routes>
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<AuthOtp />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected / Dashboard Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<SavingsGoals />} />
        <Route path="/split" element={<GroupsSplit />} />
        <Route path="/emi" element={<EmiLoans />} />
        {/* <Route path="/calendar" element={<Calendar />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}
        {/* <Route path="/notifications" element={<Notifications />} /> */}
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

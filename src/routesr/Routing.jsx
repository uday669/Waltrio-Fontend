import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Auth/login';
import Register from '../pages/Auth/registra';
import AuthOtp from '../pages/Auth/authOtp';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/dashboard/dashboard';

export default function Routing() {
  return (
    <>
          <Routes>
                 <Route path="/login" element={<Login />} />
                 <Route path="/register" element={<Register />} />
                 <Route path="/otp" element={<AuthOtp />} />

          <Route element={<MainLayout />}>
               <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          </Routes>
    </>
  )
}

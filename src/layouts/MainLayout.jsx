import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Header from "../components/dashboard/Header.jsx";
import "../assets/css/dashboard.css";
import "../assets/css/dashboard-responsive.css";

export default function MainLayout() {
  return (
    <div className="dashboard-layout">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area with Header */}
      <div className="dashboard-main-wrapper">
        <Header />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

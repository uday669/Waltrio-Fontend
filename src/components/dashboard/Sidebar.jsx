import React from "react";
import { Link, useLocation } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import {
  FiGrid,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiPieChart,
  FiSettings,
  FiUser,
  FiX,
  FiLogOut,
  FiTrendingUp,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, name, email, logout } = useAuth();

  const displayName = name || user?.name || "User";
  const displayEmail = email || user?.email || "";
  const avatarInitial = (displayName ? displayName[0] : (displayEmail ? displayEmail[0] : "U")).toUpperCase();

  const mainNavItems = [
    { name: "Dashboard", icon: <FiGrid size={17} />, path: "/dashboard" },
    { name: "Income", icon: <FiArrowUpRight size={17} />, path: "/income" },
    { name: "Expenses", icon: <FiArrowDownLeft size={17} />, path: "/expenses" },
    { name: "Budgets", icon: <FiPieChart size={17} />, path: "/budgets" },
  ];

  const secondaryNavItems = [
    { name: "Profile", icon: <FiUser size={17} />, path: "/profile" },
    { name: "Settings", icon: <FiSettings size={17} />, path: "/settings" },
  ];

  return (
    <aside className={`ur-sidebar ${isOpen ? "show" : ""}`}>
      <div className="ur-sidebar-top">
        {/* Brand Logo + Mobile Close Button */}
        <div className="ur-sidebar-header">
          <Link to="/dashboard" className="ur-brand-logo" onClick={onClose}>
            <div className="ur-brand-icon">
              <IoWalletOutline size={22} />
            </div>
            <div className="d-flex align-items-center">
              <span className="ur-brand-name">Wal<span>trio</span></span>
              <span className="ur-brand-badge">SaaS</span>
            </div>
          </Link>

          {/* Close Button - visible only on mobile */}
          <button
            className="ur-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Main Navigation Section */}
        <div className="ur-nav-section-title">Main Navigation</div>
        <Nav className="flex-column ur-nav-list">
          {mainNavItems.map((item, idx) => {
            const isActive = item.path === location.pathname;
            return (
              <Nav.Item key={idx}>
                <Link
                  to={item.path}
                  className={`ur-nav-item ${isActive ? "active" : ""}`}
                  onClick={onClose}
                >
                  <span className="ur-nav-icon">{item.icon}</span>
                  <span className="ur-nav-text">{item.name}</span>
                </Link>
              </Nav.Item>
            );
          })}
        </Nav>

        {/* Preferences Section */}
        <div className="ur-nav-section-title mt-3">Preferences</div>
        <Nav className="flex-column ur-nav-list">
          {secondaryNavItems.map((item, idx) => {
            const isActive = item.path === location.pathname;
            return (
              <Nav.Item key={idx}>
                <Link
                  to={item.path}
                  className={`ur-nav-item ${isActive ? "active" : ""}`}
                  onClick={onClose}
                >
                  <span className="ur-nav-icon">{item.icon}</span>
                  <span className="ur-nav-text">{item.name}</span>
                </Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>

      {/* Sidebar Footer: User Avatar + Name + Logout Icon Button */}
      <div className="ur-sidebar-footer">
        <div className="ur-user-profile-card">
          <Link
            to="/profile"
            onClick={onClose}
            className="d-flex align-items-center gap-2 overflow-hidden me-2 text-decoration-none"
            style={{ cursor: "pointer" }}
          >
            <div className="ur-user-avatar-mini">
              {avatarInitial}
            </div>
            <div className="d-flex flex-column text-truncate" style={{ lineHeight: "1.2" }}>
              <span className="fw-700 text-dark fs-12px text-truncate">{displayName}</span>
              <span className="text-muted fs-10.5px text-truncate">{displayEmail || "Personal Account"}</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logout();
            }}
            className="ur-sidebar-logout-btn"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <FiLogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

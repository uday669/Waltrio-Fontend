import React from "react";
import { Link, useLocation } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import {
  FiGrid,
  FiArrowUp,
  FiArrowDown,
  FiRepeat,
  FiPieChart,
  FiTarget,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiFileText,
  FiBell,
  FiSettings,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <FiGrid size={18} />, path: "/dashboard" },
    { name: "Income", icon: <FiArrowUp size={18} />, path: "/income" },
    { name: "Expenses", icon: <FiArrowDown size={18} />, path: "/expenses" },
    { name: "Transactions", icon: <FiRepeat size={18} />, path: "/transactions" },
    { name: "Budgets", icon: <FiPieChart size={18} />, path: "/budgets" },
    { name: "Savings Goals", icon: <FiTarget size={18} />, path: "/goals" },
    { name: "Groups & Split", icon: <FiUsers size={18} />, path: "/split" },
    { name: "EMI / Loans", icon: <FiCreditCard size={18} />, path: "/emi" },
    // { name: "Calendar", icon: <FiCalendar size={18} />, path: "/calendar" },
    // { name: "Reports", icon: <FiFileText size={18} />, path: "/reports" },
    // { name: "Notifications", icon: <FiBell size={18} />, path: "/notifications" },
    { name: "Settings", icon: <FiSettings size={18} />, path: "/settings" },
  ];

  return (
    <aside className={`ur-sidebar ${isOpen ? "show" : ""}`}>
      <div className="ur-sidebar-top">
        {/* Brand Logo + Mobile Close Button */}
        <div className="ur-sidebar-header">
          <Link to="/dashboard" className="ur-brand-logo">
            <div className="ur-brand-icon">
              <IoWalletOutline size={22} />
            </div>
            <span className="ur-brand-name">
              Wal<span>trio</span>
            </span>
          </Link>

          {/* Close Button - visible only on mobile/tablet */}
          <button
            className="ur-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <Nav className="flex-column ur-nav-list">
          {navItems.map((item, idx) => {
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
      <div className="ur-sidebar-footer p-3 border-top mt-auto">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              U
            </div>
            <div className="d-flex flex-column" style={{ lineHeight: "1.15" }}>
              <span className="fw-700 text-dark fs-12.5px">Uday</span>
              <span className="text-muted fs-10.5px">uday@waltro.com</span>
            </div>
          </div>
          <Link
            to="/login"
            className="btn btn-light btn-sm p-1 rounded-6px text-danger"
            title="Log Out"
            style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <FiLogOut size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

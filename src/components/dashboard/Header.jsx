import React from "react";
import Button from "react-bootstrap/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic breadcrumb text mapping
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case "/income":
        return { section: "Finance", current: "Income Streams" };
      case "/expenses":
        return { section: "Finance", current: "Expenses & Bills" };
      case "/budgets":
        return { section: "Planning", current: "Budget Caps" };
      case "/groups":
      case "/split":
        return { section: "Social Finance", current: "Group & Split Expenses" };
      case "/profile":
        return { section: "Account", current: "User Profile" };
      case "/settings":
        return { section: "Preferences", current: "Settings" };
      default:
        return { section: "Dashboard", current: "Overview" };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="ur-top-header">
      {/* Header Left: Mobile Brand Logo on Left, Desktop Breadcrumb on Left */}
      <div className="ur-header-left d-flex align-items-center gap-2">
        {/* Mobile / Responsive: Brand Logo on Left */}
        <Link to="/dashboard" className="ur-brand-logo ur-header-mobile-brand text-decoration-none">
          <div className="ur-brand-icon">
            <IoWalletOutline size={20} />
          </div>
          <div className="d-flex align-items-center">
            <span className="ur-brand-name">
              Wal<span>trio</span>
            </span>
            <span className="ur-brand-badge">SaaS</span>
          </div>
        </Link>

        {/* Desktop: Dynamic Breadcrumb */}
        <div className="ur-breadcrumb-wrap ur-header-desktop-breadcrumb">
          <span className="ur-breadcrumb-root">{breadcrumb.section}</span>
          <span className="ur-breadcrumb-divider">/</span>
          <strong className="ur-breadcrumb-active">{breadcrumb.current}</strong>
        </div>
      </div>

      {/* Header Right: Actions + Mobile Bar Open (Hamburger) Button */}
      <div className="ur-header-actions d-flex align-items-center gap-2">
        <div className="ur-header-badge-status d-none d-sm-inline-flex">
          <span className="ur-live-dot"></span>
          <span>Live Sync</span>
        </div>

        {location.pathname !== "/income" && (
          <Button
            variant="outline-primary"
            size="sm"
            className="ms-btn-income d-none d-md-inline-flex fs-11.5px"
            onClick={() => navigate("/income")}
          >
            <FiArrowUpRight size={13} />
            <span>Income</span>
          </Button>
        )}

        {location.pathname !== "/expenses" && (
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-btn-expense d-none d-md-inline-flex fs-11.5px"
            onClick={() => navigate("/expenses")}
          >
            <FiArrowDownLeft size={13} />
            <span>Expense</span>
          </Button>
        )}

        {/* Mobile / Responsive: Bar Open Button on Right */}
        <button
          className="ur-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <FiMenu size={18} />
        </button>
      </div>
    </header>
  );
}

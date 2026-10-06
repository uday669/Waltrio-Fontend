import React from "react";
import Button from "react-bootstrap/Button";
import { FiMenu, FiPlus, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

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
      case "/settings":
        return { section: "Preferences", current: "Settings" };
      default:
        return { section: "Dashboard", current: "Overview" };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="ur-top-header">
      {/* Header Left: Hamburger (mobile) + Dynamic Breadcrumb */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="ur-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <FiMenu size={18} />
        </button>

        <div className="ur-breadcrumb-wrap">
          <span className="ur-breadcrumb-root">{breadcrumb.section}</span>
          <span className="ur-breadcrumb-divider">/</span>
          <strong className="ur-breadcrumb-active">{breadcrumb.current}</strong>
        </div>
      </div>

      {/* Header Actions on Right */}
      <div className="ur-header-actions">
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
      </div>
    </header>
  );
}

import React from "react";
import Button from "react-bootstrap/Button";
import { FiPlus, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();

  return (
    <header className="ur-top-header">
      {/* Header Left: Hamburger (mobile) + Breadcrumb */}
      <div className="d-flex align-items-center gap-2">
        {/* Hamburger Menu Button — visible only on mobile/tablet */}
        <button
          className="ur-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <FiMenu size={20} />
        </button>

        <span className="ur-breadcrumb-text">
          Dashboard <span className="text-muted mx-1">/</span> <strong className="text-dark">Overview</strong>
        </span>
      </div>

      {/* Header Actions on Right */}
      <div className="ur-header-actions">
        {/* Bell Icon Hidden */}
        {/* <button
          className="ur-bell-btn"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <FiBell size={15} />
          <span className="ur-bell-badge">3</span>
        </button> */}

        {/* Add Transaction Button */}
        {/* <Button
          className="btn-add-transaction border-0"
          onClick={() => navigate("/transactions")}
        >
          <FiPlus size={13} />
          <span className="d-none d-sm-inline">Add Transaction</span>
        </Button> */}
      </div>
    </header>
  );
}

import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import {
  FiChevronDown,
  FiBell,
  FiPlus,
  FiMenu,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const monthOptions = [
    { value: "2026-08", label: "📅 August 2026" },
    { value: "2026-07", label: "📅 July 2026" },
    { value: "2026-06", label: "📅 June 2026" },
    { value: "2026-05", label: "📅 May 2026" },
    { value: "2026-04", label: "📅 April 2026" },
  ];

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);

  // Select2 Custom Styling for Header Month (Compact 34px)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
      borderRadius: "8px",
      minHeight: "34px",
      height: "34px",
      width: "145px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.12)" : "none",
      fontSize: "12px",
      fontWeight: "500",
      color: "#0f172a",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#4f46e5"
        : state.isFocused
        ? "rgba(79, 70, 229, 0.08)"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      fontSize: "11.5px",
      fontWeight: state.isSelected ? "600" : "500",
      borderRadius: "6px",
      margin: "2px 4px",
      width: "calc(100% - 8px)",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      padding: "3px",
      zIndex: 1000,
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
      fontWeight: "500",
      fontSize: "12px",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#64748b",
      padding: "2px 6px",
    }),
  };

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
        {/* Month Selector — hidden on small phones */}
        <div className="d-none d-sm-block">
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            styles={selectStyles}
            isSearchable={false}
            aria-label="Select Month"
          />
        </div>

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
        <Button
          className="btn-add-transaction border-0"
          onClick={() => navigate("/transactions")}
        >
          <FiPlus size={13} />
          <span className="d-none d-sm-inline">Add Transaction</span>
        </Button>
      </div>
    </header>
  );
}

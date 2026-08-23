import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import {
  FiChevronDown,
  FiBell,
  FiPlus,
} from "react-icons/fi";

export default function Header() {
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
      {/* Header Left Title / Breadcrumb */}
      <div className="d-flex align-items-center">
        <span className="fs-13px fw-600 text-secondary">
          Dashboard <span className="text-muted mx-1">/</span> <strong className="text-dark">Overview</strong>
        </span>
      </div>

      {/* Header Actions on Right */}
      <div className="ur-header-actions">
        {/* Month Selector */}
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

        {/* Bell Icon with Badge 3 */}
        <button className="ur-bell-btn" aria-label="Notifications">
          <FiBell size={15} />
          <span className="ur-bell-badge">3</span>
        </button>

        {/* User Profile */}
        <Dropdown>
          <Dropdown.Toggle
            as="div"
            className="ur-user-toggle"
            id="dropdown-user"
          >
            <div className="ur-user-avatar">
              <span>U</span>
            </div>
            <span className="ur-user-name-text">Uday</span>
            <FiChevronDown size={12} className="text-muted ms-1" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm rounded-10px border-0 p-1">
            <Dropdown.Item className="rounded-6px fs-12px">My Profile</Dropdown.Item>
            <Dropdown.Item className="rounded-6px fs-12px">Settings</Dropdown.Item>
            <Dropdown.Divider className="my-1" />
            <Dropdown.Item className="rounded-6px fs-12px text-danger">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Sleek Compact + Add Transaction Button */}
        <Button className="btn-add-transaction border-0">
          <FiPlus size={13} />
          <span>Add Transaction</span>
        </Button>
      </div>
    </header>
  );
}

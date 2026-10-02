import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
} from "react-icons/fi";

export const MONTHS = [
  { value: 1, label: "January", short: "Jan" },
  { value: 2, label: "February", short: "Feb" },
  { value: 3, label: "March", short: "Mar" },
  { value: 4, label: "April", short: "Apr" },
  { value: 5, label: "May", short: "May" },
  { value: 6, label: "June", short: "Jun" },
  { value: 7, label: "July", short: "Jul" },
  { value: 8, label: "August", short: "Aug" },
  { value: 9, label: "September", short: "Sep" },
  { value: 10, label: "October", short: "Oct" },
  { value: 11, label: "November", short: "Nov" },
  { value: 12, label: "December", short: "Dec" },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MonthYearFilter({
  selectedMonth,
  selectedYear,
  selectedDate, // "YYYY-MM-DD" or null
  selectedMode = "month", // "month" | "date" | "all"
  onChangeMonth,
  onChangeYear,
  onChangeDate,
  onChangeMode,
  onFilterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(selectedMode || "month"); // "month" | "date"
  const containerRef = useRef(null);

  const currentYearNum = Number(selectedYear) || new Date().getFullYear();
  const currentMonthNum = Number(selectedMonth) || new Date().getMonth() + 1;

  const [viewYear, setViewYear] = useState(currentYearNum);
  const [viewMonth, setViewMonth] = useState(currentMonthNum);

  // Sync internal view with props
  useEffect(() => {
    setViewYear(currentYearNum);
    setViewMonth(currentMonthNum);
  }, [currentYearNum, currentMonthNum]);

  useEffect(() => {
    if (selectedMode) setActiveTab(selectedMode);
  }, [selectedMode]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedMonthObj =
    MONTHS.find((m) => m.value === currentMonthNum) || MONTHS[0];

  // Formatted Label for trigger button
  const triggerLabel = useMemo(() => {
    if (activeTab === "date" && selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const mObj = MONTHS.find((mo) => mo.value === m);
      return `${d} ${mObj ? mObj.short : ""} ${y}`;
    }
    return `${selectedMonthObj.label} ${currentYearNum}`;
  }, [activeTab, selectedDate, selectedMonthObj, currentYearNum]);

  // Generate calendar days for "Specific Date" view
  const calendarDays = useMemo(() => {
    const totalDays = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay();
    const prevMonthTotalDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        month: viewMonth === 1 ? 12 : viewMonth - 1,
        year: viewMonth === 1 ? viewYear - 1 : viewYear,
        isOtherMonth: true,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isOtherMonth: false,
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth === 12 ? 1 : viewMonth + 1,
        year: viewMonth === 12 ? viewYear + 1 : viewYear,
        isOtherMonth: true,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Handlers
  const handleSelectMonth = (monthVal) => {
    setActiveTab("month");
    if (onChangeMode) onChangeMode("month");
    if (onChangeYear && viewYear !== currentYearNum) onChangeYear(viewYear);
    if (onChangeMonth) onChangeMonth(monthVal);
    if (onChangeDate) onChangeDate(null);
    if (onFilterChange) {
      onFilterChange({
        mode: "month",
        month: monthVal,
        year: viewYear,
        date: null,
      });
    }
    setIsOpen(false);
  };

  const handleSelectSpecificDate = ({ day, month, year }) => {
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    setActiveTab("date");
    if (onChangeMode) onChangeMode("date");
    if (onChangeMonth) onChangeMonth(month);
    if (onChangeYear) onChangeYear(year);
    if (onChangeDate) onChangeDate(formattedDate);
    if (onFilterChange) {
      onFilterChange({
        mode: "date",
        month,
        year,
        date: formattedDate,
      });
    }
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const now = new Date();
    const d = now.getDate();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    handleSelectSpecificDate({ day: d, month: m, year: y });
  };

  return (
    <div className="ur-month-filter-dropdown position-relative" ref={containerRef}>
      {/* Clickable DatePicker Trigger Button */}
      <button
        type="button"
        className={`ur-month-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Click to select month, year, or specific date"
      >
        <span className="ur-month-icon-box">
          <FiCalendar size={14} />
        </span>
        <span className="ur-month-label-text">{triggerLabel}</span>
        <FiChevronDown
          size={14}
          className={`ur-month-chevron ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* DatePicker Popup Menu */}
      {isOpen && (
        <div className={`ur-month-picker-popup ${activeTab === "date" ? "wide" : ""}`}>
          {/* Mode Switcher Tabs */}
          <div className="ur-date-mode-tabs p-1 border-bottom bg-light d-flex gap-1">
            <button
              type="button"
              className={`ur-mode-tab-btn ${activeTab === "month" ? "active" : ""}`}
              onClick={() => setActiveTab("month")}
            >
              By Month
            </button>
            <button
              type="button"
              className={`ur-mode-tab-btn ${activeTab === "date" ? "active" : ""}`}
              onClick={() => setActiveTab("date")}
            >
              Specific Date
            </button>
          </div>

          {/* VIEW 1: MONTH & YEAR PICKER */}
          {activeTab === "month" && (
            <>
              {/* Year Navigator */}
              <div className="ur-month-picker-header d-flex align-items-center justify-content-between p-2 border-bottom">
                <button
                  type="button"
                  className="ur-month-nav-arrow"
                  onClick={() => setViewYear((y) => y - 1)}
                  title="Previous Year"
                >
                  <FiChevronLeft size={16} />
                </button>

                <span className="fw-800 fs-14px text-dark">{viewYear}</span>

                <button
                  type="button"
                  className="ur-month-nav-arrow"
                  onClick={() => setViewYear((y) => y + 1)}
                  title="Next Year"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="ur-month-picker-grid p-2">
                {MONTHS.map((m) => {
                  const isSelected =
                    activeTab === "month" &&
                    m.value === currentMonthNum &&
                    viewYear === currentYearNum;
                  const isCurrentCalendarMonth =
                    m.value === new Date().getMonth() + 1 &&
                    viewYear === new Date().getFullYear();

                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleSelectMonth(m.value)}
                      className={`ur-month-grid-item ${
                        isSelected ? "selected" : ""
                      } ${isCurrentCalendarMonth && !isSelected ? "today" : ""}`}
                    >
                      <span className="month-short">{m.short}</span>
                      {isSelected && <FiCheck size={11} className="ms-1" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: SPECIFIC DATE DAY PICKER */}
          {activeTab === "date" && (
            <>
              {/* Month & Year Navigator */}
              <div className="ur-month-picker-header d-flex align-items-center justify-content-between p-2 border-bottom">
                <button
                  type="button"
                  className="ur-month-nav-arrow"
                  onClick={() => {
                    if (viewMonth === 1) {
                      setViewMonth(12);
                      setViewYear((y) => y - 1);
                    } else {
                      setViewMonth((m) => m - 1);
                    }
                  }}
                  title="Previous Month"
                >
                  <FiChevronLeft size={16} />
                </button>

                <span className="fw-800 fs-13px text-dark">
                  {MONTHS[viewMonth - 1]?.label} {viewYear}
                </span>

                <button
                  type="button"
                  className="ur-month-nav-arrow"
                  onClick={() => {
                    if (viewMonth === 12) {
                      setViewMonth(1);
                      setViewYear((y) => y + 1);
                    } else {
                      setViewMonth((m) => m + 1);
                    }
                  }}
                  title="Next Month"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

              {/* Day Headers (Su, Mo, Tu...) */}
              <div className="ur-calendar-weekdays px-2 pt-2 pb-1">
                {WEEKDAYS.map((wd, i) => (
                  <div key={i} className="ur-weekday-label">
                    {wd}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="ur-calendar-days-grid px-2 pb-2">
                {calendarDays.map((dObj, idx) => {
                  const dateStr = `${dObj.year}-${String(dObj.month).padStart(
                    2,
                    "0"
                  )}-${String(dObj.day).padStart(2, "0")}`;
                  const isSelected = activeTab === "date" && selectedDate === dateStr;
                  const isToday =
                    dateStr === new Date().toISOString().slice(0, 10);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSpecificDate(dObj)}
                      className={`ur-day-grid-item ${
                        dObj.isOtherMonth ? "other-month" : ""
                      } ${isSelected ? "selected" : ""} ${
                        isToday && !isSelected ? "today" : ""
                      }`}
                    >
                      {dObj.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Action Footer */}
          <div className="ur-month-picker-footer p-2 border-top bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-link btn-sm text-primary fw-600 fs-11px p-0 text-decoration-none"
                onClick={handleSetToday}
              >
                Today
              </button>
              <span className="text-muted fs-11px">•</span>
              <button
                type="button"
                className="btn btn-link btn-sm text-primary fw-600 fs-11px p-0 text-decoration-none"
                onClick={() => {
                  const now = new Date();
                  handleSelectMonth(now.getMonth() + 1);
                }}
              >
                This Month
              </button>
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm fs-11px py-0 px-2 rounded-4px text-muted"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

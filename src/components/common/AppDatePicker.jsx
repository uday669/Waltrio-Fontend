import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
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

/**
 * AppDatePicker
 * Pure React custom interactive DatePicker for forms and modals.
 * Replaces standard browser/3rd-party date inputs with Waltrio brand styling.
 */
export default function AppDatePicker({
  value,
  onChange,
  showMonthYearPicker = false,
  placeholder,
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState(showMonthYearPicker ? "month" : "date"); // "date" | "month" | "year"
  const containerRef = useRef(null);

  // Normalize incoming value to { y, m, d }
  const selectedDateObj = useMemo(() => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return {
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      };
    }
    if (typeof value === "string") {
      const parts = value.split("-").map(Number);
      if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return { year: parts[0], month: parts[1], day: parts[2] };
      }
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { year: parts[0], month: parts[1], day: 1 };
      }
    }
    return null;
  }, [value]);

  const today = useMemo(() => {
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }, []);

  const [viewYear, setViewYear] = useState(selectedDateObj?.year || today.year);
  const [viewMonth, setViewMonth] = useState(selectedDateObj?.month || today.month);

  // Sync internal view with incoming value
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.year);
      setViewMonth(selectedDateObj.month);
    }
  }, [selectedDateObj]);

  // Click outside to close popup
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

  // Formatted display value in the input
  const displayValue = useMemo(() => {
    if (!selectedDateObj) return "";
    const mObj = MONTHS.find((m) => m.value === selectedDateObj.month);
    if (showMonthYearPicker) {
      return `${mObj?.label || ""} ${selectedDateObj.year}`;
    }
    return `${selectedDateObj.day} ${mObj?.short || ""} ${selectedDateObj.year}`;
  }, [selectedDateObj, showMonthYearPicker]);

  // Calendar days generation
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
        isPadding: true,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isPadding: false,
      });
    }

    // Next month padding to fill grid
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        month: viewMonth === 12 ? 1 : viewMonth + 1,
        year: viewMonth === 12 ? viewYear + 1 : viewYear,
        isPadding: true,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dayObj) => {
    const yyyy = dayObj.year;
    const mm = String(dayObj.month).padStart(2, "0");
    const dd = String(dayObj.day).padStart(2, "0");
    const isoString = `${yyyy}-${mm}-${dd}`;
    onChange && onChange(isoString, new Date(yyyy, dayObj.month - 1, dayObj.day));
    setIsOpen(false);
  };

  const handleSelectMonth = (monthVal) => {
    if (showMonthYearPicker) {
      const mm = String(monthVal).padStart(2, "0");
      const isoString = `${viewYear}-${mm}`;
      onChange && onChange(isoString, new Date(viewYear, monthVal - 1, 1));
      setIsOpen(false);
    } else {
      setViewMonth(monthVal);
      setViewMode("date");
    }
  };

  const handleSelectToday = () => {
    const yyyy = today.year;
    const mm = String(today.month).padStart(2, "0");
    const dd = String(today.day).padStart(2, "0");
    const isoString = `${yyyy}-${mm}-${dd}`;
    setViewYear(today.year);
    setViewMonth(today.month);
    onChange && onChange(isoString, new Date());
    setIsOpen(false);
  };

  const currentMonthName = MONTHS.find((m) => m.value === viewMonth)?.label || "";

  return (
    <div className="position-relative w-100 ur-datepicker-container" ref={containerRef}>
      {/* Input Trigger */}
      <div
        className={`position-relative w-100 ${disabled ? "opacity-50" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <input
          type="text"
          readOnly
          disabled={disabled}
          value={displayValue}
          placeholder={placeholder || (showMonthYearPicker ? "Select month" : "Select date")}
          className={`ur-form-input w-100 ${className}`}
          style={{ paddingRight: "36px", cursor: disabled ? "not-allowed" : "pointer" }}
        />
        <FiCalendar
          size={15}
          className="position-absolute text-muted"
          style={{
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Floating Calendar Popup */}
      {isOpen && (
        <div
          className="ur-month-picker-popup position-absolute shadow-lg border"
          style={{
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 999999,
            width: "290px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
          }}
        >
          {/* Header Navigation */}
          <div className="ur-month-picker-header d-flex align-items-center justify-content-between p-2 border-bottom">
            <button
              type="button"
              className="ur-month-nav-arrow"
              onClick={viewMode === "month" ? () => setViewYear((y) => y - 1) : handlePrevMonth}
              title="Previous"
            >
              <FiChevronLeft size={16} />
            </button>

            <div className="d-flex align-items-center gap-1">
              {!showMonthYearPicker && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-dark fw-700 text-decoration-none p-0 px-1"
                  onClick={() => setViewMode(viewMode === "month" ? "date" : "month")}
                >
                  {currentMonthName}
                </button>
              )}
              <span className="fw-700 text-dark fs-13px">{viewYear}</span>
            </div>

            <button
              type="button"
              className="ur-month-nav-arrow"
              onClick={viewMode === "month" ? () => setViewYear((y) => y + 1) : handleNextMonth}
              title="Next"
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* Month Mode Selector */}
          {viewMode === "month" ? (
            <div className="p-3">
              <div className="ur-month-picker-grid">
                {MONTHS.map((m) => {
                  const isSelected = selectedDateObj?.month === m.value && selectedDateObj?.year === viewYear;
                  const isCurrent = today.month === m.value && today.year === viewYear;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      className={`ur-month-grid-item ${isSelected ? "selected" : ""} ${
                        isCurrent && !isSelected ? "today" : ""
                      }`}
                      onClick={() => handleSelectMonth(m.value)}
                    >
                      {m.short}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Calendar Day Grid */
            <div className="p-2">
              <div className="ur-calendar-weekdays mb-1">
                {WEEKDAYS.map((w, idx) => (
                  <div key={idx} className="ur-weekday-label text-muted fs-10.5px fw-600">
                    {w}
                  </div>
                ))}
              </div>
              <div className="ur-calendar-days-grid">
                {calendarDays.map((d, idx) => {
                  const isSelected =
                    selectedDateObj &&
                    selectedDateObj.year === d.year &&
                    selectedDateObj.month === d.month &&
                    selectedDateObj.day === d.day;
                  const isTodayDate =
                    today.year === d.year && today.month === d.month && today.day === d.day;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`ur-day-grid-item ${d.isPadding ? "padding text-muted opacity-50" : ""} ${
                        isSelected ? "selected" : ""
                      } ${isTodayDate && !isSelected ? "today" : ""}`}
                      onClick={() => handleSelectDay(d)}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Shortcuts */}
          <div className="ur-month-picker-footer d-flex align-items-center justify-content-between p-2 border-top bg-light">
            <button
              type="button"
              className="btn btn-sm btn-link text-primary fw-600 text-decoration-none fs-11px p-0 d-flex align-items-center gap-1"
              onClick={handleSelectToday}
            >
              <FiClock size={12} /> Today
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary fw-500 text-decoration-none fs-11px p-0"
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

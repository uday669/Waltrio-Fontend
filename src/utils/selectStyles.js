// Universal Select2 (react-select) Custom Styles for Waltrio

// 1. Filter Dropdown Styles (Used in Table Toolbars)
export const filterSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#f8fafc",
    borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
    borderRadius: "8px",
    minHeight: "34px",
    height: "34px",
    width: "140px",
    minWidth: "130px",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.12)" : "none",
    fontSize: "12px",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
    flexShrink: 0,
    "&:hover": {
      borderColor: "#cbd5e1",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
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
    zIndex: 9999,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (base) => ({
    ...base,
    color: "#334155",
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

// 2. Form & Modal Dropdown Styles (Used in Form inputs)
export const formSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#ffffff",
    borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
    borderRadius: "8px",
    minHeight: "36px",
    height: "36px",
    width: "100%",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(79, 70, 229, 0.12)" : "none",
    fontSize: "12.5px",
    fontWeight: "500",
    color: "#0f172a",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#cbd5e1",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 10px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#4f46e5"
      : state.isFocused
      ? "rgba(79, 70, 229, 0.08)"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    fontSize: "12px",
    fontWeight: state.isSelected ? "600" : "500",
    borderRadius: "6px",
    margin: "2px 4px",
    width: "calc(100% - 8px)",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "8px",
    boxShadow: "0 12px 28px -4px rgba(0, 0, 0, 0.12)",
    border: "1px solid #e2e8f0",
    padding: "4px",
    zIndex: 9999,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontWeight: "500",
    fontSize: "12.5px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#64748b",
    padding: "4px 8px",
  }),
};

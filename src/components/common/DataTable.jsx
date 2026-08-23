/**
 * ==============================================================================
 * WALTRIO - MASTER REUSABLE COMMON DATA TABLE COMPONENT
 * ==============================================================================
 * 
 * A plug-and-play universal Data Table for any page (Income, Expenses, Transactions,
 * Budgets, etc.). Fully compatible with React 19, API state, live search, multi-column 
 * sorting, pagination, multi-row selection, bulk delete, CSV export, and loading states.
 * 
 * ------------------------------------------------------------------------------
 * HOW TO USE WITH API OR LOCAL STATE (Only ONE Tag in your page):
 * ------------------------------------------------------------------------------
 * ```jsx
 * import CommonDataTable from "../../components/common/DataTable";
 * 
 * export default function AnyPage() {
 *   const [data, setData] = useState([]);
 *   const [loading, setLoading] = useState(false);
 * 
 *   // 1. Define Columns
 *   const columns = [
 *     { name: "ID", selector: row => row.id, sortable: true, width: "100px" },
 *     { name: "Title", selector: row => row.title, sortable: true },
 *     { name: "Amount", selector: row => row.amount, sortable: true, right: true, cell: row => `₹${row.amount}` },
 *     { name: "Actions", right: true, cell: row => <Button onClick={() => edit(row)}>Edit</Button> }
 *   ];
 * 
 *   // 2. Drop in the table
 *   return (
 *     <CommonDataTable
 *       title="My Table"
 *       subtitle="Subtitle description"
 *       columns={columns}
 *       data={data}
 *       loading={loading}
 *       keyField="id"
 *       onBulkDelete={(selectedIds) => deleteFromApi(selectedIds)}
 *       filters={<MyCustomFilters />}
 *       actions={<Button onClick={openAddModal}>+ Add Item</Button>}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useMemo } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiDownload,
  FiTrash2,
  FiX,
  FiInbox,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

export default function CommonDataTable({
  // Main Data & Config
  columns = [],
  data = [],
  keyField = "id",
  loading = false,
  error = null,
  onRetry = null,

  // Card Wrapper Settings
  wrapInCard = true,
  cardClassName = "ms-premium-card border-0 mb-4",
  
  // Header & Description
  title = "",
  subtitle = "",
  
  // Search Configuration
  searchable = true,
  searchPlaceholder = "Search records...",
  searchFields = [], // Optional: specify specific fields e.g. ['name', 'description']
  
  // Filters & Custom Header Buttons
  filters = null,
  actions = null,
  
  // Selection & Bulk Operations
  selectableRows = true,
  onSelectedRowsChange = null,
  onBulkDelete = null,
  
  // Export Configuration
  exportable = true,
  exportFileName = "Export_Statements",
  
  // Sorting Configuration
  initialSortField = "",
  initialSortOrder = "desc", // 'asc' | 'desc'
  
  // Pagination Configuration
  pagination = true,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  
  // Empty State Message
  emptyMessage = "No matching records found.",
}) {
  // ---------------------------------------------------------------------------
  // Internal States
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(initialSortField);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set());

  // ---------------------------------------------------------------------------
  // 1. Live Client-Side Search Filtering
  // ---------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const query = searchTerm.toLowerCase();

    return data.filter((row) => {
      // If specific searchFields are provided, search only in those
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = row[field];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      }

      // Default: Search across all scalar values of the row object
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchTerm, searchFields]);

  // ---------------------------------------------------------------------------
  // 2. Column Sorting (Numbers, Dates, Strings)
  // ---------------------------------------------------------------------------
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // If selector was passed as a function and matched sortField
      if (aVal === undefined || bVal === undefined) {
        const matchingCol = columns.find((c) => (c.sortField || c.selector) === sortField);
        if (matchingCol && typeof matchingCol.selector === "function") {
          aVal = matchingCol.selector(a);
          bVal = matchingCol.selector(b);
        }
      }

      // Numerical Comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Date Comparison
      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      // String Comparison
      const aStr = String(aVal || "").toLowerCase();
      const bStr = String(bVal || "").toLowerCase();
      if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder, columns]);

  // ---------------------------------------------------------------------------
  // 3. Client-Side Pagination
  // ---------------------------------------------------------------------------
  const totalItems = sortedData.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validCurrentPage, pageSize, pagination]);

  // Toggle Column Sort
  const handleSort = (field, sortable = true) => {
    if (!sortable) return;
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ---------------------------------------------------------------------------
  // 4. Selection Handlers
  // ---------------------------------------------------------------------------
  const isAllCurrentSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRowKeys.has(row[keyField]));

  const handleSelectAll = (e) => {
    const nextSelected = new Set(selectedRowKeys);
    if (e.target.checked) {
      paginatedData.forEach((row) => nextSelected.add(row[keyField]));
    } else {
      paginatedData.forEach((row) => nextSelected.delete(row[keyField]));
    }
    setSelectedRowKeys(nextSelected);
    if (onSelectedRowsChange) {
      const selectedRows = data.filter((row) => nextSelected.has(row[keyField]));
      onSelectedRowsChange(selectedRows);
    }
  };

  const handleRowSelect = (key) => {
    const nextSelected = new Set(selectedRowKeys);
    if (nextSelected.has(key)) {
      nextSelected.delete(key);
    } else {
      nextSelected.add(key);
    }
    setSelectedRowKeys(nextSelected);
    if (onSelectedRowsChange) {
      const selectedRows = data.filter((row) => nextSelected.has(row[keyField]));
      onSelectedRowsChange(selectedRows);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. CSV Export Helper
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    const exportData =
      selectedRowKeys.size > 0
        ? data.filter((row) => selectedRowKeys.has(row[keyField]))
        : sortedData;

    if (exportData.length === 0) return;

    const visibleCols = columns.filter((col) => col.selector || col.name);
    const headers = visibleCols.map((col) => `"${col.name}"`).join(",");

    const rows = exportData.map((row) => {
      return visibleCols
        .map((col) => {
          let val = "";
          if (typeof col.selector === "function") {
            val = col.selector(row);
          } else if (col.selector) {
            val = row[col.selector];
          }
          if (val === null || val === undefined) val = "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------------------------------------------------------
  // 6. Bulk Delete Handler
  // ---------------------------------------------------------------------------
  const handleTriggerBulkDelete = () => {
    if (onBulkDelete && selectedRowKeys.size > 0) {
      const selectedKeysArray = Array.from(selectedRowKeys);
      onBulkDelete(selectedKeysArray);
      setSelectedRowKeys(new Set());
    }
  };

  const startEntry = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(validCurrentPage * pageSize, totalItems);

  // ---------------------------------------------------------------------------
  // TABLE CORE CONTENT
  // ---------------------------------------------------------------------------
  const tableContent = (
    <div className="ur-datatable-wrapper">
      {/* Top Header & Search Controls (Strict Single-Line Alignment) */}
      <div className="ur-datatable-toolbar d-flex align-items-center justify-content-between gap-3 mb-3">
        {(title || subtitle) && (
          <div className="ur-datatable-header-text">
            {title && <h5 className="ur-datatable-title mb-0">{title}</h5>}
            {subtitle && <p className="ur-datatable-sub text-muted mb-0">{subtitle}</p>}
          </div>
        )}

        <div className="ur-datatable-controls-row">
          {/* Custom Filters (Passed from Parent Page) */}
          {filters}

          {/* Live Search Input */}
          {searchable && (
            <div className="ur-table-search-box position-relative">
              <FiSearch className="ur-search-icon" size={14} />
              <Form.Control
                type="text"
                size="sm"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="ur-table-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="ur-search-clear-btn"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
          )}

          {/* Export CSV Button */}
          {exportable && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="ur-table-export-btn d-flex align-items-center gap-1"
              onClick={handleExportCSV}
              title="Export to CSV"
            >
              <FiDownload size={13} />
              <span className="d-none d-sm-inline">Export</span>
            </Button>
          )}

          {/* Other Actions / Add Button */}
          {actions}
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <Alert variant="danger" className="d-flex align-items-center justify-content-between py-2 px-3 mb-3 fs-12px rounded-8px">
          <div className="d-flex align-items-center gap-2">
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
          {onRetry && (
            <Button variant="outline-danger" size="sm" onClick={onRetry} className="d-flex align-items-center gap-1 fs-11px py-0 px-2">
              <FiRefreshCw size={11} /> Retry
            </Button>
          )}
        </Alert>
      )}

      {/* Bulk Selection Notification Bar */}
      {selectableRows && selectedRowKeys.size > 0 && (
        <div className="ur-bulk-selection-bar mb-2 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="ur-bulk-badge">{selectedRowKeys.size}</span>
            <span className="ur-bulk-text">item(s) selected across table</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="light"
              size="sm"
              className="ur-bulk-btn-clear"
              onClick={() => setSelectedRowKeys(new Set())}
            >
              Deselect All
            </Button>
            {onBulkDelete && (
              <Button
                variant="danger"
                size="sm"
                className="ur-bulk-btn-delete d-flex align-items-center gap-1"
                onClick={handleTriggerBulkDelete}
              >
                <FiTrash2 size={13} />
                <span>Delete Selected</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Table Responsive Container */}
      <div className="table-responsive ur-table-responsive-box">
        <Table hover className="ur-custom-datatable align-middle mb-0">
          <thead>
            <tr>
              {selectableRows && (
                <th style={{ width: "42px", minWidth: "42px" }} className="text-center">
                  <Form.Check
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleSelectAll}
                    className="ur-table-checkbox"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col, idx) => {
                const colKey = col.sortField || (typeof col.selector === "string" ? col.selector : col.name);
                const isSorted = sortField === colKey;
                return (
                  <th
                    key={idx}
                    style={{
                      width: col.width || "auto",
                      minWidth: col.minWidth || "auto",
                      textAlign: col.right ? "right" : col.center ? "center" : "left",
                      cursor: col.sortable ? "pointer" : "default",
                    }}
                    onClick={() => col.sortable && handleSort(colKey, col.sortable)}
                    className={`ur-th-col ${col.sortable ? "sortable" : ""} ${isSorted ? "sorted" : ""}`}
                  >
                    <div
                      className={`d-flex align-items-center gap-1 ${
                        col.right ? "justify-content-end" : col.center ? "justify-content-center" : ""
                      }`}
                    >
                      <span>{col.name}</span>
                      {col.sortable && (
                        <span className="ur-sort-arrows">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <FiChevronUp size={13} className="text-primary" />
                            ) : (
                              <FiChevronDown size={13} className="text-primary" />
                            )
                          ) : (
                            <span className="ur-sort-inactive-arrows">
                              <FiChevronUp size={11} />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Loading State Spinner */}
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectableRows ? 1 : 0)} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <Spinner animation="border" variant="primary" size="sm" className="mb-2" />
                    <span className="text-muted fs-12px fw-500">Loading data, please wait...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              /* Empty State Message */
              <tr>
                <td colSpan={columns.length + (selectableRows ? 1 : 0)} className="text-center py-5">
                  <div className="ur-empty-table-state py-4">
                    <div className="ur-empty-icon mb-2">
                      <FiInbox size={38} className="text-muted opacity-50" />
                    </div>
                    <h6 className="fw-700 text-dark mb-1">{emptyMessage}</h6>
                    <p className="text-muted fs-12px mb-3">
                      {searchTerm
                        ? `No results found matching "${searchTerm}". Try resetting your search filter.`
                        : "There are currently no records available in this view."}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="rounded-6px fs-11.5px px-3"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              /* Paginated Data Rows */
              paginatedData.map((row, rIdx) => {
                const isSelected = selectedRowKeys.has(row[keyField]);
                return (
                  <tr
                    key={row[keyField] || rIdx}
                    className={`ur-datatable-row ${isSelected ? "ur-row-selected" : ""}`}
                  >
                    {selectableRows && (
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(row[keyField])}
                          className="ur-table-checkbox"
                          aria-label={`Select row ${row[keyField]}`}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          textAlign: col.right ? "right" : col.center ? "center" : "left",
                        }}
                        className="ur-td-cell"
                      >
                        {col.cell
                          ? col.cell(row)
                          : typeof col.selector === "function"
                          ? col.selector(row)
                          : row[col.selector]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && (
        <div className="ur-datatable-footer d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 pt-3 mt-1">
          {/* Summary Info & Page Size selector */}
          <div className="d-flex align-items-center gap-3 fs-12px text-muted">
            <span>
              Showing <strong className="text-dark">{startEntry}</strong> to{" "}
              <strong className="text-dark">{endEntry}</strong> of{" "}
              <strong className="text-dark">{totalItems}</strong> entries
            </span>

            <div className="d-flex align-items-center gap-1 ms-2">
              <span>Rows:</span>
              <Form.Select
                size="sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ur-pagesize-select"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {/* Page Number Buttons */}
          <div className="ur-pagination-nav d-flex align-items-center gap-1">
            <Button
              variant="light"
              size="sm"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="ur-page-nav-btn"
              title="First Page"
            >
              <FiChevronsLeft size={14} />
            </Button>

            <Button
              variant="light"
              size="sm"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="ur-page-nav-btn"
              title="Previous Page"
            >
              <FiChevronLeft size={14} />
            </Button>

            {/* Numeric Page Buttons with Ellipsis */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true;
                return Math.abs(p - validCurrentPage) <= 1 || p === 1 || p === totalPages;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="ur-page-ellipsis">...</span>}
                    <Button
                      variant={validCurrentPage === p ? "primary" : "light"}
                      size="sm"
                      onClick={() => setCurrentPage(p)}
                      className={`ur-page-number-btn ${validCurrentPage === p ? "active" : ""}`}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                );
              })}

            <Button
              variant="light"
              size="sm"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="ur-page-nav-btn"
              title="Next Page"
            >
              <FiChevronRight size={14} />
            </Button>

            <Button
              variant="light"
              size="sm"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="ur-page-nav-btn"
              title="Last Page"
            >
              <FiChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // If wrapInCard is true, automatically wrap in Waltrio Card
  if (wrapInCard) {
    return (
      <Card className={cardClassName}>
        <Card.Body className="p-3">
          {tableContent}
        </Card.Body>
      </Card>
    );
  }

  return tableContent;
}

export { CommonDataTable };

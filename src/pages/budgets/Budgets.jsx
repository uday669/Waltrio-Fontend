import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Chart from "react-apexcharts";
import {
  FiPieChart,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCoffee,
  FiHome,
  FiShoppingBag,
  FiZap,
  FiActivity,
  FiBook,
  FiRefreshCw,
} from "react-icons/fi";
import Select from "react-select";
import { formSelectStyles } from "../../utils/selectStyles";
import CommonDataTable from "../../components/common/DataTable";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBudgetCategories,
  useUpsertBudgetCategory,
  useDeleteBudgetCategory,
} from "../../hooks/useBudgets";
import { deleteBudgetCategory } from "../../api/budgets.api";
import { toast } from "../../lib/toast";

// Per-category visuals (icon + colors) attached to each server record.
const CATEGORY_META = {
  "Housing": { icon: <FiHome size={15} />, color: "#4f46e5", bg: "#eef2ff" },
  "Food & Dining": { icon: <FiCoffee size={15} />, color: "#8b5cf6", bg: "#f5f3ff" },
  "Transportation & Fuel": { icon: <FiTrendingUp size={15} />, color: "#f59e0b", bg: "#fffbeb" },
  "Shopping & Retail": { icon: <FiShoppingBag size={15} />, color: "#ec4899", bg: "#fdf2f8" },
  "Utilities & Bills": { icon: <FiZap size={15} />, color: "#06b6d4", bg: "#ecfeff" },
  "Fitness & Wellness": { icon: <FiActivity size={15} />, color: "#10b981", bg: "#ecfdf5" },
  Entertainment: { icon: <FiCoffee size={15} />, color: "#d97706", bg: "#fef3c7" },
  Healthcare: { icon: <FiPieChart size={15} />, color: "#ef4444", bg: "#fff1f2" },
  Education: { icon: <FiBook size={15} />, color: "#6366f1", bg: "#eef2ff" },
};
const DEFAULT_META = { icon: <FiPieChart size={15} />, color: "#4f46e5", bg: "#eef2ff" };
const withVisuals = (b) => ({ ...b, ...(CATEGORY_META[b.category] || DEFAULT_META) });

export default function Budgets() {
  const queryClient = useQueryClient();

  // GET /budget/category — real caps (visuals attached client-side).
  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    isError: budgetsIsError,
    error: budgetsErr,
  } = useBudgetCategories();

  React.useEffect(() => {
    if (budgetsIsError) {
      console.error("[budgets] request failed:", budgetsErr);
      toast.error(budgetsErr?.message || "Could not load budgets.");
    }
  }, [budgetsIsError, budgetsErr]);

  const budgets = useMemo(() => (budgetsData || []).map(withVisuals), [budgetsData]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  // Form State — only fields the API accepts.
  const [formData, setFormData] = useState({
    category: "Food & Dining",
    label: "",
    monthlyAmount: "",
    alertThreshold: "80",
  });

  // ---- Mutations --------------------------------------------------------
  // POST/PUT /budget/category (upsert) — used by both Add and Edit.
  const { mutate: upsertBudget, isPending: saving } = useUpsertBudgetCategory({
    onSuccess: () => {
      toast.success("Budget saved.");
      setShowAddModal(false);
      setShowEditModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not save budget."),
  });

  // DELETE /budget/category/:id
  const { mutate: deleteBudgetMut } = useDeleteBudgetCategory({
    onSuccess: () => {
      toast.success("Budget deleted.");
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not delete budget."),
  });

  // Exact body the API expects for an upsert (only these four fields).
  const buildPayload = (extra = {}) => ({
    category: formData.category,
    label: formData.label || formData.category,
    monthlyAmount: Number(formData.monthlyAmount),
    alertThreshold: Number(formData.alertThreshold),
    ...extra,
  });

  // Calculate Overall Metrics
  const metrics = useMemo(() => {
    let totalAllocated = 0;
    let totalSpent = 0;

    budgets.forEach((b) => {
      totalAllocated += Number(b.allocated) || 0;
      totalSpent += Number(b.spent) || 0;
    });

    const remaining = Math.max(0, totalAllocated - totalSpent);
    const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    const overBudgetCount = budgets.filter((b) => Number(b.spent) > Number(b.allocated)).length;

    return { totalAllocated, totalSpent, remaining, overallPct, overBudgetCount, count: budgets.length };
  }, [budgets]);

  // ApexChart: Budget vs Spent Bar Chart
  const chartOptions = {
    chart: { type: "bar", height: 240, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, columnWidth: "44%", borderRadius: 4 } },
    colors: ["#4f46e5", "#f43f5e"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: budgets.map((b) => b.category.split(" ")[0]),
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val / 1000}k`,
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` },
    },
  };

  const chartSeries = [
    { name: "Allocated Budget", data: budgets.map((b) => b.allocated) },
    { name: "Actual Spent", data: budgets.map((b) => b.spent) },
  ];

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      category: "Food & Dining",
      label: "",
      monthlyAmount: "",
      alertThreshold: "80",
    });
    setShowAddModal(true);
  };

  // Save Add -> POST /budget/category (upsert)
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.monthlyAmount) {
      toast.error("Category and monthly amount are required.");
      return;
    }
    upsertBudget(buildPayload());
  };

  // Open Edit
  const handleOpenEdit = (b) => {
    setActiveBudget(b);
    setFormData({
      category: b.category,
      label: b.label || b.category,
      monthlyAmount: b.allocated,
      alertThreshold: b.alertThreshold || "80",
    });
    setShowEditModal(true);
  };

  // Save Edit -> /budget/category upsert (keyed by category)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeBudget) return;
    upsertBudget(buildPayload({ category: activeBudget.category }));
  };

  // Delete Handlers
  const handleOpenDelete = (b) => {
    setActiveBudget(b);
    setShowDeleteModal(true);
  };

  // Confirm Delete -> DELETE /budget/category/:id
  const handleConfirmDelete = () => {
    if (!activeBudget) return;
    deleteBudgetMut(activeBudget.id);
  };

  // Bulk Delete -> DELETE /budget/category/:id for each selected row
  const handleBulkDelete = async (ids) => {
    if (!ids?.length) return;
    try {
      await Promise.all(ids.map((id) => deleteBudgetCategory(id)));
      toast.success(`${ids.length} budget cap(s) deleted.`);
    } catch (err) {
      toast.error(err.message || "Some budgets could not be deleted.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    }
  };

  // Table Columns for CommonDataTable
  const columns = [
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: row.bg || "#eef2ff",
              color: row.color || "#4f46e5",
            }}
          >
            {row.icon || <FiPieChart size={15} />}
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.category}</div>
            <div className="text-muted fs-11px">{row.label || row.category}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Allocated Limit",
      selector: (row) => row.allocated,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => <span className="fw-700 text-dark fs-12.5px">₹{row.allocated.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Spent So Far",
      selector: (row) => row.spent,
      sortable: true,
      right: true,
      width: "130px",
      cell: (row) => (
        <span className={`fw-700 fs-12.5px ${row.spent > row.allocated ? "text-danger" : "text-dark"}`}>
          ₹{row.spent.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      name: "Remaining",
      selector: (row) => row.allocated - row.spent,
      sortable: true,
      right: true,
      width: "130px",
      cell: (row) => {
        const rem = row.allocated - row.spent;
        return (
          <span className={`fw-700 fs-12.5px ${rem >= 0 ? "text-success" : "text-danger"}`}>
            {rem >= 0 ? `+₹${rem.toLocaleString("en-IN")}` : `-₹${Math.abs(rem).toLocaleString("en-IN")}`}
          </span>
        );
      },
    },
    {
      name: "Consumption",
      selector: (row) => Math.round((row.spent / (row.allocated || 1)) * 100),
      sortable: true,
      width: "160px",
      cell: (row) => {
        const pct = Math.round((row.spent / (row.allocated || 1)) * 100);
        const isOver = pct > 100;
        const isWarn = pct >= 80 && !isOver;
        return (
          <div style={{ width: "100%" }}>
            <div className="d-flex justify-content-between align-items-center fs-10.5px mb-1">
              <span className={`fw-700 ${isOver ? "text-danger" : isWarn ? "text-warning" : "text-primary"}`}>{pct}%</span>
              <span className="text-muted">{isOver ? "Exceeded" : isWarn ? "Near Limit" : "Healthy"}</span>
            </div>
            <ProgressBar
              now={Math.min(100, pct)}
              className={isOver ? "ms-progress-red" : isWarn ? "ms-progress-orange" : "ms-progress-blue"}
              style={{ height: "5px" }}
            />
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.spent > row.allocated ? "Over Budget" : "On Track",
      sortable: true,
      width: "130px",
      cell: (row) => {
        const isOver = row.spent > row.allocated;
        return (
          <span className={`ur-status-pill ${isOver ? "danger" : "success"}`}>
            {isOver ? <FiAlertCircle size={10} className="me-1" /> : <FiCheckCircle size={10} className="me-1" />}
            {isOver ? "Over Limit" : "On Track"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      width: "100px",
      right: true,
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-end gap-1">
          <Button variant="light" size="sm" className="ur-action-btn edit" onClick={() => handleOpenEdit(row)} title="Edit">
            <FiEdit2 size={13} />
          </Button>
          <Button variant="light" size="sm" className="ur-action-btn delete" onClick={() => handleOpenDelete(row)} title="Delete">
            <FiTrash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Budget Planner &amp; Caps</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              August 2026
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Set category spending limits, track consumption rates in real-time, and prevent budget overruns.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
            onClick={handleOpenAdd}
          >
            <FiPlus size={15} />
            <span>+ Set Category Budget</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Monthly Limit</div>
                  <div className="ms-stat-val text-primary">
                    ₹{metrics.totalAllocated.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiDollarSign size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">{metrics.count} Active Budgets</span>
                <span className="ms-stat-sub-text">Across categories</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Spent So Far</div>
                  <div className="ms-stat-val">
                    ₹{metrics.totalSpent.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiTrendingDown size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">{metrics.overallPct}% of limit</span>
                <span className="ms-stat-sub-text">Pacing normal</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Remaining Cushion</div>
                  <div className="ms-stat-val text-success">
                    ₹{metrics.remaining.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiCheckCircle size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">Available to spend</span>
                <span className="ms-stat-sub-text">Until month end</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Budget Health</div>
                  <div className="ms-stat-val fs-18px">
                    {metrics.overBudgetCount === 0 ? "100% On Track" : `${metrics.overBudgetCount} Over Limit`}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fef3c7" }}>
                  <FiAlertTriangle size={20} color="#d97706" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle">
                <ProgressBar now={metrics.overallPct} className="ms-progress-blue" style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Budget vs Spent Visual Analytics Chart */}
      <Card className="ms-premium-card border-0 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h5 className="ms-card-title mb-0">Allocated Budget vs Actual Spending</h5>
              <p className="text-muted fs-11px mb-0">Category consumption breakdown</p>
            </div>
            <div className="d-flex align-items-center gap-3 fs-11px">
              <span className="d-flex align-items-center gap-1">
                <span className="ms-legend-square" style={{ backgroundColor: "#4f46e5" }}></span>
                <span className="fw-600 text-dark">Budget Limit</span>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="ms-legend-square" style={{ backgroundColor: "#f43f5e" }}></span>
                <span className="fw-600 text-dark">Spent Outlay</span>
              </span>
            </div>
          </div>
          <Chart options={chartOptions} series={chartSeries} type="bar" height={240} />
        </Card.Body>
      </Card>

      {/* 4. Active Category Cards Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="ms-card-title mb-0">Active Category Caps</h5>
        <span className="text-muted fs-12px">{budgets.length} Category allocations</span>
      </div>

      <Row className="g-3 mb-4">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / (b.allocated || 1)) * 100);
          const isOver = pct > 100;
          return (
            <Col key={b.id} xs={12} sm={6} lg={4}>
              <Card className="ms-premium-card h-100 border-0">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "9px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: b.bg,
                            color: b.color,
                          }}
                        >
                          {b.icon}
                        </div>
                        <div>
                          <div className="fw-700 text-dark fs-13px">{b.category}</div>
                          <div className="text-muted fs-11px">Limit: ₹{b.allocated.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      <Badge bg={isOver ? "danger-subtle" : "success-subtle"} className={`fs-10.5px fw-700 ${isOver ? "text-danger" : "text-success"}`}>
                        {isOver ? "Exceeded" : `${pct}% Used`}
                      </Badge>
                    </div>

                    {/* Numbers */}
                    <div className="p-2 px-3 rounded-8px bg-light mb-2 fs-12px">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Spent:</span>
                        <span className={`fw-700 ${isOver ? "text-danger" : "text-dark"}`}>₹{b.spent.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Remaining:</span>
                        <span className={`fw-700 ${b.allocated - b.spent >= 0 ? "text-success" : "text-danger"}`}>
                          ₹{Math.abs(b.allocated - b.spent).toLocaleString("en-IN")} {b.allocated - b.spent >= 0 ? "left" : "over"}
                        </span>
                      </div>
                    </div>

                    <ProgressBar
                      now={Math.min(100, pct)}
                      className={isOver ? "ms-progress-red" : pct > 80 ? "ms-progress-orange" : "ms-progress-blue"}
                      style={{ height: "6px" }}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-1 pt-2 mt-2 border-top">
                    <Button variant="light" size="sm" className="fs-11px py-0 px-2 fw-600" onClick={() => handleOpenEdit(b)}>
                      Adjust Cap
                    </Button>
                    <Button variant="light" size="sm" className="fs-11px py-0 px-2 text-danger fw-600" onClick={() => handleOpenDelete(b)}>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 5. Master CommonDataTable with 1-line Toolbar */}
      <CommonDataTable
        columns={columns}
        data={budgets}
        keyField="id"
        loading={budgetsLoading}
        title="Category Budget Allocations Ledger"
        subtitle={`Showing ${budgets.length} budget limit rules`}
        searchPlaceholder="Search category budget..."
        selectableRows={true}
        defaultPageSize={10}
        onBulkDelete={handleBulkDelete}
        exportFileName="Category_Budgets_Audit"
      />

      {/* ===================================================================
          MODAL: ADD NEW BUDGET
          =================================================================== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <span className="ur-modal-icon edit"><FiPlus size={16} /></span>
            Set Category Budget Limit
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Expense Category *</Form.Label>
              <Select
                value={[
                  { value: "Food & Dining", label: "Food & Dining" },
                  { value: "Housing", label: "Housing & Rent" },
                  { value: "Transportation & Fuel", label: "Transportation & Fuel" },
                  { value: "Shopping & Retail", label: "Shopping & Retail" },
                  { value: "Utilities & Bills", label: "Utilities & Bills" },
                  { value: "Fitness & Wellness", label: "Fitness & Wellness" },
                  { value: "Entertainment", label: "Entertainment" },
                  { value: "Healthcare", label: "Healthcare" },
                  { value: "Education", label: "Education" },
                ].find((c) => c.value === formData.category)}
                onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                options={[
                  { value: "Food & Dining", label: "Food & Dining" },
                  { value: "Housing", label: "Housing & Rent" },
                  { value: "Transportation & Fuel", label: "Transportation & Fuel" },
                  { value: "Shopping & Retail", label: "Shopping & Retail" },
                  { value: "Utilities & Bills", label: "Utilities & Bills" },
                  { value: "Fitness & Wellness", label: "Fitness & Wellness" },
                  { value: "Entertainment", label: "Entertainment" },
                  { value: "Healthcare", label: "Healthcare" },
                  { value: "Education", label: "Education" },
                ]}
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Budget Label *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Groceries & Dining Out"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Monthly Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                required
                min="100"
                placeholder="e.g. 8000"
                value={formData.monthlyAmount}
                onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                className="ur-form-input fw-700 text-primary"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Alert Threshold (%)</Form.Label>
              <Select
                value={[
                  { value: "70", label: "At 70% used" },
                  { value: "80", label: "At 80% used" },
                  { value: "90", label: "At 90% used" },
                ].find((t) => t.value === formData.alertThreshold)}
                onChange={(opt) => setFormData({ ...formData, alertThreshold: opt.value })}
                options={[
                  { value: "70", label: "At 70% used" },
                  { value: "80", label: "At 80% used" },
                  { value: "90", label: "At 90% used" },
                ]}
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4" disabled={saving}>
              {saving ? "Saving..." : "Set Budget"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark">Adjust Budget: {activeBudget?.category}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Budget Label *</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Monthly Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                required
                min="100"
                value={formData.monthlyAmount}
                onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                className="ur-form-input fw-700 text-primary"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Alert Threshold (%)</Form.Label>
              <Select
                value={[
                  { value: "70", label: "At 70% used" },
                  { value: "80", label: "At 80% used" },
                  { value: "90", label: "At 90% used" },
                ].find((t) => t.value === String(formData.alertThreshold))}
                onChange={(opt) => setFormData({ ...formData, alertThreshold: opt.value })}
                options={[
                  { value: "70", label: "At 70% used" },
                  { value: "80", label: "At 80% used" },
                  { value: "90", label: "At 90% used" },
                ]}
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm" className="ur-modal">
        <Modal.Body className="text-center p-4">
          <div className="ur-delete-icon-box mx-auto mb-3"><FiTrash2 size={24} color="#ef4444" /></div>
          <h5 className="fw-700 text-dark mb-1">Delete Budget Cap?</h5>
          <p className="text-muted fs-12px mb-3">Remove budget rule for {activeBudget?.category}?</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="light" size="sm" onClick={() => setShowDeleteModal(false)} className="rounded-6px px-3">Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} className="rounded-6px px-3">Delete</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

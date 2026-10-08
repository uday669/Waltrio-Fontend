import React, { useState, useMemo, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Chart from "react-apexcharts";
import {
  FiPieChart,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiBell,
} from "react-icons/fi";
import Select from "react-select";
import { formSelectStyles } from "../../utils/selectStyles";
import { useQueryClient } from "@tanstack/react-query";
import {
  useBudgetCategories,
  useCreateBudgetCategory,
  useUpdateBudgetCategory,
  useDeleteBudgetCategory,
  useCopyBudgetNextMonth,
} from "../../hooks/useBudgets";
import { toast } from "../../lib/toast";
import { useCategories } from "../../context/CategoryContext";
import MonthYearFilter, { MONTHS } from "../../components/common/MonthYearFilter";
import { useAuth } from "../../context/AuthContext";

export default function Budgets() {
  const queryClient = useQueryClient();
  const { currencySymbol } = useAuth();
  const { expenseCategories, allCategories, getCategoryMeta } = useCategories();

  // Header Month and Year Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("month");

  // Categories available for setting budgets
  const availableCategories = useMemo(() => {
    if (expenseCategories && expenseCategories.length > 0) {
      return expenseCategories;
    }
    return allCategories || [];
  }, [expenseCategories, allCategories]);

  // Dynamic Selected Month & Year display
  const selectedMonthYear = useMemo(() => {
    if (selectedMode === "date" && selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const mObj = MONTHS.find((mo) => mo.value === m);
      return `${d} ${mObj ? mObj.short : ""} ${y}`;
    }
    const monthLabel = MONTHS.find((m) => m.value === Number(selectedMonth))?.label || "Month";
    return `${monthLabel} ${selectedYear}`;
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // Budget query params for GET /v1/api/budget/category (only month and year)
  const budgetParams = useMemo(() => {
    if (selectedMode === "date" && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length >= 3) {
        return {
          month: parts[1],
          year: parts[0],
        };
      }
    }
    if (selectedMode === "year") {
      return {
        year: Number(selectedYear),
      };
    }
    return {
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // GET /budget/category — returns cards, chart, and budgets list.
  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    isError: budgetsIsError,
    error: budgetsErr,
  } = useBudgetCategories(budgetParams);

  useEffect(() => {
    if (budgetsIsError) {
      console.error("[budgets] request failed:", budgetsErr);
      toast.error(budgetsErr?.message || "Could not load budgets.");
    }
  }, [budgetsIsError, budgetsErr]);

  const budgets = useMemo(() => {
    return (budgetsData || []).map((b) => {
      const meta = getCategoryMeta(b.category, "expense");
      return {
        ...b,
        icon: meta.icon,
        color: meta.color,
        bg: meta.bg,
      };
    });
  }, [budgetsData, getCategoryMeta]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  // Form State — category, label, monthlyAmount, alertThreshold.
  const [formData, setFormData] = useState({
    category: "",
    label: "",
    monthlyAmount: "",
    alertThreshold: "80",
  });

  // ---- Mutations --------------------------------------------------------
  // POST /v1/api/budget/category
  const { mutate: createBudgetMut, isPending: creating } = useCreateBudgetCategory({
    onSuccess: () => {
      toast.success("Budget added successfully.");
      setShowAddModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not save budget."),
  });

  // PATCH /v1/api/budget/category/:id
  const { mutate: updateBudgetMut, isPending: updating } = useUpdateBudgetCategory({
    onSuccess: () => {
      toast.success("Budget updated successfully.");
      setShowEditModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not update budget."),
  });

  // DELETE /v1/api/budget/category/:id
  const { mutate: deleteBudgetMut } = useDeleteBudgetCategory({
    onSuccess: () => {
      toast.success("Budget deleted.");
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not delete budget."),
  });

  // POST /v1/api/budget/category/copy-next-month
  const [copyingId, setCopyingId] = useState(null);
  const { mutate: copyNextMonthMut } = useCopyBudgetNextMonth({
    onSuccess: () => {
      const nextM = Number(selectedMonth) === 12 ? 1 : Number(selectedMonth) + 1;
      const nextMName = MONTHS.find((m) => m.value === nextM)?.label || "next month";
      toast.success(`Budget copied to ${nextMName}.`);
      setCopyingId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Could not copy budget to next month.");
      setCopyingId(null);
    },
  });

  const handleCopyNextMonth = (b) => {
    const currentMonth = Number(b.month || selectedMonth);
    const currentYear = Number(b.year || selectedYear);
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const budgetId = b.id || b._id;

    setCopyingId(budgetId);
    copyNextMonthMut({
      budgetId,
      id: budgetId,
      _id: budgetId,
      category: b.category,
      label: b.label || b.category,
      monthlyAmount: Number(b.allocated || b.monthlyAmount || 0),
      alertThreshold: Number(b.alertThreshold || 80),
      month: currentMonth,
      year: currentYear,
      targetMonth: nextMonth,
      targetYear: nextYear,
    });
  };

  const saving = creating || updating;

  // Calculate Overall Metrics (Powered by API cards with clean fallback)
  const apiCards = budgetsData?.cards;
  const metrics = useMemo(() => {
    if (apiCards) {
      const totalAllocated = Number(apiCards.totalMonthlyLimit ?? 0);
      const totalSpent = Number(apiCards.spentSoFar ?? 0);
      const remaining = Number(apiCards.remainingCushion ?? Math.max(0, totalAllocated - totalSpent));
      const overallPct = Number(apiCards.spentPercentage ?? (totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0));
      const overBudgetCount = Number(apiCards.overLimitCount ?? budgets.filter((b) => Number(b.spent) > Number(b.allocated)).length);
      const count = Number(apiCards.activeBudgets ?? apiCards.filteredCount ?? budgets.length);

      return { totalAllocated, totalSpent, remaining, overallPct: Math.round(overallPct), overBudgetCount, count };
    }

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
  }, [apiCards, budgets]);

  // ApexChart: Budget vs Spent Grouped Bar Chart (Powered by API chart with clean fallback)
  const apiChart = budgetsData?.chart;
  const { chartCategories, chartAllocated, chartSpent } = useMemo(() => {
    if (Array.isArray(apiChart) && apiChart.length > 0) {
      return {
        chartCategories: apiChart.map((c) => (c.label || c.category || "").split(" ")[0]),
        chartAllocated: apiChart.map((c) => Number(c.budgetLimit ?? c.allocated ?? c.monthlyAmount ?? 0)),
        chartSpent: apiChart.map((c) => Number(c.spent ?? 0)),
      };
    }
    return {
      chartCategories: budgets.map((b) => (b.label || b.category).split(" ")[0]),
      chartAllocated: budgets.map((b) => b.allocated),
      chartSpent: budgets.map((b) => b.spent),
    };
  }, [apiChart, budgets]);

  const barChartOptions = {
    chart: { type: "bar", height: 210, toolbar: { show: false }, fontFamily: "inherit", parentHeightOffset: 0 },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: chartCategories.length === 1 ? "18%" : chartCategories.length <= 3 ? "28%" : "40%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    colors: ["#4f46e5", "#f43f5e"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: chartCategories,
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      forceNiceScale: true,
      labels: {
        formatter: (val) => (val >= 1000 ? `${currencySymbol}${(val / 1000).toFixed(val % 1000 ? 1 : 0)}k` : `${currencySymbol}${Math.round(val)}`),
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4, padding: { top: 0, right: 0, bottom: 0, left: 10 } },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${currencySymbol}${Number(val || 0).toLocaleString()}` },
    },
  };

  const barChartSeries = [
    { name: "Budget Limit", data: chartAllocated },
    { name: "Spent Outlay", data: chartSpent },
  ];

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultCat = availableCategories[0]?.name || "";
    setFormData({
      category: defaultCat,
      label: defaultCat,
      monthlyAmount: "",
      alertThreshold: "80",
    });
    setShowAddModal(true);
  };

  // Save Add -> POST /v1/api/budget/category
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.monthlyAmount) {
      toast.error("Category and monthly amount are required.");
      return;
    }
    createBudgetMut({
      category: formData.category,
      label: formData.label || formData.category,
      monthlyAmount: Number(formData.monthlyAmount),
      alertThreshold: Number(formData.alertThreshold || 80),
      month: Number(selectedMonth),
      year: Number(selectedYear),
    });
  };

  // Open Edit
  const handleOpenEdit = (b) => {
    setActiveBudget(b);
    setFormData({
      category: b.category,
      label: b.label || b.category,
      monthlyAmount: b.allocated || b.monthlyAmount || "",
      alertThreshold: String(b.alertThreshold || "80"),
    });
    setShowEditModal(true);
  };

  // Save Edit -> PATCH /v1/api/budget/category/:id
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeBudget) return;
    updateBudgetMut({
      id: activeBudget.id || activeBudget._id,
      category: formData.category || activeBudget.category,
      label: formData.label || activeBudget.label || formData.category,
      monthlyAmount: Number(formData.monthlyAmount),
      alertThreshold: Number(formData.alertThreshold || 80),
      month: Number(activeBudget.month || selectedMonth),
      year: Number(activeBudget.year || selectedYear),
    });
  };

  // Delete Handlers
  const handleOpenDelete = (b) => {
    setActiveBudget(b);
    setShowDeleteModal(true);
  };

  // Confirm Delete -> DELETE /v1/api/budget/category/:id
  const handleConfirmDelete = () => {
    if (!activeBudget) return;
    deleteBudgetMut(activeBudget.id || activeBudget._id);
  };

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* Dynamic Style Injection for Pixel-Perfect Card Design */}
      <style>{`
        .budget-category-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }
        .budget-category-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
        }
        .budget-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          line-height: 1.4;
        }
        .budget-status-pill.success {
          background-color: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
        }
        .budget-status-pill.warning {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          color: #d97706;
        }
        .budget-status-pill.danger {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        .budget-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .budget-status-pill.success .budget-status-dot { background-color: #059669; }
        .budget-status-pill.warning .budget-status-dot { background-color: #d97706; }
        .budget-status-pill.danger .budget-status-dot { background-color: #dc2626; }
        .btn-budget-action-next {
          background-color: #eef2ff !important;
          border: 1px solid #e0e7ff !important;
          color: #4f46e5 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 5px 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          transition: all 0.15s ease;
        }
        .btn-budget-action-next:hover {
          background-color: #e0e7ff !important;
          border-color: #c7d2fe !important;
          color: #4338ca !important;
        }
        .btn-budget-action-edit {
          background-color: #f5f3ff !important;
          border: 1px solid #ede9fe !important;
          color: #7c3aed !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 5px 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          transition: all 0.15s ease;
        }
        .btn-budget-action-edit:hover {
          background-color: #ede9fe !important;
          border-color: #ddd6fe !important;
          color: #6d28d9 !important;
        }
        .btn-budget-action-delete {
          background-color: #fef2f2 !important;
          border: 1px solid #fee2e2 !important;
          color: #ef4444 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          padding: 5px 10px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.15s ease;
        }
        .btn-budget-action-delete:hover {
          background-color: #fee2e2 !important;
          border-color: #fecaca !important;
          color: #dc2626 !important;
        }
      `}</style>

      {/* ===================================================================
          1. HEADER & ACTION BUTTONS
          =================================================================== */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Budget Planner &amp; Caps</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              {selectedMonthYear}
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Set category spending limits, track consumption rates in real-time, and prevent budget overruns.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <MonthYearFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedDate={selectedDate}
            selectedMode={selectedMode}
            onChangeMonth={setSelectedMonth}
            onChangeYear={setSelectedYear}
            onChangeDate={setSelectedDate}
            onChangeMode={setSelectedMode}
          />
          <Button
            className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
            onClick={handleOpenAdd}
          >
            <FiPlus size={15} />
            <span>Set Category Budget</span>
          </Button>
        </div>
      </div>

      {/* ===================================================================
          2. TOP 4 METRICS CARDS
          =================================================================== */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Monthly Limit</div>
                  <div className="ms-stat-val text-primary">
                    {currencySymbol}{metrics.totalAllocated.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                  <div className="ms-stat-val text-danger">
                    {currencySymbol}{metrics.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                    {currencySymbol}{metrics.remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">{metrics.overallPct}% utilized</span>
                <span className="ms-stat-sub-text">Overall health</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          3. VISUAL BAR CHART ROW
          =================================================================== */}
      {chartCategories.length > 0 && (
        <Row className="g-3 mb-3">
          <Col xs={12}>
            <Card className="ms-premium-card border-0">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="ms-card-title mb-0">Allocated Budget vs Actual Spending</h5>
                    <p className="text-muted fs-11px mb-0">Category consumption breakdown for {selectedMonthYear}</p>
                  </div>
                  <div className="d-flex align-items-center gap-3 fs-11px">
                    <span className="d-flex align-items-center gap-1">
                      <span className="ms-legend-square" style={{ backgroundColor: "#4f46e5", width: "10px", height: "10px", borderRadius: "3px" }}></span>
                      <span className="fw-600 text-dark">Budget Limit</span>
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <span className="ms-legend-square" style={{ backgroundColor: "#f43f5e", width: "10px", height: "10px", borderRadius: "3px" }}></span>
                      <span className="fw-600 text-dark">Spent Outlay</span>
                    </span>
                  </div>
                </div>

                <div className="ms-chart-wrap pt-1">
                  <Chart options={barChartOptions} series={barChartSeries} type="bar" height={210} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* ===================================================================
          4. CATEGORY BUDGET CARDS GRID (Pixel-Perfect Requested Design)
          =================================================================== */}
      <div className="mb-4">
        {/* Section Header without search */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-700 text-dark mb-0 d-flex align-items-center gap-2">
              <span>Category Budget Limits</span>
              <Badge bg="primary-subtle" className="text-primary fs-11px fw-600 px-2 py-0.5 rounded-pill">
                {budgets.length} {budgets.length === 1 ? "Cap" : "Caps"}
              </Badge>
            </h5>
            <p className="text-muted fs-11.5px mb-0">Active category caps for {selectedMonthYear}</p>
          </div>
        </div>

        {/* Cards Grid */}
        {budgetsLoading ? (
          <div className="text-center py-5 text-muted fs-13px">Loading category budgets...</div>
        ) : budgets.length === 0 ? (
          <Card className="ms-premium-card border-0 text-center py-5">
            <Card.Body>
              <div className="d-inline-flex p-3 rounded-circle bg-light text-muted mb-2">
                <FiPieChart size={28} />
              </div>
              <h6 className="fw-700 text-dark mb-1">No Category Budgets Found</h6>
              <p className="text-muted fs-12px mb-3">
                You have not set any category budget limits for {selectedMonthYear}.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAdd} className="fs-12px fw-600 px-3">
                <FiPlus size={14} className="me-1" /> Set Category Budget
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {budgets.map((b) => {
              const allocated = Number(b.allocated || b.monthlyAmount || 0);
              const spent = Number(b.spent || 0);
              const remaining = allocated - spent;
              const pct = allocated > 0 ? (spent / allocated) * 100 : 0;
              const threshold = Number(b.alertThreshold || 80);
              const isOver = spent > allocated;
              const isWarn = pct >= threshold && !isOver;

              return (
                <Col xs={12} lg={6} key={b.id || b._id}>
                  <div className="budget-category-card h-100 d-flex flex-column justify-content-between">
                    {/* Top Header */}
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2.5">
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: b.bg || "#f5f3ff",
                              color: b.color || "#6366f1",
                              fontSize: "18px",
                              flexShrink: 0,
                              marginRight: "14px",
                            }}
                          >
                            {b.icon || <FiPieChart size={18} />}
                          </div>
                          <div>
                            <div className="fw-700 text-dark fs-15px line-clamp-1 mb-0.5">{b.label || b.category}</div>
                            <div className="text-muted fs-11.5px">Category: {b.category}</div>
                          </div>
                        </div>

                        <div>
                          <span className={`budget-status-pill ${isOver ? "danger" : isWarn ? "warning" : "success"}`}>
                            <span className="budget-status-dot" style={{ marginRight: "2px" }} />
                            <span>{isOver ? "OVER LIMIT" : isWarn ? "NEAR LIMIT" : "ON TRACK"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle Amounts & Percentage */}
                      <div className="mb-2">
                        <div className="d-flex align-items-baseline justify-content-between mb-1">
                          <div className="d-flex align-items-baseline">
                            <span className="fw-800 text-dark fs-17px" style={{ marginRight: "8px" }}>
                              {currencySymbol}{spent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-muted fs-13px fw-500">
                              {"of "}{currencySymbol}{allocated.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span
                            className={`fw-700 fs-13.5px ${
                              isOver ? "text-danger" : isWarn ? "text-warning" : "text-success"
                            }`}
                          >
                            {pct.toFixed(2)}%
                          </span>
                        </div>

                        <div className="mb-2">
                          <span
                            className="fw-600 fs-12.5px"
                            style={{
                              color: remaining >= 0 ? "#059669" : "#dc2626",
                            }}
                          >
                            {currencySymbol}{Math.abs(remaining).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                            {remaining >= 0 ? "remaining" : "over budget"}
                          </span>
                        </div>

                        {/* Progress Bar Track & Fill */}
                        <div
                          style={{
                            height: "7px",
                            borderRadius: "999px",
                            backgroundColor: "#f1f5f9",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, Math.max(0, pct))}%`,
                              backgroundColor: isOver ? "#ef4444" : isWarn ? "#f59e0b" : "#10b981",
                              borderRadius: "999px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top border-light-subtle">
                      <div
                        className="d-inline-flex align-items-center border bg-light text-secondary fs-11.5px fw-600"
                        style={{
                          borderColor: "#e2e8f0",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          gap: "6px",
                        }}
                      >
                        <FiBell size={13} className="text-secondary flex-shrink-0" style={{ marginRight: "2px" }} />
                        <span>{threshold}% Alert</span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-budget-action-next"
                          onClick={() => handleCopyNextMonth(b)}
                          disabled={copyingId === (b.id || b._id)}
                          title="Copy to Next Month"
                        >
                          <FiCalendar size={13} />
                          <span>{copyingId === (b.id || b._id) ? "Copying..." : "Next Month"}</span>
                        </Button>

                        <Button
                          variant="light"
                          size="sm"
                          className="btn-budget-action-edit"
                          onClick={() => handleOpenEdit(b)}
                          title="Edit Budget"
                        >
                          <FiEdit2 size={13} />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="light"
                          size="sm"
                          className="btn-budget-action-delete"
                          onClick={() => handleOpenDelete(b)}
                          title="Delete Budget"
                        >
                          <FiTrash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

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
                value={
                  availableCategories
                    .map((c) => ({ value: c.name, label: c.name }))
                    .find((c) => c.value === formData.category) ||
                  (formData.category ? { value: formData.category, label: formData.category } : null)
                }
                onChange={(opt) =>
                  setFormData({
                    ...formData,
                    category: opt ? opt.value : "",
                    label: formData.label || (opt ? opt.value : ""),
                  })
                }
                options={availableCategories.map((c) => ({ value: c.name, label: c.name }))}
                placeholder="Select Category..."
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
              <Form.Label className="ur-form-label">Monthly Amount ({currencySymbol}) *</Form.Label>
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

      {/* ===================================================================
          MODAL: EDIT BUDGET
          =================================================================== */}
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
              <Form.Label className="ur-form-label">Monthly Amount ({currencySymbol}) *</Form.Label>
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

      {/* ===================================================================
          MODAL: DELETE CONFIRMATION
          =================================================================== */}
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

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import ProgressBar from "react-bootstrap/ProgressBar";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Chart from "react-apexcharts";
import Select from "react-select";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiHome,
  FiCoffee,
  FiShoppingBag,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa";
import { useDashboardYearSummary, useDashboardAnalyticsYear } from "../../hooks/useDashboard";
import { useBudgetCategories } from "../../hooks/useBudgets";
import { useCreateIncome } from "../../hooks/useIncomes";
import { useCreateExpense } from "../../hooks/useExpenses";
import { formSelectStyles } from "../../utils/selectStyles";
import { toast } from "../../lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../context/CategoryContext";
import MonthYearFilter, { MONTHS } from "../../components/common/MonthYearFilter";
import AppDatePicker from "../../components/common/AppDatePicker";

const today = () => new Date().toISOString().slice(0, 10);

const fmtCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtPct = (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v || 0)}%`;

const BUDGET_CAT_META = {
  "Food & Dining": { icon: <FiCoffee size={14} />, color: "#8b5cf6", bg: "#f5f3ff", gradient: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)" },
  "Housing & Rent": { icon: <FiHome size={14} />, color: "#4f46e5", bg: "#eef2ff", gradient: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)" },
  Transportation: { icon: <FiArrowRight size={14} />, color: "#d97706", bg: "#fffbeb", gradient: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" },
  "Transportation & Fuel": { icon: <FiArrowRight size={14} />, color: "#d97706", bg: "#fffbeb", gradient: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" },
  Shopping: { icon: <FiShoppingBag size={14} />, color: "#059669", bg: "#ecfdf5", gradient: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" },
  "Shopping & Retail": { icon: <FiShoppingBag size={14} />, color: "#059669", bg: "#ecfdf5", gradient: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" },
  Utilities: { icon: <FiZap size={14} />, color: "#0891b2", bg: "#ecfeff", gradient: "linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)" },
  "Utilities & Bills": { icon: <FiZap size={14} />, color: "#0891b2", bg: "#ecfeff", gradient: "linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)" },
};
const DEFAULT_BUDGET_META = { icon: <FiTarget size={14} />, color: "#4f46e5", bg: "#eef2ff", gradient: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)" };

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { name, user } = useAuth();
  const { incomeCategories, expenseCategories } = useCategories();
  const firstName = (name || user?.name || "User").split(" ")[0];

  // Dynamic greeting based on current hour
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Header Month and Year Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("month");
  const selectedMonthName = MONTHS.find((m) => m.value === Number(selectedMonth))?.label || "Current Month";

  // Income vs Expenses Chart Timeframe Filter State: "6m" | "12m" | "year"
  const [chartTimeframe, setChartTimeframe] = useState("12m");
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  // Quick-add modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ source: "", category: "", amount: "", date: today(), description: "" });
  const [expenseForm, setExpenseForm] = useState({ merchant: "", category: "", amount: "", date: today(), description: "" });

  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["dashboard"] });

  const { mutate: createIncomeMut, isPending: savingIncome } = useCreateIncome({
    onSuccess: () => {
      toast.success("Income added successfully.");
      setShowIncomeModal(false);
      refreshDashboard();
    },
    onError: (err) => toast.error(err.message || "Could not add income."),
  });

  const { mutate: createExpenseMut, isPending: savingExpense } = useCreateExpense({
    onSuccess: () => {
      toast.success("Expense added successfully.");
      setShowExpenseModal(false);
      refreshDashboard();
    },
    onError: (err) => toast.error(err.message || "Could not add expense."),
  });

  const openIncomeModal = () => {
    setIncomeForm({ source: "", category: incomeCategories[0]?.name || "", amount: "", date: today(), description: "" });
    setShowIncomeModal(true);
  };
  const openExpenseModal = () => {
    setExpenseForm({ merchant: "", category: expenseCategories[0]?.name || "", amount: "", date: today(), description: "" });
    setShowExpenseModal(true);
  };

  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.source || !incomeForm.amount) {
      toast.error("Source and amount are required.");
      return;
    }
    createIncomeMut({
      incomeSource: incomeForm.source,
      category: incomeForm.category,
      amount: Number(incomeForm.amount),
      date: incomeForm.date,
      description: incomeForm.description,
    });
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.merchant || !expenseForm.amount) {
      toast.error("Merchant and amount are required.");
      return;
    }
    createExpenseMut({
      merchant: expenseForm.merchant,
      note: expenseForm.description,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      status: "Paid",
      attachment: null,
    });
  };

  // Dashboard Query Params for GET /v1/api/dashboard/year-summary
  const summaryParams = useMemo(() => {
    if (selectedMode === "date" && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length >= 3) {
        return {
          filter: "day",
          day: parts[2],
          month: parts[1],
          year: parts[0],
        };
      }
    }
    if (selectedMode === "year") {
      return {
        filter: "year",
        year: Number(selectedYear),
      };
    }
    return {
      filter: "month",
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // Analytics params for GET /v1/api/dashboard/analytics-year
  const analyticsParams = useMemo(() => {
    if (chartTimeframe === "6m") {
      return { months: 6 };
    }
    if (chartTimeframe === "year") {
      return { filter: "year", year: Number(chartYear) };
    }
    return {};
  }, [chartTimeframe, chartYear]);

  const { data: summaryData } = useDashboardYearSummary(summaryParams);
  const { data: analyticsData } = useDashboardAnalyticsYear(analyticsParams);

  const totalBalance = summaryData?.totalBalance ?? 0;
  const income = summaryData?.totalIncome || {};
  const expense = summaryData?.totalExpenses || {};
  const savings = summaryData?.totalSavings || {};
  const budget = summaryData?.budgetOverview || {};

  const { data: budgetCaps } = useBudgetCategories();
  const categoryAllocations = useMemo(() => {
    const caps = Array.isArray(budgetCaps) ? budgetCaps : [];
    return caps.map((cap) => {
      const allocated = Number(cap.allocated) || 0;
      const spent = Number(cap.spent) || 0;
      const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      const meta = BUDGET_CAT_META[cap.category] || DEFAULT_BUDGET_META;
      const isOver = pct >= 100;
      const isWarn = !isOver && pct >= Number(cap.alertThreshold || 80);
      return {
        name: cap.category,
        spent,
        allocated,
        pct,
        icon: meta.icon,
        color: meta.color,
        bg: meta.bg,
        gradient: meta.gradient,
        statusClass: isOver ? "danger" : isWarn ? "warning" : "success",
        statusLabel: isOver ? "Over Limit" : isWarn ? "Warning" : "On Track",
        percentColor: isOver ? "#ef4444" : isWarn ? "#d97706" : meta.color,
      };
    });
  }, [budgetCaps]);

  const budgetSummary = useMemo(() => {
    const limit = Number(budget.monthlyLimit ?? categoryAllocations.reduce((a, c) => a + c.allocated, 0));
    const spent = Number(budget.spent ?? categoryAllocations.reduce((a, c) => a + c.spent, 0));
    const available = Number(budget.available ?? Math.max(0, limit - spent));
    const pct = Number(budget.percentageUsed ?? (limit > 0 ? Math.round((spent / limit) * 100) : 0));
    const onTrack = budget.onTrack ?? pct <= 100;
    return {
      limit,
      spent,
      available,
      pct,
      onTrack,
    };
  }, [categoryAllocations, budget]);
  const goals = summaryData?.savingsGoals || [];

  // Top 4 Stat Cards
  const stats = [
    {
      title: "Total Balance",
      value: fmtCurrency(totalBalance),
      change: fmtPct(income.change ?? 0),
      isPositive: Number(income.change ?? 0) >= 0,
      icon: <IoWalletOutline size={20} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: "Available net balance",
    },
    {
      title: "Total Income",
      value: fmtCurrency(income.amount),
      change: fmtPct(income.change),
      isPositive: Number(income.change ?? 0) >= 0,
      icon: <FiTrendingUp size={20} color="#10b981" />,
      iconBg: "#ecfdf5",
      sub: `${fmtCurrency(income.vsPrevious ?? 0)} vs previous`,
    },
    {
      title: "Total Expenses",
      value: fmtCurrency(expense.amount),
      change: fmtPct(expense.change),
      isPositive: Number(expense.change ?? 0) <= 0,
      icon: <FiArrowDownLeft size={20} color="#ef4444" />,
      iconBg: "#fff1f2",
      sub: `${Number(expense.budgetUsedPercentage ?? 0)}% of budget used`,
    },
    {
      title: "Total Savings",
      value: fmtCurrency(savings.amount),
      change: fmtPct(savings.change),
      isPositive: Number(savings.change ?? 0) >= 0,
      icon: <FaPiggyBank size={18} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: `${Number(savings.netSavingsRate ?? 0)}% net savings rate`,
    },
  ];

  // Bar Chart Data
  const iveData = analyticsData?.incomeVsExpenses || {};
  const monthly = Array.isArray(iveData.monthly) ? iveData.monthly : [];
  const barCategories = monthly.map((m) => m.shortLabel || m.label);
  const barIncome = monthly.map((m) => Number(m.income || 0));
  const barExpenses = monthly.map((m) => Number(m.expenses || 0));
  const iveTotalIncome = Number(iveData.totalIncome || barIncome.reduce((a, b) => a + b, 0));
  const iveTotalExpenses = Number(iveData.totalExpenses || barExpenses.reduce((a, b) => a + b, 0));

  const barChartOptions = {
    chart: {
      type: "bar",
      height: 260,
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    colors: ["#4f46e5", "#f43f5e"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: barCategories,
      labels: {
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 4,
      labels: {
        formatter: (val) => (val === 0 ? "0" : `${(val / 1000).toFixed(val % 1000 ? 1 : 0)}K`),
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` },
    },
  };

  const barChartSeries = [
    { name: "Income", data: barIncome },
    { name: "Expenses", data: barExpenses },
  ];

  // Savings Goals
  const GOAL_GRADIENTS = [
    "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
    "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
    "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
  ];
  const savingsGoals = goals.map((g, i) => {
    const saved = Number(g.saved ?? g.savedAmount ?? g.currentAmount ?? 0);
    const target = Number(g.target ?? g.targetAmount ?? 0);
    const percent = Number(g.percent ?? g.percentage ?? (target ? Math.round((saved / target) * 100) : 0));
    return {
      title: g.title ?? g.name ?? "Goal",
      icon: g.icon ?? "🎯",
      iconBg: "#eef2ff",
      category: g.category ?? "Savings",
      saved,
      target,
      percent,
      gradient: GOAL_GRADIENTS[i % GOAL_GRADIENTS.length],
      badgeColor: "#4f46e5",
      badgeBg: "#eef2ff",
      remainingText: `₹${Math.max(target - saved, 0).toLocaleString("en-IN")} left`,
      eta: g.eta ?? g.targetDate ?? "",
    };
  });
  const totalSaved = savingsGoals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = savingsGoals.reduce((a, g) => a + g.target, 0);

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. GREETING HEADER & QUICK ACTION BUTTONS */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1">
            {timeGreeting}, {firstName} 👋
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Here is your financial pulse and budget breakdown for {selectedMonthName} {selectedYear}.
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
          <Button className="ms-btn-income" onClick={openIncomeModal}>
            <FiPlus size={14} />
            <span>Add Income</span>
          </Button>
          <Button className="ms-btn-expense" onClick={openExpenseModal}>
            <FiMinus size={14} />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* 2. TOP 4 STAT CARDS */}
      <Row className="g-3 mb-3">
        {stats.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} xl={3}>
            <Card className="ms-premium-card h-100 border-0">
              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="ms-stat-title">{stat.title}</div>
                    <div className="ms-stat-val">{stat.value}</div>
                  </div>
                  <div
                    className="ms-stat-icon-box"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                  <span
                    className={`ms-trend-pill ${
                      stat.isPositive ? "positive" : "negative"
                    }`}
                  >
                    {stat.isPositive ? (
                      <FiTrendingUp size={11} />
                    ) : (
                      <FiTrendingDown size={11} />
                    )}
                    {stat.change}
                  </span>
                  <span className="ms-stat-sub-text">{stat.sub}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 3. INCOME VS EXPENSES CHART */}
      <Row className="g-3 mb-3">
        <Col xs={12}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
                  <div>
                    <h5 className="ms-card-title mb-0">Income vs Expenses Analysis</h5>
                    <p className="text-muted fs-11.5px mb-0">Inflows vs Outflows monthly breakdown</p>
                  </div>

                  {/* Filter: 6 Months, 12 Months, Year */}
                  <div className="d-flex align-items-center gap-1">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Timeframe">
                      <button
                        type="button"
                        className={`btn btn-sm ${chartTimeframe === "6m" ? "btn-primary text-white fw-600" : "btn-light text-secondary border"}`}
                        style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "6px 0 0 6px" }}
                        onClick={() => setChartTimeframe("6m")}
                      >
                        6 Months
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${chartTimeframe === "12m" ? "btn-primary text-white fw-600" : "btn-light text-secondary border"}`}
                        style={{ fontSize: "11px", padding: "3px 10px", borderRadius: chartTimeframe === "year" ? "0" : undefined }}
                        onClick={() => setChartTimeframe("12m")}
                      >
                        12 Months
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${chartTimeframe === "year" ? "btn-primary text-white fw-600" : "btn-light text-secondary border"}`}
                        style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "0 6px 6px 0" }}
                        onClick={() => setChartTimeframe("year")}
                      >
                        Year
                      </button>
                    </div>
                    {chartTimeframe === "year" && (
                      <Form.Select
                        size="sm"
                        value={chartYear}
                        onChange={(e) => setChartYear(Number(e.target.value))}
                        style={{ width: "80px", fontSize: "11.5px", padding: "3px 6px", height: "30px", borderRadius: "6px" }}
                        className="border ms-1"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="d-flex align-items-center gap-3 my-2 fs-11.5px">
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#4f46e5", width: "10px", height: "10px", borderRadius: "3px" }}
                    ></span>
                    <span className="fw-600 text-dark">Income: ₹{Number(iveTotalIncome || 0).toLocaleString("en-IN")}</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#f43f5e", width: "10px", height: "10px", borderRadius: "3px" }}
                    ></span>
                    <span className="fw-600 text-dark">Expenses: ₹{Number(iveTotalExpenses || 0).toLocaleString("en-IN")}</span>
                  </span>
                </div>
              </div>

              <div className="ms-chart-wrap pt-1">
                <Chart
                  options={barChartOptions}
                  series={barChartSeries}
                  type="bar"
                  height={260}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 4. BUDGET OVERVIEW & SAVINGS GOALS */}
      <Row className="g-3 mb-3">
        {/* Budget Overview */}
        <Col xs={12} lg={6}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="ms-card-title mb-0">Monthly Budget Overview</h5>
                  <p className="text-muted fs-11.5px mb-0">Consumption limits &amp; pace</p>
                </div>
                <Badge
                  bg={budgetSummary.pct > 100 ? "danger-subtle" : "success-subtle"}
                  className={`fw-700 fs-10.5px py-1 px-2 rounded-6px ${budgetSummary.pct > 100 ? "text-danger" : "text-success"}`}
                >
                  {budgetSummary.pct > 100 ? "Over Budget" : "On Track"}
                </Badge>
              </div>

              {/* Monthly Budget Summary Card */}
              <div className="ms-budget-metric-card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="ms-mini-label">Monthly Limit</div>
                    <div className="ms-budget-main-val">₹{budgetSummary.limit.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-center">
                    <div className="ms-mini-label">Spent</div>
                    <div className="ms-budget-used-val">₹{budgetSummary.spent.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-end">
                    <div className="ms-mini-label">Available</div>
                    <div className="ms-budget-rem-val">₹{budgetSummary.available.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted fw-600 fs-11px">Budget Consumption</span>
                    <span className="fw-800 text-primary fs-11px">{budgetSummary.pct}%</span>
                  </div>
                  <ProgressBar
                    now={Math.min(100, budgetSummary.pct)}
                    style={{ height: "7px", borderRadius: "10px" }}
                  />
                </div>
              </div>

              {/* Category Allocations */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-700 text-dark fs-12.5px">Category Allocations</span>
                  <button
                    type="button"
                    onClick={() => navigate("/budgets")}
                    className="btn btn-link p-0 text-decoration-none fs-11.5px fw-600 text-primary"
                  >
                    View All Caps &rarr;
                  </button>
                </div>
                <div className="d-flex flex-column gap-2">
                  {categoryAllocations.length === 0 ? (
                    <div className="text-muted fs-12px py-3 text-center border rounded-8px bg-light">
                      No category budgets set yet. <button type="button" onClick={() => navigate("/budgets")} className="btn btn-link p-0 text-primary fs-12px fw-600">Set one now</button>
                    </div>
                  ) : (
                    categoryAllocations.slice(0, 4).map((cat, idx) => (
                      <div className="ms-cat-alloc-card" key={idx}>
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <div className="d-flex align-items-center gap-2">
                            <div className="ms-cat-icon-box" style={{ backgroundColor: cat.bg, color: cat.color }}>
                              {cat.icon}
                            </div>
                            <div>
                              <div className="ms-cat-name">{cat.name}</div>
                              <div className="ms-cat-amount-info">
                                ₹{cat.spent.toLocaleString("en-IN")}{" "}
                                <span className="text-muted fw-400">/ ₹{cat.allocated.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="ms-cat-percent" style={{ color: cat.percentColor }}>{cat.pct}%</div>
                            <span className={`ms-cat-status-badge ${cat.statusClass}`}>{cat.statusLabel}</span>
                          </div>
                        </div>
                        <div className="ms-cat-progress-track">
                          <div
                            className="ms-cat-progress-fill"
                            style={{ width: `${Math.min(100, cat.pct)}%`, background: cat.gradient }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Savings Goals */}
        <Col xs={12} lg={6}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="ms-card-title mb-0 d-flex align-items-center gap-2">
                      <FiTarget className="text-primary" /> Savings Goals &amp; Targets
                    </h5>
                    <p className="text-muted fs-11.5px mb-0">Progress toward milestone targets</p>
                  </div>
                </div>

                {/* Goals Cards List */}
                <div className="d-flex flex-column gap-2">
                  {savingsGoals.length === 0 ? (
                    <div className="text-center text-muted fs-12px py-4 border rounded-8px bg-light">
                      No savings targets configured.
                    </div>
                  ) : (
                    savingsGoals.map((goal, idx) => (
                      <div key={idx} className="ms-goal-card p-3 rounded-10px">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="ms-goal-icon-box"
                              style={{ backgroundColor: goal.iconBg }}
                            >
                              <span>{goal.icon}</span>
                            </div>
                            <div>
                              <div className="ms-goal-name">{goal.title}</div>
                              <div className="ms-goal-cat">{goal.category} {goal.eta ? `• Target ${goal.eta}` : ""}</div>
                            </div>
                          </div>

                          <div className="text-end">
                            <span
                              className="ms-goal-percent-badge"
                              style={{
                                backgroundColor: goal.badgeBg,
                                color: goal.badgeColor,
                              }}
                            >
                              {goal.percent}%
                            </span>
                          </div>
                        </div>

                        {/* Goal Numbers */}
                        <div className="d-flex justify-content-between align-items-center fs-12px mb-1.5">
                          <span className="fw-700 text-dark">
                            ₹{goal.saved.toLocaleString("en-IN")}{" "}
                            <span className="text-muted fw-500">
                              / ₹{goal.target.toLocaleString("en-IN")}
                            </span>
                          </span>
                          <span className="text-muted fs-11px">{goal.remainingText}</span>
                        </div>

                        {/* Gradient Custom Progress Bar */}
                        <div className="ms-goal-track" style={{ height: "7px" }}>
                          <div
                            className="ms-goal-fill"
                            style={{
                              width: `${Math.min(100, goal.percent)}%`,
                              background: goal.gradient,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 text-center border-top mt-3">
                <span className="text-muted fs-12px">
                  🎯 Total Saved: <strong className="text-dark">₹{totalSaved.toLocaleString("en-IN")}</strong> of ₹{totalTarget.toLocaleString("en-IN")}
                  {totalTarget ? ` (${Math.round((totalSaved / totalTarget) * 100)}% overall)` : ""}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QUICK ADD: INCOME MODAL */}
      <Modal show={showIncomeModal} onHide={() => setShowIncomeModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income"><FiPlus size={16} /></span>
              Add Income
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Record a new incoming payout or revenue stream.</p>
          </div>
        </Modal.Header>
        <Form onSubmit={handleSaveIncome}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Client Payout / Monthly Salary"
                value={incomeForm.source}
                onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Category *</Form.Label>
              <Select
                value={
                  incomeCategories
                    .map((c) => ({ value: c.name, label: c.name }))
                    .find((o) => o.value === incomeForm.category) ||
                  (incomeForm.category ? { value: incomeForm.category, label: incomeForm.category } : null)
                }
                onChange={(opt) => setIncomeForm({ ...incomeForm, category: opt ? opt.value : "" })}
                options={incomeCategories.map((c) => ({ value: c.name, label: c.name }))}
                placeholder="Select Income Category..."
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 50000"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="ur-form-input fw-700 text-success"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Date</Form.Label>
              <AppDatePicker
                value={incomeForm.date}
                onChange={(dateStr) => setIncomeForm({ ...incomeForm, date: dateStr })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Description / Note</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Project milestone delivery"
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowIncomeModal(false)} className="rounded-8px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="ms-btn-income px-4" disabled={savingIncome}>
              <FiPlus size={14} /> {savingIncome ? "Saving..." : "Save Income"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QUICK ADD: EXPENSE MODAL */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon"><FiMinus size={16} /></span>
              Add Expense
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Record an outgoing purchase or bill payment.</p>
          </div>
        </Modal.Header>
        <Form onSubmit={handleSaveExpense}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Merchant / Payee Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Amazon / Cloud Server"
                value={expenseForm.merchant}
                onChange={(e) => setExpenseForm({ ...expenseForm, merchant: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Category *</Form.Label>
              <Select
                value={
                  expenseCategories
                    .map((c) => ({ value: c.name, label: c.name }))
                    .find((o) => o.value === expenseForm.category) ||
                  (expenseForm.category ? { value: expenseForm.category, label: expenseForm.category } : null)
                }
                onChange={(opt) => setExpenseForm({ ...expenseForm, category: opt ? opt.value : "" })}
                options={expenseCategories.map((c) => ({ value: c.name, label: c.name }))}
                placeholder="Select Expense Category..."
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 2500"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="ur-form-input fw-700 text-danger"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Date</Form.Label>
              <AppDatePicker
                value={expenseForm.date}
                onChange={(dateStr) => setExpenseForm({ ...expenseForm, date: dateStr })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Description / Note</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Monthly hosting subscription"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowExpenseModal(false)} className="rounded-8px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="ms-btn-expense px-4" disabled={savingExpense}>
              <FiMinus size={14} /> {savingExpense ? "Saving..." : "Save Expense"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

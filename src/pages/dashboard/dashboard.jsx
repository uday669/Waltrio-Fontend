import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
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
  FiCalendar,
  FiArrowRight,
  FiHome,
  FiCoffee,
  FiShoppingBag,
  FiFileText,
  FiTarget,
  FiBriefcase,
  FiZap,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa";
import { BsBank2, BsStars } from "react-icons/bs";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import { useDashboardOverview, useTotalBalance } from "../../hooks/useDashboard";
import { useBudgetCategories } from "../../hooks/useBudgets";
import { useCreateIncome } from "../../hooks/useIncomes";
import { useCreateExpense } from "../../hooks/useExpenses";
import { formSelectStyles } from "../../utils/selectStyles";
import { toast } from "../../lib/toast";
import { useQueryClient } from "@tanstack/react-query";

// Category options for the quick-add modals.
const INCOME_CATEGORIES = ["Salary", "Freelance", "Rental", "Dividends", "Consulting", "Investments", "Digital Products", "Bonus", "Other"].map((c) => ({ value: c, label: c }));
const EXPENSE_CATEGORIES = ["Housing", "Food & Dining", "Transportation", "Shopping", "Utilities", "Healthcare", "Fitness & Wellness", "Entertainment", "Education", "Other"].map((c) => ({ value: c, label: c }));
const today = () => new Date().toISOString().slice(0, 10);

// Currency + percent formatting helpers.
const fmtCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtPct = (v) => `${Number(v) >= 0 ? "+" : ""}${Number(v || 0)}%`;

// Palette reused for the expense-category donut.
const DONUT_COLORS = ["#4f46e5", "#8b5cf6", "#f59e0b", "#10b981", "#06b6d4", "#94a3b8", "#ec4899", "#e11d48"];

// Per-category visuals for the Budget Overview "Category Allocations" list.
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

  // ---- Quick-add modals (Add Income / Add Expense) ----------------------
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ source: "", category: "Salary", amount: "", date: today(), description: "" });
  const [expenseForm, setExpenseForm] = useState({ merchant: "", category: "Food & Dining", amount: "", date: today(), description: "" });

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
    setIncomeForm({ source: "", category: "Salary", amount: "", date: today(), description: "" });
    setShowIncomeModal(true);
  };
  const openExpenseModal = () => {
    setExpenseForm({ merchant: "", category: "Food & Dining", amount: "", date: today(), description: "" });
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

  // GET /dashboard/overview
  const { data: overview } = useDashboardOverview();
  const c = overview?.cards || {};

  // GET /dashboard/total-balance — dedicated source for the Total Balance card.
  const { data: totalBalanceData } = useTotalBalance();
  // Accept a bare number or an object with common field names.
  const tb =
    typeof totalBalanceData === "number" ? { totalBalance: totalBalanceData } : totalBalanceData || {};
  const totalBalance = tb.totalBalance ?? tb.balance ?? tb.amount ?? c.totalBalance;
  const totalBalanceChange = tb.totalBalanceChange ?? tb.change ?? c.totalBalanceChange ?? 0;
  const ive = overview?.incomeVsExpenses || {};
  const expCats = overview?.expenseCategories || {};
  const budget = overview?.budgetOverview || {};

  // GET /budget/category — powers the Category Allocations list below.
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

  // Budget summary strip (limit / spent / available / %) — computed from the
  // same caps so it reconciles with the allocations list; falls back to the
  // overview's budgetOverview when there are no caps.
  const budgetSummary = useMemo(() => {
    if (categoryAllocations.length === 0) {
      const limit = Number(budget.monthlyLimit || 0);
      const spent = Number(budget.spent || 0);
      return {
        limit,
        spent,
        available: Number(budget.available ?? Math.max(0, limit - spent)),
        pct: Number(budget.percentageUsed ?? (limit > 0 ? Math.round((spent / limit) * 100) : 0)),
      };
    }
    const limit = categoryAllocations.reduce((a, c) => a + c.allocated, 0);
    const spent = categoryAllocations.reduce((a, c) => a + c.spent, 0);
    return {
      limit,
      spent,
      available: Math.max(0, limit - spent),
      pct: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryAllocations, budget.monthlyLimit, budget.spent, budget.available, budget.percentageUsed]);
  const goals = overview?.savingsGoals || [];

  // 1. Top 4 Stat Cards — from data.cards
  const stats = [
    {
      title: "Total Balance",
      value: fmtCurrency(totalBalance),
      change: fmtPct(totalBalanceChange),
      isPositive: Number(totalBalanceChange) >= 0,
      icon: <IoWalletOutline size={20} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: "Available across accounts",
    },
    {
      title: "Total Income",
      value: fmtCurrency(c.totalIncome?.amount),
      change: fmtPct(c.totalIncome?.change),
      isPositive: Number(c.totalIncome?.change ?? 0) >= 0,
      icon: <FiTrendingUp size={20} color="#10b981" />,
      iconBg: "#ecfdf5",
      sub: `${fmtCurrency(c.totalIncome?.vsPreviousMonth)} vs last month`,
    },
    {
      title: "Total Expenses",
      value: fmtCurrency(c.totalExpenses?.amount),
      change: fmtPct(c.totalExpenses?.change),
      isPositive: Number(c.totalExpenses?.change ?? 0) <= 0,
      icon: <FiArrowDownLeft size={20} color="#ef4444" />,
      iconBg: "#fff1f2",
      sub: `${Number(c.totalExpenses?.budgetUsedPercentage ?? 0)}% of monthly budget used`,
    },
    {
      title: "Total Savings",
      value: fmtCurrency(c.totalSavings?.amount),
      change: fmtPct(c.totalSavings?.change),
      isPositive: Number(c.totalSavings?.change ?? 0) >= 0,
      icon: <FaPiggyBank size={18} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: `${Number(c.totalSavings?.netSavingsRate ?? 0)}% net savings rate`,
    },
  ];

  // 2. Bar Chart: Income vs Expenses — from incomeVsExpenses.weekly
  const weekly = Array.isArray(ive.weekly) ? ive.weekly : [];
  const barCategories = weekly.map((w) => w.label);
  const barIncome = weekly.map((w) => Number(w.income || 0));
  const barExpenses = weekly.map((w) => Number(w.expenses || 0));

  const barChartOptions = {
    chart: {
      type: "bar",
      height: 250,
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "46%",
        borderRadius: 4,
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

  // 3. Donut Chart: Expense Categories — from expenseCategories.categories
  const expCatList = Array.isArray(expCats.categories) ? expCats.categories : [];
  const expTotal = Number(expCats.total || 0);
  const donutLabels = expCatList.map((x) => x.category);
  const donutColors = expCatList.map((x, i) => x.color || DONUT_COLORS[i % DONUT_COLORS.length]);
  const donutSeries = expCatList.map((x) => Number(x.percentage || 0));
  const categoryLegend = expCatList.map((x, i) => ({
    name: x.category,
    percent: `${Number(x.percentage || 0)}%`,
    amount: `₹${Number(x.total || 0).toLocaleString("en-IN")}`,
    color: x.color || DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const donutOptions = {
    chart: {
      type: "donut",
      height: 230,
      fontFamily: "inherit",
      parentHeightOffset: 0,
    },
    labels: donutLabels,
    colors: donutColors,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      style: { fontSize: "11px", fontWeight: "700", colors: ["#ffffff"] },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
        },
      },
    },
    legend: { show: false },
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val}% (₹${((val / 100) * expTotal).toFixed(0)})` },
    },
  };

  // 4. Savings Goals — from data.savingsGoals
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

  // 5. Clean Transactions Data
  const transactions = [
    {
      id: "TX-9021",
      name: "TechCorp India Pvt Ltd",
      subtitle: "August Monthly Payroll",
      date: "20 Aug 2026",
      time: "10:00 AM",
      account: "HDFC •••• 4091",
      accountIcon: <BsBank2 className="text-primary me-1" size={12} />,
      amount: "+₹50,000.00",
      isIncome: true,
      icon: <FiBriefcase size={15} />,
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
    {
      id: "TX-9020",
      name: "DLF Phase 2 Apartment Rent",
      subtitle: "House Rent • Landlord Transfer",
      date: "18 Aug 2026",
      time: "02:30 PM",
      account: "GPay • landlord@okhdfc",
      accountIcon: <SiGooglepay className="text-secondary me-1" size={12} />,
      amount: "-₹10,000.00",
      isIncome: false,
      icon: <FiHome size={15} />,
      iconBg: "#f5f3ff",
      iconColor: "#8b5cf6",
    },
    {
      id: "TX-9019",
      name: "Swiggy Instamart & Blinkit",
      subtitle: "Groceries & Household Supplies",
      date: "17 Aug 2026",
      time: "08:15 PM",
      account: "PhonePe UPI",
      accountIcon: <SiPhonepe className="text-secondary me-1" size={12} />,
      amount: "-₹2,500.00",
      isIncome: false,
      icon: <FiCoffee size={15} />,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
    },
    {
      id: "TX-9018",
      name: "Amazon India Online Store",
      subtitle: "Electronics & Books Purchase",
      date: "16 Aug 2026",
      time: "04:45 PM",
      account: "Visa •••• 8820",
      accountIcon: <IoWalletOutline className="text-secondary me-1" size={12} />,
      amount: "-₹1,200.00",
      isIncome: false,
      icon: <FiShoppingBag size={15} />,
      iconBg: "#fdf2f8",
      iconColor: "#ec4899",
    },
    {
      id: "TX-9017",
      name: "Torrent Power Electricity",
      subtitle: "Consumer #89210 • Auto-Debit",
      date: "15 Aug 2026",
      time: "11:20 AM",
      account: "Auto-Debit • HDFC",
      accountIcon: <FiZap className="text-secondary me-1" size={12} />,
      amount: "-₹1,800.00",
      isIncome: false,
      icon: <FiFileText size={15} />,
      iconBg: "#ecfeff",
      iconColor: "#06b6d4",
    },
  ];

  return (
    <Container fluid className="p-0 ms-dashboard">
      {/* ===================================================================
          1. GREETING HEADER & BUTTONS (Compact & Refined)
          =================================================================== */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1">
            Good Morning, Uday <span className="ms-greeting-emoji">👏</span>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Here's your comprehensive financial overview for August 2026.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button className="ms-btn-income" onClick={openIncomeModal}>
            <FiPlus size={13} />
            <span>Add Income</span>
          </Button>
          <Button className="ms-btn-expense" onClick={openExpenseModal}>
            <FiMinus size={13} />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* ===================================================================
          2. TOP 4 STAT CARDS
          =================================================================== */}
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

      {/* ===================================================================
          PAIR 1: INCOME VS EXPENSES & EXPENSE CATEGORIES
          =================================================================== */}
      <Row className="g-3 mb-3">
        {/* Income vs Expenses Bar Chart */}
        <Col xs={12} lg={6}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <h5 className="ms-card-title mb-0">Income vs Expenses</h5>
                    <p className="text-muted fs-11px mb-0">Cash inflows vs outflows trend</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="d-flex align-items-center gap-3 my-2 fs-11px">
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#4f46e5" }}
                    ></span>
                    <span className="fw-600 text-dark">Income: ₹{Number(ive.totalIncome || 0).toLocaleString("en-IN")}</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#f43f5e" }}
                    ></span>
                    <span className="fw-600 text-dark">Expenses: ₹{Number(ive.totalExpenses || 0).toLocaleString("en-IN")}</span>
                  </span>
                </div>
              </div>

              <div className="ms-chart-wrap pt-1">
                <Chart
                  options={barChartOptions}
                  series={barChartSeries}
                  type="bar"
                  height={250}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Expense Categories Donut Chart */}
        <Col xs={12} lg={6}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-0">Expense Categories</h5>
                <p className="text-muted fs-11px mb-0">Breakdown of ₹{expTotal.toLocaleString("en-IN")} total spending</p>
              </div>

              {donutSeries.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-muted fs-12px my-auto py-2" style={{ minHeight: 230 }}>
                  No expense data to show yet.
                </div>
              ) : (
              <div className="d-flex align-items-center justify-content-around flex-wrap gap-2 my-auto py-2">
                <div style={{ width: "210px", height: "230px" }}>
                  <Chart
                    options={donutOptions}
                    series={donutSeries}
                    type="donut"
                    height={230}
                  />
                </div>

                {/* Legend List */}
                <div className="ms-donut-legend ps-2" style={{ minWidth: "170px" }}>
                  {categoryLegend.map((cat, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between mb-2 fs-11.5px"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="ms-legend-dot"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <span className="text-dark fw-600">{cat.name}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted fs-11px">{cat.amount}</span>
                        <span className="fw-700 text-dark">{cat.percent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          PAIR 2: BUDGET OVERVIEW & SAVINGS GOALS
          =================================================================== */}
      <Row className="g-3 mb-3">
        {/* Budget Overview */}
        <Col xs={12} lg={6}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="ms-card-title mb-0">Budget Overview</h5>
                  <p className="text-muted fs-11px mb-0">Monthly budget consumption</p>
                </div>
                <Badge
                  bg={budgetSummary.pct > 100 ? "danger-subtle" : "success-subtle"}
                  className={`fw-700 fs-10px py-1 px-2 rounded-6px ${budgetSummary.pct > 100 ? "text-danger" : "text-success"}`}
                >
                  {budgetSummary.pct > 100 ? "Over Budget" : "On Track"}
                </Badge>
              </div>

              {/* Monthly Budget Summary Card */}
              <div className="ms-budget-metric-card p-2 px-3 rounded-10px mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="ms-mini-label">Monthly Limit</div>
                    <div className="ms-budget-main-val">₹{budgetSummary.limit.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-center">
                    <div className="ms-mini-label">Spent so far</div>
                    <div className="ms-budget-used-val">₹{budgetSummary.spent.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-end">
                    <div className="ms-mini-label">Available</div>
                    <div className="ms-budget-rem-val">₹{budgetSummary.available.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted fw-600 fs-11px">Total Spent</span>
                    <span className="fw-800 text-primary fs-11px">{budgetSummary.pct}%</span>
                  </div>
                  <ProgressBar
                    now={Math.min(100, budgetSummary.pct)}
                    className="ms-progress-blue"
                    style={{ height: "8px" }}
                  />
                </div>
              </div>

              {/* Category Allocations — Premium Design */}
              <div>
                <div className="ms-cat-budget-heading mb-2">Category Allocations</div>
                <div className="d-flex flex-column gap-2">
                  {categoryAllocations.length === 0 ? (
                    <div className="text-muted fs-12px py-2 text-center">
                      No category budgets set yet.
                    </div>
                  ) : (
                    categoryAllocations.map((cat, idx) => (
                      <div className="ms-cat-alloc-card" key={idx}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="ms-cat-icon-box" style={{ backgroundColor: cat.bg, color: cat.color }}>
                              {cat.icon}
                            </div>
                            <div>
                              <div className="ms-cat-name">{cat.name}</div>
                              <div className="ms-cat-amount-info">
                                ₹{cat.spent.toLocaleString("en-IN")}{" "}
                                <span className="text-muted">of ₹{cat.allocated.toLocaleString("en-IN")}</span>
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
                      <FiTarget className="text-primary" /> Savings Goals
                    </h5>
                    <p className="text-muted fs-11px mb-0">Active targets &amp; milestones</p>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="ms-btn-goal-add"
                    onClick={() => navigate("/goals")}
                  >
                    + New Goal
                  </Button>
                </div>

                {/* Goals Cards List */}
                <div className="d-flex flex-column gap-2">
                  {savingsGoals.length === 0 && (
                    <div className="text-center text-muted fs-12px py-4">
                      No savings goals yet. Create one to start tracking.
                    </div>
                  )}
                  {savingsGoals.map((goal, idx) => (
                    <div key={idx} className="ms-goal-card p-2 px-3 rounded-10px">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="ms-goal-icon-box"
                            style={{ backgroundColor: goal.iconBg }}
                          >
                            <span>{goal.icon}</span>
                          </div>
                          <div>
                            <div className="ms-goal-name">{goal.title}</div>
                            <div className="ms-goal-cat">{goal.category} • {goal.eta}</div>
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
                      <div className="d-flex justify-content-between align-items-center fs-11.5px mb-1">
                        <span className="fw-700 text-dark">
                          ₹{goal.saved.toLocaleString("en-IN")}{" "}
                          <span className="text-muted fw-500">
                            / ₹{goal.target.toLocaleString("en-IN")}
                          </span>
                        </span>
                        <span className="text-muted fs-10.5px">{goal.remainingText}</span>
                      </div>

                      {/* Gradient Custom Progress Bar */}
                      <div className="ms-goal-track" style={{ height: "7px" }}>
                        <div
                          className="ms-goal-fill"
                          style={{
                            width: `${goal.percent}%`,
                            background: goal.gradient,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center border-top mt-2">
                <span className="text-muted fs-11px">
                  🚀 Total Saved: <strong className="text-dark">₹{totalSaved.toLocaleString("en-IN")}</strong> of ₹{totalTarget.toLocaleString("en-IN")}
                  {totalTarget ? ` (${Math.round((totalSaved / totalTarget) * 100)}% overall)` : ""}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          PAIR 3: CLEAN 4-COLUMN RECENT TRANSACTIONS & UPCOMING PAYMENTS
          (hidden — static mock content)
          =================================================================== */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
      <Row className="g-3">
        {/* Clean Recent Transactions Table */}
        <Col xs={12} lg={7}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="ms-card-title mb-0">Recent Transactions</h5>
                    <p className="text-muted fs-11px mb-0">Latest verified account activity</p>
                  </div>
                  <a href="#all-transactions" className="ms-view-all-link fs-11.5px">
                    View Statement <FiArrowRight size={12} className="ms-1" />
                  </a>
                </div>

                {/* Clean 4-Column Table */}
                <div className="table-responsive">
                  <Table className="ms-clean-table mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Merchant / Details</th>
                        <th>Date &amp; Time</th>
                        <th>Account / Method</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="ms-tx-item-row">
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="ms-tx-avatar-box"
                                style={{
                                  backgroundColor: tx.iconBg,
                                  color: tx.iconColor,
                                }}
                              >
                                {tx.icon}
                              </div>
                              <div>
                                <div className="ms-tx-main-title">{tx.name}</div>
                                <div className="ms-tx-desc-text">{tx.subtitle}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-dark fw-600 fs-11.5px">{tx.date}</div>
                            <div className="text-muted fs-10.5px">{tx.time}</div>
                          </td>
                          <td>
                            <div className="d-inline-flex align-items-center text-dark fw-600 fs-11.5px">
                              {tx.accountIcon}
                              <span>{tx.account}</span>
                            </div>
                          </td>
                          <td className="text-end">
                            <span
                              className={`ms-authentic-amount ${
                                tx.isIncome ? "income" : "expense"
                              }`}
                            >
                              {tx.amount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Payments & Financial Insights */}
        <Col xs={12} lg={5}>
          <div className="d-flex flex-column gap-3 h-100">
            {/* Upcoming Payments */}
            <Card className="ms-premium-card border-0">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="ms-card-title mb-0">Upcoming Payments</h5>
                    <p className="text-muted fs-11px mb-0">Due within the next 10 days</p>
                  </div>
                  <a href="#calendar" className="ms-view-all-link fs-11.5px">
                    Calendar <FiArrowRight size={12} className="ms-1" />
                  </a>
                </div>

                <div className="d-flex flex-column gap-2">
                  <div className="ms-payment-item p-2 px-3 rounded-10px d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="ms-payment-date-badge">
                        <span className="month">AUG</span>
                        <span className="day">25</span>
                      </div>
                      <div>
                        <div className="fw-700 text-dark fs-12px">Bike EMI Loan</div>
                        <div className="text-muted fs-10.5px">HDFC Auto-Debit</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-800 text-danger fs-13px">₹2,500</div>
                      <span className="badge bg-danger-subtle text-danger fs-10px">Due in 2 days</span>
                    </div>
                  </div>

                  <div className="ms-payment-item p-2 px-3 rounded-10px d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="ms-payment-date-badge">
                        <span className="month">AUG</span>
                        <span className="day">28</span>
                      </div>
                      <div>
                        <div className="fw-700 text-dark fs-12px">Electricity Bill</div>
                        <div className="text-muted fs-10.5px">Torrent Power</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-800 text-dark fs-13px">₹1,800</div>
                      <span className="badge bg-warning-subtle text-warning-emphasis fs-10px">Due in 5 days</span>
                    </div>
                  </div>

                  <div className="ms-payment-item p-2 px-3 rounded-10px d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="ms-payment-date-badge">
                        <span className="month">AUG</span>
                        <span className="day">30</span>
                      </div>
                      <div>
                        <div className="fw-700 text-dark fs-12px">House Rent</div>
                        <div className="text-muted fs-10.5px">Landlord Transfer</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-800 text-dark fs-13px">₹10,000</div>
                      <span className="badge bg-secondary-subtle text-secondary fs-10px">Due in 7 days</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Financial Insights */}
            <Card className="ms-premium-card border-0 flex-grow-1">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="ms-card-title mb-0">✨ Waltrio AI Insights</h5>
                    <p className="text-muted fs-11px mb-0">Automated financial tips</p>
                  </div>
                  <Badge bg="primary-subtle" className="text-primary fw-700 fs-10px py-1 px-8px rounded-pill">
                    Live Copilot
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column gap-2 fs-11.5px flex-grow-1 pe-2">
                    <div className="d-flex align-items-start gap-2 p-2 rounded-8px bg-warning-subtle text-warning-emphasis">
                      <BsStars className="mt-1 flex-shrink-0" />
                      <span>
                        Food expenses are <strong>18% higher</strong> than last month.
                      </span>
                    </div>
                    <div className="d-flex align-items-start gap-2 p-2 rounded-8px bg-success-subtle text-success-emphasis">
                      <BsStars className="mt-1 flex-shrink-0" />
                      <span>
                        You are <strong>on track</strong> to achieve your MacBook savings goal.
                      </span>
                    </div>
                    <div className="d-flex align-items-start gap-2 p-2 rounded-8px bg-primary-subtle text-primary-emphasis">
                      <BsStars className="mt-1 flex-shrink-0" />
                      <span>
                        Monthly savings <strong>increased by 12%</strong> compared to July.
                      </span>
                    </div>
                  </div>

                  {/* Growth Illustration */}
                  <div className="ms-growth-graphic flex-shrink-0 d-none d-sm-flex">
                    <div className="ms-growth-bars">
                      <span className="bar b1"></span>
                      <span className="bar b2"></span>
                      <span className="bar b3"></span>
                      <span className="bar b4"></span>
                    </div>
                    <svg
                      className="ms-growth-svg"
                      viewBox="0 0 100 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 5 45 Q 30 40, 50 25 T 95 10"
                        stroke="#4f46e5"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      <circle cx="95" cy="10" r="4.5" fill="#4f46e5" />
                    </svg>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
      )}

      {/* ===================================================================
          QUICK ADD: INCOME MODAL
          =================================================================== */}
      <Modal show={showIncomeModal} onHide={() => setShowIncomeModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income"><FiPlus size={16} /></span>
              Add Income
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Quickly record an income entry.</p>
          </div>
        </Modal.Header>
        <Form onSubmit={handleSaveIncome}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. TechCorp India Pvt Ltd"
                value={incomeForm.source}
                onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Category *</Form.Label>
              <Select
                value={INCOME_CATEGORIES.find((o) => o.value === incomeForm.category)}
                onChange={(opt) => setIncomeForm({ ...incomeForm, category: opt.value })}
                options={INCOME_CATEGORIES}
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
              <Form.Control
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Description / Work Scope</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Monthly salary payout"
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowIncomeModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="ms-btn-income px-4" disabled={savingIncome}>
              <FiPlus size={14} /> {savingIncome ? "Saving..." : "Save Income"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          QUICK ADD: EXPENSE MODAL
          =================================================================== */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon"><FiMinus size={16} /></span>
              Add Expense
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Quickly record an outgoing payment.</p>
          </div>
        </Modal.Header>
        <Form onSubmit={handleSaveExpense}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Merchant / Payee Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Swiggy Instamart / Amazon"
                value={expenseForm.merchant}
                onChange={(e) => setExpenseForm({ ...expenseForm, merchant: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Category *</Form.Label>
              <Select
                value={EXPENSE_CATEGORIES.find((o) => o.value === expenseForm.category)}
                onChange={(opt) => setExpenseForm({ ...expenseForm, category: opt.value })}
                options={EXPENSE_CATEGORIES}
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
              <Form.Control
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Description / Note</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Monthly grocery supplies"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowExpenseModal(false)} className="rounded-6px px-3">
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import ProgressBar from "react-bootstrap/ProgressBar";
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

export default function Dashboard() {
  const navigate = useNavigate();
  // Select2 Options for Chart (Compact)
  const timePeriodOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(timePeriodOptions[0]);

  // 1. Top 4 Stat Cards
  const stats = [
    {
      title: "Total Balance",
      value: "₹42,500.00",
      change: "+12.5%",
      isPositive: true,
      icon: <IoWalletOutline size={20} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: "Available in primary account",
    },
    {
      title: "Total Income",
      value: "₹50,000.00",
      change: "+8.2%",
      isPositive: true,
      icon: <FiTrendingUp size={20} color="#10b981" />,
      iconBg: "#ecfdf5",
      sub: "+₹3,800 higher than July",
    },
    {
      title: "Total Expenses",
      value: "₹20,500.00",
      change: "-4.3%",
      isPositive: true,
      icon: <FiArrowDownLeft size={20} color="#ef4444" />,
      iconBg: "#fff1f2",
      sub: "41% of monthly budget used",
    },
    {
      title: "Total Savings",
      value: "₹29,500.00",
      change: "+15.7%",
      isPositive: true,
      icon: <FaPiggyBank size={18} color="#4f46e5" />,
      iconBg: "#eef2ff",
      sub: "59% net savings rate this month",
    },
  ];

  // 2. Bar Chart: Income vs Expenses
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
      categories: ["Aug 1–7", "Aug 8–14", "Aug 15–21", "Aug 22–28", "Aug 29–31"],
      labels: {
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 20000,
      tickAmount: 4,
      labels: {
        formatter: (val) => (val === 0 ? "0" : `${val / 1000}K`),
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
    { name: "Income", data: [15000, 12000, 17500, 12500, 7500] },
    { name: "Expenses", data: [5000, 4000, 6200, 5200, 4500] },
  ];

  // 3. Donut Chart: Expense Categories
  const donutOptions = {
    chart: {
      type: "donut",
      height: 230,
      fontFamily: "inherit",
      parentHeightOffset: 0,
    },
    labels: ["Housing", "Food & Dining", "Transport", "Shopping", "Utilities", "Other"],
    colors: ["#4f46e5", "#8b5cf6", "#f59e0b", "#10b981", "#06b6d4", "#94a3b8"],
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
      y: { formatter: (val) => `${val}% (₹${((val / 100) * 20500).toFixed(0)})` },
    },
  };

  const donutSeries = [30, 22, 15, 12, 11, 10];

  const categoryLegend = [
    { name: "Housing", percent: "30%", amount: "₹6,150", color: "#4f46e5" },
    { name: "Food & Dining", percent: "22%", amount: "₹4,510", color: "#8b5cf6" },
    { name: "Transport", percent: "15%", amount: "₹3,075", color: "#f59e0b" },
    { name: "Shopping", percent: "12%", amount: "₹2,460", color: "#10b981" },
    { name: "Utilities", percent: "11%", amount: "₹2,255", color: "#06b6d4" },
    { name: "Other", percent: "10%", amount: "₹2,050", color: "#94a3b8" },
  ];

  // 4. Savings Goals Data
  const savingsGoals = [
    {
      title: "MacBook Pro M3",
      icon: "💻",
      iconBg: "#eef2ff",
      category: "Tech & Workspace",
      saved: 45000,
      target: 80000,
      percent: 56,
      gradient: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
      badgeColor: "#4f46e5",
      badgeBg: "#eef2ff",
      remainingText: "₹35,000 left",
      eta: "Est. Oct 2026",
    },
    {
      title: "Emergency Safety Net",
      icon: "🛡️",
      iconBg: "#ecfdf5",
      category: "Emergency Reserve",
      saved: 25000,
      target: 50000,
      percent: 50,
      gradient: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
      badgeColor: "#10b981",
      badgeBg: "#ecfdf5",
      remainingText: "₹25,000 left",
      eta: "Est. Nov 2026",
    },
    {
      title: "Bali Vacation 2026",
      icon: "✈️",
      iconBg: "#fffbeb",
      category: "Travel & Leisure",
      saved: 18000,
      target: 40000,
      percent: 45,
      gradient: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
      badgeColor: "#d97706",
      badgeBg: "#fef3c7",
      remainingText: "₹22,000 left",
      eta: "Est. Dec 2026",
    },
  ];

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

  // Select2 Custom Styling (Compact 30px)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#4f46e5" : "#e2e8f0",
      borderRadius: "6px",
      minHeight: "30px",
      height: "30px",
      fontSize: "11.5px",
      fontWeight: "500",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.15)" : "none",
      cursor: "pointer",
      "&:hover": { borderColor: "#cbd5e1" },
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
      borderRadius: "5px",
      margin: "2px 4px",
      width: "calc(100% - 8px)",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      boxShadow: "0 8px 20px -3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e2e8f0",
      zIndex: 1000,
    }),
    singleValue: (base) => ({ ...base, color: "#0f172a", fontSize: "11.5px" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#64748b", padding: "1px 5px" }),
  };

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
          <Button className="ms-btn-income" onClick={() => navigate("/income")}>
            <FiPlus size={13} />
            <span>Add Income</span>
          </Button>
          <Button className="ms-btn-expense" onClick={() => navigate("/expenses")}>
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
                  <div style={{ width: "90px" }}>
                    <Select
                      value={selectedPeriod}
                      onChange={setSelectedPeriod}
                      options={timePeriodOptions}
                      styles={selectStyles}
                      isSearchable={false}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="d-flex align-items-center gap-3 my-2 fs-11px">
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#4f46e5" }}
                    ></span>
                    <span className="fw-600 text-dark">Income: ₹64,000</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="ms-legend-square"
                      style={{ backgroundColor: "#f43f5e" }}
                    ></span>
                    <span className="fw-600 text-dark">Expenses: ₹24,900</span>
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
                <p className="text-muted fs-11px mb-0">Breakdown of ₹20,500 total spending</p>
              </div>

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
                <Badge bg="success-subtle" className="text-success fw-700 fs-10px py-1 px-2 rounded-6px">
                  On Track
                </Badge>
              </div>

              {/* Monthly Budget Summary Card */}
              <div className="ms-budget-metric-card p-2 px-3 rounded-10px mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="ms-mini-label">Monthly Limit</div>
                    <div className="ms-budget-main-val">₹30,000</div>
                  </div>
                  <div className="text-center">
                    <div className="ms-mini-label">Spent so far</div>
                    <div className="ms-budget-used-val">₹20,500</div>
                  </div>
                  <div className="text-end">
                    <div className="ms-mini-label">Available</div>
                    <div className="ms-budget-rem-val">₹9,500</div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted fw-600 fs-11px">Total Spent</span>
                    <span className="fw-800 text-primary fs-11px">68%</span>
                  </div>
                  <ProgressBar
                    now={68}
                    className="ms-progress-blue"
                    style={{ height: "8px" }}
                  />
                </div>
              </div>

              {/* Category Allocations — Premium Design */}
              <div>
                <div className="ms-cat-budget-heading mb-2">Category Allocations</div>
                <div className="d-flex flex-column gap-2">

                  {/* Food & Dining */}
                  <div className="ms-cat-alloc-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="ms-cat-icon-box" style={{ backgroundColor: "#f5f3ff", color: "#8b5cf6" }}>
                          <FiCoffee size={14} />
                        </div>
                        <div>
                          <div className="ms-cat-name">Food &amp; Dining</div>
                          <div className="ms-cat-amount-info">₹4,400 <span className="text-muted">of ₹6,000</span></div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="ms-cat-percent" style={{ color: "#8b5cf6" }}>73%</div>
                        <span className="ms-cat-status-badge warning">Warning</span>
                      </div>
                    </div>
                    <div className="ms-cat-progress-track">
                      <div className="ms-cat-progress-fill" style={{ width: "73%", background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)" }}></div>
                    </div>
                  </div>

                  {/* Housing & Rent */}
                  <div className="ms-cat-alloc-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="ms-cat-icon-box" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                          <FiHome size={14} />
                        </div>
                        <div>
                          <div className="ms-cat-name">Housing &amp; Rent</div>
                          <div className="ms-cat-amount-info">₹8,000 <span className="text-muted">of ₹10,000</span></div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="ms-cat-percent" style={{ color: "#ef4444" }}>80%</div>
                        <span className="ms-cat-status-badge danger">Over Limit</span>
                      </div>
                    </div>
                    <div className="ms-cat-progress-track">
                      <div className="ms-cat-progress-fill" style={{ width: "80%", background: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)" }}></div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="ms-cat-alloc-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="ms-cat-icon-box" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
                          <FiArrowRight size={14} />
                        </div>
                        <div>
                          <div className="ms-cat-name">Transportation</div>
                          <div className="ms-cat-amount-info">₹2,250 <span className="text-muted">of ₹4,000</span></div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="ms-cat-percent" style={{ color: "#d97706" }}>56%</div>
                        <span className="ms-cat-status-badge success">On Track</span>
                      </div>
                    </div>
                    <div className="ms-cat-progress-track">
                      <div className="ms-cat-progress-fill" style={{ width: "56%", background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" }}></div>
                    </div>
                  </div>

                  {/* Shopping & Retail */}
                  <div className="ms-cat-alloc-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="ms-cat-icon-box" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                          <FiShoppingBag size={14} />
                        </div>
                        <div>
                          <div className="ms-cat-name">Shopping &amp; Retail</div>
                          <div className="ms-cat-amount-info">₹1,850 <span className="text-muted">of ₹3,000</span></div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="ms-cat-percent" style={{ color: "#059669" }}>61%</div>
                        <span className="ms-cat-status-badge success">On Track</span>
                      </div>
                    </div>
                    <div className="ms-cat-progress-track">
                      <div className="ms-cat-progress-fill" style={{ width: "61%", background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" }}></div>
                    </div>
                  </div>

                  {/* Utilities & Bills */}
                  <div className="ms-cat-alloc-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="ms-cat-icon-box" style={{ backgroundColor: "#ecfeff", color: "#0891b2" }}>
                          <FiZap size={14} />
                        </div>
                        <div>
                          <div className="ms-cat-name">Utilities &amp; Bills</div>
                          <div className="ms-cat-amount-info">₹2,200 <span className="text-muted">of ₹4,000</span></div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="ms-cat-percent" style={{ color: "#0891b2" }}>55%</div>
                        <span className="ms-cat-status-badge success">On Track</span>
                      </div>
                    </div>
                    <div className="ms-cat-progress-track">
                      <div className="ms-cat-progress-fill" style={{ width: "55%", background: "linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)" }}></div>
                    </div>
                  </div>

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
                  <Button variant="outline-primary" size="sm" className="ms-btn-goal-add">
                    + New Goal
                  </Button>
                </div>

                {/* Goals Cards List */}
                <div className="d-flex flex-column gap-2">
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
                  🚀 Total Saved: <strong className="text-dark">₹88,000</strong> of ₹1,70,000 (52% overall)
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          PAIR 3: CLEAN 4-COLUMN RECENT TRANSACTIONS & UPCOMING PAYMENTS
          =================================================================== */}
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
    </Container>
  );
}

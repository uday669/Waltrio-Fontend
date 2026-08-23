import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Chart from "react-apexcharts";
import Select from "react-select";
import {
  FiArrowUpRight,
  FiTrendingUp,
  FiPlus,
  FiCalendar,
  FiBriefcase,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLayers,
  FiPieChart,
  FiRepeat,
  FiAlertCircle,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for Incomes
const INITIAL_INCOME_DATA = [
  {
    id: "INC-8091",
    source: "TechCorp India Pvt Ltd",
    description: "August Monthly Base Salary + Performance Bonus",
    category: "Salary",
    account: "HDFC Bank •••• 4091",
    accountType: "Bank Transfer",
    date: "2026-08-20",
    time: "10:00 AM",
    amount: 65000,
    status: "Received",
    isRecurring: true,
    referenceNo: "NEFT-HDFC-99120412",
    notes: "Credited automatically on 20th of every month",
  },
  {
    id: "INC-8090",
    source: "Apex SaaS Freelance Design",
    description: "Milestone 2 - Design System & Component Library",
    category: "Freelance",
    account: "ICICI Bank •••• 9821",
    accountType: "Direct Deposit",
    date: "2026-08-18",
    time: "03:45 PM",
    amount: 28000,
    status: "Received",
    isRecurring: false,
    referenceNo: "UPI-ICICI-882190",
    notes: "UI/UX wireframes & design kit delivery accepted",
  },
  {
    id: "INC-8089",
    source: "Apartment 4B Rental Yield",
    description: "Monthly Rental Inflow - DLF Greens Tenant",
    category: "Rental",
    account: "HDFC Bank •••• 4091",
    accountType: "GPay UPI",
    date: "2026-08-15",
    time: "11:30 AM",
    amount: 18000,
    status: "Received",
    isRecurring: true,
    referenceNo: "GPAY-90218-441",
    notes: "Tenant paid on schedule",
  },
  {
    id: "INC-8088",
    source: "TCS & Infosys Dividends",
    description: "Q2 FY27 Quarterly Equity Stock Dividends",
    category: "Dividends",
    account: "Zerodha Trading A/C",
    accountType: "Demag Dividend",
    date: "2026-08-12",
    time: "09:15 AM",
    amount: 4500,
    status: "Received",
    isRecurring: false,
    referenceNo: "DIV-NSE-881920",
    notes: "Direct dividend payout credited to ledger",
  },
  {
    id: "INC-8087",
    source: "Fintech Advisory Consultation",
    description: "Architecture review consultation (3 hours session)",
    category: "Consulting",
    account: "PhonePe UPI",
    accountType: "PhonePe UPI",
    date: "2026-08-10",
    time: "05:20 PM",
    amount: 12500,
    status: "Received",
    isRecurring: false,
    referenceNo: "UPI-PHON-77821",
    notes: "Consulting invoice #FIN-2026-09",
  },
  {
    id: "INC-8086",
    source: "SBI Fixed Deposit Interest",
    description: "Quarterly cumulative FD interest payout",
    category: "Investments",
    account: "SBI Bank •••• 1109",
    accountType: "Bank Interest",
    date: "2026-08-05",
    time: "12:00 PM",
    amount: 3800,
    status: "Received",
    isRecurring: true,
    referenceNo: "INT-SBI-00129",
    notes: "Automated quarterly reinvestment interest",
  },
  {
    id: "INC-8085",
    source: "YouTube Partner Program",
    description: "AdSense Creator Revenue - July Monetization",
    category: "Digital Products",
    account: "HDFC Bank •••• 4091",
    accountType: "Wire Transfer",
    date: "2026-08-02",
    time: "08:40 AM",
    amount: 8200,
    status: "Received",
    isRecurring: true,
    referenceNo: "GOOGLE-ADS-991",
    notes: "Google Ireland wire payout",
  },
  {
    id: "INC-8084",
    source: "Annual Performance Bonus",
    description: "Mid-Year Appraisal Performance Incentive",
    category: "Bonus",
    account: "HDFC Bank •••• 4091",
    accountType: "Bank Transfer",
    date: "2026-07-28",
    time: "10:30 AM",
    amount: 35000,
    status: "Received",
    isRecurring: false,
    referenceNo: "BONUS-CORP-4019",
    notes: "Approved by leadership committee",
  },
  {
    id: "INC-8083",
    source: "Brand Sponsorship - DevKit",
    description: "Newsletter sponsorship shoutout & review",
    category: "Freelance",
    account: "ICICI Bank •••• 9821",
    accountType: "Direct Deposit",
    date: "2026-07-20",
    time: "02:10 PM",
    amount: 15000,
    status: "Received",
    isRecurring: false,
    referenceNo: "SPON-DEV-08",
    notes: "Delivered video segment and newsletter sponsor slot",
  },
  {
    id: "INC-8082",
    source: "Upcoming Contract Retainer",
    description: "Monthly maintenance retainer for cloud infra",
    category: "Consulting",
    account: "HDFC Bank •••• 4091",
    accountType: "Bank Transfer",
    date: "2026-08-28",
    time: "11:00 AM",
    amount: 22000,
    status: "Pending",
    isRecurring: true,
    referenceNo: "INV-RET-2026",
    notes: "Expected credit by end of month",
  },
];

// Available Categories with icons & theme colors
const CATEGORIES = [
  { label: "All Categories", value: "all", color: "#64748b" },
  { label: "Salary", value: "Salary", color: "#10b981", bg: "#ecfdf5" },
  { label: "Freelance", value: "Freelance", color: "#6366f1", bg: "#eef2ff" },
  { label: "Rental", value: "Rental", color: "#06b6d4", bg: "#ecfeff" },
  { label: "Dividends", value: "Dividends", color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "Consulting", value: "Consulting", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Investments", value: "Investments", color: "#14b8a6", bg: "#f0fdfa" },
  { label: "Digital Products", value: "Digital Products", color: "#ec4899", bg: "#fdf2f8" },
  { label: "Bonus", value: "Bonus", color: "#e11d48", bg: "#ffe4e6" },
];

export default function Income() {
  const [incomes, setIncomes] = useState(INITIAL_INCOME_DATA);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("monthly");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeIncome, setActiveIncome] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    source: "",
    description: "",
    category: "Salary",
    account: "HDFC Bank •••• 4091",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    time: "12:00 PM",
    status: "Received",
    isRecurring: false,
    referenceNo: "",
    notes: "",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const received = incomes
      .filter((i) => i.status === "Received")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const recurring = incomes
      .filter((i) => i.isRecurring)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const avg = incomes.length > 0 ? Math.round(total / incomes.length) : 0;

    // Find top source category
    const catMap = {};
    incomes.forEach((i) => {
      catMap[i.category] = (catMap[i.category] || 0) + Number(i.amount);
    });
    let topCat = "Salary";
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return { total, received, recurring, avg, topCat, maxVal };
  }, [incomes]);

  // Filtered dataset for table
  const tableData = useMemo(() => {
    return incomes.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [incomes, selectedCategory, selectedStatus]);

  // ApexChart: Income Trends Spline Area
  const trendChartOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 2.5, colors: ["#10b981"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
        colorStops: [
          { offset: 0, color: "#10b981", opacity: 0.4 },
          { offset: 100, color: "#10b981", opacity: 0.0 },
        ],
      },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Apr", "May", "Jun", "Jul", "Aug (Curr)", "Sep (Proj)"],
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val / 1000}k`,
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` },
    },
  };

  const trendChartSeries = [
    {
      name: "Income Stream",
      data: [95000, 110000, 125000, 138000, metrics.total, 160000],
    },
  ];

  // ApexChart: Income by Source Donut
  const donutOptions = {
    chart: { type: "donut", height: 210, fontFamily: "inherit" },
    labels: ["Salary", "Freelance", "Rental", "Consulting", "Dividends & Other"],
    colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b", "#8b5cf6"],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      style: { fontSize: "11px", fontWeight: "700", colors: ["#ffffff"] },
      dropShadow: { enabled: false },
    },
    plotOptions: { pie: { donut: { size: "65%" } } },
    legend: { show: false },
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val}%` },
    },
  };

  const donutSeries = [52, 22, 14, 8, 4];

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      source: "",
      description: "",
      category: "Salary",
      account: "HDFC Bank •••• 4091",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00 PM",
      status: "Received",
      isRecurring: false,
      referenceNo: `INC-TX-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: "",
    });
    setShowAddModal(true);
  };

  // Submit Add Form
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.amount) return;

    const newEntry = {
      id: `INC-${Math.floor(8100 + Math.random() * 900)}`,
      ...formData,
      amount: Number(formData.amount),
    };

    setIncomes([newEntry, ...incomes]);
    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setActiveIncome(item);
    setFormData({
      source: item.source,
      description: item.description,
      category: item.category,
      account: item.account,
      amount: item.amount,
      date: item.date,
      time: item.time,
      status: item.status,
      isRecurring: item.isRecurring,
      referenceNo: item.referenceNo || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeIncome) return;

    setIncomes(
      incomes.map((item) =>
        item.id === activeIncome.id
          ? { ...item, ...formData, amount: Number(formData.amount) }
          : item
      )
    );
    setShowEditModal(false);
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setActiveIncome(item);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!activeIncome) return;
    setIncomes(incomes.filter((i) => i.id !== activeIncome.id));
    setShowDeleteModal(false);
  };

  // Bulk Delete
  const handleBulkDelete = (ids) => {
    const idSet = new Set(ids);
    setIncomes(incomes.filter((i) => !idSet.has(i.id)));
  };

  // View Details
  const handleOpenDetails = (item) => {
    setActiveIncome(item);
    setShowDetailsModal(true);
  };

  // Columns definition for React Data Table
  const columns = [
    {
      name: "Income Ref & Source",
      selector: (row) => row.source,
      sortable: true,
      minWidth: "240px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="ur-income-avatar-box">
            <FiArrowUpRight size={15} color="#10b981" />
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.source}</div>
            <div className="text-muted fs-11px text-truncate" style={{ maxWidth: "200px" }}>
              {row.description || row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "140px",
      cell: (row) => {
        const catInfo = CATEGORIES.find((c) => c.value === row.category) || {};
        return (
          <span
            className="ur-category-badge"
            style={{
              backgroundColor: catInfo.bg || "#ecfdf5",
              color: catInfo.color || "#10b981",
            }}
          >
            {row.category}
          </span>
        );
      },
    },
    {
      name: "Account / Method",
      selector: (row) => row.account,
      sortable: true,
      minWidth: "160px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-1 fs-12px">
          {row.account.includes("HDFC") || row.account.includes("ICICI") || row.account.includes("SBI") ? (
            <BsBank2 className="text-primary me-1" size={12} />
          ) : row.account.includes("GPay") ? (
            <SiGooglepay className="text-info me-1" size={13} />
          ) : row.account.includes("PhonePe") ? (
            <SiPhonepe className="text-primary me-1" size={13} />
          ) : (
            <IoWalletOutline className="text-muted me-1" size={13} />
          )}
          <span className="text-dark fw-500">{row.account}</span>
        </div>
      ),
    },
    {
      name: "Date & Time",
      selector: (row) => row.date,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <div>
          <div className="fw-600 text-dark fs-11.5px">
            {new Date(row.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-muted fs-10.5px">{row.time}</div>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`ur-status-pill ${
            row.status === "Received" ? "success" : "warning"
          }`}
        >
          {row.status === "Received" ? (
            <FiCheckCircle size={10} className="me-1" />
          ) : (
            <FiClock size={10} className="me-1" />
          )}
          {row.status}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => (
        <div className="text-end">
          <div className="fw-800 text-success fs-13px">
            +₹{Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          {row.isRecurring && (
            <span className="text-muted fs-10px d-flex align-items-center justify-content-end gap-1">
              <FiRepeat size={9} /> Recurring
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "110px",
      right: true,
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-end gap-1">
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn view"
            onClick={() => handleOpenDetails(row)}
            title="View Details"
          >
            <FiEye size={13} />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn edit"
            onClick={() => handleOpenEdit(row)}
            title="Edit Record"
          >
            <FiEdit2 size={13} />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn delete"
            onClick={() => handleOpenDelete(row)}
            title="Delete Record"
          >
            <FiTrash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* ===================================================================
          1. HEADER & ACTION BUTTONS
          =================================================================== */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Income Management</span>
            <Badge bg="success-subtle" className="text-success fs-11px fw-700 py-1 px-2 rounded-6px">
              Active Inflow
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Track, analyze, and manage all your salary, investments, freelance, and passive income streams.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button className="ms-btn-income" onClick={handleOpenAdd}>
            <FiPlus size={14} />
            <span>Add New Income</span>
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
                  <div className="ms-stat-title">Total Inflow (Month)</div>
                  <div className="ms-stat-val text-success">
                    ₹{metrics.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiTrendingUp size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill positive">
                  <FiTrendingUp size={11} /> +14.8%
                </span>
                <span className="ms-stat-sub-text">vs previous 30 days</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Recurring Inflow</div>
                  <div className="ms-stat-val">
                    ₹{metrics.recurring.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiRepeat size={19} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">
                  {Math.round((metrics.recurring / (metrics.total || 1)) * 100)}% of total
                </span>
                <span className="ms-stat-sub-text">Salary &amp; Rentals</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Average Income / Entry</div>
                  <div className="ms-stat-val">
                    ₹{metrics.avg.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiDollarSign size={19} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill positive">
                  <FiTrendingUp size={11} /> +6.4%
                </span>
                <span className="ms-stat-sub-text">Across {incomes.length} records</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Top Revenue Stream</div>
                  <div className="ms-stat-val fs-18px text-truncate" style={{ maxWidth: "160px" }}>
                    {metrics.topCat}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfeff" }}>
                  <FiBriefcase size={19} color="#06b6d4" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">
                  ₹{metrics.maxVal.toLocaleString("en-IN")}
                </span>
                <span className="ms-stat-sub-text">Primary Source</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          3. VISUAL CHARTS ROW
          =================================================================== */}
      <Row className="g-3 mb-3">
        {/* Income Growth Spline Chart */}
        <Col xs={12} lg={7}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="ms-card-title mb-0">Income Inflow Velocity</h5>
                  <p className="text-muted fs-11px mb-0">6-Month progression &amp; projected growth</p>
                </div>
                <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-6px">
                  <Button
                    variant={timeRange === "monthly" ? "white" : "transparent"}
                    size="sm"
                    className={`ur-chart-filter-btn ${timeRange === "monthly" ? "active" : ""}`}
                    onClick={() => setTimeRange("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={timeRange === "quarterly" ? "white" : "transparent"}
                    size="sm"
                    className={`ur-chart-filter-btn ${timeRange === "quarterly" ? "active" : ""}`}
                    onClick={() => setTimeRange("quarterly")}
                  >
                    Quarterly
                  </Button>
                </div>
              </div>

              <div className="ms-chart-wrap pt-1">
                <Chart options={trendChartOptions} series={trendChartSeries} type="area" height={220} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Source Breakdown Donut */}
        <Col xs={12} lg={5}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-0">Revenue Share by Category</h5>
                <p className="text-muted fs-11px mb-0">Portfolio distribution</p>
              </div>

              <div className="d-flex align-items-center justify-content-around flex-wrap gap-2 my-auto py-2">
                <div style={{ width: "180px", height: "200px" }}>
                  <Chart options={donutOptions} series={donutSeries} type="donut" height={200} />
                </div>

                <div className="ms-donut-legend ps-2" style={{ minWidth: "150px" }}>
                  {[
                    { name: "Salary", pct: "52%", clr: "#10b981" },
                    { name: "Freelance", pct: "22%", clr: "#6366f1" },
                    { name: "Rental", pct: "14%", clr: "#06b6d4" },
                    { name: "Consulting", pct: "8%", clr: "#f59e0b" },
                    { name: "Dividends", pct: "4%", clr: "#8b5cf6" },
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between mb-1 fs-11px">
                      <div className="d-flex align-items-center gap-2">
                        <span className="ms-legend-dot" style={{ backgroundColor: item.clr }}></span>
                        <span className="text-dark fw-600">{item.name}</span>
                      </div>
                      <span className="fw-700 text-dark">{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          4. UNIVERSAL COMMON DATA TABLE (Plug-and-play with single tag)
          =================================================================== */}
      <CommonDataTable
        columns={columns}
        data={tableData}
        keyField="id"
        title="All Income Transactions"
        subtitle={`Showing ${tableData.length} verified income logs`}
        searchPlaceholder="Search by payer, source, or reference..."
        selectableRows={true}
        initialSortField="date"
        initialSortOrder="desc"
        defaultPageSize={10}
        onBulkDelete={handleBulkDelete}
        exportFileName="Income_Statements"
        filters={
          <div className="ur-inline-filters">
            {/* Category Filter */}
            <Form.Select
              size="sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ur-filter-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Form.Select>

            {/* Status Filter */}
            <Form.Select
              size="sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="ur-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </Form.Select>
          </div>
        }
      />

      {/* ===================================================================
          MODAL: ADD NEW INCOME
          =================================================================== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income">
                <FiPlus size={16} />
              </span>
              Record New Income
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Fill in the details below to record an income entry into Waltrio.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. TechCorp India Pvt Ltd"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="ur-form-input"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Deposited To Account *</Form.Label>
                  <Form.Select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="HDFC Bank •••• 4091">HDFC Bank •••• 4091</option>
                    <option value="ICICI Bank •••• 9821">ICICI Bank •••• 9821</option>
                    <option value="SBI Bank •••• 1109">SBI Bank •••• 1109</option>
                    <option value="PhonePe UPI">PhonePe UPI</option>
                    <option value="GPay UPI">GPay UPI</option>
                    <option value="Cash in Hand">Cash in Hand</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Description / Work Scope</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Monthly salary payout with milestone bonus"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="recurring-income-chk"
                  label="Mark as recurring monthly income"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="ur-checkbox-label"
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="ms-btn-income px-4">
              <FiPlus size={14} /> Save Income
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: EDIT INCOME
          =================================================================== */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon edit">
                <FiEdit2 size={15} />
              </span>
              Edit Income Record ({activeIncome?.id})
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Modify information for this income log.</p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="ur-form-input"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Account</Form.Label>
                  <Form.Select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="HDFC Bank •••• 4091">HDFC Bank •••• 4091</option>
                    <option value="ICICI Bank •••• 9821">ICICI Bank •••• 9821</option>
                    <option value="SBI Bank •••• 1109">SBI Bank •••• 1109</option>
                    <option value="PhonePe UPI">PhonePe UPI</option>
                    <option value="GPay UPI">GPay UPI</option>
                    <option value="Cash in Hand">Cash in Hand</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="recurring-income-edit-chk"
                  label="Mark as recurring monthly income"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="ur-checkbox-label"
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Update Record
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: DELETE CONFIRMATION
          =================================================================== */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm" className="ur-modal">
        <Modal.Body className="text-center p-4">
          <div className="ur-delete-icon-box mx-auto mb-3">
            <FiTrash2 size={24} color="#ef4444" />
          </div>
          <h5 className="fw-700 text-dark mb-1">Delete Income Record?</h5>
          <p className="text-muted fs-12px mb-3">
            Are you sure you want to delete <strong>{activeIncome?.source}</strong> (₹{activeIncome?.amount?.toLocaleString("en-IN")})? This action cannot be undone.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="light" size="sm" onClick={() => setShowDeleteModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} className="rounded-6px px-3">
              Delete Record
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ===================================================================
          MODAL: VIEW DETAILS
          =================================================================== */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <FiEye className="text-primary" /> Income Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {activeIncome && (
            <div>
              {/* Highlight Card */}
              <div className="ur-details-highlight-card p-3 rounded-10px mb-3 text-center">
                <span className="text-muted fs-11px">TOTAL AMOUNT CREDITED</span>
                <div className="fw-800 text-success fs-24px my-1">
                  +₹{Number(activeIncome.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <Badge bg="success-subtle" className="text-success fs-11px px-2 py-1 rounded-6px">
                  Status: {activeIncome.status}
                </Badge>
              </div>

              {/* Information Grid */}
              <div className="d-flex flex-column gap-2 fs-12px">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Transaction ID:</span>
                  <span className="fw-700 text-dark">{activeIncome.id}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Source / Payer:</span>
                  <span className="fw-600 text-dark">{activeIncome.source}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Category:</span>
                  <span className="fw-600 text-primary">{activeIncome.category}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Credited Account:</span>
                  <span className="fw-600 text-dark">{activeIncome.account}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Date &amp; Timestamp:</span>
                  <span className="fw-600 text-dark">
                    {activeIncome.date} at {activeIncome.time}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Reference / UTR:</span>
                  <span className="fw-600 text-muted font-monospace">{activeIncome.referenceNo || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Notes:</span>
                  <span className="fw-500 text-dark text-end" style={{ maxWidth: "240px" }}>
                    {activeIncome.notes || activeIncome.description || "None"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" size="sm" onClick={() => setShowDetailsModal(false)} className="rounded-6px px-4">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

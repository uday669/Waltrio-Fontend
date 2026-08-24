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
import Select from "react-select";
import { filterSelectStyles, formSelectStyles } from "../../utils/selectStyles";
import {
  FiArrowDownLeft,
  FiTrendingDown,
  FiPlus,
  FiCalendar,
  FiShoppingBag,
  FiCoffee,
  FiHome,
  FiZap,
  FiTrendingUp,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiActivity,
  FiShield,
  FiBook,
  FiPaperclip,
  FiX,
  FiImage,
  FiUploadCloud,
  FiAlertTriangle,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for Expenses
const INITIAL_EXPENSES_DATA = [
  {
    id: "EXP-9041",
    merchant: "DLF Phase 2 Apartment Rent",
    description: "Monthly apartment lease payment to landlord",
    category: "Housing",
    account: "GPay • landlord@okhdfc",
    paymentMethod: "UPI Transfer",
    date: "2026-08-18",
    time: "02:30 PM",
    amount: 10000,
    status: "Paid",
    receipt: "DLF_Receipt_Aug26.pdf",
    tags: "Fixed, Essential",
    notes: "Direct bank transfer confirmation #GPAY-8820",
  },
  {
    id: "EXP-9040",
    merchant: "Swiggy Instamart & Blinkit",
    description: "Bi-weekly household groceries and vegetables",
    category: "Food & Dining",
    account: "PhonePe UPI",
    paymentMethod: "UPI Transfer",
    date: "2026-08-17",
    time: "08:15 PM",
    amount: 2500,
    status: "Paid",
    receipt: "Blinkit_Order_789.pdf",
    tags: "Daily, Groceries",
    notes: "Ordered monthly ration items",
  },
  {
    id: "EXP-9039",
    merchant: "Amazon India Online",
    description: "Ergonomic Monitor Arm & Wireless Keyboard",
    category: "Shopping",
    account: "Visa •••• 8820",
    paymentMethod: "Credit Card",
    date: "2026-08-16",
    time: "04:45 PM",
    amount: 3200,
    status: "Paid",
    receipt: "Amazon_Tax_Invoice.pdf",
    tags: "Work, Workspace",
    notes: "Tax deductible workspace expense",
  },
  {
    id: "EXP-9038",
    merchant: "Torrent Power Electricity",
    description: "Consumer #89210 • Power bill July usage",
    category: "Utilities",
    account: "Auto-Debit • HDFC",
    paymentMethod: "Auto Debit",
    date: "2026-08-15",
    time: "11:20 AM",
    amount: 1800,
    status: "Paid",
    receipt: "Torrent_Electricity.pdf",
    tags: "Bills, Utilities",
    notes: "Auto-debited on schedule",
  },
  {
    id: "EXP-9037",
    merchant: "Indian Oil Petrol Pump",
    description: "Full fuel tank refill for car",
    category: "Transportation",
    account: "ICICI Bank •••• 9821",
    paymentMethod: "Debit Card",
    date: "2026-08-14",
    time: "09:30 AM",
    amount: 3500,
    status: "Paid",
    receipt: "IOCL_Fuel_Bill.pdf",
    tags: "Fuel, Commute",
    notes: "City & highway travel fuel",
  },
  {
    id: "EXP-9036",
    merchant: "Apollo Pharmacy & Healthcare",
    description: "Prescription vitamins and medical checkup",
    category: "Healthcare",
    account: "PhonePe UPI",
    paymentMethod: "UPI Transfer",
    date: "2026-08-12",
    time: "06:10 PM",
    amount: 1450,
    status: "Paid",
    receipt: "Apollo_RX_Bill.pdf",
    tags: "Health, Wellness",
    notes: "Routine medical test and prescriptions",
  },
  {
    id: "EXP-9035",
    merchant: "Cult.fit Fitness Membership",
    description: "Quarterly gym and fitness pass auto-renewal",
    category: "Fitness & Wellness",
    account: "Visa •••• 8820",
    paymentMethod: "Credit Card",
    date: "2026-08-10",
    time: "07:00 AM",
    amount: 4200,
    status: "Paid",
    receipt: "CultFit_Sub_Invoice.pdf",
    tags: "Subscription, Health",
    notes: "Quarterly pass access to 3 centers",
  },
  {
    id: "EXP-9034",
    merchant: "Netflix & Spotify Premium",
    description: "Monthly entertainment digital entertainment pack",
    category: "Entertainment",
    account: "Visa •••• 8820",
    paymentMethod: "Credit Card",
    date: "2026-08-08",
    time: "10:00 AM",
    amount: 899,
    status: "Paid",
    receipt: "Netflix_Invoice_Aug.pdf",
    tags: "Entertainment, Monthly",
    notes: "Family 4K multi-screen pack",
  },
  {
    id: "EXP-9033",
    merchant: "Coursera & Udemy Learning",
    description: "Full-Stack System Design Certification Course",
    category: "Education",
    account: "HDFC Bank •••• 4091",
    paymentMethod: "Net Banking",
    date: "2026-08-05",
    time: "03:15 PM",
    amount: 2200,
    status: "Paid",
    receipt: "Coursera_Certificate.pdf",
    tags: "Skill, Upgrading",
    notes: "Course enrolled with lifetime access",
  },
  {
    id: "EXP-9032",
    merchant: "Airtel Fiber Broadband",
    description: "300 Mbps Unlimited Fiber Internet Bill",
    category: "Utilities",
    account: "PhonePe UPI",
    paymentMethod: "UPI Transfer",
    date: "2026-08-25",
    time: "12:00 PM",
    amount: 1180,
    status: "Pending",
    receipt: "Airtel_Bill_Due.pdf",
    tags: "Internet, Utilities",
    notes: "Bill generated, due on 25th Aug",
  },
];

// Categories definition with badges & styling
const EXPENSE_CATEGORIES = [
  { label: "All Categories", value: "all", color: "#64748b" },
  { label: "Housing", value: "Housing", color: "#4f46e5", bg: "#eef2ff", icon: <FiHome size={14} /> },
  { label: "Food & Dining", value: "Food & Dining", color: "#8b5cf6", bg: "#f5f3ff", icon: <FiCoffee size={14} /> },
  { label: "Transportation", value: "Transportation", color: "#f59e0b", bg: "#fffbeb", icon: <FiTrendingUp size={14} /> },
  { label: "Shopping", value: "Shopping", color: "#ec4899", bg: "#fdf2f8", icon: <FiShoppingBag size={14} /> },
  { label: "Utilities", value: "Utilities", color: "#06b6d4", bg: "#ecfeff", icon: <FiZap size={14} /> },
  { label: "Healthcare", value: "Healthcare", color: "#ef4444", bg: "#fff1f2", icon: <FiShield size={14} /> },
  { label: "Fitness & Wellness", value: "Fitness & Wellness", color: "#10b981", bg: "#ecfdf5", icon: <FiActivity size={14} /> },
  { label: "Entertainment", value: "Entertainment", color: "#d97706", bg: "#fef3c7", icon: <FiCoffee size={14} /> },
  { label: "Education", value: "Education", color: "#6366f1", bg: "#eef2ff", icon: <FiBook size={14} /> },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES_DATA);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("weekly");

  // Monthly Budget Limit for budget metric
  const monthlyBudgetLimit = 35000;

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeExpense, setActiveExpense] = useState(null);

  // Form State with Bill / Receipt Image Support
  const [formData, setFormData] = useState({
    merchant: "",
    description: "",
    category: "Food & Dining",
    account: "PhonePe UPI",
    paymentMethod: "UPI Transfer",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    time: "02:00 PM",
    status: "Paid",
    receipt: "",
    tags: "",
    notes: "",
    receiptImg: null,
    receiptName: "",
  });

  // Modal for Viewing Full Receipt Image
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [previewReceiptImg, setPreviewReceiptImg] = useState(null);

  // File Upload Handler (Converts to Data URL for instant preview)
  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          receiptImg: reader.result,
          receiptName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const paid = expenses
      .filter((e) => e.status === "Paid")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const budgetPct = Math.min(100, Math.round((total / monthlyBudgetLimit) * 100));
    const dailyAvg = Math.round(total / 20); // 20 days so far in month

    // Top Category
    const catMap = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    let topCat = "Housing";
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return { total, paid, budgetPct, dailyAvg, topCat, maxVal };
  }, [expenses]);

  // Filtered dataset for table
  const tableData = useMemo(() => {
    return expenses.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [expenses, selectedCategory, selectedStatus]);

  // ApexChart: Spending Trend vs Budget
  const spendingTrendOptions = {
    chart: {
      type: "bar",
      height: 220,
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    colors: ["#ef4444", "#cbd5e1"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Aug 1–7", "Aug 8–14", "Aug 15–21", "Aug 22–28", "Aug 29–31"],
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
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` },
    },
  };

  const spendingTrendSeries = [
    { name: "Spent Outflow", data: [6800, 8400, 9200, 5100, 3200] },
    { name: "Budget Target", data: [7000, 7000, 7000, 7000, 7000] },
  ];

  // ApexChart: Expense Distribution Donut
  const donutOptions = {
    chart: { type: "donut", height: 210, fontFamily: "inherit" },
    labels: ["Housing", "Food & Dining", "Transport", "Shopping", "Health & Other"],
    colors: ["#4f46e5", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981"],
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
      y: { formatter: (val) => `${val}% (₹${((val / 100) * metrics.total).toFixed(0)})` },
    },
  };

  const donutSeries = [36, 20, 16, 15, 13];

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      merchant: "",
      description: "",
      category: "Food & Dining",
      account: "PhonePe UPI",
      paymentMethod: "UPI Transfer",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      time: "02:00 PM",
      status: "Paid",
      receipt: "",
      tags: "Daily",
      notes: "",
    });
    setShowAddModal(true);
  };

  // Submit Add Form
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.merchant || !formData.amount) return;

    const newEntry = {
      id: `EXP-${Math.floor(9100 + Math.random() * 900)}`,
      ...formData,
      amount: Number(formData.amount),
    };

    setExpenses([newEntry, ...expenses]);
    setShowAddModal(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setActiveExpense(item);
    setFormData({
      merchant: item.merchant,
      description: item.description,
      category: item.category,
      account: item.account,
      paymentMethod: item.paymentMethod || "UPI Transfer",
      amount: item.amount,
      date: item.date,
      time: item.time,
      status: item.status,
      receipt: item.receipt || "",
      tags: item.tags || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeExpense) return;

    setExpenses(
      expenses.map((item) =>
        item.id === activeExpense.id
          ? { ...item, ...formData, amount: Number(formData.amount) }
          : item
      )
    );
    setShowEditModal(false);
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setActiveExpense(item);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!activeExpense) return;
    setExpenses(expenses.filter((e) => e.id !== activeExpense.id));
    setShowDeleteModal(false);
  };

  // Bulk Delete
  const handleBulkDelete = (ids) => {
    const idSet = new Set(ids);
    setExpenses(expenses.filter((e) => !idSet.has(e.id)));
  };

  // View Details
  const handleOpenDetails = (item) => {
    setActiveExpense(item);
    setShowDetailsModal(true);
  };

  // Columns definition for React Data Table
  const columns = [
    {
      name: "Merchant / Payee",
      selector: (row) => row.merchant,
      sortable: true,
      minWidth: "250px",
      cell: (row) => {
        const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === row.category) || {};
        return (
          <div className="d-flex align-items-center gap-2">
            <div
              className="ur-expense-avatar-box"
              style={{ backgroundColor: catInfo.bg || "#fff1f2", color: catInfo.color || "#ef4444" }}
            >
              {catInfo.icon || <FiShoppingBag size={15} />}
            </div>
            <div>
              <div className="fw-700 text-dark fs-12.5px">{row.merchant}</div>
              <div className="text-muted fs-11px text-truncate" style={{ maxWidth: "200px" }}>
                {row.description || row.id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "150px",
      cell: (row) => {
        const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === row.category) || {};
        return (
          <span
            className="ur-category-badge"
            style={{
              backgroundColor: catInfo.bg || "#fff1f2",
              color: catInfo.color || "#ef4444",
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
          {row.account.includes("HDFC") || row.account.includes("ICICI") ? (
            <BsBank2 className="text-primary me-1" size={12} />
          ) : row.account.includes("GPay") ? (
            <SiGooglepay className="text-info me-1" size={13} />
          ) : row.account.includes("PhonePe") ? (
            <SiPhonepe className="text-primary me-1" size={13} />
          ) : (
            <IoWalletOutline className="text-secondary me-1" size={13} />
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
      width: "110px",
      cell: (row) => (
        <span
          className={`ur-status-pill ${
            row.status === "Paid" ? "success" : "warning"
          }`}
        >
          {row.status === "Paid" ? (
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
          <div className="fw-800 text-danger fs-13px">
            -₹{Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          {row.receipt && (
            <span className="text-muted fs-10px d-flex align-items-center justify-content-end gap-1">
              <FiPaperclip size={9} /> Receipt
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
            <span>Expenses Management</span>
            <Badge bg="danger-subtle" className="text-danger fs-11px fw-700 py-1 px-2 rounded-6px">
              Outflow Control
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Monitor daily spendings, merchant transactions, category budgets, and recurring bills.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button className="ms-btn-expense" onClick={handleOpenAdd}>
            <FiPlus size={14} />
            <span>Add New Expense</span>
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
                  <div className="ms-stat-title">Total Outflow (Month)</div>
                  <div className="ms-stat-val text-danger">
                    ₹{metrics.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiArrowDownLeft size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill negative">
                  <FiTrendingDown size={11} /> -3.8%
                </span>
                <span className="ms-stat-sub-text">lower than budget pace</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Budget Utilization</div>
                  <div className="ms-stat-val">
                    {metrics.budgetPct}% <span className="fs-12px text-muted fw-500">of ₹{monthlyBudgetLimit.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fef3c7" }}>
                  <FiAlertTriangle size={19} color="#d97706" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle">
                <ProgressBar
                  now={metrics.budgetPct}
                  className={metrics.budgetPct > 80 ? "ms-progress-red" : "ms-progress-blue"}
                  style={{ height: "6px" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Daily Average Spend</div>
                  <div className="ms-stat-val">
                    ₹{metrics.dailyAvg.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiActivity size={19} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">₹1,800 Target</span>
                <span className="ms-stat-sub-text">Under target by ₹190</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Largest Cost Category</div>
                  <div className="ms-stat-val fs-18px text-truncate" style={{ maxWidth: "160px" }}>
                    {metrics.topCat}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiHome size={19} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">
                  ₹{metrics.maxVal.toLocaleString("en-IN")}
                </span>
                <span className="ms-stat-sub-text">Housing &amp; Leases</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          3. VISUAL CHARTS ROW
          =================================================================== */}
      <Row className="g-3 mb-3">
        {/* Spending Outflow Bar Chart */}
        <Col xs={12} lg={7}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="ms-card-title mb-0">Weekly Outflow vs Target Limit</h5>
                  <p className="text-muted fs-11px mb-0">Expense pacing across August 2026</p>
                </div>
                <div className="d-flex align-items-center gap-3 fs-11px">
                  <span className="d-flex align-items-center gap-1">
                    <span className="ms-legend-square" style={{ backgroundColor: "#ef4444" }}></span>
                    <span className="fw-600 text-dark">Actual Spent</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span className="ms-legend-square" style={{ backgroundColor: "#cbd5e1" }}></span>
                    <span className="fw-600 text-dark">Target Limit</span>
                  </span>
                </div>
              </div>

              <div className="ms-chart-wrap pt-1">
                <Chart options={spendingTrendOptions} series={spendingTrendSeries} type="bar" height={220} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Expense Distribution Donut */}
        <Col xs={12} lg={5}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-0">Spending Distribution</h5>
                <p className="text-muted fs-11px mb-0">Category wise consumption</p>
              </div>

              <div className="d-flex align-items-center justify-content-around flex-wrap gap-2 my-auto py-2">
                <div style={{ width: "180px", height: "200px" }}>
                  <Chart options={donutOptions} series={donutSeries} type="donut" height={200} />
                </div>

                <div className="ms-donut-legend ps-2" style={{ minWidth: "150px" }}>
                  {[
                    { name: "Housing", pct: "36%", clr: "#4f46e5" },
                    { name: "Food & Dining", pct: "20%", clr: "#8b5cf6" },
                    { name: "Transport", pct: "16%", clr: "#f59e0b" },
                    { name: "Shopping", pct: "15%", clr: "#ec4899" },
                    { name: "Health & Other", pct: "13%", clr: "#10b981" },
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
        title="All Expense Logs"
        subtitle={`Showing ${tableData.length} verified expense transactions`}
        searchPlaceholder="Search by merchant, note, or reference..."
        selectableRows={true}
        initialSortField="date"
        initialSortOrder="desc"
        defaultPageSize={10}
        onBulkDelete={handleBulkDelete}
        exportFileName="Expense_Statements"
        filters={
          <div className="ur-inline-filters">
            {/* Category Filter */}
            <Select
              value={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === selectedCategory)}
              onChange={(opt) => setSelectedCategory(opt ? opt.value : "all")}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              styles={filterSelectStyles}
              isSearchable={false}
            />

            {/* Status Filter */}
            <Select
              value={[
                { value: "all", label: "All Statuses" },
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" },
              ].find((s) => s.value === selectedStatus)}
              onChange={(opt) => setSelectedStatus(opt ? opt.value : "all")}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" },
              ]}
              styles={filterSelectStyles}
              isSearchable={false}
            />
          </div>
        }
      />

      {/* ===================================================================
          MODAL: ADD NEW EXPENSE
          =================================================================== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon expense">
                <FiPlus size={16} />
              </span>
              Record New Expense
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Enter merchant and transaction details to record your outgoing payment.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Merchant / Payee Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Swiggy Instamart / Amazon"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Select
                    value={EXPENSE_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={EXPENSE_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
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
                    placeholder="e.g. 2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="ur-form-input fw-700 text-danger"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Payment Method / Account *</Form.Label>
                  <Select
                    value={[
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay • landlord@okhdfc", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card •••• 8820" },
                      { value: "Auto-Debit • HDFC", label: "Auto-Debit • HDFC" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "Cash in Hand", label: "Cash in Hand" },
                    ].find((a) => a.value === formData.account)}
                    onChange={(opt) => setFormData({ ...formData, account: opt.value })}
                    options={[
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay • landlord@okhdfc", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card •••• 8820" },
                      { value: "Auto-Debit • HDFC", label: "Auto-Debit • HDFC" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "Cash in Hand", label: "Cash in Hand" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
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
                  <Select
                    value={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                    ].find((s) => s.value === formData.status)}
                    onChange={(opt) => setFormData({ ...formData, status: opt.value })}
                    options={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Description / Note</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Monthly grocery supplies and milk"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              {/* Bill / Receipt Image Upload Dropzone */}
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label d-flex align-items-center justify-content-between">
                    <span>Attach Bill / Cash Receipt Image</span>
                    {formData.receiptImg && (
                      <span className="text-success fs-11px fw-600">✓ Bill Image Attached</span>
                    )}
                  </Form.Label>

                  {!formData.receiptImg ? (
                    <div className="ur-receipt-upload-box">
                      <input
                        type="file"
                        id="expense-receipt-file-add"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptFileChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="expense-receipt-file-add" className="w-100 cursor-pointer mb-0">
                        <FiPaperclip size={20} className="text-danger mb-1" />
                        <div className="fw-700 text-dark fs-12px">Click to Upload Bill / Receipt Image</div>
                        <span className="text-muted fs-11px">Supports PNG, JPG, JPEG, PDF receipt</span>
                      </label>
                    </div>
                  ) : (
                    <div className="ur-receipt-preview-card">
                      <img src={formData.receiptImg} alt="Receipt preview" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                          {formData.receiptName || "Uploaded_Bill_Image.png"}
                        </div>
                        <span className="text-success fs-10.5px fw-600">Bill receipt attached</span>
                      </div>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger p-1 border rounded-6px"
                        onClick={() => setFormData({ ...formData, receiptImg: null, receiptName: "" })}
                        title="Remove Image"
                      >
                        <FiX size={14} />
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="ms-btn-expense px-4">
              <FiPlus size={14} /> Save Expense
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: EDIT EXPENSE
          =================================================================== */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon edit">
                <FiEdit2 size={15} />
              </span>
              Edit Expense ({activeExpense?.id})
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Modify information for this expense log.</p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Merchant / Payee Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Select
                    value={EXPENSE_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={EXPENSE_CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
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
                    className="ur-form-input fw-700 text-danger"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Payment Method / Account</Form.Label>
                  <Select
                    value={[
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay • landlord@okhdfc", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card •••• 8820" },
                      { value: "Auto-Debit • HDFC", label: "Auto-Debit • HDFC" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "Cash in Hand", label: "Cash in Hand" },
                    ].find((a) => a.value === formData.account)}
                    onChange={(opt) => setFormData({ ...formData, account: opt.value })}
                    options={[
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay • landlord@okhdfc", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card •••• 8820" },
                      { value: "Auto-Debit • HDFC", label: "Auto-Debit • HDFC" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "Cash in Hand", label: "Cash in Hand" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
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
                  <Select
                    value={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                    ].find((s) => s.value === formData.status)}
                    onChange={(opt) => setFormData({ ...formData, status: opt.value })}
                    options={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
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

              {/* Bill / Receipt Image Upload Dropzone */}
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label d-flex align-items-center justify-content-between">
                    <span>Attached Bill / Cash Receipt Image</span>
                    {formData.receiptImg && (
                      <span className="text-success fs-11px fw-600">✓ Bill Image Attached</span>
                    )}
                  </Form.Label>

                  {!formData.receiptImg ? (
                    <div className="ur-receipt-upload-box">
                      <input
                        type="file"
                        id="expense-receipt-file-edit"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptFileChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="expense-receipt-file-edit" className="w-100 cursor-pointer mb-0">
                        <FiPaperclip size={20} className="text-danger mb-1" />
                        <div className="fw-700 text-dark fs-12px">Click to Upload Bill / Receipt Image</div>
                        <span className="text-muted fs-11px">Supports PNG, JPG, JPEG, PDF receipt</span>
                      </label>
                    </div>
                  ) : (
                    <div className="ur-receipt-preview-card">
                      <img src={formData.receiptImg} alt="Receipt preview" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                          {formData.receiptName || "Uploaded_Bill_Image.png"}
                        </div>
                        <span className="text-success fs-10.5px fw-600">Bill receipt attached</span>
                      </div>
                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger p-1 border rounded-6px"
                        onClick={() => setFormData({ ...formData, receiptImg: null, receiptName: "" })}
                        title="Remove Image"
                      >
                        <FiX size={14} />
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="rounded-6px px-4">
              Update Expense
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
          <h5 className="fw-700 text-dark mb-1">Delete Expense Record?</h5>
          <p className="text-muted fs-12px mb-3">
            Are you sure you want to delete <strong>{activeExpense?.merchant}</strong> (-₹{activeExpense?.amount?.toLocaleString("en-IN")})? This action cannot be undone.
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
          MODAL: VIEW DETAILS WITH RECEIPT PREVIEW
          =================================================================== */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <FiEye className="text-danger" /> Expense Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {activeExpense && (
            <div>
              {/* Highlight Card */}
              <div className="ur-details-highlight-card expense p-3 rounded-10px mb-3 text-center">
                <span className="text-muted fs-11px">TOTAL AMOUNT DEBITED</span>
                <div className="fw-800 text-danger fs-24px my-1">
                  -₹{Number(activeExpense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <Badge bg="danger-subtle" className="text-danger fs-11px px-2 py-1 rounded-6px">
                  Status: {activeExpense.status}
                </Badge>
              </div>

              {/* Information Grid */}
              <div className="d-flex flex-column gap-2 fs-12px">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Transaction ID:</span>
                  <span className="fw-700 text-dark">{activeExpense.id}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Merchant / Payee:</span>
                  <span className="fw-600 text-dark">{activeExpense.merchant}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Category:</span>
                  <span className="fw-600 text-danger">{activeExpense.category}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Payment Account:</span>
                  <span className="fw-600 text-dark">{activeExpense.account}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Date &amp; Timestamp:</span>
                  <span className="fw-600 text-dark">
                    {activeExpense.date} at {activeExpense.time}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Description / Notes:</span>
                  <span className="fw-500 text-dark text-end" style={{ maxWidth: "240px" }}>
                    {activeExpense.notes || activeExpense.description || "None"}
                  </span>
                </div>

                {/* Attached Bill / Receipt Preview */}
                <div className="py-2">
                  <span className="text-muted d-block mb-1">Attached Bill / Receipt:</span>
                  {activeExpense.receiptImg ? (
                    <div className="d-flex align-items-center gap-2 p-2 border rounded-8px bg-light">
                      <img src={activeExpense.receiptImg} alt="Receipt" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px">{activeExpense.receiptName || "Expense_Bill_Receipt.png"}</div>
                        <span className="text-success fs-10.5px fw-600">Attached bill document</span>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="fs-11px py-1 px-2"
                        onClick={() => {
                          setPreviewReceiptImg(activeExpense.receiptImg);
                          setShowReceiptModal(true);
                        }}
                      >
                        View Full
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2 border rounded-8px bg-light text-muted fs-11.5px">
                      🧾 No bill image attached
                    </div>
                  )}
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

      {/* ===================================================================
          MODAL: FULL RECEIPT / BILL IMAGE PREVIEW
          =================================================================== */}
      <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark">
            Bill / Receipt Image Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-3">
          {previewReceiptImg && (
            <img
              src={previewReceiptImg}
              alt="Receipt Full Preview"
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

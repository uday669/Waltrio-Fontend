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
import { filterSelectStyles, formSelectStyles } from "../../utils/selectStyles";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRepeat,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiHome,
  FiCoffee,
  FiZap,
  FiBriefcase,
  FiDollarSign,
  FiPaperclip,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for All Transactions
const INITIAL_TRANSACTIONS = [
  {
    id: "TX-9025",
    title: "TechCorp India Payroll",
    description: "August monthly base salary + performance incentive",
    type: "income",
    category: "Salary",
    account: "HDFC Bank •••• 4091",
    date: "2026-08-20",
    time: "10:00 AM",
    amount: 65000,
    status: "Completed",
    referenceNo: "NEFT-HDFC-99120412",
  },
  {
    id: "TX-9024",
    title: "DLF Phase 2 Apartment Rent",
    description: "August monthly lease payment to landlord",
    type: "expense",
    category: "Housing",
    account: "GPay • landlord@okhdfc",
    date: "2026-08-18",
    time: "02:30 PM",
    amount: 10000,
    status: "Completed",
    referenceNo: "GPAY-8820-991",
  },
  {
    id: "TX-9023",
    title: "Apex SaaS Freelance UI Design",
    description: "Milestone 2 delivery acceptance",
    type: "income",
    category: "Freelance",
    account: "ICICI Bank •••• 9821",
    date: "2026-08-18",
    time: "03:45 PM",
    amount: 28000,
    status: "Completed",
    referenceNo: "UPI-ICICI-882190",
  },
  {
    id: "TX-9022",
    title: "Swiggy Instamart & Blinkit",
    description: "Bi-weekly household groceries",
    type: "expense",
    category: "Food & Dining",
    account: "PhonePe UPI",
    date: "2026-08-17",
    time: "08:15 PM",
    amount: 2500,
    status: "Completed",
    referenceNo: "UPI-SWIGGY-772",
  },
  {
    id: "TX-9021",
    title: "Amazon Online Store",
    description: "Ergonomic monitor arm and keyboard",
    type: "expense",
    category: "Shopping",
    account: "Visa •••• 8820",
    date: "2026-08-16",
    time: "04:45 PM",
    amount: 3200,
    status: "Completed",
    referenceNo: "AMZ-99182-01",
  },
  {
    id: "TX-9020",
    title: "Apartment 4B Rental Yield",
    description: "Monthly tenant rent credit",
    type: "income",
    category: "Rental",
    account: "HDFC Bank •••• 4091",
    date: "2026-08-15",
    time: "11:30 AM",
    amount: 18000,
    status: "Completed",
    referenceNo: "GPAY-90218-441",
  },
  {
    id: "TX-9019",
    title: "Torrent Power Electricity",
    description: "Consumer #89210 • Power bill July usage",
    type: "expense",
    category: "Utilities",
    account: "Auto-Debit • HDFC",
    date: "2026-08-15",
    time: "11:20 AM",
    amount: 1800,
    status: "Completed",
    referenceNo: "EBILL-TORRENT-88",
  },
  {
    id: "TX-9018",
    title: "Indian Oil Petrol Pump",
    description: "Full fuel tank refill for car",
    type: "expense",
    category: "Transportation",
    account: "ICICI Bank •••• 9821",
    date: "2026-08-14",
    time: "09:30 AM",
    amount: 3500,
    status: "Completed",
    referenceNo: "POS-IOCL-9912",
  },
  {
    id: "TX-9017",
    title: "TCS & Infosys Dividends",
    description: "Quarterly equity stock dividend payout",
    type: "income",
    category: "Dividends",
    account: "Zerodha Trading A/C",
    date: "2026-08-12",
    time: "09:15 AM",
    amount: 4500,
    status: "Completed",
    referenceNo: "DIV-NSE-881920",
  },
  {
    id: "TX-9016",
    title: "Upcoming Retainer Payout",
    description: "Monthly maintenance retainer for cloud infra",
    type: "income",
    category: "Consulting",
    account: "HDFC Bank •••• 4091",
    date: "2026-08-28",
    time: "11:00 AM",
    amount: 22000,
    status: "Pending",
    referenceNo: "INV-RET-2026",
  },
  {
    id: "TX-9015",
    title: "Airtel Fiber Broadband Bill",
    description: "300 Mbps Unlimited Fiber Internet Bill",
    type: "expense",
    category: "Utilities",
    account: "PhonePe UPI",
    date: "2026-08-25",
    time: "12:00 PM",
    amount: 1180,
    status: "Pending",
    referenceNo: "AIRTEL-BB-991",
  },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTx, setActiveTx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "expense",
    category: "Food & Dining",
    account: "PhonePe UPI",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    time: "12:00 PM",
    status: "Completed",
    referenceNo: "",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") income += amt;
      else expense += amt;
    });

    const net = income - expense;
    return { income, expense, net, count: transactions.length };
  }, [transactions]);

  // Filtered dataset
  const tableData = useMemo(() => {
    return transactions.filter((tx) => {
      const matchType = selectedType === "all" || tx.type === selectedType;
      const matchCat = selectedCategory === "all" || tx.category === selectedCategory;
      return matchType && matchCat;
    });
  }, [transactions, selectedType, selectedCategory]);

  // Chart Data: Cash Flow Timeline
  const chartOptions = {
    chart: { type: "bar", height: 230, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, columnWidth: "42%", borderRadius: 4 } },
    colors: ["#10b981", "#ef4444"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Aug 1–7", "Aug 8–14", "Aug 15–21", "Aug 22–28", "Aug 29–31"],
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
    { name: "Inflow", data: [25000, 32000, 83000, 22000, 15000] },
    { name: "Outflow", data: [6800, 8400, 9200, 5100, 3200] },
  ];

  // Open Add
  const handleOpenAdd = () => {
    setFormData({
      title: "",
      description: "",
      type: "expense",
      category: "Food & Dining",
      account: "PhonePe UPI",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00 PM",
      status: "Completed",
      referenceNo: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setShowAddModal(true);
  };

  // Submit Add
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newEntry = {
      id: `TX-${Math.floor(9030 + Math.random() * 900)}`,
      ...formData,
      amount: Number(formData.amount),
    };
    setTransactions([newEntry, ...transactions]);
    setShowAddModal(false);
  };

  // Open Edit
  const handleOpenEdit = (tx) => {
    setActiveTx(tx);
    setFormData({
      title: tx.title,
      description: tx.description,
      type: tx.type,
      category: tx.category,
      account: tx.account,
      amount: tx.amount,
      date: tx.date,
      time: tx.time,
      status: tx.status,
      referenceNo: tx.referenceNo || "",
    });
    setShowEditModal(true);
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeTx) return;

    setTransactions(
      transactions.map((tx) =>
        tx.id === activeTx.id ? { ...tx, ...formData, amount: Number(formData.amount) } : tx
      )
    );
    setShowEditModal(false);
  };

  // Delete Handlers
  const handleOpenDelete = (tx) => {
    setActiveTx(tx);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!activeTx) return;
    setTransactions(transactions.filter((tx) => tx.id !== activeTx.id));
    setShowDeleteModal(false);
  };

  const handleBulkDelete = (ids) => {
    const idSet = new Set(ids);
    setTransactions(transactions.filter((tx) => !idSet.has(tx.id)));
  };

  const handleOpenDetails = (tx) => {
    setActiveTx(tx);
    setShowDetailsModal(true);
  };

  // Columns definition for CommonDataTable
  const columns = [
    {
      name: "Transaction Ref & Name",
      selector: (row) => row.title,
      sortable: true,
      minWidth: "260px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div
            className={`ur-tx-avatar ${row.type === "income" ? "income" : "expense"}`}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: row.type === "income" ? "#ecfdf5" : "#fff1f2",
              color: row.type === "income" ? "#10b981" : "#ef4444",
            }}
          >
            {row.type === "income" ? <FiArrowUpRight size={16} /> : <FiArrowDownLeft size={16} />}
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.title}</div>
            <div className="text-muted fs-11px text-truncate" style={{ maxWidth: "200px" }}>
              {row.description || row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "110px",
      cell: (row) => (
        <Badge
          bg={row.type === "income" ? "success-subtle" : "danger-subtle"}
          className={`text-uppercase fs-10.5px fw-700 py-1 px-2 rounded-6px ${
            row.type === "income" ? "text-success" : "text-danger"
          }`}
        >
          {row.type}
        </Badge>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <span className="ur-category-badge" style={{ backgroundColor: "#f1f5f9", color: "#334155" }}>
          {row.category}
        </span>
      ),
    },
    {
      name: "Account / Mode",
      selector: (row) => row.account,
      sortable: true,
      minWidth: "160px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-1 fs-12px text-dark fw-500">
          {row.account.includes("HDFC") || row.account.includes("ICICI") ? (
            <BsBank2 className="text-primary me-1" size={12} />
          ) : row.account.includes("GPay") ? (
            <SiGooglepay className="text-info me-1" size={13} />
          ) : row.account.includes("PhonePe") ? (
            <SiPhonepe className="text-primary me-1" size={13} />
          ) : (
            <IoWalletOutline className="text-secondary me-1" size={13} />
          )}
          {row.account}
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
        <span className={`ur-status-pill ${row.status === "Completed" ? "success" : "warning"}`}>
          {row.status === "Completed" ? <FiCheckCircle size={10} className="me-1" /> : <FiClock size={10} className="me-1" />}
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
        <div className={`text-end fw-800 fs-13px ${row.type === "income" ? "text-success" : "text-danger"}`}>
          {row.type === "income" ? "+" : "-"}₹
          {Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "110px",
      right: true,
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-end gap-1">
          <Button variant="light" size="sm" className="ur-action-btn view" onClick={() => handleOpenDetails(row)} title="Details">
            <FiEye size={13} />
          </Button>
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
            <span>Transaction Ledger</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              {transactions.length} Total
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Real-time unified audit statement of all cash inflows, outflows, and banking movements.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2" onClick={handleOpenAdd}>
            <FiPlus size={15} />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Net Cash Flow</div>
                  <div className={`ms-stat-val ${metrics.net >= 0 ? "text-primary" : "text-danger"}`}>
                    ₹{metrics.net.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiDollarSign size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill positive">
                  <FiTrendingUp size={11} /> Positive Flow
                </span>
                <span className="ms-stat-sub-text">Inflow vs Outflow</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Inflows</div>
                  <div className="ms-stat-val text-success">
                    ₹{metrics.income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiArrowUpRight size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">+12.4%</span>
                <span className="ms-stat-sub-text">Credited</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Outflows</div>
                  <div className="ms-stat-val text-danger">
                    ₹{metrics.expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiArrowDownLeft size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">-4.2%</span>
                <span className="ms-stat-sub-text">Debited</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Transactions Count</div>
                  <div className="ms-stat-val">{metrics.count} Verified</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiRepeat size={20} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">100% Reconciled</span>
                <span className="ms-stat-sub-text">All accounts</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Cash Flow Chart */}
      <Card className="ms-premium-card border-0 mb-3">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h5 className="ms-card-title mb-0">Inflows vs Outflows Pacing</h5>
              <p className="text-muted fs-11px mb-0">Bi-weekly liquidity breakdown</p>
            </div>
            <div className="d-flex align-items-center gap-3 fs-11px">
              <span className="d-flex align-items-center gap-1">
                <span className="ms-legend-square" style={{ backgroundColor: "#10b981" }}></span>
                <span className="fw-600 text-dark">Inflow: ₹{metrics.income.toLocaleString("en-IN")}</span>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span className="ms-legend-square" style={{ backgroundColor: "#ef4444" }}></span>
                <span className="fw-600 text-dark">Outflow: ₹{metrics.expense.toLocaleString("en-IN")}</span>
              </span>
            </div>
          </div>
          <Chart options={chartOptions} series={chartSeries} type="bar" height={230} />
        </Card.Body>
      </Card>

      {/* 4. Single-Tag Master Reusable CommonDataTable with strict 1-line toolbar */}
      <CommonDataTable
        columns={columns}
        data={tableData}
        keyField="id"
        title="Transactions Ledger"
        subtitle={`Showing ${tableData.length} records`}
        searchPlaceholder="Search by merchant, payer, ref..."
        selectableRows={true}
        initialSortField="date"
        initialSortOrder="desc"
        defaultPageSize={10}
        onBulkDelete={handleBulkDelete}
        exportFileName="Transactions_Audit"
        filters={
          <div className="ur-inline-filters">
            {/* Type Filter */}
            <Select
              value={[
                { value: "all", label: "All Types" },
                { value: "income", label: "Income (+)" },
                { value: "expense", label: "Expense (-)" },
              ].find((t) => t.value === selectedType)}
              onChange={(opt) => setSelectedType(opt ? opt.value : "all")}
              options={[
                { value: "all", label: "All Types" },
                { value: "income", label: "Income (+)" },
                { value: "expense", label: "Expense (-)" },
              ]}
              styles={filterSelectStyles}
              isSearchable={false}
            />

            {/* Category Filter */}
            <Select
              value={[
                { value: "all", label: "All Categories" },
                { value: "Salary", label: "Salary" },
                { value: "Freelance", label: "Freelance" },
                { value: "Rental", label: "Rental" },
                { value: "Housing", label: "Housing" },
                { value: "Food & Dining", label: "Food & Dining" },
                { value: "Shopping", label: "Shopping" },
                { value: "Utilities", label: "Utilities" },
                { value: "Transportation", label: "Transportation" },
              ].find((c) => c.value === selectedCategory)}
              onChange={(opt) => setSelectedCategory(opt ? opt.value : "all")}
              options={[
                { value: "all", label: "All Categories" },
                { value: "Salary", label: "Salary" },
                { value: "Freelance", label: "Freelance" },
                { value: "Rental", label: "Rental" },
                { value: "Housing", label: "Housing" },
                { value: "Food & Dining", label: "Food & Dining" },
                { value: "Shopping", label: "Shopping" },
                { value: "Utilities", label: "Utilities" },
                { value: "Transportation", label: "Transportation" },
              ]}
              styles={filterSelectStyles}
              isSearchable={false}
            />
          </div>
        }
      />

      {/* 5. Modals: Add / Edit / Delete / Details */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <span className="ur-modal-icon edit"><FiPlus size={16} /></span>
            Record New Transaction
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Transaction Type *</Form.Label>
                  <Select
                    value={[
                      { value: "income", label: "Income (Cash Inflow +)" },
                      { value: "expense", label: "Expense (Cash Outflow -)" },
                    ].find((t) => t.value === formData.type)}
                    onChange={(opt) => setFormData({ ...formData, type: opt.value })}
                    options={[
                      { value: "income", label: "Income (Cash Inflow +)" },
                      { value: "expense", label: "Expense (Cash Outflow -)" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Title / Payee / Source *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Swiggy or TechCorp"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="ur-form-input"
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
                    className={`ur-form-input fw-700 ${formData.type === "income" ? "text-success" : "text-danger"}`}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category</Form.Label>
                  <Select
                    value={[
                      { value: "Salary", label: "Salary" },
                      { value: "Freelance", label: "Freelance" },
                      { value: "Food & Dining", label: "Food & Dining" },
                      { value: "Housing", label: "Housing" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Shopping", label: "Shopping" },
                      { value: "Transportation", label: "Transportation" },
                    ].find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={[
                      { value: "Salary", label: "Salary" },
                      { value: "Freelance", label: "Freelance" },
                      { value: "Food & Dining", label: "Food & Dining" },
                      { value: "Housing", label: "Housing" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Shopping", label: "Shopping" },
                      { value: "Transportation", label: "Transportation" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Account / Method</Form.Label>
                  <Select
                    value={[
                      { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay UPI", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card" },
                    ].find((a) => a.value === formData.account)}
                    onChange={(opt) => setFormData({ ...formData, account: opt.value })}
                    options={[
                      { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay UPI", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card" },
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
                  <Form.Label className="ur-form-label">Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Status</Form.Label>
                  <Select
                    value={[
                      { value: "Completed", label: "Completed" },
                      { value: "Pending", label: "Pending" },
                    ].find((s) => s.value === formData.status)}
                    onChange={(opt) => setFormData({ ...formData, status: opt.value })}
                    options={[
                      { value: "Completed", label: "Completed" },
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
                    placeholder="Short description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Save Transaction
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark">Edit Transaction ({activeTx?.id})</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Title / Payee *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="ur-form-input"
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
                    className={`ur-form-input fw-700 ${formData.type === "income" ? "text-success" : "text-danger"}`}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category</Form.Label>
                  <Select
                    value={[
                      { value: "Salary", label: "Salary" },
                      { value: "Freelance", label: "Freelance" },
                      { value: "Food & Dining", label: "Food & Dining" },
                      { value: "Housing", label: "Housing" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Shopping", label: "Shopping" },
                    ].find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={[
                      { value: "Salary", label: "Salary" },
                      { value: "Freelance", label: "Freelance" },
                      { value: "Food & Dining", label: "Food & Dining" },
                      { value: "Housing", label: "Housing" },
                      { value: "Utilities", label: "Utilities" },
                      { value: "Shopping", label: "Shopping" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Account</Form.Label>
                  <Select
                    value={[
                      { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay UPI", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card" },
                    ].find((a) => a.value === formData.account)}
                    onChange={(opt) => setFormData({ ...formData, account: opt.value })}
                    options={[
                      { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                      { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                      { value: "PhonePe UPI", label: "PhonePe UPI" },
                      { value: "GPay UPI", label: "GPay UPI" },
                      { value: "Visa •••• 8820", label: "Visa Credit Card" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Update Transaction
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm" className="ur-modal">
        <Modal.Body className="text-center p-4">
          <div className="ur-delete-icon-box mx-auto mb-3">
            <FiTrash2 size={24} color="#ef4444" />
          </div>
          <h5 className="fw-700 text-dark mb-1">Delete Transaction?</h5>
          <p className="text-muted fs-12px mb-3">
            Are you sure you want to delete <strong>{activeTx?.title}</strong>?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="light" size="sm" onClick={() => setShowDeleteModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} className="rounded-6px px-3">
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="md" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <FiEye className="text-primary" /> Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {activeTx && (
            <div>
              <div className={`ur-details-highlight-card ${activeTx.type === "expense" ? "expense" : ""} p-3 rounded-10px mb-3 text-center`}>
                <span className="text-muted fs-11px">TRANSACTION AMOUNT</span>
                <div className={`fw-800 fs-24px my-1 ${activeTx.type === "income" ? "text-success" : "text-danger"}`}>
                  {activeTx.type === "income" ? "+" : "-"}₹{Number(activeTx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <Badge bg={activeTx.type === "income" ? "success-subtle" : "danger-subtle"} className={`fs-11px px-2 py-1 rounded-6px ${activeTx.type === "income" ? "text-success" : "text-danger"}`}>
                  Type: {activeTx.type.toUpperCase()} • Status: {activeTx.status}
                </Badge>
              </div>

              <div className="d-flex flex-column gap-2 fs-12px">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Transaction Ref:</span>
                  <span className="fw-700 text-dark">{activeTx.id}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Title:</span>
                  <span className="fw-600 text-dark">{activeTx.title}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Category:</span>
                  <span className="fw-600 text-primary">{activeTx.category}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Account:</span>
                  <span className="fw-600 text-dark">{activeTx.account}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Date &amp; Time:</span>
                  <span className="fw-600 text-dark">{activeTx.date} at {activeTx.time}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Reference / UTR:</span>
                  <span className="fw-600 text-muted font-monospace">{activeTx.referenceNo || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span className="text-muted">Description:</span>
                  <span className="fw-500 text-dark text-end">{activeTx.description || "None"}</span>
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

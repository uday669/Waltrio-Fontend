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
  FiCreditCard,
  FiPlus,
  FiHome,
  FiTrendingDown,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiPercent,
  FiPieChart,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import Select from "react-select";
import { formSelectStyles } from "../../utils/selectStyles";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for Loans & EMIs
const INITIAL_LOANS = [
  {
    id: "LOAN-101",
    name: "DLF Home Loan",
    bank: "HDFC Bank",
    type: "Home Loan",
    totalPrincipal: 2500000,
    paidPrincipal: 950000,
    monthlyEmi: 24500,
    interestRate: 8.4,
    totalMonths: 180,
    paidMonths: 48,
    nextDueDate: "2026-09-05",
    autoDebitAccount: "HDFC •••• 4091",
    status: "Active",
  },
  {
    id: "LOAN-102",
    name: "Hyundai Creta Auto Loan",
    bank: "ICICI Bank",
    type: "Car Loan",
    totalPrincipal: 850000,
    paidPrincipal: 510000,
    monthlyEmi: 14200,
    interestRate: 8.9,
    totalMonths: 60,
    paidMonths: 36,
    nextDueDate: "2026-09-10",
    autoDebitAccount: "ICICI •••• 9821",
    status: "Active",
  },
  {
    id: "LOAN-103",
    name: "MacBook Pro M3 Max",
    bank: "HDFC Credit Card",
    type: "No-Cost EMI",
    totalPrincipal: 120000,
    paidPrincipal: 80000,
    monthlyEmi: 10000,
    interestRate: 0.0,
    totalMonths: 12,
    paidMonths: 8,
    nextDueDate: "2026-09-15",
    autoDebitAccount: "Visa •••• 8820",
    status: "Active",
  },
];

// Initial Payment History Table Data
const INITIAL_PAYMENTS = [
  { id: "EMI-901", loanName: "DLF Home Loan", lender: "HDFC Bank", dueDate: "2026-08-05", amount: 24500, principal: 16800, interest: 7700, status: "Paid", mode: "Auto-Debit" },
  { id: "EMI-902", loanName: "Hyundai Creta Auto Loan", lender: "ICICI Bank", dueDate: "2026-08-10", amount: 14200, principal: 11200, interest: 3000, status: "Paid", mode: "Auto-Debit" },
  { id: "EMI-903", loanName: "MacBook Pro M3 Max", lender: "HDFC Credit Card", dueDate: "2026-08-15", amount: 10000, principal: 10000, interest: 0, status: "Paid", mode: "Card Statement" },
  { id: "EMI-904", loanName: "DLF Home Loan", lender: "HDFC Bank", dueDate: "2026-09-05", amount: 24500, principal: 17000, interest: 7500, status: "Upcoming", mode: "Auto-Debit" },
  { id: "EMI-905", loanName: "Hyundai Creta Auto Loan", lender: "ICICI Bank", dueDate: "2026-09-10", amount: 14200, principal: 11400, interest: 2800, status: "Upcoming", mode: "Auto-Debit" },
  { id: "EMI-906", loanName: "MacBook Pro M3 Max", lender: "HDFC Credit Card", dueDate: "2026-09-15", amount: 10000, principal: 10000, interest: 0, status: "Upcoming", mode: "Card Statement" },
];

export default function EmiLoans() {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  // Modal State
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [loanFormData, setLoanFormData] = useState({
    name: "",
    bank: "HDFC Bank",
    type: "Personal Loan",
    totalPrincipal: "",
    interestRate: "9.5",
    totalMonths: "36",
    monthlyEmi: "",
    nextDueDate: new Date().toISOString().slice(0, 10),
    autoDebitAccount: "HDFC Bank •••• 4091",
  });

  // Interactive Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState(500000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenureYears, setCalcTenureYears] = useState(5);

  // Compute Calculator Results
  const calcResults = useMemo(() => {
    const p = Number(calcPrincipal);
    const r = Number(calcRate) / 12 / 100;
    const n = Number(calcTenureYears) * 12;

    if (p <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };

    const emi = r > 0 ? Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : Math.round(p / n);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - p;

    return { emi, totalInterest, totalPayable };
  }, [calcPrincipal, calcRate, calcTenureYears]);

  // Overall Financial Metrics
  const loanMetrics = useMemo(() => {
    let totalDebt = 0;
    let totalPaid = 0;
    let totalMonthlyOutflow = 0;

    loans.forEach((l) => {
      totalDebt += l.totalPrincipal;
      totalPaid += l.paidPrincipal;
      totalMonthlyOutflow += l.monthlyEmi;
    });

    const outstanding = totalDebt - totalPaid;
    return { totalDebt, totalPaid, outstanding, totalMonthlyOutflow, count: loans.length };
  }, [loans]);

  // Handle Save New Loan
  const handleSaveLoan = (e) => {
    e.preventDefault();
    if (!loanFormData.name || !loanFormData.totalPrincipal) return;

    const p = Number(loanFormData.totalPrincipal);
    const n = Number(loanFormData.totalMonths) || 12;
    const r = (Number(loanFormData.interestRate) || 0) / 12 / 100;
    const computedEmi =
      r > 0 ? Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : Math.round(p / n);

    const newLoan = {
      id: `LOAN-${Math.floor(104 + Math.random() * 900)}`,
      name: loanFormData.name,
      bank: loanFormData.bank,
      type: loanFormData.type,
      totalPrincipal: p,
      paidPrincipal: 0,
      monthlyEmi: Number(loanFormData.monthlyEmi) || computedEmi,
      interestRate: Number(loanFormData.interestRate),
      totalMonths: n,
      paidMonths: 0,
      nextDueDate: loanFormData.nextDueDate,
      autoDebitAccount: loanFormData.autoDebitAccount,
      status: "Active",
    };

    setLoans([newLoan, ...loans]);
    setShowAddLoanModal(false);
  };

  // Payment Table Columns
  const paymentColumns = [
    {
      name: "Loan & Lender",
      selector: (row) => row.loanName,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="ur-income-avatar-box" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
            <FiCreditCard size={15} />
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.loanName}</div>
            <div className="text-muted fs-11px">{row.lender} • {row.mode}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
      sortable: true,
      width: "130px",
      cell: (row) => <span className="fw-600 text-dark fs-12px">{row.dueDate}</span>,
    },
    {
      name: "Principal Part",
      selector: (row) => row.principal,
      sortable: true,
      right: true,
      width: "130px",
      cell: (row) => <span className="fw-600 text-dark fs-12px">₹{row.principal.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Interest Part",
      selector: (row) => row.interest,
      sortable: true,
      right: true,
      width: "130px",
      cell: (row) => <span className="fw-600 text-muted fs-12px">₹{row.interest.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className={`ur-status-pill ${row.status === "Paid" ? "success" : "warning"}`}>
          {row.status === "Paid" ? <FiCheckCircle size={10} className="me-1" /> : <FiClock size={10} className="me-1" />}
          {row.status}
        </span>
      ),
    },
    {
      name: "Total EMI Amount",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      width: "150px",
      cell: (row) => (
        <div className="text-end fw-800 text-danger fs-13px">
          ₹{Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
            <span>EMI &amp; Loan Tracker</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              {loans.length} Active Loans
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Monitor active loan obligations, monthly amortization schedules, interest rates, and pre-payment progress.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
            onClick={() => setShowAddLoanModal(true)}
          >
            <FiPlus size={15} />
            <span>+ Add Loan / EMI</span>
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
                  <div className="ms-stat-title">Monthly EMI Commitment</div>
                  <div className="ms-stat-val text-danger">
                    ₹{loanMetrics.totalMonthlyOutflow.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiCreditCard size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">Auto-debited monthly</span>
                <span className="ms-stat-sub-text">Across {loans.length} loans</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Outstanding Debt</div>
                  <div className="ms-stat-val">
                    ₹{loanMetrics.outstanding.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiTrendingDown size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">
                  {Math.round((loanMetrics.paidPrincipal / (loanMetrics.totalDebt || 1)) * 100)}% Repaid
                </span>
                <span className="ms-stat-sub-text">Principal left</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Principal Paid So Far</div>
                  <div className="ms-stat-val text-success">
                    ₹{loanMetrics.totalPaid.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiCheckCircle size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">Building Equity</span>
                <span className="ms-stat-sub-text">Of ₹{loanMetrics.totalDebt.toLocaleString("en-IN")}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Next EMI Due</div>
                  <div className="ms-stat-val fs-18px">05 Sep 2026</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fef3c7" }}>
                  <FiCalendar size={20} color="#d97706" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">₹24,500 Due</span>
                <span className="ms-stat-sub-text">HDFC Home Loan</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Active Loans Card Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="ms-card-title mb-0">Active Loans &amp; EMI Portfolios</h5>
        <span className="text-muted fs-12px">Repayment pacing and progress</span>
      </div>

      <Row className="g-3 mb-4">
        {loans.map((loan) => {
          const percentPaid = Math.min(100, Math.round((loan.paidPrincipal / loan.totalPrincipal) * 100));
          return (
            <Col key={loan.id} xs={12} lg={4}>
              <Card className="ms-premium-card h-100 border-0">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
                        {loan.type}
                      </Badge>
                      <span className="badge bg-success-subtle text-success fs-10.5px fw-700">
                        {loan.interestRate > 0 ? `${loan.interestRate}% p.a.` : "No-Cost EMI (0%)"}
                      </span>
                    </div>

                    <h5 className="fw-700 text-dark fs-15px mb-1">{loan.name}</h5>
                    <div className="text-muted fs-11.5px mb-3">{loan.bank} • {loan.autoDebitAccount}</div>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center fs-11.5px mb-1">
                        <span className="text-muted">Repayment Progress:</span>
                        <span className="fw-700 text-primary">{percentPaid}% ({loan.paidMonths}/{loan.totalMonths} mos)</span>
                      </div>
                      <ProgressBar now={percentPaid} className="ms-progress-blue" style={{ height: "7px" }} />
                    </div>

                    {/* Loan Numbers */}
                    <div className="p-2 px-3 rounded-8px bg-light mb-3 fs-12px">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Monthly EMI:</span>
                        <span className="fw-800 text-danger">₹{loan.monthlyEmi.toLocaleString("en-IN")}/mo</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Total Principal:</span>
                        <span className="fw-700 text-dark">₹{loan.totalPrincipal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Next Due Date:</span>
                        <span className="fw-700 text-dark">{loan.nextDueDate}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline-primary" size="sm" className="w-100 rounded-6px fs-11.5px fw-600">
                    View Amortization Schedule →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 4. Interactive EMI Loan Calculator Widget */}
      <Card className="ms-premium-card border-0 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="ms-card-title mb-0 d-flex align-items-center gap-2">
                <FiDollarSign className="text-primary" /> Interactive EMI Loan Calculator
              </h5>
              <p className="text-muted fs-11px mb-0">Estimate monthly payments and total interest for new loans</p>
            </div>
          </div>

          <Row className="g-4 align-items-center">
            <Col xs={12} md={7}>
              {/* Principal Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="ur-form-label mb-0">Loan Principal Amount:</span>
                  <span className="fw-800 text-primary fs-14px">₹{Number(calcPrincipal).toLocaleString("en-IN")}</span>
                </div>
                <Form.Range
                  min={50000}
                  max={5000000}
                  step={25000}
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(e.target.value)}
                />
              </div>

              {/* Interest Rate Slider */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="ur-form-label mb-0">Annual Interest Rate (%):</span>
                  <span className="fw-800 text-dark fs-14px">{calcRate}%</span>
                </div>
                <Form.Range
                  min={5}
                  max={20}
                  step={0.1}
                  value={calcRate}
                  onChange={(e) => setCalcRate(e.target.value)}
                />
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="ur-form-label mb-0">Loan Tenure:</span>
                  <span className="fw-800 text-dark fs-14px">{calcTenureYears} Years ({calcTenureYears * 12} Months)</span>
                </div>
                <Form.Range
                  min={1}
                  max={30}
                  step={1}
                  value={calcTenureYears}
                  onChange={(e) => setCalcTenureYears(e.target.value)}
                />
              </div>
            </Col>

            {/* Output Calculation Banner */}
            <Col xs={12} md={5}>
              <div className="p-3 rounded-12px border bg-light text-center">
                <span className="text-muted fs-11.5px">ESTIMATED MONTHLY EMI</span>
                <div className="fw-800 text-danger fs-26px my-1">
                  ₹{calcResults.emi.toLocaleString("en-IN")}
                </div>
                <div className="pt-2 border-top mt-2 d-flex justify-content-around text-start fs-12px">
                  <div>
                    <div className="text-muted fs-10.5px">Total Interest</div>
                    <div className="fw-700 text-dark">₹{calcResults.totalInterest.toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <div className="text-muted fs-10.5px">Total Payable</div>
                    <div className="fw-700 text-dark">₹{calcResults.totalPayable.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 5. Payment Schedule Table with Universal CommonDataTable */}
      <CommonDataTable
        columns={paymentColumns}
        data={payments}
        keyField="id"
        title="Upcoming &amp; Past Payment Schedule"
        subtitle={`Showing ${payments.length} scheduled EMI installments`}
        searchPlaceholder="Search loan payment..."
        selectableRows={true}
        defaultPageSize={5}
        exportFileName="EMI_Payment_Schedule"
      />

      {/* ===================================================================
          MODAL: ADD NEW LOAN / EMI
          =================================================================== */}
      <Modal show={showAddLoanModal} onHide={() => setShowAddLoanModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <span className="ur-modal-icon edit"><FiCreditCard size={16} /></span>
            Add Loan / EMI Portfolio
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveLoan}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Loan / Item Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. DLF Home Loan / iPhone 17 EMI"
                    value={loanFormData.name}
                    onChange={(e) => setLoanFormData({ ...loanFormData, name: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Lender Bank *</Form.Label>
                  <Select
                    value={[
                      { value: "HDFC Bank", label: "HDFC Bank" },
                      { value: "ICICI Bank", label: "ICICI Bank" },
                      { value: "SBI Bank", label: "SBI Bank" },
                      { value: "Axis Bank", label: "Axis Bank" },
                      { value: "Bajaj Finserv", label: "Bajaj Finserv" },
                    ].find((b) => b.value === loanFormData.bank)}
                    onChange={(opt) => setLoanFormData({ ...loanFormData, bank: opt.value })}
                    options={[
                      { value: "HDFC Bank", label: "HDFC Bank" },
                      { value: "ICICI Bank", label: "ICICI Bank" },
                      { value: "SBI Bank", label: "SBI Bank" },
                      { value: "Axis Bank", label: "Axis Bank" },
                      { value: "Bajaj Finserv", label: "Bajaj Finserv" },
                    ]}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Total Principal Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 500000"
                    value={loanFormData.totalPrincipal}
                    onChange={(e) => setLoanFormData({ ...loanFormData, totalPrincipal: e.target.value })}
                    className="ur-form-input fw-700 text-dark"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Interest Rate (% p.a.)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.5 (0 for No-Cost EMI)"
                    value={loanFormData.interestRate}
                    onChange={(e) => setLoanFormData({ ...loanFormData, interestRate: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Tenure (Months) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 36"
                    value={loanFormData.totalMonths}
                    onChange={(e) => setLoanFormData({ ...loanFormData, totalMonths: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Next Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={loanFormData.nextDueDate}
                    onChange={(e) => setLoanFormData({ ...loanFormData, nextDueDate: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddLoanModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Save Loan Portfolio
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

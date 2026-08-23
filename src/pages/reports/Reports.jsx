import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Chart from "react-apexcharts";
import {
  FiFileText,
  FiDownload,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCheckCircle,
  FiPieChart,
  FiCalendar,
  FiPrinter,
  FiShare2,
} from "react-icons/fi";
import CommonDataTable from "../../components/common/DataTable";

// Initial Report Ledger Data
const REPORT_RECORDS = [
  { id: "REP-01", month: "August 2026", income: 147500, expense: 42380, savings: 105120, savingsRate: 71, status: "Positive" },
  { id: "REP-02", month: "July 2026", income: 138000, expense: 48900, savings: 89100, savingsRate: 64, status: "Positive" },
  { id: "REP-03", month: "June 2026", income: 125000, expense: 51200, savings: 73800, savingsRate: 59, status: "Positive" },
  { id: "REP-04", month: "May 2026", income: 110000, expense: 45000, savings: 65000, savingsRate: 59, status: "Positive" },
  { id: "REP-05", month: "April 2026", income: 95000, expense: 41000, savings: 54000, savingsRate: 56, status: "Positive" },
];

export default function Reports() {
  const [selectedRange, setSelectedRange] = useState("2026");

  // Chart 1: Cashflow Spline Area
  const cashflowChartOptions = {
    chart: { type: "area", height: 240, toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#10b981", "#ef4444"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    xaxis: {
      categories: ["Apr", "May", "Jun", "Jul", "Aug"],
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
    tooltip: { theme: "light", y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` } },
  };

  const cashflowChartSeries = [
    { name: "Total Income", data: [95000, 110000, 125000, 138000, 147500] },
    { name: "Total Expenses", data: [41000, 45000, 51200, 48900, 42380] },
  ];

  // Chart 2: Category Donut
  const donutOptions = {
    chart: { type: "donut", height: 220, fontFamily: "inherit" },
    labels: ["Housing", "Dining & Food", "Auto & Transport", "Utilities", "Shopping"],
    colors: ["#4f46e5", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"],
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` },
    plotOptions: { pie: { donut: { size: "65%" } } },
    stroke: { width: 2, colors: ["#ffffff"] },
  };

  const donutSeries = [35, 25, 18, 12, 10];

  // Columns for CommonDataTable
  const columns = [
    {
      name: "Financial Period",
      selector: (row) => row.month,
      sortable: true,
      minWidth: "160px",
      cell: (row) => <span className="fw-700 text-dark fs-12.5px">{row.month}</span>,
    },
    {
      name: "Total Income",
      selector: (row) => row.income,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => <span className="fw-700 text-success fs-12.5px">+₹{row.income.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Total Outflow",
      selector: (row) => row.expense,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => <span className="fw-700 text-danger fs-12.5px">-₹{row.expense.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Net Monthly Savings",
      selector: (row) => row.savings,
      sortable: true,
      right: true,
      width: "160px",
      cell: (row) => <span className="fw-800 text-primary fs-12.5px">₹{row.savings.toLocaleString("en-IN")}</span>,
    },
    {
      name: "Savings Rate %",
      selector: (row) => row.savingsRate,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div style={{ width: "100%" }}>
          <div className="d-flex justify-content-between align-items-center fs-10.5px mb-1">
            <span className="fw-700 text-primary">{row.savingsRate}% Saved</span>
          </div>
          <ProgressBar now={row.savingsRate} className="ms-progress-blue" style={{ height: "5px" }} />
        </div>
      ),
    },
    {
      name: "Health Status",
      selector: (row) => row.status,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className="ur-status-pill success">
          <FiCheckCircle size={10} className="me-1" /> Healthy
        </span>
      ),
    },
  ];

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Financial Statements &amp; Reports</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              FY 2026-27
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Generate audit-ready income &amp; expense analytics, savings rates, and tax deduction statements.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-primary" size="sm" className="rounded-8px d-flex align-items-center gap-1 fs-12px fw-600 px-3 py-2">
            <FiDownload size={14} /> <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" className="rounded-8px d-flex align-items-center gap-1 fs-12px fw-600 px-3 py-2">
            <FiPrinter size={14} /> <span>Print PDF Report</span>
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
                  <div className="ms-stat-title">Annual Net Savings</div>
                  <div className="ms-stat-val text-primary">₹3,87,020</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiDollarSign size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">+24.5% YoY</span>
                <span className="ms-stat-sub-text">Accumulated</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Avg Monthly Inflows</div>
                  <div className="ms-stat-val text-success">₹1,23,100</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiTrendingUp size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">High Consistency</span>
                <span className="ms-stat-sub-text">5 Months Avg</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Avg Monthly Outflows</div>
                  <div className="ms-stat-val text-danger">₹45,696</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiTrendingDown size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">Controlled</span>
                <span className="ms-stat-sub-text">37% of income</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Financial Health Score</div>
                  <div className="ms-stat-val text-success fs-18px">92 / 100 (A+)</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiCheckCircle size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle">
                <ProgressBar now={92} className="ms-progress-blue" style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Analytics Charts */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="ms-card-title mb-0">Income vs Expense Trajectory</h5>
                  <p className="text-muted fs-11px mb-0">5-month pacing and savings growth</p>
                </div>
              </div>
              <Chart options={cashflowChartOptions} series={cashflowChartSeries} type="area" height={240} />
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-1">Expense Allocation</h5>
                <p className="text-muted fs-11px mb-3">Category distribution</p>
                <Chart options={donutOptions} series={donutSeries} type="donut" height={220} />
              </div>
              <div className="text-center text-muted fs-11px pt-2 border-top">
                Housing &amp; Food account for 60% of total spend
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 4. Master CommonDataTable */}
      <CommonDataTable
        columns={columns}
        data={REPORT_RECORDS}
        keyField="id"
        title="Monthly Financial Statements Breakdown"
        subtitle="Audited ledger summary with savings ratios"
        searchPlaceholder="Search statement month..."
        selectableRows={false}
        defaultPageSize={5}
        exportFileName="Monthly_Statements_Report"
      />
    </Container>
  );
}

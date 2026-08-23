import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiClock,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import CommonDataTable from "../../components/common/DataTable";

// Initial Scheduled Financial Calendar Events
const INITIAL_EVENTS = [
  { id: "EVT-1", date: "2026-08-01", title: "Flat Rent Due", category: "Housing", type: "expense", amount: 10000, status: "Paid", account: "GPay UPI" },
  { id: "EVT-2", date: "2026-08-05", title: "DLF Home Loan EMI", category: "Loan EMI", type: "expense", amount: 24500, status: "Paid", account: "HDFC Auto-Debit" },
  { id: "EVT-3", date: "2026-08-10", title: "Hyundai Creta Auto EMI", category: "Loan EMI", type: "expense", amount: 14200, status: "Paid", account: "ICICI Auto-Debit" },
  { id: "EVT-4", date: "2026-08-15", title: "Apartment Rental Income", category: "Rental", type: "income", amount: 18000, status: "Paid", account: "HDFC Bank" },
  { id: "EVT-5", date: "2026-08-18", title: "Freelance UI Milestone", category: "Freelance", type: "income", amount: 28000, status: "Paid", account: "ICICI Bank" },
  { id: "EVT-6", date: "2026-08-20", title: "TechCorp Monthly Salary", category: "Salary", type: "income", amount: 65000, status: "Paid", account: "HDFC Bank" },
  { id: "EVT-7", date: "2026-08-25", title: "Airtel Fiber Broadband Bill", category: "Utilities", type: "expense", amount: 1180, status: "Upcoming", account: "PhonePe UPI" },
  { id: "EVT-8", date: "2026-08-28", title: "Cloud Infra Retainer", category: "Consulting", type: "income", amount: 22000, status: "Upcoming", account: "HDFC Bank" },
  { id: "EVT-9", date: "2026-09-05", title: "DLF Home Loan EMI", category: "Loan EMI", type: "expense", amount: 24500, status: "Upcoming", account: "HDFC Auto-Debit" },
];

export default function Calendar() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedDate, setSelectedDate] = useState("2026-08-20");
  const [currentMonth, setCurrentMonth] = useState("August 2026");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Utilities",
    type: "expense",
    amount: "",
    date: selectedDate,
    account: "HDFC Bank •••• 4091",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalScheduledIn = 0;
    let totalScheduledOut = 0;
    let upcomingCount = 0;

    events.forEach((e) => {
      if (e.type === "income") totalScheduledIn += e.amount;
      else totalScheduledOut += e.amount;
      if (e.status === "Upcoming") upcomingCount++;
    });

    return { totalScheduledIn, totalScheduledOut, upcomingCount, totalEvents: events.length };
  }, [events]);

  // Events on currently selected day
  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  // Calendar Day Numbers generation for August 2026 (starts Saturday Aug 1)
  const calendarDays = useMemo(() => {
    const days = [];
    // August 2026: 31 days. Starts on Saturday (index 6 if Mon=0, or 6 if Sun=0)
    // 5 empty days for offset (Aug 1 is Saturday)
    for (let i = 0; i < 5; i++) {
      days.push({ day: null, date: null });
    }
    for (let d = 1; d <= 31; d++) {
      const dateStr = `2026-08-${d < 10 ? `0${d}` : d}`;
      const dayEvts = events.filter((e) => e.date === dateStr);
      days.push({ day: d, date: dateStr, events: dayEvts });
    }
    return days;
  }, [events]);

  // Handle Save Event
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newEvt = {
      id: `EVT-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      type: formData.type,
      amount: Number(formData.amount),
      date: formData.date,
      status: "Upcoming",
      account: formData.account,
    };

    setEvents([...events, newEvt]);
    setShowAddModal(false);
  };

  // Table Columns
  const tableColumns = [
    {
      name: "Event / Bill Name",
      selector: (row) => row.title,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: row.type === "income" ? "#ecfdf5" : "#fff1f2",
              color: row.type === "income" ? "#10b981" : "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {row.type === "income" ? <FiArrowUpRight size={16} /> : <FiArrowDownLeft size={16} />}
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.title}</div>
            <div className="text-muted fs-11px">{row.category} • {row.account}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Scheduled Date",
      selector: (row) => row.date,
      sortable: true,
      width: "140px",
      cell: (row) => <span className="fw-600 text-dark fs-12px">{row.date}</span>,
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
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => (
        <div className={`text-end fw-800 fs-13px ${row.type === "income" ? "text-success" : "text-danger"}`}>
          {row.type === "income" ? "+" : "-"}₹{Number(row.amount).toLocaleString("en-IN")}
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
            <span>Financial Calendar</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              August 2026
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Track upcoming bill auto-debits, expected salary credits, and installment deadlines on an interactive calendar.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus size={15} />
            <span>+ Schedule Reminder</span>
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
                  <div className="ms-stat-title">Expected Inflows</div>
                  <div className="ms-stat-val text-success">
                    ₹{metrics.totalScheduledIn.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiArrowUpRight size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">Credits planned</span>
                <span className="ms-stat-sub-text">This month</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Scheduled Outflows</div>
                  <div className="ms-stat-val text-danger">
                    ₹{metrics.totalScheduledOut.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiArrowDownLeft size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">Bills &amp; EMIs</span>
                <span className="ms-stat-sub-text">Auto-debit</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Upcoming In 7 Days</div>
                  <div className="ms-stat-val text-primary">{metrics.upcomingCount} Pending</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiClock size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">Auto reminders set</span>
                <span className="ms-stat-sub-text">Notifications ON</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Schedules</div>
                  <div className="ms-stat-val">{metrics.totalEvents} Logged</div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiCalendar size={20} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">100% Synced</span>
                <span className="ms-stat-sub-text">Bank accounts</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Interactive Monthly Calendar Grid + Selected Day Timeline */}
      <Row className="g-3 mb-4">
        {/* Calendar Grid (Col-8) */}
        <Col xs={12} lg={8}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3">
              {/* Calendar Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-700 text-dark mb-0 d-flex align-items-center gap-2">
                  <FiCalendar className="text-primary" /> {currentMonth}
                </h5>
                <div className="d-flex gap-1">
                  <Button variant="light" size="sm" className="p-1 border rounded-6px"><FiChevronLeft size={16} /></Button>
                  <Button variant="light" size="sm" className="p-1 border rounded-6px"><FiChevronRight size={16} /></Button>
                </div>
              </div>

              {/* Day Name Headers */}
              <div className="d-grid text-center text-muted fs-11.5px fw-700 mb-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
              </div>

              {/* Day Tiles */}
              <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                {calendarDays.map((item, idx) => {
                  if (!item.day) {
                    return <div key={idx} className="p-2 rounded-8px bg-light opacity-25" style={{ minHeight: "65px" }}></div>;
                  }
                  const isSelected = item.date === selectedDate;
                  const hasIncome = item.events.some((e) => e.type === "income");
                  const hasExpense = item.events.some((e) => e.type === "expense");

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(item.date)}
                      className={`p-2 rounded-8px border cursor-pointer position-relative d-flex flex-column justify-content-between ${
                        isSelected ? "border-primary bg-primary-subtle shadow-sm" : "bg-white"
                      }`}
                      style={{ minHeight: "65px", transition: "all 0.15s ease" }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`fw-700 fs-12px ${isSelected ? "text-primary" : "text-dark"}`}>{item.day}</span>
                        {item.events.length > 0 && (
                          <span className="badge bg-primary rounded-circle" style={{ width: "16px", height: "16px", fontSize: "9px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.events.length}
                          </span>
                        )}
                      </div>

                      {/* Event Dot Indicators */}
                      <div className="d-flex gap-1 mt-1">
                        {hasIncome && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }}></span>}
                        {hasExpense && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }}></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Selected Date Timeline Sidebar (Col-4) */}
        <Col xs={12} lg={4}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div>
                    <span className="text-muted fs-11px">SELECTED DAY</span>
                    <h6 className="fw-700 text-dark mb-0">{selectedDate}</h6>
                  </div>
                  <Badge bg="primary-subtle" className="text-primary fs-11px fw-600">
                    {dayEvents.length} Events
                  </Badge>
                </div>

                {/* Day events list */}
                {dayEvents.length > 0 ? (
                  <div className="d-flex flex-column gap-2 my-2">
                    {dayEvents.map((evt) => (
                      <div key={evt.id} className="p-2 rounded-8px border bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="fw-700 text-dark fs-12px">{evt.title}</span>
                          <span className={`fw-800 fs-12px ${evt.type === "income" ? "text-success" : "text-danger"}`}>
                            {evt.type === "income" ? "+" : "-"}₹{evt.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center fs-11px text-muted">
                          <span>{evt.category}</span>
                          <span className={`badge ${evt.status === "Paid" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                            {evt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted fs-12px">
                    <FiCalendar size={28} className="text-secondary mb-2" />
                    <div>No scheduled transactions for {selectedDate}</div>
                  </div>
                )}
              </div>

              <Button
                variant="outline-primary"
                size="sm"
                className="w-100 rounded-6px mt-3"
                onClick={() => {
                  setFormData({ ...formData, date: selectedDate });
                  setShowAddModal(true);
                }}
              >
                + Add Reminder for {selectedDate}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 4. Master CommonDataTable */}
      <CommonDataTable
        columns={tableColumns}
        data={events}
        keyField="id"
        title="Scheduled Financial Timeline"
        subtitle={`Showing ${events.length} upcoming & past scheduled events`}
        searchPlaceholder="Search scheduled bill / income..."
        selectableRows={false}
        defaultPageSize={10}
        exportFileName="Financial_Calendar_Schedule"
      />

      {/* Modal: Schedule Reminder */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <FiCalendar className="text-primary" /> Schedule Reminder / Bill
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEvent}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Event / Bill Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Electricity Bill / Rent"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            <Row className="g-2 mb-2">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="expense">Expense (Outflow)</option>
                    <option value="income">Income (Inflow)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="ur-form-input fw-700 text-dark"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Scheduled Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Save Schedule
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

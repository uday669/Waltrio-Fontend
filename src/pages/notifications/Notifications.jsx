import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiDollarSign,
  FiCreditCard,
  FiTrash2,
  FiCheck,
  FiClock,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-1",
    title: "Salary Credited to HDFC Bank",
    message: "TechCorp India Pvt Ltd deposited ₹65,000 to Account •••• 4091.",
    type: "income",
    category: "Income",
    time: "10 mins ago",
    read: false,
    icon: <FiDollarSign size={16} />,
    iconBg: "#ecfdf5",
    iconColor: "#10b981",
    link: "/income",
  },
  {
    id: "NOTIF-2",
    title: "Budget Cap Alert: Shopping & Retail",
    message: "You have spent ₹4,200 (105%) of your ₹4,000 allocated monthly limit.",
    type: "budget",
    category: "Budget Alert",
    time: "2 hours ago",
    read: false,
    icon: <FiAlertTriangle size={16} />,
    iconBg: "#fff1f2",
    iconColor: "#ef4444",
    link: "/budgets",
  },
  {
    id: "NOTIF-3",
    title: "Upcoming Auto-Debit: DLF Home Loan EMI",
    message: "₹24,500 will be auto-debited on 05 Sep 2026 from HDFC Bank.",
    type: "emi",
    category: "EMI Due",
    time: "1 day ago",
    read: false,
    icon: <FiCreditCard size={16} />,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    link: "/emi",
  },
  {
    id: "NOTIF-4",
    title: "Rahul Settled Split Balance in Goa Trip",
    message: "Rahul paid ₹500 towards Goa Beach Vacation group expense balance.",
    type: "split",
    category: "Groups & Split",
    time: "2 days ago",
    read: true,
    icon: <FiUsers size={16} />,
    iconBg: "#eef2ff",
    iconColor: "#4f46e5",
    link: "/split",
  },
  {
    id: "NOTIF-5",
    title: "Monthly Security & Login Audit",
    message: "Your Waltrio account was accessed successfully from Chrome on Windows (IP: 103.21.xx.xx).",
    type: "system",
    category: "Security",
    time: "3 days ago",
    read: true,
    icon: <FiCheckCircle size={16} />,
    iconBg: "#f5f3ff",
    iconColor: "#8b5cf6",
    link: "/settings",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredList = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter !== "all") return notifications.filter((n) => n.type === filter);
    return notifications;
  }, [notifications, filter]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotif = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Notifications &amp; Activity Center</span>
            {unreadCount > 0 && (
              <Badge bg="danger-subtle" className="text-danger fs-11px fw-700 py-1 px-2 rounded-6px">
                {unreadCount} New
              </Badge>
            )}
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Real-time notifications for money transfers, budget warnings, bill due dates, and split settlements.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-8px fs-12px fw-600 px-3 py-2 d-flex align-items-center gap-1"
              onClick={handleMarkAllRead}
            >
              <FiCheck size={14} /> <span>Mark All Read</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="light"
              size="sm"
              className="rounded-8px fs-12px text-danger border px-3 py-2 d-flex align-items-center gap-1"
              onClick={handleClearAll}
            >
              <FiTrash2 size={14} /> <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Notification Filters Bar */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Button
          variant={filter === "all" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "income" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("income")}
        >
          Inflow
        </Button>
        <Button
          variant={filter === "budget" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("budget")}
        >
          Budget Caps
        </Button>
        <Button
          variant={filter === "emi" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("emi")}
        >
          EMI &amp; Bills
        </Button>
        <Button
          variant={filter === "split" ? "primary" : "light"}
          size="sm"
          className="rounded-8px fs-12px fw-600 px-3"
          onClick={() => setFilter("split")}
        >
          Groups Split
        </Button>
      </div>

      {/* 3. Notification List */}
      <Card className="ms-premium-card border-0 mb-4">
        <Card.Body className="p-3">
          {filteredList.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {filteredList.map((notif) => (
                <div
                  key={notif.id}
                  className={`d-flex align-items-start justify-content-between p-3 rounded-10px border transition-all ${
                    !notif.read ? "bg-primary-subtle border-primary-subtle" : "bg-white"
                  }`}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        backgroundColor: notif.iconBg,
                        color: notif.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {notif.icon}
                    </div>

                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-700 text-dark mb-0 fs-13px">{notif.title}</h6>
                        {!notif.read && (
                          <span className="badge bg-danger rounded-circle" style={{ width: "7px", height: "7px", padding: 0 }}></span>
                        )}
                        <span className="badge bg-light text-muted border fs-10px">{notif.category}</span>
                      </div>
                      <p className="text-muted fs-12px mb-2">{notif.message}</p>

                      <div className="d-flex align-items-center gap-3 fs-11px text-muted">
                        <span><FiClock size={11} className="me-1" /> {notif.time}</span>
                        {notif.link && (
                          <Link to={notif.link} className="fw-600 text-primary text-decoration-none">
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    {!notif.read && (
                      <Button
                        variant="light"
                        size="sm"
                        className="p-1 border rounded-6px text-primary"
                        onClick={() => handleMarkSingleRead(notif.id)}
                        title="Mark Read"
                      >
                        <FiCheck size={14} />
                      </Button>
                    )}
                    <Button
                      variant="light"
                      size="sm"
                      className="p-1 border rounded-6px text-danger"
                      onClick={() => handleDeleteNotif(notif.id)}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FiBell size={36} className="text-secondary mb-2 opacity-50" />
              <h6 className="fw-700 text-dark">No notifications found</h6>
              <p className="fs-12px mb-0">You're all caught up with your financial alerts!</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

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
import {
  FiUsers,
  FiUserPlus,
  FiPlus,
  FiArrowLeft,
  FiDollarSign,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiEye,
  FiLayers,
  FiTag,
  FiCalendar,
  FiUser,
  FiX,
  FiSend,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for Groups
const INITIAL_GROUPS = [
  {
    id: "GRP-101",
    name: "Goa Beach Vacation 🏖️",
    category: "Trip & Travel",
    categoryBg: "#eef2ff",
    categoryColor: "#4f46e5",
    totalExpense: 34500,
    yourBalance: 1850, // Positive: you get back, Negative: you owe
    createdDate: "15 Aug 2026",
    members: [
      { id: "M1", name: "Uday (You)", email: "uday@waltro.com", paid: 18000, owes: 0, getsBack: 1850, avatarBg: "#4f46e5" },
      { id: "M2", name: "Rahul Sharma", email: "rahul@gmail.com", paid: 8500, owes: 500, getsBack: 0, avatarBg: "#10b981" },
      { id: "M3", name: "Priya Patel", email: "priya@gmail.com", paid: 5000, owes: 1200, getsBack: 0, avatarBg: "#ec4899" },
      { id: "M4", name: "Amit Verma", email: "amit@gmail.com", paid: 3000, owes: 150, getsBack: 0, avatarBg: "#f59e0b" },
    ],
    expenses: [
      { id: "GE-01", description: "Private Villa 2-Night Stay", category: "Hotel", paidBy: "Uday (You)", amount: 18000, date: "2026-08-16", yourShare: 4500 },
      { id: "GE-02", description: "Beach Shack Seafood Dinner", category: "Dining", paidBy: "Rahul Sharma", amount: 8500, date: "2026-08-17", yourShare: 2125 },
      { id: "GE-03", description: "Scooter & Fuel Rentals", category: "Transport", paidBy: "Priya Patel", amount: 5000, date: "2026-08-17", yourShare: 1250 },
      { id: "GE-04", description: "Water Sports & Scuba Pass", category: "Activities", paidBy: "Amit Verma", amount: 3000, date: "2026-08-18", yourShare: 750 },
    ],
  },
  {
    id: "GRP-102",
    name: "Room 402 Flatmates 🏠",
    category: "Roommates",
    categoryBg: "#f5f3ff",
    categoryColor: "#8b5cf6",
    totalExpense: 22400,
    yourBalance: -650, // Negative: You owe
    createdDate: "01 Aug 2026",
    members: [
      { id: "M1", name: "Uday (You)", email: "uday@waltro.com", paid: 6000, owes: 650, getsBack: 0, avatarBg: "#4f46e5" },
      { id: "M2", name: "Karan Johar", email: "karan@gmail.com", paid: 9400, owes: 0, getsBack: 1933, avatarBg: "#06b6d4" },
      { id: "M3", name: "Siddharth Malhotra", email: "sid@gmail.com", paid: 7000, owes: 1283, getsBack: 0, avatarBg: "#8b5cf6" },
    ],
    expenses: [
      { id: "GE-05", description: "Monthly Wi-Fi & Electricity Bill", category: "Utilities", paidBy: "Karan Johar", amount: 4400, date: "2026-08-05", yourShare: 1466 },
      { id: "GE-06", description: "Blinkit Monthly Ration Supplies", category: "Groceries", paidBy: "Uday (You)", amount: 6000, date: "2026-08-08", yourShare: 2000 },
      { id: "GE-07", description: "Cook & Maid Monthly Salary", category: "Services", paidBy: "Siddharth Malhotra", amount: 7000, date: "2026-08-10", yourShare: 2333 },
      { id: "GE-08", description: "Urban Company Deep Cleaning", category: "Services", paidBy: "Karan Johar", amount: 5000, date: "2026-08-15", yourShare: 1666 },
    ],
  },
  {
    id: "GRP-103",
    name: "Weekend Hackathon Squad 💻",
    category: "Project / Event",
    categoryBg: "#ecfdf5",
    categoryColor: "#10b981",
    totalExpense: 6800,
    yourBalance: 1200,
    createdDate: "10 Aug 2026",
    members: [
      { id: "M1", name: "Uday (You)", email: "uday@waltro.com", paid: 3500, owes: 0, getsBack: 1200, avatarBg: "#4f46e5" },
      { id: "M2", name: "Sneha Roy", email: "sneha@tech.io", paid: 2300, owes: 0, getsBack: 0, avatarBg: "#ec4899" },
      { id: "M3", name: "Deepak Singh", email: "deepak@dev.org", paid: 1000, owes: 1200, getsBack: 0, avatarBg: "#f59e0b" },
    ],
    expenses: [
      { id: "GE-09", description: "Domain & AWS Cloud Hosting", category: "Tech", paidBy: "Uday (You)", amount: 3500, date: "2026-08-11", yourShare: 1166 },
      { id: "GE-10", description: "RedBull & Pizza Night Delivery", category: "Food", paidBy: "Sneha Roy", amount: 2300, date: "2026-08-11", yourShare: 766 },
      { id: "GE-11", description: "Prototyping Figma Team Pass", category: "Design", paidBy: "Deepak Singh", amount: 1000, date: "2026-08-12", yourShare: 333 },
    ],
  },
];

export default function GroupsSplit() {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState(null); // null = List view, GRP-XXX = Detail view

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupCategory, setGroupCategory] = useState("Trip & Travel");
  // Friend list inputs (1 by 1, up to max 5)
  const [friendsList, setFriendsList] = useState([
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com" },
  ]);

  // Add Money / Add Group Expense Modal State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "Dining",
    paidBy: "Uday (You)",
    date: new Date().toISOString().slice(0, 10),
  });

  // Current Selected Active Group object
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  // Overall Financial Summary across all groups
  const overallSummary = useMemo(() => {
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    let totalSpend = 0;

    groups.forEach((g) => {
      totalSpend += g.totalExpense;
      if (g.yourBalance > 0) totalOwedToYou += g.yourBalance;
      else if (g.yourBalance < 0) totalYouOwe += Math.abs(g.yourBalance);
    });

    return { totalOwedToYou, totalYouOwe, totalSpend, activeCount: groups.length };
  }, [groups]);

  // Handle Add Friend Input (Max 5)
  const handleAddFriendInput = () => {
    if (friendsList.length >= 5) return;
    setFriendsList([
      ...friendsList,
      { id: Date.now(), name: "", email: "" },
    ]);
  };

  // Handle Friend Input Change
  const handleFriendChange = (id, field, value) => {
    setFriendsList(
      friendsList.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Handle Remove Friend Input
  const handleRemoveFriendInput = (id) => {
    if (friendsList.length <= 1) return;
    setFriendsList(friendsList.filter((f) => f.id !== id));
  };

  // Open Create Group Modal
  const handleOpenCreateModal = () => {
    setGroupName("");
    setGroupCategory("Trip & Travel");
    setFriendsList([
      { id: 1, name: "Friend 1", email: "" },
      { id: 2, name: "Friend 2", email: "" },
    ]);
    setShowCreateModal(true);
  };

  // Save Create Group
  const handleSaveCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const colors = ["#4f46e5", "#10b981", "#ec4899", "#f59e0b", "#06b6d4", "#8b5cf6"];

    // Build members: always include Uday (You) + the valid added friends
    const newMembers = [
      {
        id: "M1",
        name: "Uday (You)",
        email: "uday@waltro.com",
        paid: 0,
        owes: 0,
        getsBack: 0,
        avatarBg: "#4f46e5",
      },
      ...friendsList
        .filter((f) => f.name.trim())
        .map((f, idx) => ({
          id: `M${idx + 2}`,
          name: f.name.trim(),
          email: f.email.trim() || `${f.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
          paid: 0,
          owes: 0,
          getsBack: 0,
          avatarBg: colors[(idx + 1) % colors.length],
        })),
    ];

    const newGroup = {
      id: `GRP-${Math.floor(104 + Math.random() * 900)}`,
      name: groupName.trim(),
      category: groupCategory,
      categoryBg: "#eef2ff",
      categoryColor: "#4f46e5",
      totalExpense: 0,
      yourBalance: 0,
      createdDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      members: newMembers,
      expenses: [],
    };

    setGroups([newGroup, ...groups]);
    setShowCreateModal(false);
  };

  // Open Add Expense / Add Money Modal in active group
  const handleOpenAddExpense = () => {
    if (!activeGroup) return;
    setExpenseForm({
      description: "",
      amount: "",
      category: "Dining",
      paidBy: "Uday (You)",
      date: new Date().toISOString().slice(0, 10),
    });
    setShowAddExpenseModal(true);
  };

  // Submit Add Expense to Active Group
  const handleSaveAddExpense = (e) => {
    e.preventDefault();
    if (!activeGroup || !expenseForm.description || !expenseForm.amount) return;

    const amountNum = Number(expenseForm.amount);
    const memberCount = activeGroup.members.length || 1;
    const splitPerMember = Math.round(amountNum / memberCount);

    const newExpense = {
      id: `GE-${Math.floor(20 + Math.random() * 90)}`,
      description: expenseForm.description,
      category: expenseForm.category,
      paidBy: expenseForm.paidBy,
      amount: amountNum,
      date: expenseForm.date,
      yourShare: splitPerMember,
    };

    // Recalculate member balances
    const updatedMembers = activeGroup.members.map((m) => {
      const isPayer = m.name === expenseForm.paidBy;
      const additionalPaid = isPayer ? amountNum : 0;
      const newPaidTotal = m.paid + additionalPaid;
      return {
        ...m,
        paid: newPaidTotal,
      };
    });

    const updatedTotal = activeGroup.totalExpense + amountNum;
    const isYouPayer = expenseForm.paidBy === "Uday (You)";
    const yourNetChange = isYouPayer ? amountNum - splitPerMember : -splitPerMember;
    const updatedYourBalance = activeGroup.yourBalance + yourNetChange;

    const updatedGroup = {
      ...activeGroup,
      totalExpense: updatedTotal,
      yourBalance: updatedYourBalance,
      members: updatedMembers,
      expenses: [newExpense, ...activeGroup.expenses],
    };

    setGroups(groups.map((g) => (g.id === activeGroup.id ? updatedGroup : g)));
    setShowAddExpenseModal(false);
  };

  // Columns for Group Expenses Table
  const expenseTableColumns = [
    {
      name: "Expense Description",
      selector: (row) => row.description,
      sortable: true,
      minWidth: "240px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#eef2ff",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "12px",
            }}
          >
            ₹
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.description}</div>
            <div className="text-muted fs-11px">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Paid By",
      selector: (row) => row.paidBy,
      sortable: true,
      width: "160px",
      cell: (row) => (
        <span className={`fw-600 fs-12px ${row.paidBy.includes("You") ? "text-success" : "text-dark"}`}>
          {row.paidBy}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      width: "130px",
      cell: (row) => <span className="fs-12px text-muted">{row.date}</span>,
    },
    {
      name: "Total Cost",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => (
        <div className="text-end fw-800 text-dark fs-13px">
          ₹{Number(row.amount).toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      name: "Your Share",
      selector: (row) => row.yourShare,
      sortable: true,
      right: true,
      width: "130px",
      cell: (row) => (
        <div className="text-end fw-700 text-primary fs-12.5px">
          ₹{Number(row.yourShare).toLocaleString("en-IN")}
        </div>
      ),
    },
  ];

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* ===================================================================
          VIEW 1: ALL GROUPS LIST & SUMMARY CARDS
          =================================================================== */}
      {!activeGroup ? (
        <>
          {/* Header & Create Group Button */}
          <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-3">
            <div>
              <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
                <span>Groups &amp; Expense Split</span>
                <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
                  {groups.length} Active Groups
                </Badge>
              </h1>
              <p className="ms-greeting-subtitle mb-0">
                Split bills with roommates, friends, travel squads, and track who owes whom with instant settlement.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
                onClick={handleOpenCreateModal}
              >
                <FiPlus size={15} />
                <span>+ Create Group</span>
              </Button>
            </div>
          </div>

          {/* Top 3 Summary Cards */}
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="ms-premium-card h-100 border-0">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="ms-stat-title">You Are Owed (Gets Back)</div>
                      <div className="ms-stat-val text-success">
                        +₹{overallSummary.totalOwedToYou.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                      <FiDollarSign size={20} color="#10b981" />
                    </div>
                  </div>
                  <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                    <span className="text-success fw-700 fs-11px">Collect from friends</span>
                    <span className="ms-stat-sub-text">Across active groups</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="ms-premium-card h-100 border-0">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="ms-stat-title">You Owe (To Pay)</div>
                      <div className="ms-stat-val text-danger">
                        -₹{overallSummary.totalYouOwe.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                      <IoWalletOutline size={20} color="#ef4444" />
                    </div>
                  </div>
                  <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                    <span className="text-danger fw-700 fs-11px">Pending payables</span>
                    <span className="ms-stat-sub-text">Settle via UPI</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="ms-premium-card h-100 border-0">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="ms-stat-title">Total Shared Outlay</div>
                      <div className="ms-stat-val">
                        ₹{overallSummary.totalSpend.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                      <FiUsers size={20} color="#4f46e5" />
                    </div>
                  </div>
                  <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                    <span className="text-primary fw-700 fs-11px">{groups.length} Groups total</span>
                    <span className="ms-stat-sub-text">Managed in Waltrio</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Groups Grid Cards */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="ms-card-title mb-0">Your Active Expense Groups</h5>
            <span className="text-muted fs-12px">Click any group to view members, ledger, &amp; add money</span>
          </div>

          <Row className="g-3 mb-4">
            {groups.map((grp) => (
              <Col key={grp.id} xs={12} md={6} xl={4}>
                <Card
                  className="ms-premium-card h-100 border-0 cursor-pointer"
                  onClick={() => setActiveGroupId(grp.id)}
                  style={{ transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                >
                  <Card.Body className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      {/* Top Category Badge & ID */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge
                          style={{
                            backgroundColor: grp.categoryBg || "#eef2ff",
                            color: grp.categoryColor || "#4f46e5",
                            fontWeight: 700,
                            fontSize: "11px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {grp.category}
                        </Badge>
                        <span className="text-muted fs-11px">Created {grp.createdDate}</span>
                      </div>

                      {/* Group Title */}
                      <h5 className="fw-700 text-dark fs-15px mb-1">{grp.name}</h5>

                      {/* Member Avatars Stack */}
                      <div className="d-flex align-items-center gap-1 my-3">
                        <div className="d-flex align-items-center">
                          {grp.members.slice(0, 4).map((m, idx) => (
                            <div
                              key={idx}
                              title={m.name}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: m.avatarBg || "#4f46e5",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "700",
                                border: "2px solid #ffffff",
                                marginLeft: idx === 0 ? "0" : "-8px",
                              }}
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-muted fs-11.5px ms-2">
                          {grp.members.length} Members ({grp.members.map((m) => m.name.split(" ")[0]).join(", ")})
                        </span>
                      </div>

                      {/* Financial Numbers Box */}
                      <div className="p-2 px-3 rounded-8px bg-light mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted fs-11px">Total Group Spend:</span>
                          <span className="fw-700 text-dark fs-12px">₹{grp.totalExpense.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted fs-11px">Your Net Status:</span>
                          <span
                            className={`fw-800 fs-12.5px ${
                              grp.yourBalance > 0
                                ? "text-success"
                                : grp.yourBalance < 0
                                ? "text-danger"
                                : "text-muted"
                            }`}
                          >
                            {grp.yourBalance > 0
                              ? `+₹${grp.yourBalance.toLocaleString("en-IN")} (You get back)`
                              : grp.yourBalance < 0
                              ? `-₹${Math.abs(grp.yourBalance).toLocaleString("en-IN")} (You owe)`
                              : "Settled Up (₹0)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Group Button */}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 rounded-6px fs-12px fw-600 py-1"
                      onClick={() => setActiveGroupId(grp.id)}
                    >
                      Open Group &amp; Split Details →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        /* ===================================================================
            VIEW 2: DRILL-DOWN INTO SINGLE GROUP DETAILS
            =================================================================== */
        <div>
          {/* Back Button & Top Navigation */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-8px fw-600 fs-12px px-3 py-2 border"
              onClick={() => setActiveGroupId(null)}
            >
              <FiArrowLeft size={14} /> Back to All Groups
            </Button>

            <div className="d-flex align-items-center gap-2">
              <Button
                className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
                onClick={handleOpenAddExpense}
              >
                <FiPlus size={15} />
                <span>+ Add Money / Expense</span>
              </Button>
            </div>
          </div>

          {/* Group Header Hero Card */}
          <Card className="ms-premium-card border-0 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
                      {activeGroup.category}
                    </Badge>
                    <span className="text-muted fs-11.5px">Group ID: {activeGroup.id}</span>
                  </div>
                  <h2 className="fw-800 text-dark mb-1">{activeGroup.name}</h2>
                  <p className="text-muted fs-12px mb-0">
                    Created on {activeGroup.createdDate} • {activeGroup.members.length} Members participating
                  </p>
                </div>

                {/* Balance Banner */}
                <div className="d-flex align-items-center gap-4 bg-light p-3 rounded-10px">
                  <div>
                    <div className="text-muted fs-11px">TOTAL GROUP SPEND</div>
                    <div className="fw-800 text-dark fs-18px">₹{activeGroup.totalExpense.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="border-start ps-3">
                    <div className="text-muted fs-11px">YOUR NET POSITION</div>
                    <div
                      className={`fw-800 fs-18px ${
                        activeGroup.yourBalance > 0
                          ? "text-success"
                          : activeGroup.yourBalance < 0
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    >
                      {activeGroup.yourBalance > 0
                        ? `+₹${activeGroup.yourBalance.toLocaleString("en-IN")}`
                        : activeGroup.yourBalance < 0
                        ? `-₹${Math.abs(activeGroup.yourBalance).toLocaleString("en-IN")}`
                        : "₹0"}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Members List with Settle Up Status */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="ms-card-title mb-0">Group Members ({activeGroup.members.length})</h5>
            <span className="text-muted fs-11.5px">Breakdown of payments &amp; shares</span>
          </div>

          <Row className="g-3 mb-4">
            {activeGroup.members.map((member) => (
              <Col key={member.id} xs={12} sm={6} lg={3}>
                <Card className="ms-premium-card h-100 border-0">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: member.avatarBg || "#4f46e5",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-700 text-dark fs-13px">{member.name}</div>
                        <div className="text-muted fs-11px">{member.email}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-top">
                      <div className="d-flex justify-content-between fs-11.5px mb-1">
                        <span className="text-muted">Paid by {member.name.split(" ")[0]}:</span>
                        <span className="fw-700 text-dark">₹{member.paid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="d-flex justify-content-between fs-11.5px">
                        <span className="text-muted">Balance status:</span>
                        <span
                          className={`fw-700 ${
                            member.getsBack > 0
                              ? "text-success"
                              : member.owes > 0
                              ? "text-danger"
                              : "text-muted"
                          }`}
                        >
                          {member.getsBack > 0
                            ? `Gets ₹${member.getsBack.toLocaleString("en-IN")}`
                            : member.owes > 0
                            ? `Owes ₹${member.owes.toLocaleString("en-IN")}`
                            : "Settled"}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Group Expenses Table using CommonDataTable */}
          <CommonDataTable
            columns={expenseTableColumns}
            data={activeGroup.expenses}
            keyField="id"
            title="Shared Group Expenses"
            subtitle={`Showing ${activeGroup.expenses.length} transaction entries for ${activeGroup.name}`}
            searchPlaceholder="Search group expense..."
            selectableRows={false}
            defaultPageSize={5}
            actions={
              <Button
                variant="primary"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-6px fs-11.5px px-3"
                onClick={handleOpenAddExpense}
              >
                <FiPlus size={13} /> Add Expense
              </Button>
            }
          />
        </div>
      )}

      {/* ===================================================================
          MODAL: CREATE GROUP (WITH DYNAMIC ADD FRIENDS UP TO 5)
          =================================================================== */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon edit"><FiUsers size={16} /></span>
              Create New Expense Group
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Set group name, category, and add up to 5 friends to split bills.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveCreateGroup}>
          <Modal.Body className="py-3">
            <Row className="g-3 mb-3">
              <Col xs={12} md={7}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Group Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Goa Trip 2026 / Flat 402 Roommates"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Category</Form.Label>
                  <Form.Select
                    value={groupCategory}
                    onChange={(e) => setGroupCategory(e.target.value)}
                    className="ur-form-input"
                  >
                    <option value="Trip & Travel">Trip &amp; Travel</option>
                    <option value="Roommates">Roommates / Flat</option>
                    <option value="Project / Event">Project / Event</option>
                    <option value="Dining & Outing">Dining &amp; Outing</option>
                    <option value="Office & Work">Office &amp; Work</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* DYNAMIC FRIENDS INPUT SECTION (MAX 5) */}
            <div className="p-3 rounded-10px border bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h6 className="fw-700 text-dark mb-0 d-flex align-items-center gap-2 fs-13px">
                    <FiUserPlus className="text-primary" /> Add Friends / Members
                  </h6>
                  <span className="text-muted fs-11px">
                    You (Uday) are automatically included. Add up to 5 friends.
                  </span>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={friendsList.length >= 5}
                  onClick={handleAddFriendInput}
                  className="rounded-6px fs-11.5px py-1 px-3 d-flex align-items-center gap-1"
                >
                  <FiPlus size={12} /> Add Member ({friendsList.length}/5)
                </Button>
              </div>

              {/* Friends input list */}
              <div className="d-flex flex-column gap-2 mt-2">
                {friendsList.map((friend, idx) => (
                  <div key={friend.id} className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary rounded-circle" style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                      {idx + 1}
                    </span>
                    <Form.Control
                      type="text"
                      required
                      placeholder={`Friend #${idx + 1} Name`}
                      value={friend.name}
                      onChange={(e) => handleFriendChange(friend.id, "name", e.target.value)}
                      className="ur-form-input"
                      style={{ height: "34px", fontSize: "12px" }}
                    />
                    <Form.Control
                      type="email"
                      placeholder="Email (optional)"
                      value={friend.email}
                      onChange={(e) => handleFriendChange(friend.id, "email", e.target.value)}
                      className="ur-form-input"
                      style={{ height: "34px", fontSize: "12px" }}
                    />
                    {friendsList.length > 1 && (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleRemoveFriendInput(friend.id)}
                        className="text-danger p-1 border rounded-6px"
                        title="Remove"
                      >
                        <FiX size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {friendsList.length >= 5 && (
                <div className="text-center text-primary fs-11px fw-600 mt-2">
                  ✓ Maximum limit of 5 friends reached
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowCreateModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Create Group
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: ADD MONEY / GROUP EXPENSE
          =================================================================== */}
      <Modal show={showAddExpenseModal} onHide={() => setShowAddExpenseModal(false)} centered className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <span className="ur-modal-icon income"><FiPlus size={16} /></span>
            Add Money / Group Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAddExpense}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Expense Description *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Seafood Dinner at Shack"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            <Row className="g-2 mb-2">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Total Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="e.g. 4500"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="ur-form-input fw-700 text-primary"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Category</Form.Label>
                  <Form.Select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="ur-form-input"
                  >
                    <option value="Dining">Dining &amp; Food</option>
                    <option value="Hotel">Hotel &amp; Stay</option>
                    <option value="Transport">Transport &amp; Cab</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities &amp; Bills</option>
                    <option value="Activities">Activities &amp; Fun</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Paid By *</Form.Label>
              <Form.Select
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                className="ur-form-input fw-600"
              >
                {activeGroup?.members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="p-2 rounded-6px bg-light border text-center fs-11px text-muted mt-2">
              💡 This amount will be split equally among all {activeGroup?.members.length} members.
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddExpenseModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4">
              Add Expense
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {
  FiUsers,
  FiPlus,
  FiArrowRight,
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiTrash2,
  FiCheckCircle,
  FiShare2,
  FiCopy,
  FiCheck,
  FiTrendingUp,
  FiTrendingDown,
  FiRepeat,
  FiSliders,
  FiSearch,
  FiUserPlus,
  FiTag,
  FiInfo,
  FiMail,
  FiSend,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { toast } from "../../lib/toast";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/groups.css";

// Preset Group Categories
const GROUP_CATEGORIES = [
  { id: "trip", name: "Trip & Travel", emoji: "✈️", bg: "#ecfeff", color: "#0891b2" },
  { id: "home", name: "Roommates & Home", emoji: "🏠", bg: "#eef2ff", color: "#4f46e5" },
  { id: "food", name: "Dining & Food", emoji: "🍽️", bg: "#fffbeb", color: "#d97706" },
  { id: "events", name: "Events & Outings", emoji: "🎉", bg: "#fdf2f8", color: "#db2777" },
  { id: "project", name: "Shared Projects", emoji: "💼", bg: "#f0fdf4", color: "#16a34a" },
];

const PRESET_EMOJIS = ["✈️", "🏠", "🍽️", "🎉", "🏖️", "🚗", "🎬", "💼", "🍕", "⛺"];

// Initial Starter Mock Groups matching product vision
const INITIAL_GROUPS = [
  {
    id: "goa-2026",
    name: "Goa Beach Vacation 2026",
    category: "Trip & Travel",
    emoji: "🏖️",
    description: "Villa bookings, beach shack dinners, scooter rentals, and fuel split evenly.",
    currency: "INR",
    createdAt: "2026-10-01",
    members: [
      { id: "m-1", name: "You", email: "you@example.com", isUser: true, color: "#4f46e5" },
      { id: "m-2", name: "Rahul K.", email: "rahul@example.com", isUser: false, color: "#8b5cf6" },
      { id: "m-3", name: "Priya S.", email: "priya@example.com", isUser: false, color: "#ec4899" },
      { id: "m-4", name: "Ankit M.", email: "ankit@example.com", isUser: false, color: "#06b6d4" },
      { id: "m-5", name: "Sneha R.", email: "sneha@example.com", isUser: false, color: "#10b981" },
    ],
    expenses: [
      {
        id: "exp-1",
        title: "Candolim Sea-Facing Villa Booking",
        amount: 14000,
        paidById: "m-1", // You paid
        category: "Accommodation",
        date: "2026-10-02",
        splitBetweenIds: ["m-1", "m-2", "m-3", "m-4", "m-5"],
      },
      {
        id: "exp-2",
        title: "Seafood Feast at Thalassa",
        amount: 6500,
        paidById: "m-2", // Rahul paid
        category: "Food & Dining",
        date: "2026-10-03",
        splitBetweenIds: ["m-1", "m-2", "m-3", "m-4", "m-5"],
      },
      {
        id: "exp-3",
        title: "Scooter Rental & Fuel Fill",
        amount: 4000,
        paidById: "m-1", // You paid
        category: "Transport",
        date: "2026-10-04",
        splitBetweenIds: ["m-1", "m-2", "m-3", "m-4", "m-5"],
      },
    ],
    settlements: [],
  },
  {
    id: "apt-402",
    name: "Apartment 402 Rent & Utilities",
    category: "Roommates & Home",
    emoji: "🏠",
    description: "Monthly flat rent, broadband, electricity bills, and shared groceries.",
    currency: "INR",
    createdAt: "2026-09-01",
    members: [
      { id: "m-1", name: "You", email: "you@example.com", isUser: true, color: "#4f46e5" },
      { id: "m-a", name: "Devansh P.", email: "devansh@example.com", isUser: false, color: "#f59e0b" },
      { id: "m-b", name: "Kavya T.", email: "kavya@example.com", isUser: false, color: "#06b6d4" },
    ],
    expenses: [
      {
        id: "exp-a1",
        title: "High-Speed WiFi & Cable Bill",
        amount: 1800,
        paidById: "m-1",
        category: "Utilities",
        date: "2026-10-01",
        splitBetweenIds: ["m-1", "m-a", "m-b"],
      },
      {
        id: "exp-a2",
        title: "Weekly Organic Groceries & Pantry",
        amount: 2700,
        paidById: "m-a",
        category: "Groceries",
        date: "2026-10-05",
        splitBetweenIds: ["m-1", "m-a", "m-b"],
      },
    ],
    settlements: [],
  },
];

export default function Groups() {
  const { currencySymbol, formatAmount, user } = useAuth();

  // Local storage persisted state
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem("waltrio_groups_data");
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("waltrio_groups_data", JSON.stringify(groups));
    } catch {
      // ignore
    }
  }, [groups]);

  // View state: null = Groups List, string ID = Group Detail
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses"); // 'expenses' | 'debts' | 'members' | 'settlements'

  // Search & Filter in list view
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Forms
  const [newGroupForm, setNewGroupForm] = useState({
    name: "",
    emoji: "✈️",
    description: "",
  });

  const [newExpenseForm, setNewExpenseForm] = useState({
    title: "",
    amount: "",
    category: "General",
    paidById: "m-1",
    date: new Date().toISOString().split("T")[0],
    splitMode: "equal", // 'equal'
    selectedMemberIds: [],
  });

  const [settleForm, setSettleForm] = useState({
    payerId: "",
    payeeId: "",
    amount: "",
    paymentMode: "UPI",
    notes: "Settled via Waltrio UPI",
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Current active group object
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  // Ensure current user ID matches "You"
  const currentUserId = "m-1";

  // Financial summary computation for a group
  const computeGroupBalances = (group) => {
    if (!group) return { totalSpend: 0, yourShare: 0, yourPaid: 0, yourNet: 0, memberBalances: {}, debts: [] };

    let totalSpend = 0;
    let yourPaid = 0;
    let yourShare = 0;
    const memberPaid = {};
    const memberShare = {};

    group.members.forEach((m) => {
      memberPaid[m.id] = 0;
      memberShare[m.id] = 0;
    });

    group.expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      totalSpend += amt;
      memberPaid[exp.paidById] = (memberPaid[exp.paidById] || 0) + amt;
      if (exp.paidById === currentUserId) yourPaid += amt;

      const splitIds = exp.splitBetweenIds?.length ? exp.splitBetweenIds : group.members.map((m) => m.id);
      const perPerson = amt / splitIds.length;

      splitIds.forEach((id) => {
        memberShare[id] = (memberShare[id] || 0) + perPerson;
        if (id === currentUserId) yourShare += perPerson;
      });
    });

    // Factor in settlements
    (group.settlements || []).forEach((set) => {
      const amt = Number(set.amount) || 0;
      // payer paid, so reduces debt (increases balance)
      memberPaid[set.payerId] = (memberPaid[set.payerId] || 0) + amt;
      // payee received, so reduces credit
      memberShare[set.payeeId] = (memberShare[set.payeeId] || 0) + amt;
      if (set.payerId === currentUserId) yourPaid += amt;
      if (set.payeeId === currentUserId) yourShare += amt;
    });

    // Net balance per member: Paid - Share
    const memberNet = {};
    group.members.forEach((m) => {
      memberNet[m.id] = Math.round((memberPaid[m.id] || 0) - (memberShare[m.id] || 0));
    });

    const yourNet = memberNet[currentUserId] || 0;

    // Debt simplification algorithm: who owes whom
    const debtors = [];
    const creditors = [];

    group.members.forEach((m) => {
      const bal = memberNet[m.id];
      if (bal < -0.01) debtors.push({ ...m, amount: Math.abs(bal) });
      else if (bal > 0.01) creditors.push({ ...m, amount: bal });
    });

    const debts = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settledAmount = Math.min(debtor.amount, creditor.amount);

      if (settledAmount > 0.01) {
        debts.push({
          from: debtor,
          to: creditor,
          amount: Math.round(settledAmount),
        });
      }

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount < 0.01) dIdx++;
      if (creditor.amount < 0.01) cIdx++;
    }

    return {
      totalSpend,
      yourShare: Math.round(yourShare),
      yourPaid: Math.round(yourPaid),
      yourNet,
      memberBalances: memberNet,
      debts,
    };
  };

  // Live balances of active group
  const activeGroupFinancials = useMemo(() => {
    return computeGroupBalances(activeGroup);
  }, [activeGroup]);

  // Overview Stats across all groups
  const overallStats = useMemo(() => {
    let totalGroups = groups.length;
    let totalSpend = 0;
    let totalNet = 0;
    let totalSettled = 0;

    groups.forEach((g) => {
      const f = computeGroupBalances(g);
      totalSpend += f.totalSpend;
      totalNet += f.yourNet;
      (g.settlements || []).forEach((s) => {
        totalSettled += Number(s.amount || 0);
      });
    });

    return {
      totalGroups,
      totalSpend,
      totalNet,
      totalSettled,
    };
  }, [groups]);

  // Filter groups in overview list
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        !searchQuery.trim() ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "all" ||
        g.category.toLowerCase().includes(filterCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [groups, searchQuery, filterCategory]);

  // Open Add Expense modal
  const handleOpenAddExpense = () => {
    if (!activeGroup) return;
    setNewExpenseForm({
      title: "",
      amount: "",
      category: "General",
      paidById: currentUserId,
      date: new Date().toISOString().split("T")[0],
      splitMode: "equal",
      selectedMemberIds: activeGroup.members.map((m) => m.id),
    });
    setShowAddExpenseModal(true);
  };

  // Submit Add Expense
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!newExpenseForm.title.trim() || !newExpenseForm.amount) {
      toast.error("Please enter expense title and valid amount.");
      return;
    }

    const amt = parseFloat(newExpenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    const newExpense = {
      id: `exp-${Date.now()}`,
      title: newExpenseForm.title.trim(),
      amount: amt,
      category: newExpenseForm.category,
      paidById: newExpenseForm.paidById,
      date: newExpenseForm.date || new Date().toISOString().split("T")[0],
      splitBetweenIds:
        newExpenseForm.selectedMemberIds.length > 0
          ? newExpenseForm.selectedMemberIds
          : activeGroup.members.map((m) => m.id),
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          expenses: [newExpense, ...g.expenses],
        };
      })
    );

    toast.success(`Logged "${newExpense.title}" of ${formatAmount ? formatAmount(amt) : `${currencySymbol}${amt}`}!`);
    setShowAddExpenseModal(false);
  };

  // Delete Expense
  const handleDeleteExpense = (expId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          expenses: g.expenses.filter((e) => e.id !== expId),
        };
      })
    );
    toast.success("Expense removed from group.");
  };

  // Open Settle Up modal
  const handleOpenSettle = (prefillDebt = null) => {
    if (!activeGroup) return;
    if (prefillDebt) {
      setSettleForm({
        payerId: prefillDebt.from.id,
        payeeId: prefillDebt.to.id,
        amount: prefillDebt.amount,
        paymentMode: "UPI",
        notes: "Settled via Waltrio Automated UPI",
      });
    } else {
      const defaultPayer = activeGroup.members[1]?.id || activeGroup.members[0].id;
      const defaultPayee = currentUserId;
      setSettleForm({
        payerId: defaultPayer,
        payeeId: defaultPayee,
        amount: "",
        paymentMode: "UPI",
        notes: "Direct Settlement",
      });
    }
    setShowSettleModal(true);
  };

  // Record Settlement Payment
  const handleRecordSettlement = (e) => {
    e.preventDefault();
    const amt = parseFloat(settleForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid settlement amount.");
      return;
    }
    if (settleForm.payerId === settleForm.payeeId) {
      toast.error("Payer and payee cannot be the same member.");
      return;
    }

    const payer = activeGroup.members.find((m) => m.id === settleForm.payerId);
    const payee = activeGroup.members.find((m) => m.id === settleForm.payeeId);

    const newSettlement = {
      id: `set-${Date.now()}`,
      payerId: settleForm.payerId,
      payeeId: settleForm.payeeId,
      payerName: payer?.name || "Member",
      payeeName: payee?.name || "Member",
      amount: amt,
      paymentMode: settleForm.paymentMode,
      date: new Date().toISOString().split("T")[0],
      notes: settleForm.notes,
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          settlements: [newSettlement, ...(g.settlements || [])],
        };
      })
    );

    toast.success(`Payment recorded: ${payer?.name} paid ${payee?.name} ${formatAmount ? formatAmount(amt) : `${currencySymbol}${amt}`}!`);
    setShowSettleModal(false);
  };

  // Create New Group
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) {
      toast.error("Please enter a group name.");
      return;
    }

    const initialMembers = [
      { id: "m-1", name: "You", email: user?.email || "you@example.com", isUser: true, color: "#4f46e5" },
    ];

    const newGrp = {
      id: `group-${Date.now()}`,
      name: newGroupForm.name.trim(),
      category: "General",
      emoji: newGroupForm.emoji || "👥",
      description: newGroupForm.description || "Shared group for tracking and splitting expenses.",
      currency: "INR",
      createdAt: new Date().toISOString().split("T")[0],
      members: initialMembers,
      expenses: [],
      settlements: [],
    };

    setGroups((prev) => [newGrp, ...prev]);
    toast.success(`Group "${newGrp.name}" created successfully!`);
    setShowCreateGroupModal(false);
    setActiveGroupId(newGrp.id);
  };

  // Open Invite Modal
  const handleOpenInviteModal = () => {
    setInviteForm({ email: "", name: "" });
    setCopiedLink(false);
    setShowInviteModal(true);
  };

  // Copy Invite Link
  const handleCopyInviteLink = () => {
    const link = `https://waltrio.com/split?group=${activeGroup?.id || "demo"}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Group invitation link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send Email Invite
  const handleSendInvite = (e) => {
    e.preventDefault();
    const email = inviteForm.email.trim();
    if (!email) {
      toast.error("Please enter a valid receiver email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!activeGroup) return;

    // Check if email already in members
    const exists = activeGroup.members.some(
      (m) => m.email?.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      toast.error("This email is already a member of this group.");
      return;
    }

    const memberName = inviteForm.name.trim() || email.split("@")[0];
    const colors = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#3b82f6", "#6366f1"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newMember = {
      id: `m-inv-${Date.now()}`,
      name: memberName,
      email: email,
      isUser: false,
      color: randomColor,
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          members: [...g.members, newMember],
        };
      })
    );

    toast.success(`Invitation sent to ${email}! Added to group.`);
    setInviteForm({ email: "", name: "" });
  };

  return (
    <Container fluid className="ur-groups-container px-3 px-md-4 py-3">
      {/* ===================================================================
          1. GROUP DETAIL VIEW (When a group is opened)
          =================================================================== */}
      {activeGroup ? (
        <div>
          {/* Back Button Bar */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button
              type="button"
              onClick={() => setActiveGroupId(null)}
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 rounded-10px px-3 py-2 fw-600 fs-13px"
            >
              <FiArrowLeft size={14} />
              <span>Back to Groups</span>
            </button>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleOpenInviteModal}
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 rounded-10px px-3 py-2 fw-600 fs-13px"
              >
                <FiUserPlus size={13} />
                <span>Invite Members</span>
              </button>
            </div>
          </div>

          {/* Group Detail Executive Header Card */}
          <div className="ur-group-detail-card">
            <div className="ur-detail-header-flex">
              <div className="ur-detail-title-group">
                <div className="ur-detail-avatar-box">
                  {activeGroup.emoji || "👥"}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h2 className="ur-detail-title mb-0">{activeGroup.name}</h2>
                    <span className="badge rounded-pill bg-light text-secondary border px-2 py-1 fs-11px fw-600">
                      {activeGroup.members.length} Members
                    </span>
                  </div>
                  <p className="ur-detail-desc mb-0">
                    {activeGroup.description || "Shared group for tracking and splitting expenses evenly."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  variant="light"
                  onClick={() => handleOpenSettle()}
                  className="rounded-12px px-3 py-2 fw-700 fs-13px d-inline-flex align-items-center gap-2 border shadow-sm"
                  style={{ backgroundColor: "#ffffff", color: "#1e1b4b" }}
                >
                  <FiRepeat size={15} />
                  <span>Settle Up</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={handleOpenAddExpense}
                  className="rounded-12px px-3 py-2 fw-700 fs-13px d-inline-flex align-items-center gap-2 border-0 shadow-sm"
                  style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
                >
                  <FiPlus size={16} strokeWidth={2.5} />
                  <span>Add Expense</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Group 3 Live Financial Summary Cards */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={4}>
              <div className="ur-detail-stat-box">
                <div className="ur-detail-stat-top">
                  <div>
                    <div className="ur-card-num-label">Total Outlay</div>
                    <div className="fs-20px fw-800 text-dark">
                      {formatAmount ? formatAmount(activeGroupFinancials.totalSpend) : `${currencySymbol}${activeGroupFinancials.totalSpend.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="ur-detail-stat-icon-wrap" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                    <IoWalletOutline size={20} />
                  </div>
                </div>
                <div className="fs-12px text-muted">
                  {activeGroup.expenses.length} shared expense{activeGroup.expenses.length === 1 ? "" : "s"} logged
                </div>
              </div>
            </Col>

            <Col xs={12} sm={4}>
              <div className="ur-detail-stat-box">
                <div className="ur-detail-stat-top">
                  <div>
                    <div className="ur-card-num-label">Your Share</div>
                    <div className="fs-20px fw-800 text-primary">
                      {formatAmount ? formatAmount(activeGroupFinancials.yourShare) : `${currencySymbol}${activeGroupFinancials.yourShare.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="ur-detail-stat-icon-wrap" style={{ backgroundColor: "#ecfeff", color: "#0891b2" }}>
                    <FiDollarSign size={20} />
                  </div>
                </div>
                <div className="fs-12px text-muted">
                  You paid {formatAmount ? formatAmount(activeGroupFinancials.yourPaid) : `${currencySymbol}${activeGroupFinancials.yourPaid.toLocaleString()}`}
                </div>
              </div>
            </Col>

            <Col xs={12} sm={4}>
              <div className="ur-detail-stat-box">
                <div className="ur-detail-stat-top">
                  <div>
                    <div className="ur-card-num-label">Your Net Balance</div>
                    <div
                      className={`fs-20px fw-800 ${
                        activeGroupFinancials.yourNet > 0
                          ? "text-success"
                          : activeGroupFinancials.yourNet < 0
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    >
                      {activeGroupFinancials.yourNet > 0
                        ? `+${formatAmount ? formatAmount(activeGroupFinancials.yourNet) : `${currencySymbol}${activeGroupFinancials.yourNet.toLocaleString()}`}`
                        : activeGroupFinancials.yourNet < 0
                        ? `-${formatAmount ? formatAmount(Math.abs(activeGroupFinancials.yourNet)) : `${currencySymbol}${Math.abs(activeGroupFinancials.yourNet).toLocaleString()}`}`
                        : "Settled"}
                    </div>
                  </div>
                  <div
                    className="ur-detail-stat-icon-wrap"
                    style={{
                      backgroundColor: activeGroupFinancials.yourNet >= 0 ? "#ecfdf5" : "#fff1f2",
                      color: activeGroupFinancials.yourNet >= 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {activeGroupFinancials.yourNet >= 0 ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
                  </div>
                </div>
                <div className="fs-12px text-muted">
                  {activeGroupFinancials.yourNet > 0
                    ? "You are owed by others"
                    : activeGroupFinancials.yourNet < 0
                    ? "You owe money to group"
                    : "Zero pending dues"}
                </div>
              </div>
            </Col>
          </Row>

          {/* Modern Group Tabs Navigation with Badge Counters */}
          <div className="ur-modern-tabs">
            <button
              type="button"
              onClick={() => setActiveTab("expenses")}
              className={`ur-modern-tab-btn ${activeTab === "expenses" ? "active" : ""}`}
            >
              <FiDollarSign size={15} />
              <span>Expenses</span>
              <span className="ur-tab-counter-badge">{activeGroup.expenses.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("debts")}
              className={`ur-modern-tab-btn ${activeTab === "debts" ? "active" : ""}`}
            >
              <FiRepeat size={15} />
              <span>Who Owes Whom</span>
              <span className="ur-tab-counter-badge">{activeGroupFinancials.debts.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`ur-modern-tab-btn ${activeTab === "members" ? "active" : ""}`}
            >
              <FiUsers size={15} />
              <span>Members</span>
              <span className="ur-tab-counter-badge">{activeGroup.members.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settlements")}
              className={`ur-modern-tab-btn ${activeTab === "settlements" ? "active" : ""}`}
            >
              <FiCheckCircle size={15} />
              <span>Settlements</span>
              <span className="ur-tab-counter-badge">{activeGroup.settlements?.length || 0}</span>
            </button>
          </div>

          {/* ===============================================================
              TAB 1: EXPENSES LIST
              =============================================================== */}
          {activeTab === "expenses" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 fs-15px text-dark mb-0">Shared Expenses History</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleOpenAddExpense}
                  className="rounded-8px px-3 py-2 fw-600 fs-13px d-flex align-items-center gap-2"
                >
                  <FiPlus size={14} />
                  <span>Add Expense</span>
                </Button>
              </div>

              {activeGroup.expenses.length === 0 ? (
                <Card className="border-0 bg-white rounded-16px shadow-sm text-center p-5">
                  <div style={{ fontSize: "40px" }} className="mb-2">🧾</div>
                  <h6 className="fw-700 text-dark">No Expenses Logged Yet</h6>
                  <p className="text-muted fs-13px max-w-400 mx-auto mb-3">
                    Start splitting costs with your friends. Add villa bookings, food bills, or shared groceries.
                  </p>
                  <div>
                    <Button variant="primary" size="sm" onClick={handleOpenAddExpense} className="rounded-10px px-3 py-2 fw-600">
                      Add First Expense
                    </Button>
                  </div>
                </Card>
              ) : (
                activeGroup.expenses.map((exp) => {
                  const payer = activeGroup.members.find((m) => m.id === exp.paidById);
                  const isYou = exp.paidById === currentUserId;
                  const splitCount = exp.splitBetweenIds?.length || activeGroup.members.length;
                  const yourShare = exp.splitBetweenIds?.includes(currentUserId)
                    ? exp.amount / splitCount
                    : 0;

                  return (
                    <div key={exp.id} className="ur-group-expense-item">
                      <div className="d-flex align-items-center gap-3">
                        <div className="ur-expense-icon-box">
                          {exp.category === "Accommodation" ? "🏨" : exp.category === "Food & Dining" ? "🍽️" : exp.category === "Transport" ? "🚗" : "🧾"}
                        </div>
                        <div>
                          <div className="fw-700 fs-14px text-dark">{exp.title}</div>
                          <div className="fs-12px text-muted d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-600" style={{ color: payer?.color || "#4f46e5" }}>
                              {isYou ? "You paid" : `${payer?.name || "Member"} paid`}
                            </span>
                            <span>•</span>
                            <span>{exp.date}</span>
                            <span>•</span>
                            <span>Split among {splitCount} people</span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="text-end">
                          <div className="fw-800 fs-15px text-dark">
                            {formatAmount ? formatAmount(exp.amount) : `${currencySymbol}${exp.amount.toLocaleString()}`}
                          </div>
                          <div className="fs-12px text-muted">
                            {isYou ? (
                              <span className="text-success fw-600">
                                you lent {formatAmount ? formatAmount(exp.amount - yourShare) : `${currencySymbol}${(exp.amount - yourShare).toFixed(0)}`}
                              </span>
                            ) : yourShare > 0 ? (
                              <span className="text-danger fw-600">
                                your share {formatAmount ? formatAmount(yourShare) : `${currencySymbol}${yourShare.toFixed(0)}`}
                              </span>
                            ) : (
                              <span>not involved</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="btn btn-sm text-secondary p-1 border-0 hover-danger"
                          title="Delete expense"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 2: WHO OWES WHOM (DEBTS MATRIX & QUICK SETTLE)
              =============================================================== */}
          {activeTab === "debts" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-700 fs-15px text-dark mb-0">Automated Simplified Settlements</h6>
                  <p className="fs-13px text-muted mb-0">
                    Waltrio combines all group expenses to calculate minimum transactions to settle all debts.
                  </p>
                </div>
              </div>

              {activeGroupFinancials.debts.length === 0 ? (
                <Card className="border-0 bg-white rounded-16px shadow-sm text-center p-5">
                  <div style={{ fontSize: "40px" }} className="mb-2">🎉</div>
                  <h6 className="fw-700 text-dark">Everyone is Settled Up!</h6>
                  <p className="text-muted fs-13px max-w-400 mx-auto mb-0">
                    No outstanding debts remain in this group. All expenses have been settled evenly.
                  </p>
                </Card>
              ) : (
                activeGroupFinancials.debts.map((debt, idx) => {
                  const isYouPayer = debt.from.id === currentUserId;
                  const isYouPayee = debt.to.id === currentUserId;

                  return (
                    <div key={idx} className="ur-debt-card">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="ur-member-pill">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: debt.from.color || "#4f46e5",
                            }}
                          />
                          {isYouPayer ? "You" : debt.from.name}
                        </span>

                        <span className="text-muted fs-13px fw-600">owes</span>

                        <span className="ur-member-pill">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: debt.to.color || "#10b981",
                            }}
                          />
                          {isYouPayee ? "You" : debt.to.name}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="fw-800 fs-16px text-dark">
                          {formatAmount ? formatAmount(debt.amount) : `${currencySymbol}${debt.amount.toLocaleString()}`}
                        </div>

                        <Button
                          variant={isYouPayer ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => handleOpenSettle(debt)}
                          className="rounded-8px px-3 py-2 fw-600 fs-12px d-flex align-items-center gap-2"
                        >
                          <FiCheck size={14} />
                          <span>{isYouPayer ? "Pay Now" : "Record Settlement"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 3: MEMBERS LIST
              =============================================================== */}
          {activeTab === "members" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 fs-15px text-dark mb-0">Group Members ({activeGroup.members.length})</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleOpenInviteModal}
                  className="rounded-8px px-3 py-2 fw-600 fs-13px d-flex align-items-center gap-2"
                >
                  <FiUserPlus size={14} />
                  <span>Invite via Email</span>
                </Button>
              </div>

              <Row className="g-3">
                {activeGroup.members.map((m) => {
                  const net = activeGroupFinancials.memberBalances[m.id] || 0;
                  return (
                    <Col key={m.id} xs={12} sm={6}>
                      <Card className="border-0 bg-white rounded-14px p-3 shadow-sm h-100">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: m.color || "#4f46e5",
                                color: "#ffffff",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "15px",
                              }}
                            >
                              {m.name[0]}
                            </div>
                            <div>
                              <div className="fw-700 fs-13px text-dark d-flex align-items-center gap-2">
                                <span>{m.name}</span>
                                {m.isUser && (
                                  <Badge bg="primary-subtle" className="text-primary fw-600 fs-10px">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="fs-12px text-muted">{m.email}</div>
                            </div>
                          </div>

                          <div className="text-end">
                            <div
                              className={`fw-700 fs-13px ${
                                net > 0 ? "text-success" : net < 0 ? "text-danger" : "text-muted"
                              }`}
                            >
                              {net > 0
                                ? `gets ${formatAmount ? formatAmount(net) : `${currencySymbol}${net}`}`
                                : net < 0
                                ? `owes ${formatAmount ? formatAmount(Math.abs(net)) : `${currencySymbol}${Math.abs(net)}`}`
                                : "settled up"}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {/* ===============================================================
              TAB 4: SETTLEMENTS HISTORY
              =============================================================== */}
          {activeTab === "settlements" && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-700 fs-15px text-dark mb-0">Completed Settlements History</h6>
              </div>

              {!activeGroup.settlements || activeGroup.settlements.length === 0 ? (
                <Card className="border-0 bg-white rounded-16px shadow-sm text-center p-5">
                  <div style={{ fontSize: "36px" }} className="mb-2">🤝</div>
                  <h6 className="fw-700 text-dark">No Settlements Recorded Yet</h6>
                  <p className="text-muted fs-13px max-w-400 mx-auto mb-0">
                    When group members pay each other back using UPI or cash, record them here to settle dues.
                  </p>
                </Card>
              ) : (
                activeGroup.settlements.map((set) => (
                  <div key={set.id} className="ur-debt-card">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          backgroundColor: "#ecfdf5",
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FiCheckCircle size={18} />
                      </div>
                      <div>
                        <div className="fw-700 fs-13px text-dark">
                          {set.payerName} paid {set.payeeName}
                        </div>
                        <div className="fs-12px text-muted">
                          {set.date} • {set.paymentMode || "UPI"} • {set.notes}
                        </div>
                      </div>
                    </div>

                    <div className="fw-800 fs-15px text-success">
                      {formatAmount ? formatAmount(set.amount) : `${currencySymbol}${set.amount}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* ===================================================================
            2. ALL GROUPS LIST & OVERVIEW DASHBOARD VIEW
            =================================================================== */
        <div>
          {/* Top Header Row */}
          <div className="ur-groups-header-wrap">
            <div>
              <h2 className="ur-groups-title">Group &amp; Split Expenses</h2>
              <p className="ur-groups-desc">
                Split vacation bookings, apartment rent, and dinners evenly with friends with automated UPI calculations.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setNewGroupForm({ name: "", emoji: "✈️", description: "" });
                setShowCreateGroupModal(true);
              }}
              className="rounded-12px px-3 py-2 fw-700 fs-13px d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
            >
              <FiPlus size={16} strokeWidth={2.5} />
              <span>Create New Group</span>
            </Button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="ur-groups-toolbar">
            <div className="ur-groups-search-box">
              <FiSearch size={16} className="ur-groups-search-icon" />
              <input
                type="text"
                placeholder="Search groups by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ur-groups-search-input"
              />
            </div>

            <div className="d-flex align-items-center gap-2 overflow-auto pb-1 pb-sm-0">
              <button
                type="button"
                onClick={() => setFilterCategory("all")}
                className={`btn btn-sm rounded-10px px-3 py-2 fw-600 fs-12px ${
                  filterCategory === "all" ? "btn-dark text-white" : "btn-light border text-secondary"
                }`}
              >
                All
              </button>
              {GROUP_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.name)}
                  className={`btn btn-sm rounded-10px px-3 py-2 fw-600 fs-12px text-nowrap ${
                    filterCategory === cat.name ? "btn-dark text-white" : "btn-light border text-secondary"
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Cards Grid */}
          <Row className="g-3">
            {filteredGroups.map((group) => {
              const fin = computeGroupBalances(group);
              return (
                <Col key={group.id} xs={12} sm={6} lg={4}>
                  <div
                    onClick={() => setActiveGroupId(group.id)}
                    className="ur-premium-group-card"
                  >
                    <div>
                      <div className="ur-group-card-top">
                        <div className="ur-group-icon-avatar">{group.emoji || "👥"}</div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                            <h5 className="ur-group-meta-title text-truncate mb-0">
                              {group.name}
                            </h5>
                            <span className="badge rounded-pill bg-light text-secondary border px-2 py-1 fs-11px fw-600 flex-shrink-0">
                              {group.members.length} members
                            </span>
                          </div>
                          <p className="ur-group-meta-desc">
                            {group.description || "Shared group for tracking and splitting expenses."}
                          </p>
                        </div>
                      </div>

                      <div className="ur-group-card-numbers">
                        <div>
                          <div className="ur-card-num-label">Total Outlay</div>
                          <div className="ur-card-num-val">
                            {formatAmount ? formatAmount(fin.totalSpend) : `${currencySymbol}${fin.totalSpend.toLocaleString()}`}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="ur-card-num-label">Your Balance</div>
                          <div
                            className={`ur-balance-pill ${
                              fin.yourNet > 0 ? "owed" : fin.yourNet < 0 ? "owe" : "settled"
                            }`}
                          >
                            {fin.yourNet > 0
                              ? `+${formatAmount ? formatAmount(fin.yourNet) : `${currencySymbol}${fin.yourNet}`}`
                              : fin.yourNet < 0
                              ? `-${formatAmount ? formatAmount(Math.abs(fin.yourNet)) : `${currencySymbol}${Math.abs(fin.yourNet)}`}`
                              : "Settled"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ur-group-card-footer">
                      {/* Avatar Stack */}
                      <div className="ur-avatar-stack">
                        {group.members.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="ur-avatar-stack-item"
                            style={{ backgroundColor: m.color || "#4f46e5" }}
                            title={m.name}
                          >
                            {m.name[0]}
                          </div>
                        ))}
                        {group.members.length > 4 && (
                          <div className="ur-avatar-stack-more">
                            +{group.members.length - 4}
                          </div>
                        )}
                      </div>

                      <span className="ur-card-link-btn">
                        <span>View Group</span>
                        <FiArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* ===================================================================
          MODAL 1: CREATE GROUP (Clean, simplified fields)
          =================================================================== */}
      <Modal
        show={showCreateGroupModal}
        onHide={() => setShowCreateGroupModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 fs-17px text-dark">
            Create Shared Group
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateGroup}>
          <Modal.Body className="pt-2">
            <p className="text-muted fs-13px mb-3">
              Set up a shared group to track and split expenses automatically.
            </p>

            {/* Select Emoji */}
            <Form.Group className="mb-3">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Choose Group Icon
              </Form.Label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewGroupForm((p) => ({ ...p, emoji }))}
                    className="btn btn-sm rounded-10px p-2 fs-16px"
                    style={{
                      backgroundColor: newGroupForm.emoji === emoji ? "#eef2ff" : "#f8fafc",
                      border: newGroupForm.emoji === emoji ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </Form.Group>

            {/* Group Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Group Name *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Goa Trip, Flat 402, Weekend Outing"
                value={newGroupForm.name}
                onChange={(e) => setNewGroupForm((p) => ({ ...p, name: e.target.value }))}
                className="rounded-10px fs-13px"
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-2">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Description (Optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief notes about this group..."
                value={newGroupForm.description}
                onChange={(e) => setNewGroupForm((p) => ({ ...p, description: e.target.value }))}
                className="rounded-10px fs-13px"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowCreateGroupModal(false)} className="rounded-10px px-3 fw-600">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="rounded-10px px-4 fw-700" style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}>
              Create Group
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 2: ADD EXPENSE TO GROUP
          =================================================================== */}
      <Modal
        show={showAddExpenseModal}
        onHide={() => setShowAddExpenseModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 fs-17px text-dark">
            Log Shared Expense
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveExpense}>
          <Modal.Body className="pt-2">
            <p className="text-muted fs-13px mb-3">
              Add a cost paid by any member and choose how to split it.
            </p>

            <Form.Group className="mb-3">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Expense Title *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Resort Booking, Dinner, Groceries"
                value={newExpenseForm.title}
                onChange={(e) => setNewExpenseForm((p) => ({ ...p, title: e.target.value }))}
                className="rounded-10px fs-13px"
                required
              />
            </Form.Group>

            <Row className="g-2 mb-3">
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Amount ({currencySymbol}) *
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpenseForm.amount}
                  onChange={(e) => setNewExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                  className="rounded-10px fs-13px"
                  required
                />
              </Col>
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Category
                </Form.Label>
                <Form.Select
                  value={newExpenseForm.category}
                  onChange={(e) => setNewExpenseForm((p) => ({ ...p, category: e.target.value }))}
                  className="rounded-10px fs-13px"
                >
                  <option value="General">🧾 General</option>
                  <option value="Food & Dining">🍽️ Food & Dining</option>
                  <option value="Accommodation">🏨 Accommodation</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Entertainment">🎉 Entertainment</option>
                  <option value="Utilities">💡 Utilities</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2 mb-3">
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Paid By
                </Form.Label>
                <Form.Select
                  value={newExpenseForm.paidById}
                  onChange={(e) => setNewExpenseForm((p) => ({ ...p, paidById: e.target.value }))}
                  className="rounded-10px fs-13px"
                >
                  {activeGroup?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isUser ? "You" : m.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={newExpenseForm.date}
                  onChange={(e) => setNewExpenseForm((p) => ({ ...p, date: e.target.value }))}
                  className="rounded-10px fs-13px"
                />
              </Col>
            </Row>

            {/* Split Members Checklist */}
            <Form.Group className="mb-2">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1 d-flex justify-content-between">
                <span>Split Equally Between ({newExpenseForm.selectedMemberIds.length} Members)</span>
              </Form.Label>
              <div className="p-2 rounded-12px border bg-light-subtle d-flex flex-column gap-2">
                {activeGroup?.members.map((m) => {
                  const isChecked = newExpenseForm.selectedMemberIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setNewExpenseForm((prev) => {
                          const exists = prev.selectedMemberIds.includes(m.id);
                          const next = exists
                            ? prev.selectedMemberIds.filter((id) => id !== m.id)
                            : [...prev.selectedMemberIds, m.id];
                          return { ...prev, selectedMemberIds: next };
                        });
                      }}
                      className="d-flex align-items-center justify-content-between p-2 px-2 rounded-8px cursor-pointer"
                      style={{ backgroundColor: isChecked ? "#ffffff" : "transparent" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="form-check-input mt-0"
                        />
                        <span className="fs-13px fw-600 text-dark">{m.name}</span>
                      </div>
                      {isChecked && newExpenseForm.amount && (
                        <span className="fs-12px text-muted fw-600">
                          {currencySymbol}
                          {(
                            parseFloat(newExpenseForm.amount) /
                            (newExpenseForm.selectedMemberIds.length || 1)
                          ).toFixed(0)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowAddExpenseModal(false)} className="rounded-10px px-3 fw-600">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="rounded-10px px-4 fw-700" style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}>
              Save &amp; Split
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 3: SETTLE UP / RECORD PAYMENT
          =================================================================== */}
      <Modal
        show={showSettleModal}
        onHide={() => setShowSettleModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 fs-17px text-dark">
            Record Settlement Payment
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRecordSettlement}>
          <Modal.Body className="pt-2">
            <p className="text-muted fs-13px mb-3">
              Mark a debt as paid via UPI, Cash, or Net Banking to balance group books.
            </p>

            <Row className="g-2 mb-3">
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Payer (Who Paid)
                </Form.Label>
                <Form.Select
                  value={settleForm.payerId}
                  onChange={(e) => setSettleForm((p) => ({ ...p, payerId: e.target.value }))}
                  className="rounded-10px fs-13px"
                >
                  {activeGroup?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isUser ? "You" : m.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                  Payee (Who Received)
                </Form.Label>
                <Form.Select
                  value={settleForm.payeeId}
                  onChange={(e) => setSettleForm((p) => ({ ...p, payeeId: e.target.value }))}
                  className="rounded-10px fs-13px"
                >
                  {activeGroup?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isUser ? "You" : m.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Amount ({currencySymbol}) *
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="0.00"
                value={settleForm.amount}
                onChange={(e) => setSettleForm((p) => ({ ...p, amount: e.target.value }))}
                className="rounded-10px fs-14px fw-700"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Payment Mode
              </Form.Label>
              <Form.Select
                value={settleForm.paymentMode}
                onChange={(e) => setSettleForm((p) => ({ ...p, paymentMode: e.target.value }))}
                className="rounded-10px fs-13px"
              >
                <option value="UPI">⚡ UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Cash">💵 Cash</option>
                <option value="Bank Transfer">🏦 IMPS / NEFT / Bank Transfer</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
                Notes
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Paid via GPay UPI transaction"
                value={settleForm.notes}
                onChange={(e) => setSettleForm((p) => ({ ...p, notes: e.target.value }))}
                className="rounded-10px fs-13px"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowSettleModal(false)} className="rounded-10px px-3 fw-600">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="rounded-10px px-4 fw-700" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}>
              Confirm Settlement
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 4: INVITE MEMBERS (EXECUTIVE SAAS DESIGN)
          =================================================================== */}
      <Modal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        centered
        className="ur-invite-modal"
      >
        <Modal.Header closeButton className="border-0 px-4 pt-4 pb-2">
          <div className="d-flex align-items-center gap-3">
            <div className="ur-invite-header-icon">
              <FiUserPlus size={20} />
            </div>
            <div>
              <Modal.Title className="fw-800 fs-17px text-dark mb-1">
                Invite to {activeGroup?.name}
              </Modal.Title>
              <div className="text-muted fs-12px">
                Add friends by email to split expenses together
              </div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          {/* Quick Email Invite Input Bar */}
          <Form onSubmit={handleSendInvite} className="mb-3">
            <Form.Label className="fs-12px fw-700 text-uppercase text-secondary mb-1">
              Invite by Email
            </Form.Label>
            <div className="d-flex gap-2">
              <div className="position-relative flex-grow-1">
                <FiMail
                  size={15}
                  className="position-absolute text-muted"
                  style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <Form.Control
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-12px fs-13px"
                  style={{ paddingLeft: "38px", height: "42px" }}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="rounded-12px px-3 py-2 fw-700 fs-13px text-nowrap d-inline-flex align-items-center gap-2 shadow-sm"
                style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5", height: "42px" }}
              >
                <FiSend size={13} />
                <span>Send Invite</span>
              </Button>
            </div>
          </Form>

          {/* Shareable Link Card */}
          <div className="ur-invite-link-card mb-3">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="rounded-10px bg-white border d-flex align-items-center justify-content-center text-primary flex-shrink-0"
                style={{ width: "36px", height: "36px" }}
              >
                <FiShare2 size={15} />
              </div>
              <div className="overflow-hidden">
                <div className="fw-700 fs-13px text-dark">Share via link</div>
                <div className="text-muted fs-12px text-truncate">
                  Anyone with the link can view and join
                </div>
              </div>
            </div>

            <Button
              variant={copiedLink ? "success" : "light"}
              size="sm"
              onClick={handleCopyInviteLink}
              className="rounded-9px px-3 py-2 fw-600 fs-12px text-nowrap border d-inline-flex align-items-center gap-1 flex-shrink-0"
              style={{ backgroundColor: copiedLink ? "#10b981" : "#ffffff", color: copiedLink ? "#ffffff" : "#0f172a" }}
            >
              {copiedLink ? <FiCheck size={13} /> : <FiCopy size={13} />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </Button>
          </div>

          {/* Members List with clean flat rows */}
          <div className="pt-2">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fs-12px fw-700 text-uppercase text-secondary">
                Group Members
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 fs-11px fw-600">
                {activeGroup?.members.length} members
              </span>
            </div>

            <div
              className="d-flex flex-column gap-1 overflow-auto pe-1"
              style={{ maxHeight: "160px" }}
            >
              {activeGroup?.members.map((m) => (
                <div key={m.id} className="ur-invite-member-row">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: m.color || "#4f46e5",
                        color: "#ffffff",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <div className="fs-13px fw-700 text-dark text-truncate d-flex align-items-center gap-2">
                        <span>{m.name}</span>
                        {m.isUser && (
                          <span className="badge bg-primary-subtle text-primary border-0 fs-10px py-1 px-2 fw-600">
                            You
                          </span>
                        )}
                      </div>
                      <div className="fs-11px text-muted text-truncate">{m.email}</div>
                    </div>
                  </div>

                  <span className="fs-11px fw-600 text-muted ms-2 flex-shrink-0">
                    {m.isUser ? "Owner" : "Member"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

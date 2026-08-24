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
  FiTarget,
  FiPlus,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiArrowUpRight,
  FiAward,
  FiHeart,
  FiSmile,
  FiShield,
} from "react-icons/fi";
import { IoShieldCheckmarkOutline, IoAirplaneOutline, IoCarSportOutline, IoHomeOutline, IoSparklesOutline } from "react-icons/io5";
import CommonDataTable from "../../components/common/DataTable";

// Initial Mock Dataset for Savings Goals
const INITIAL_GOALS = [
  {
    id: "GOL-01",
    name: "Emergency Safety Cushion",
    category: "Emergency Fund",
    targetAmount: 300000,
    currentAmount: 255000,
    monthlyTarget: 15000,
    deadline: "2026-12-31",
    status: "In Progress",
    color: "#10b981",
    iconName: "shield",
  },
  {
    id: "GOL-02",
    name: "Hyundai Creta Down Payment",
    category: "Automobile",
    targetAmount: 450000,
    currentAmount: 320000,
    monthlyTarget: 25000,
    deadline: "2027-03-31",
    status: "In Progress",
    color: "#4f46e5",
    iconName: "car",
  },
  {
    id: "GOL-03",
    name: "Europe Summer Holiday 2027",
    category: "Travel & Vacation",
    targetAmount: 250000,
    currentAmount: 115000,
    monthlyTarget: 12000,
    deadline: "2027-06-30",
    status: "In Progress",
    color: "#06b6d4",
    iconName: "airplane",
  },
  {
    id: "GOL-04",
    name: "Home Interior & Renovation",
    category: "Real Estate",
    targetAmount: 200000,
    currentAmount: 200000,
    monthlyTarget: 20000,
    deadline: "2026-08-15",
    status: "Completed",
    color: "#8b5cf6",
    iconName: "home",
  },
  {
    id: "GOL-05",
    name: "Gold & Sovereign Bonds",
    category: "Wealth & Gold",
    targetAmount: 150000,
    currentAmount: 60000,
    monthlyTarget: 10000,
    deadline: "2027-10-31",
    status: "In Progress",
    color: "#f59e0b",
    iconName: "sparkles",
  },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Emergency Fund", label: "Emergency Fund" },
  { value: "Automobile", label: "Automobile & Vehicle" },
  { value: "Travel & Vacation", label: "Travel & Vacation" },
  { value: "Real Estate", label: "Real Estate & Home" },
  { value: "Wealth & Gold", label: "Wealth & Gold" },
  { value: "Retirement", label: "Retirement Nest Egg" },
];

export default function SavingsGoals() {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    name: "",
    category: "Emergency Fund",
    targetAmount: "",
    currentAmount: "",
    monthlyTarget: "",
    deadline: "2027-06-30",
    color: "#4f46e5",
    iconName: "shield",
  });

  const [depositData, setDepositData] = useState({
    amount: "",
    sourceAccount: "HDFC Bank •••• 4091",
    note: "Monthly Auto Savings SIP",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;

    goals.forEach((g) => {
      totalTarget += g.targetAmount;
      totalSaved += g.currentAmount;
      if (g.currentAmount >= g.targetAmount) completedCount++;
    });

    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      overallPct,
      completedCount,
      totalCount: goals.length,
    };
  }, [goals]);

  // Filtered Table Data
  const tableData = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = selectedCategory === "all" || g.category === selectedCategory;
      const matchStat = selectedStatus === "all" || g.status === selectedStatus;
      return matchCat && matchStat;
    });
  }, [goals, selectedCategory, selectedStatus]);

  // Helper Icon Renderer
  const renderGoalIcon = (iconName, color) => {
    const size = 18;
    switch (iconName) {
      case "shield":
        return <IoShieldCheckmarkOutline size={size} color={color} />;
      case "car":
        return <IoCarSportOutline size={size} color={color} />;
      case "airplane":
        return <IoAirplaneOutline size={size} color={color} />;
      case "home":
        return <IoHomeOutline size={size} color={color} />;
      case "sparkles":
        return <IoSparklesOutline size={size} color={color} />;
      default:
        return <FiTarget size={size} color={color} />;
    }
  };

  // ApexChart Options
  const chartOptions = {
    chart: { type: "bar", height: 230, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, columnWidth: "40%", borderRadius: 6 } },
    colors: ["#4f46e5", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: goals.map((g) => g.name.length > 14 ? g.name.slice(0, 14) + "..." : g.name),
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val >= 100000 ? (val / 100000).toFixed(1) + "L" : val / 1000 + "k"}`,
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light", y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` } },
  };

  const chartSeries = [
    { name: "Target Goal (₹)", data: goals.map((g) => g.targetAmount) },
    { name: "Saved to Date (₹)", data: goals.map((g) => g.currentAmount) },
  ];

  // Open Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      category: "Emergency Fund",
      targetAmount: "",
      currentAmount: "",
      monthlyTarget: "",
      deadline: "2027-06-30",
      color: "#4f46e5",
      iconName: "shield",
    });
    setShowAddModal(true);
  };

  const handleOpenDeposit = (goal) => {
    setActiveGoal(goal);
    setDepositData({
      amount: "",
      sourceAccount: "HDFC Bank •••• 4091",
      note: `Contribution towards ${goal.name}`,
    });
    setShowDepositModal(true);
  };

  const handleOpenEdit = (goal) => {
    setActiveGoal(goal);
    setFormData({
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      monthlyTarget: goal.monthlyTarget,
      deadline: goal.deadline,
      color: goal.color,
      iconName: goal.iconName,
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (goal) => {
    setActiveGoal(goal);
    setShowDeleteModal(true);
  };

  // Save Handlers
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    const targetVal = Number(formData.targetAmount);
    const currentVal = Number(formData.currentAmount) || 0;

    const newGoal = {
      id: `GOL-0${goals.length + 1}`,
      name: formData.name,
      category: formData.category,
      targetAmount: targetVal,
      currentAmount: currentVal,
      monthlyTarget: Number(formData.monthlyTarget) || Math.round((targetVal - currentVal) / 12),
      deadline: formData.deadline,
      status: currentVal >= targetVal ? "Completed" : "In Progress",
      color: formData.color,
      iconName: formData.iconName,
    };

    setGoals([...goals, newGoal]);
    setShowAddModal(false);
  };

  const handleSaveDeposit = (e) => {
    e.preventDefault();
    if (!depositData.amount || !activeGoal) return;

    const depAmount = Number(depositData.amount);
    const updatedGoals = goals.map((g) => {
      if (g.id === activeGoal.id) {
        const newTotal = g.currentAmount + depAmount;
        return {
          ...g,
          currentAmount: newTotal,
          status: newTotal >= g.targetAmount ? "Completed" : "In Progress",
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    setShowDepositModal(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeGoal) return;

    const targetVal = Number(formData.targetAmount);
    const currentVal = Number(formData.currentAmount);

    const updatedGoals = goals.map((g) => {
      if (g.id === activeGoal.id) {
        return {
          ...g,
          name: formData.name,
          category: formData.category,
          targetAmount: targetVal,
          currentAmount: currentVal,
          monthlyTarget: Number(formData.monthlyTarget),
          deadline: formData.deadline,
          status: currentVal >= targetVal ? "Completed" : "In Progress",
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (!activeGoal) return;
    setGoals(goals.filter((g) => g.id !== activeGoal.id));
    setShowDeleteModal(false);
  };

  // Table Columns for CommonDataTable
  const columns = [
    {
      name: "Savings Goal & Category",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "240px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: `${row.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderGoalIcon(row.iconName, row.color)}
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.name}</div>
            <div className="text-muted fs-11px">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Progress & Target",
      selector: (row) => (row.currentAmount / row.targetAmount) * 100,
      sortable: true,
      minWidth: "190px",
      cell: (row) => {
        const pct = Math.min(100, Math.round((row.currentAmount / row.targetAmount) * 100));
        return (
          <div style={{ width: "100%" }}>
            <div className="d-flex justify-content-between align-items-center fs-11px mb-1">
              <span className="fw-700 text-dark">₹{row.currentAmount.toLocaleString("en-IN")}</span>
              <span className="text-muted fs-10.5px">of ₹{row.targetAmount.toLocaleString("en-IN")} ({pct}%)</span>
            </div>
            <ProgressBar
              now={pct}
              style={{ height: "6px", backgroundColor: "#f1f5f9" }}
            />
          </div>
        );
      },
    },
    {
      name: "Monthly SIP Pace",
      selector: (row) => row.monthlyTarget,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <span className="fw-700 text-primary fs-12px">
          ₹{Number(row.monthlyTarget).toLocaleString("en-IN")}/mo
        </span>
      ),
    },
    {
      name: "Target Deadline",
      selector: (row) => row.deadline,
      sortable: true,
      width: "130px",
      cell: (row) => <span className="fs-12px text-dark fw-600">{row.deadline}</span>,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className={`ur-status-pill ${row.status === "Completed" ? "success" : "in-progress"}`}>
          {row.status === "Completed" ? (
            <FiCheckCircle size={10} className="me-1" />
          ) : (
            <FiTrendingUp size={10} className="me-1" />
          )}
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "140px",
      right: true,
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-end gap-1">
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn edit"
            onClick={() => handleOpenDeposit(row)}
            title="Deposit Funds"
            style={{ color: "#10b981" }}
          >
            <FiArrowUpRight size={14} />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn view"
            onClick={() => handleOpenEdit(row)}
            title="Edit Goal"
          >
            <FiEdit2 size={13} />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="ur-action-btn delete"
            onClick={() => handleOpenDelete(row)}
            title="Delete Goal"
          >
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
            <span>Savings &amp; Financial Goals</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              {goals.length} Active Targets
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Set dedicated target funds for vacations, vehicles, real estate, and emergency cushions with auto-progress tracking.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            className="btn btn-primary rounded-8px d-flex align-items-center gap-1 fs-12.5px fw-600 px-3 py-2"
            onClick={handleOpenAdd}
          >
            <FiPlus size={15} />
            <span>+ Create New Goal</span>
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
                  <div className="ms-stat-title">Total Target Sum</div>
                  <div className="ms-stat-val text-primary">
                    ₹{metrics.totalTarget.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiTarget size={20} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">{metrics.totalCount} Portfolios</span>
                <span className="ms-stat-sub-text">Cumulative targets</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Saved So Far</div>
                  <div className="ms-stat-val text-success">
                    ₹{metrics.totalSaved.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiDollarSign size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">{metrics.overallPct}% Achieved</span>
                <span className="ms-stat-sub-text">Across all targets</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Remaining Cushion Gap</div>
                  <div className="ms-stat-val text-danger">
                    ₹{metrics.totalRemaining.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiTrendingUp size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">To reach goals</span>
                <span className="ms-stat-sub-text">Within deadlines</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Milestones Completed</div>
                  <div className="ms-stat-val fs-20px">
                    {metrics.completedCount} / {metrics.totalCount} Goals
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiAward size={20} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle">
                <ProgressBar now={metrics.overallPct} className="ms-progress-blue" style={{ height: "6px" }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Analytics Chart + Goals Visual Grid */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={7}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="ms-card-title mb-0">Goal Targets vs Realized Accumulation</h5>
                  <p className="text-muted fs-11px mb-0">Comparison of targets vs saved funds</p>
                </div>
                <div className="d-flex align-items-center gap-3 fs-11px">
                  <span className="d-flex align-items-center gap-1">
                    <span className="ms-legend-square" style={{ backgroundColor: "#4f46e5" }}></span>
                    <span className="fw-600 text-dark">Target</span>
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span className="ms-legend-square" style={{ backgroundColor: "#10b981" }}></span>
                    <span className="fw-600 text-dark">Saved</span>
                  </span>
                </div>
              </div>
              <Chart options={chartOptions} series={chartSeries} type="bar" height={230} />
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="ms-premium-card border-0 h-100">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-1">Top Savings Milestones</h5>
                <p className="text-muted fs-11px mb-3">Priority portfolios sorted by progress</p>

                <div className="d-flex flex-column gap-3">
                  {goals.slice(0, 3).map((g) => {
                    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id} className="p-2 rounded-8px border bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-700 text-dark fs-12px">{g.name}</span>
                          <span className="fw-700 text-primary fs-11.5px">{pct}%</span>
                        </div>
                        <ProgressBar now={pct} style={{ height: "5px" }} />
                        <div className="d-flex justify-content-between align-items-center fs-10.5px text-muted mt-1">
                          <span>Saved: ₹{g.currentAmount.toLocaleString("en-IN")}</span>
                          <span>Target: ₹{g.targetAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-top text-center text-muted fs-11px mt-2">
                💡 Monthly contributions of ₹{goals.reduce((a, b) => a + (b.monthlyTarget || 0), 0).toLocaleString("en-IN")} keep all targets on track.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 4. Active Goal Cards Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="ms-card-title mb-0">Active Savings Portfolio Cards</h5>
        <span className="text-muted fs-12px">{goals.length} Portfolios Managed</span>
      </div>

      <Row className="g-3 mb-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          return (
            <Col key={g.id} xs={12} md={6} xl={4}>
              <Card className="ms-premium-card border-0 h-100 position-relative">
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    {/* Card Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: `${g.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {renderGoalIcon(g.iconName, g.color)}
                        </div>
                        <div>
                          <h6 className="fw-700 text-dark mb-0 fs-13px">{g.name}</h6>
                          <span className="text-muted fs-11px">{g.category}</span>
                        </div>
                      </div>

                      <span className={`ur-status-pill ${g.status === "Completed" ? "success" : "in-progress"}`}>
                        {g.status}
                      </span>
                    </div>

                    {/* Progress Numbers */}
                    <div className="bg-light p-2 rounded-8px my-2">
                      <div className="d-flex justify-content-between align-items-baseline mb-1">
                        <div>
                          <span className="text-muted fs-10.5px">CURRENT SAVED</span>
                          <div className="fw-800 text-success fs-15px">
                            ₹{g.currentAmount.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="text-muted fs-10.5px">TARGET GOAL</span>
                          <div className="fw-700 text-dark fs-13px">
                            ₹{g.targetAmount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      <ProgressBar now={pct} style={{ height: "6px" }} />

                      <div className="d-flex justify-content-between align-items-center fs-10.5px text-muted mt-1">
                        <span>{pct}% Completed</span>
                        <span>Deadline: {g.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-2">
                    <span className="text-muted fs-11px">
                      SIP: <strong className="text-primary">₹{g.monthlyTarget?.toLocaleString("en-IN")}/mo</strong>
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-6px fs-11.5px px-2"
                        onClick={() => handleOpenDeposit(g)}
                      >
                        <FiPlus size={12} /> Deposit
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="ur-action-btn edit"
                        onClick={() => handleOpenEdit(g)}
                        title="Edit Goal"
                      >
                        <FiEdit2 size={12} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 5. Master CommonDataTable */}
      <CommonDataTable
        columns={columns}
        data={tableData}
        keyField="id"
        title="Savings Goals &amp; Milestone Ledger"
        subtitle={`Showing ${tableData.length} active portfolio plans`}
        searchPlaceholder="Search goal name, category..."
        selectableRows={false}
        defaultPageSize={5}
        exportFileName="Savings_Goals_Statement"
        filters={
          <div className="ur-inline-filters">
            {/* Category Filter */}
            <Select
              value={CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)}
              onChange={(opt) => setSelectedCategory(opt ? opt.value : "all")}
              options={CATEGORY_OPTIONS}
              styles={filterSelectStyles}
              isSearchable={false}
            />

            {/* Status Filter */}
            <Select
              value={[
                { value: "all", label: "All Statuses" },
                { value: "In Progress", label: "In Progress" },
                { value: "Completed", label: "Completed" },
              ].find((s) => s.value === selectedStatus)}
              onChange={(opt) => setSelectedStatus(opt ? opt.value : "all")}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "In Progress", label: "In Progress" },
                { value: "Completed", label: "Completed" },
              ]}
              styles={filterSelectStyles}
              isSearchable={false}
            />
          </div>
        }
      />

      {/* ===================================================================
          MODAL 1: CREATE NEW GOAL
          =================================================================== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income"><FiTarget size={16} /></span>
              Create New Savings Target
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Set target amount, monthly pacing, and milestone deadlines for your financial dream.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Goal Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. New Electric Car / Maldives Honeymoon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Select
                    value={CATEGORY_OPTIONS.filter((c) => c.value !== "all").find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={CATEGORY_OPTIONS.filter((c) => c.value !== "all")}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Target Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 500000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="ur-form-input fw-700 text-primary"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Initial Saved / Starting Balance (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Planned Monthly Contribution (₹/mo)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Target Completion Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
              Create Goal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 2: DEPOSIT FUNDS TO GOAL
          =================================================================== */}
      <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)} centered className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income"><FiArrowUpRight size={16} /></span>
              Deposit Funds: {activeGoal?.name}
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Add savings contribution to this target.</p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveDeposit}>
          <Modal.Body className="py-3">
            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Deposit Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                required
                min="100"
                placeholder="e.g. 10000"
                value={depositData.amount}
                onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                className="ur-form-input fw-700 text-success fs-16px"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Source Bank Account</Form.Label>
              <Select
                value={[
                  { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                  { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                  { value: "SBI Bank •••• 1109", label: "SBI Bank •••• 1109" },
                  { value: "PhonePe UPI", label: "PhonePe UPI" },
                  { value: "Cash in Hand", label: "Cash in Hand" },
                ].find((a) => a.value === depositData.sourceAccount)}
                onChange={(opt) => setDepositData({ ...depositData, sourceAccount: opt.value })}
                options={[
                  { value: "HDFC Bank •••• 4091", label: "HDFC Bank •••• 4091" },
                  { value: "ICICI Bank •••• 9821", label: "ICICI Bank •••• 9821" },
                  { value: "SBI Bank •••• 1109", label: "SBI Bank •••• 1109" },
                  { value: "PhonePe UPI", label: "PhonePe UPI" },
                  { value: "Cash in Hand", label: "Cash in Hand" },
                ]}
                styles={formSelectStyles}
                menuPortalTarget={document.body}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="ur-form-label">Note / Reference</Form.Label>
              <Form.Control
                type="text"
                value={depositData.note}
                onChange={(e) => setDepositData({ ...depositData, note: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowDepositModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="success" size="sm" className="rounded-6px px-4">
              Add Deposit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 3: EDIT GOAL
          =================================================================== */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark">Edit Goal ({activeGoal?.id})</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Goal Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category</Form.Label>
                  <Select
                    value={CATEGORY_OPTIONS.filter((c) => c.value !== "all").find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={CATEGORY_OPTIONS.filter((c) => c.value !== "all")}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Target Amount (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    min="1000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="ur-form-input fw-700 text-primary"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Current Saved Balance (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Monthly SIP (₹/mo)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Target Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="ur-form-input"
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
              Update Goal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL 4: DELETE GOAL
          =================================================================== */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm" className="ur-modal">
        <Modal.Body className="text-center p-4">
          <div className="ur-delete-icon-box mx-auto mb-3"><FiTrash2 size={24} color="#ef4444" /></div>
          <h5 className="fw-700 text-dark mb-1">Delete Goal?</h5>
          <p className="text-muted fs-12px mb-3">Are you sure you want to delete <strong>{activeGoal?.name}</strong>?</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="light" size="sm" onClick={() => setShowDeleteModal(false)} className="rounded-6px px-3">Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} className="rounded-6px px-3">Delete</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

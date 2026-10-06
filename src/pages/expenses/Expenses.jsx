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
import { useQueryClient } from "@tanstack/react-query";
import {
  useExpenses,
  useExpenseAnalytics,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "../../hooks/useExpenses";
import { deleteExpense } from "../../api/expenses.api";
import { toast } from "../../lib/toast";
import { useCategories } from "../../context/CategoryContext";
import MonthYearFilter, { MONTHS } from "../../components/common/MonthYearFilter";
import AppDatePicker from "../../components/common/AppDatePicker";

export default function Expenses() {
  const queryClient = useQueryClient();
  const { expenseCategories, getCategoryMeta } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("weekly");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("month");

  const selectedMonthName = useMemo(() => {
    return MONTHS.find((m) => m.value === Number(selectedMonth))?.label || "Month";
  }, [selectedMonth]);

  // Monthly budget limit for the (computed) daily-pace metric.
  const monthlyBudgetLimit = 35000;

  // Translate active filter mode into GET /expenses list query params:
  // ?filter=day&day=3&month=10&year=2026 or ?filter=month&month=10&year=2026 or ?filter=year&year=2026
  const queryParams = useMemo(() => {
    const base = {
      category: selectedCategory,
      status: selectedStatus,
      page,
      limit,
    };
    if (selectedMode === "date" && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length >= 3) {
        return {
          ...base,
          filter: "day",
          day: parts[2],
          month: parts[1],
          year: parts[0],
        };
      }
    }
    if (selectedMode === "year") {
      return {
        ...base,
        filter: "year",
        year: Number(selectedYear),
      };
    }
    return {
      ...base,
      filter: "month",
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear, selectedCategory, selectedStatus, page, limit]);

  // Analytics Query Params: ?filter=month&month=10&year=2026 or ?filter=day&day=3&month=10&year=2026 or ?filter=year&year=2026
  const analyticsParams = useMemo(() => {
    if (selectedMode === "date" && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length >= 3) {
        return {
          filter: "day",
          day: parts[2],
          month: parts[1],
          year: parts[0],
        };
      }
    }
    if (selectedMode === "year") {
      return {
        filter: "year",
        year: Number(selectedYear),
      };
    }
    return {
      filter: "month",
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // ---- Server data (TanStack Query) -------------------------------------
  const {
    data: expensesData,
    isLoading: expensesLoading,
    isError: expensesIsError,
    error: expensesErr,
  } = useExpenses(queryParams);

  React.useEffect(() => {
    if (expensesIsError) {
      console.error("[expenses] request failed:", expensesErr);
      toast.error(expensesErr?.message || "Could not load expenses.");
    }
  }, [expensesIsError, expensesErr]);

  const expenses = useMemo(() => expensesData || [], [expensesData]);
  const totalCount = expensesData?.total ?? expensesData?.pagination?.total ?? expenses.length;

  const { data: analyticsData } = useExpenseAnalytics(analyticsParams);

  // ---- Mutations --------------------------------------------------------
  const { mutate: createExpenseMut, isPending: creating } = useCreateExpense({
    onSuccess: () => {
      toast.success("Expense added successfully.");
      setShowAddModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not add expense."),
  });

  const { mutate: updateExpenseMut, isPending: updating } = useUpdateExpense({
    onSuccess: () => {
      toast.success("Expense updated successfully.");
      setShowEditModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not update expense."),
  });

  const { mutate: deleteExpenseMut } = useDeleteExpense({
    onSuccess: () => {
      toast.success("Expense deleted.");
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not delete expense."),
  });

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

  // Calculate Local Fallback Metrics
  const metrics = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const paid = expenses
      .filter((e) => e.status === "Paid")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const budgetPct = Math.min(100, Math.round((total / monthlyBudgetLimit) * 100));
    const dailyAvg = Math.round(total / 20);

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
      const matchDate =
        selectedMode !== "date" ||
        !selectedDate ||
        item.date === selectedDate ||
        String(item.date).startsWith(selectedDate);
      return matchCat && matchStatus && matchDate;
    });
  }, [expenses, selectedCategory, selectedStatus, selectedMode, selectedDate]);

  // Derive metric cards from GET /expenses/analytics
  const a = analyticsData || {};
  const largestCatName =
    a.largestCostCategory?.category ||
    (typeof a.largestCostCategory === "string" ? a.largestCostCategory : metrics.topCat);
  const largestCatMeta = getCategoryMeta(largestCatName, "expense");

  const cards = {
    total: Number(a.totalOutflow ?? a.totalSpent ?? metrics.total),
    dailyAvg: Number(a.dailyAverageSpend ?? metrics.dailyAvg),
    topCat: largestCatName,
    maxVal: Number(
      a.largestCostCategory?.price ??
        a.largestCostCategory?.total ??
        metrics.maxVal
    ),
    totalEntries: a.totalEntries ?? tableData.length ?? expenses.length,
  };

  // ---- Chart data from GET /expenses/analytics (fallback: compute) ------
  const EXP_DONUT_COLORS = ["#4f46e5", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#06b6d4", "#ef4444", "#d97706"];
  const { trendCats, trendSpent, trendTarget, donutItems } = useMemo(() => {
    const an = analyticsData || {};

    // 1. Weekly Outflow vs Target Limit
    let tCats = [];
    let tSpent = [];
    let tTarget = [];
    const tr = an.weeklyOutflow ?? an.trend ?? an.spending ?? an.weekly ?? an.outflow ?? null;
    if (Array.isArray(tr) && tr.length) {
      tCats = tr.map((p) => p.label ?? (p.week != null ? `Week ${p.week}` : p.name ?? ""));
      tSpent = tr.map((p) => Number(p.actualSpent ?? p.spent ?? p.amount ?? p.value ?? 0));
      tTarget = tr.map((p) => Number(p.targetLimit ?? p.target ?? p.budget ?? 0));
    } else if (expenses.length) {
      // Fallback: Last 6 months of outflow from real records
      const byMonth = {};
      expenses.forEach((e) => {
        const d = new Date(e.date);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth[key] = (byMonth[key] || 0) + (Number(e.amount) || 0);
      });
      const now = new Date();
      for (let k = 5; k >= 0; k--) {
        const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        tCats.push(d.toLocaleString("en-US", { month: "short" }));
        tSpent.push(byMonth[key] || 0);
        tTarget.push(Math.round(monthlyBudgetLimit));
      }
    }

    // 2. Spending Distribution Category Donut
    let dItems = [];
    const distCats =
      an.spendingDistribution?.categories ??
      an.spendingDistribution ??
      an.byCategory ??
      an.categoryShare ??
      an.categories ??
      null;

    if (Array.isArray(distCats) && distCats.length) {
      dItems = distCats.map((it, i) => {
        const catName = it.category ?? it.name ?? it.label ?? "Other";
        const catMeta = getCategoryMeta(catName, "expense");
        return {
          name: catName,
          value: Number(it.percentage ?? it.total ?? it.value ?? 0),
          amount: Number(it.total ?? it.amount ?? 0),
          color: catMeta?.color ?? it.color ?? EXP_DONUT_COLORS[i % EXP_DONUT_COLORS.length],
        };
      });
    } else if (expenses.length) {
      const catMap = {};
      expenses.forEach((e) => {
        catMap[e.category || "Other"] = (catMap[e.category || "Other"] || 0) + (Number(e.amount) || 0);
      });
      const total = Object.values(catMap).reduce((x, y) => x + y, 0) || 1;
      dItems = Object.entries(catMap)
        .sort((x, y) => y[1] - x[1])
        .map(([name, amount], i) => {
          const cat = getCategoryMeta(name, "expense");
          return {
            name,
            value: Math.round((amount / total) * 100),
            amount,
            color: cat?.color ?? EXP_DONUT_COLORS[i % EXP_DONUT_COLORS.length],
          };
        });
    }

    return { trendCats: tCats, trendSpent: tSpent, trendTarget: tTarget, donutItems: dItems };
  }, [analyticsData, expenses, monthlyBudgetLimit, getCategoryMeta]);

  const donutLabels = donutItems.map((d) => d.name);
  const donutColors = donutItems.map((d) => d.color);

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
      categories: trendCats,
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (val) => (val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 ? 1 : 0)}k` : `₹${Math.round(val)}`),
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
    { name: "Spent Outflow", data: trendSpent },
    { name: "Budget Target", data: trendTarget },
  ];

  // ApexChart: Expense Distribution Donut
  const donutOptions = {
    chart: { type: "donut", height: 210, fontFamily: "inherit" },
    labels: donutLabels,
    colors: donutColors.length ? donutColors : ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: true, fontSize: "11px", fontWeight: 600, color: "#64748b", offsetY: -4 },
            value: { show: true, fontSize: "16px", fontWeight: 800, color: "#0f172a", offsetY: 4, formatter: (val) => `${val}%` },
            total: {
              show: true,
              label: "Total",
              fontSize: "10.5px",
              fontWeight: 600,
              color: "#64748b",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    legend: { show: false },
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val}% (₹${((val / 100) * cards.total).toFixed(0)})` },
    },
  };

  const donutSeries = donutItems.map((d) => d.value);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      merchant: "",
      description: "",
      category: expenseCategories[0]?.name || "Food & Dining",
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

  // Exact body the API expects for create (POST) and update (PUT).
  const buildPayload = () => ({
    merchant: formData.merchant,
    note: formData.description,
    category: formData.category,
    amount: Number(formData.amount),
    date: formData.date,
    status: formData.status,
    attachment: formData.receiptImg || null,
  });

  // Submit Add Form -> POST /expenses
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.merchant || !formData.amount) {
      toast.error("Merchant and amount are required.");
      return;
    }
    createExpenseMut(buildPayload());
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
      date: item.date ? String(item.date).slice(0, 10) : "",
      time: item.time,
      status: item.status,
      receipt: item.receipt || "",
      tags: item.tags || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Form -> PUT /expenses/:id
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeExpense) return;
    updateExpenseMut({ id: activeExpense.id, ...buildPayload() });
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setActiveExpense(item);
    setShowDeleteModal(true);
  };

  // Confirm Delete -> DELETE /expenses/:id
  const handleConfirmDelete = () => {
    if (!activeExpense) return;
    deleteExpenseMut(activeExpense.id);
  };

  // Bulk Delete -> DELETE /expenses/:id for each selected row
  const handleBulkDelete = async (ids) => {
    if (!ids?.length) return;
    try {
      await Promise.all(ids.map((id) => deleteExpense(id)));
      toast.success(`${ids.length} expense record(s) deleted.`);
    } catch (err) {
      toast.error(err.message || "Some records could not be deleted.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    }
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
        const catInfo = getCategoryMeta(row.category, "expense");
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
        const catInfo = getCategoryMeta(row.category, "expense");
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
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <span className="fw-600 text-dark fs-11.5px">
          {new Date(row.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
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

        <div className="d-flex flex-wrap align-items-center gap-2">
          <MonthYearFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedDate={selectedDate}
            selectedMode={selectedMode}
            onChangeMonth={setSelectedMonth}
            onChangeYear={setSelectedYear}
            onChangeDate={setSelectedDate}
            onChangeMode={setSelectedMode}
          />
          <Button className="ms-btn-expense" onClick={handleOpenAdd}>
            <FiPlus size={14} />
            <span>Add New Expense</span>
          </Button>
        </div>
      </div>

      {/* ===================================================================
          2. TOP 3 METRICS CARDS (Powered by /expenses/analytics)
          =================================================================== */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} xl={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">
                    Total Outflow ({selectedMode === "date" ? "Day" : "Month"})
                  </div>
                  <div className="ms-stat-val text-danger">
                    ₹{cards.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiArrowDownLeft size={20} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill negative">
                  <FiTrendingDown size={11} /> Outflow
                </span>
                <span className="ms-stat-sub-text">
                  {cards.totalEntries} {cards.totalEntries === 1 ? "entry" : "entries"} recorded
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Daily Average Spend</div>
                  <div className="ms-stat-val">
                    ₹{cards.dailyAvg.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiActivity size={19} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">₹{cards.dailyAvg.toLocaleString("en-IN")}/day</span>
                <span className="ms-stat-sub-text">Calculated average</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Largest Cost Category</div>
                  <div className="ms-stat-val fs-18px text-truncate" style={{ maxWidth: "160px" }}>
                    {cards.topCat}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: largestCatMeta?.bg || "#eef2ff" }}>
                  {largestCatMeta?.icon || <FiHome size={19} color="#4f46e5" />}
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">
                  ₹{cards.maxVal.toLocaleString("en-IN")}
                </span>
                <span className="ms-stat-sub-text">Top spending area</span>
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
                  <p className="text-muted fs-11px mb-0">
                    Expense pacing across {selectedMode === "date" && selectedDate ? selectedDate : `${selectedMonthName} ${selectedYear}`}
                  </p>
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
                {trendSpent.length ? (
                  <Chart options={spendingTrendOptions} series={spendingTrendSeries} type="bar" height={220} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted fs-12px" style={{ height: 220 }}>
                    No expense data to chart yet.
                  </div>
                )}
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

              {donutSeries.length ? (
                <Row className="align-items-center g-3 my-auto py-1">
                  <Col xs={12} sm={6} className="d-flex justify-content-center">
                    <div style={{ width: "170px", height: "185px" }}>
                      <Chart options={donutOptions} series={donutSeries} type="donut" height={185} />
                    </div>
                  </Col>

                  <Col xs={12} sm={6}>
                    <div className="d-flex flex-column gap-1.5" style={{ maxHeight: "175px", overflowY: "auto" }}>
                      {donutItems.map((item, i) => (
                        <div key={i} className="ms-donut-legend-card fs-11px">
                          <div className="d-flex align-items-center gap-2 text-truncate me-2">
                            <span className="ms-legend-dot" style={{ backgroundColor: item.color }}></span>
                            <span className="text-dark fw-600 text-truncate">{item.name}</span>
                          </div>
                          <span className="fw-700 text-dark flex-shrink-0">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted fs-12px my-auto py-2" style={{ minHeight: 185 }}>
                  No expense data to chart yet.
                </div>
              )}
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
        loading={expensesLoading}
        title="All Expense Logs"
        subtitle={`${selectedMonthName} ${selectedYear} • ${totalCount} expense log(s)`}
        searchPlaceholder="Search by merchant, note, or reference..."
        selectableRows={true}
        initialSortField="date"
        initialSortOrder="desc"
        defaultPageSize={limit}
        totalRows={totalCount}
        page={page}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onBulkDelete={handleBulkDelete}
        exportFileName="Expense_Statements"
        filters={
          <div className="ur-inline-filters">
            {/* Category Filter */}
            <Select
              value={[
                { value: "all", label: "All Categories" },
                ...expenseCategories.map((c) => ({ value: c.name, label: c.name })),
              ].find((c) => c.value === selectedCategory) || { value: "all", label: "All Categories" }}
              onChange={(opt) => {
                setSelectedCategory(opt ? opt.value : "all");
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Categories" },
                ...expenseCategories.map((c) => ({ value: c.name, label: c.name })),
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
                    value={expenseCategories.map((c) => ({ value: c.name, label: c.name })).find((c) => c.value === formData.category) || { value: formData.category, label: formData.category }}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={expenseCategories.map((c) => ({ value: c.name, label: c.name }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
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

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Date</Form.Label>
                  <AppDatePicker
                    value={formData.date}
                    onChange={(dateStr) => setFormData({ ...formData, date: dateStr })}
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

            </Row>
          </Modal.Body>


          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="ms-btn-expense px-4" disabled={creating}>
              <FiPlus size={14} /> {creating ? "Saving..." : "Save Expense"}
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
                    value={expenseCategories.map((c) => ({ value: c.name, label: c.name })).find((c) => c.value === formData.category) || { value: formData.category, label: formData.category }}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={expenseCategories.map((c) => ({ value: c.name, label: c.name }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
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

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Date</Form.Label>
                  <AppDatePicker
                    value={formData.date}
                    onChange={(dateStr) => setFormData({ ...formData, date: dateStr })}
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

            </Row>
          </Modal.Body>


          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" className="rounded-6px px-4" disabled={updating}>
              {updating ? "Updating..." : "Update Expense"}
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
                  <span className="text-muted">Date:</span>
                  <span className="fw-600 text-dark">
                    {activeExpense.date}
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

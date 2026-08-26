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
  FiTrendingUp,
  FiPlus,
  FiCalendar,
  FiBriefcase,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLayers,
  FiPieChart,
  FiRepeat,
  FiAlertCircle,
  FiPaperclip,
  FiX,
  FiImage,
  FiUploadCloud,
} from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import CommonDataTable from "../../components/common/DataTable";
import { useQueryClient } from "@tanstack/react-query";
import {
  useIncomes,
  useIncomeSummary,
  useIncomeAnalytics,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from "../../hooks/useIncomes";
import { deleteIncome } from "../../api/incomes.api";
import { toast } from "../../lib/toast";

// Available Categories with icons & theme colors
const CATEGORIES = [
  { label: "All Categories", value: "all", color: "#64748b" },
  { label: "Salary", value: "Salary", color: "#10b981", bg: "#ecfdf5" },
  { label: "Freelance", value: "Freelance", color: "#6366f1", bg: "#eef2ff" },
  { label: "Rental", value: "Rental", color: "#06b6d4", bg: "#ecfeff" },
  { label: "Dividends", value: "Dividends", color: "#8b5cf6", bg: "#f5f3ff" },
  { label: "Consulting", value: "Consulting", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Investments", value: "Investments", color: "#14b8a6", bg: "#f0fdfa" },
  { label: "Digital Products", value: "Digital Products", color: "#ec4899", bg: "#fdf2f8" },
  { label: "Bonus", value: "Bonus", color: "#e11d48", bg: "#ffe4e6" },
  { label: "Other", value: "Other", color: "#64748b", bg: "#f1f5f9" },
];

export default function Income() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("monthly");
  // Server-side period filter for GET /incomes:
  //   "current" -> no params (backend defaults to current month)
  //   "all"     -> ?all=true
  //   "YYYY-M"  -> ?month=M&year=YYYY
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  // Period dropdown options: This Month, All Time, then the last 11 months.
  const periodOptions = useMemo(() => {
    const opts = [
      { value: "current", label: "This Month" },
      { value: "all", label: "All Time" },
    ];
    const now = new Date();
    for (let k = 1; k <= 11; k++) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      opts.push({
        value: `${d.getFullYear()}-${d.getMonth() + 1}`,
        label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return opts;
  }, []);

  // Translate the selected period into GET /incomes query params.
  const periodParams = useMemo(() => {
    if (selectedPeriod === "all") return { all: true };
    if (selectedPeriod === "current") return {};
    const [year, month] = selectedPeriod.split("-").map(Number);
    return { month, year };
  }, [selectedPeriod]);

  // ---- Server data (TanStack Query) -------------------------------------
  // GET /incomes — full list (period + filters passed as params).
  const {
    data: incomesData,
    isLoading: incomesLoading,
    isError: incomesIsError,
    error: incomesErr,
  } = useIncomes({ ...periodParams, category: selectedCategory, status: selectedStatus });

  // Surface a real API/auth failure instead of a silent empty table.
  React.useEffect(() => {
    if (incomesIsError) {
      console.error("[incomes] request failed:", incomesErr);
      toast.error(incomesErr?.message || "Could not load incomes.");
    }
  }, [incomesIsError, incomesErr]);

  // Only ever show real API data (empty array while loading / when none).
  const incomes = useMemo(() => incomesData || [], [incomesData]);

  // GET /incomes/summary — the 4 metric cards.
  const { data: summaryData } = useIncomeSummary();

  // GET /incomes/analytics — data for the two charts.
  const { data: analyticsData } = useIncomeAnalytics({ range: timeRange });

  // ---- Mutations --------------------------------------------------------
  const { mutate: createIncomeMut, isPending: creating } = useCreateIncome({
    onSuccess: () => {
      toast.success("Income added successfully.");
      setShowAddModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not add income."),
  });

  const { mutate: updateIncomeMut, isPending: updating } = useUpdateIncome({
    onSuccess: () => {
      toast.success("Income updated successfully.");
      setShowEditModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not update income."),
  });

  const { mutate: deleteIncomeMut } = useDeleteIncome({
    onSuccess: () => {
      toast.success("Income deleted.");
      setShowDeleteModal(false);
    },
    onError: (err) => toast.error(err.message || "Could not delete income."),
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeIncome, setActiveIncome] = useState(null);

  // Form State with Receipt Image Support
  const [formData, setFormData] = useState({
    source: "",
    description: "",
    category: "Salary",
    account: "HDFC Bank •••• 4091",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    time: "12:00 PM",
    status: "Received",
    isRecurring: false,
    referenceNo: "",
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

  // Calculate Metrics from the real income records.
  const metrics = useMemo(() => {
    const total = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const avg = incomes.length > 0 ? Math.round(total / incomes.length) : 0;

    // Sum of income dated in the current calendar month.
    const now = new Date();
    const thisMonth = incomes
      .filter((i) => {
        const d = new Date(i.date);
        return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Find top category by total amount.
    const catMap = {};
    incomes.forEach((i) => {
      catMap[i.category] = (catMap[i.category] || 0) + Number(i.amount);
    });
    let topCat = "—";
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return { total, thisMonth, avg, topCat, maxVal };
  }, [incomes]);

  // Prefer server summary (GET /incomes/summary); fall back to computed metrics.
  const s = summaryData || {};
  const thisMonth = Number(s.thisMonth ?? s.monthlyInflow ?? s.currentMonth ?? metrics.thisMonth);
  const total = Number(s.totalInflow ?? s.total ?? s.totalIncome ?? metrics.total);
  const recurringInflow = Number(s.recurringInflow ?? s.recurring ?? thisMonth);
  const cards = {
    total,
    thisMonth,
    recurringInflow,
    // Prefer server-provided percentage; else compute recurring share of total.
    recurringPercentage: Number(
      s.recurringPercentage ?? Math.round((recurringInflow / (total || 1)) * 100)
    ),
    avg: Number(s.averageIncome ?? s.average ?? s.avg ?? metrics.avg),
    topCat:
      s.topStream?.name ?? s.topCategory ?? (typeof s.topStream === "string" ? s.topStream : null) ?? metrics.topCat,
    maxVal: Number(s.topStream?.amount ?? s.topAmount ?? s.maxVal ?? metrics.maxVal),
    count: Number(s.count ?? s.totalRecords ?? incomes.length),
  };

  // Filtered dataset for table
  const tableData = useMemo(() => {
    return incomes.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      return matchCat && matchStatus;
    });
  }, [incomes, selectedCategory, selectedStatus]);

  // ---- Chart data -------------------------------------------------------
  // Use GET /incomes/analytics when it returns a shape we recognize;
  // otherwise compute the charts from the REAL income list. Never dummy data.
  const DONUT_COLORS = ["#10b981", "#6366f1", "#06b6d4", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#e11d48"];

  const { trendCategories, trendData, donutItems } = useMemo(() => {
    const analytics = analyticsData || {};

    // --- Trend line ---
    let tCats = [];
    let tData = [];
    const trendRaw =
      analytics.trend ?? analytics.inflow ?? analytics.monthly ?? analytics.velocity ?? null;
    if (Array.isArray(trendRaw) && trendRaw.length) {
      tCats = trendRaw.map((p) => p.label ?? p.month ?? p.name ?? "");
      tData = trendRaw.map((p) => Number(p.amount ?? p.value ?? p.total ?? 0));
    } else if (trendRaw && Array.isArray(trendRaw.labels) && Array.isArray(trendRaw.data)) {
      tCats = trendRaw.labels;
      tData = trendRaw.data.map(Number);
    } else if (incomes.length) {
      const now = new Date();
      if (timeRange === "quarterly") {
        // Bucket by quarter; render the last 4 quarters.
        const byQ = {};
        incomes.forEach((i) => {
          const d = new Date(i.date);
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
          byQ[key] = (byQ[key] || 0) + (Number(i.amount) || 0);
        });
        for (let k = 3; k >= 0; k--) {
          const d = new Date(now.getFullYear(), now.getMonth() - k * 3, 1);
          const q = Math.floor(d.getMonth() / 3) + 1;
          const key = `${d.getFullYear()}-Q${q}`;
          tCats.push(`Q${q} ${String(d.getFullYear()).slice(2)}`);
          tData.push(byQ[key] || 0);
        }
      } else {
        // Bucket by month; render the last 6 months (empty months as 0).
        const byMonth = {};
        incomes.forEach((i) => {
          const d = new Date(i.date);
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          byMonth[key] = (byMonth[key] || 0) + (Number(i.amount) || 0);
        });
        for (let k = 5; k >= 0; k--) {
          const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          tCats.push(d.toLocaleString("en-US", { month: "short" }));
          tData.push(byMonth[key] || 0);
        }
      }
    }

    // --- Category donut ---
    let dItems = [];
    const donutRaw =
      analytics.byCategory ?? analytics.categoryShare ?? analytics.sources ?? analytics.breakdown ?? null;
    if (Array.isArray(donutRaw) && donutRaw.length) {
      const raw = donutRaw.map((item) => ({
        name: item.name ?? item.label ?? item.category ?? "Other",
        value: Number(item.value ?? item.percent ?? item.amount ?? 0),
        color: item.color,
      }));
      // If values are absolute amounts (not %), convert to percentages.
      const sum = raw.reduce((a, b) => a + b.value, 0);
      const asPct = sum > 100 || sum === 0;
      dItems = raw.map((it, i) => ({
        name: it.name,
        value: asPct && sum ? Math.round((it.value / sum) * 100) : Math.round(it.value),
        color: it.color ?? DONUT_COLORS[i % DONUT_COLORS.length],
      }));
    } else if (incomes.length) {
      // Compute category share from real records.
      const catMap = {};
      incomes.forEach((i) => {
        catMap[i.category || "Other"] = (catMap[i.category || "Other"] || 0) + (Number(i.amount) || 0);
      });
      const total = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
      dItems = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount], i) => {
          const cat = CATEGORIES.find((c) => c.value === name);
          return {
            name,
            value: Math.round((amount / total) * 100),
            color: cat?.color ?? DONUT_COLORS[i % DONUT_COLORS.length],
          };
        });
    }

    return { trendCategories: tCats, trendData: tData, donutItems: dItems };
  }, [analyticsData, incomes, timeRange]);

  const donutLabels = donutItems.map((d) => d.name);
  const donutSeries = donutItems.map((d) => d.value);
  const donutColors = donutItems.map((d) => d.color);

  // ApexChart: Income Trends Spline Area
  const trendChartOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 2.5, colors: ["#10b981"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
        colorStops: [
          { offset: 0, color: "#10b981", opacity: 0.4 },
          { offset: 100, color: "#10b981", opacity: 0.0 },
        ],
      },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: false },
    // Markers make a single / sparse data point visible.
    markers: {
      size: trendData.length <= 2 ? 5 : 0,
      colors: ["#10b981"],
      strokeColors: "#ffffff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      categories: trendCategories,
      labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 4,
      labels: {
        formatter: (val) => {
          if (val >= 1000) {
            const k = val / 1000;
            return `₹${Number.isInteger(k) ? k : k.toFixed(1)}k`;
          }
          return `₹${Math.round(val)}`;
        },
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `₹${val.toLocaleString("en-IN")}` },
    },
  };

  const trendChartSeries = [
    {
      name: "Income Stream",
      data: trendData,
    },
  ];

  // ApexChart: Income by Source Donut
  const donutOptions = {
    chart: { type: "donut", height: 210, fontFamily: "inherit" },
    labels: donutLabels,
    colors: donutColors,
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
      y: { formatter: (val) => `${val}%` },
    },
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      source: "",
      description: "",
      category: "Salary",
      account: "HDFC Bank •••• 4091",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      time: "12:00 PM",
      status: "Received",
      isRecurring: false,
      referenceNo: `INC-TX-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: "",
    });
    setShowAddModal(true);
  };

  // Build the API payload from the form (drops the local-only preview fields).
  const buildPayload = () => {
    // Exact body the API expects for create (POST) and update (PUT).
    return {
      incomeSource: formData.source,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
    };
  };

  // Submit Add Form -> POST /incomes
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.amount) {
      toast.error("Source and amount are required.");
      return;
    }
    createIncomeMut(buildPayload());
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setActiveIncome(item);
    setFormData({
      source: item.source,
      description: item.description,
      category: item.category,
      account: item.account,
      amount: item.amount,
      date: item.date ? String(item.date).slice(0, 10) : "",
      time: item.time,
      status: item.status,
      isRecurring: item.isRecurring,
      referenceNo: item.referenceNo || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Form -> PUT /incomes/:id
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeIncome) return;
    updateIncomeMut({ id: activeIncome.id, ...buildPayload() });
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setActiveIncome(item);
    setShowDeleteModal(true);
  };

  // Confirm Delete -> DELETE /incomes/:id
  const handleConfirmDelete = () => {
    if (!activeIncome) return;
    deleteIncomeMut(activeIncome.id);
  };

  // Bulk Delete -> DELETE /incomes/:id for each selected row
  const handleBulkDelete = async (ids) => {
    if (!ids?.length) return;
    try {
      await Promise.all(ids.map((id) => deleteIncome(id)));
      toast.success(`${ids.length} income record(s) deleted.`);
    } catch (err) {
      toast.error(err.message || "Some records could not be deleted.");
    } finally {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    }
  };

  // View Details
  const handleOpenDetails = (item) => {
    setActiveIncome(item);
    setShowDetailsModal(true);
  };

  // Columns definition for React Data Table
  const columns = [
    {
      name: "Income Ref & Source",
      selector: (row) => row.source,
      sortable: true,
      minWidth: "240px",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="ur-income-avatar-box">
            <FiArrowUpRight size={15} color="#10b981" />
          </div>
          <div>
            <div className="fw-700 text-dark fs-12.5px">{row.source}</div>
            <div className="text-muted fs-11px text-truncate" style={{ maxWidth: "200px" }}>
              {row.description || row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "140px",
      cell: (row) => {
        const catInfo = CATEGORIES.find((c) => c.value === row.category) || {};
        return (
          <span
            className="ur-category-badge"
            style={{
              backgroundColor: catInfo.bg || "#ecfdf5",
              color: catInfo.color || "#10b981",
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
          {row.account.includes("HDFC") || row.account.includes("ICICI") || row.account.includes("SBI") ? (
            <BsBank2 className="text-primary me-1" size={12} />
          ) : row.account.includes("GPay") ? (
            <SiGooglepay className="text-info me-1" size={13} />
          ) : row.account.includes("PhonePe") ? (
            <SiPhonepe className="text-primary me-1" size={13} />
          ) : (
            <IoWalletOutline className="text-muted me-1" size={13} />
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
      width: "120px",
      cell: (row) => (
        <span
          className={`ur-status-pill ${
            row.status === "Received" ? "success" : "warning"
          }`}
        >
          {row.status === "Received" ? (
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
          <div className="fw-800 text-success fs-13px">
            +₹{Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          {row.isRecurring && (
            <span className="text-muted fs-10px d-flex align-items-center justify-content-end gap-1">
              <FiRepeat size={9} /> Recurring
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
            <span>Income Management</span>
            <Badge bg="success-subtle" className="text-success fs-11px fw-700 py-1 px-2 rounded-6px">
              Active Inflow
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Track, analyze, and manage all your salary, investments, freelance, and passive income streams.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button className="ms-btn-income" onClick={handleOpenAdd}>
            <FiPlus size={14} />
            <span>Add New Income</span>
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
                  <div className="ms-stat-title">Total Inflow (Month)</div>
                  <div className="ms-stat-val text-success">
                    ₹{cards.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiTrendingUp size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill positive">
                  <FiTrendingUp size={11} /> +14.8%
                </span>
                <span className="ms-stat-sub-text">vs previous 30 days</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Recurring Inflow</div>
                  <div className="ms-stat-val">
                    ₹{cards.recurringInflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiRepeat size={19} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">
                  {cards.recurringPercentage}% of total
                </span>
                <span className="ms-stat-sub-text">Salary & Rentals</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Average Income / Entry</div>
                  <div className="ms-stat-val">
                    ₹{cards.avg.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiDollarSign size={19} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="ms-trend-pill positive">
                  <FiTrendingUp size={11} /> +6.4%
                </span>
                <span className="ms-stat-sub-text">Across {cards.count} records</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Top Revenue Stream</div>
                  <div className="ms-stat-val fs-18px text-truncate" style={{ maxWidth: "160px" }}>
                    {cards.topCat}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfeff" }}>
                  <FiBriefcase size={19} color="#06b6d4" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">
                  ₹{cards.maxVal.toLocaleString("en-IN")}
                </span>
                <span className="ms-stat-sub-text">Primary Source</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===================================================================
          3. VISUAL CHARTS ROW
          =================================================================== */}
      <Row className="g-3 mb-3">
        {/* Income Growth Spline Chart */}
        <Col xs={12} lg={7}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="ms-card-title mb-0">Income Inflow Velocity</h5>
                  <p className="text-muted fs-11px mb-0">
                    {timeRange === "quarterly" ? "Last 4 quarters progression" : "6-Month progression & projected growth"}
                  </p>
                </div>
                <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-6px">
                  <Button
                    variant={timeRange === "monthly" ? "white" : "transparent"}
                    size="sm"
                    className={`ur-chart-filter-btn ${timeRange === "monthly" ? "active" : ""}`}
                    onClick={() => setTimeRange("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={timeRange === "quarterly" ? "white" : "transparent"}
                    size="sm"
                    className={`ur-chart-filter-btn ${timeRange === "quarterly" ? "active" : ""}`}
                    onClick={() => setTimeRange("quarterly")}
                  >
                    Quarterly
                  </Button>
                </div>
              </div>

              <div className="ms-chart-wrap pt-1">
                {trendData.length ? (
                  <Chart options={trendChartOptions} series={trendChartSeries} type="area" height={220} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted fs-12px" style={{ height: 220 }}>
                    No income data to chart yet.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Source Breakdown Donut */}
        <Col xs={12} lg={5}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <h5 className="ms-card-title mb-0">Revenue Share by Category</h5>
                <p className="text-muted fs-11px mb-0">Portfolio distribution</p>
              </div>

              {donutSeries.length ? (
                <div className="d-flex align-items-center justify-content-around flex-wrap gap-2 my-auto py-2">
                  <div style={{ width: "180px", height: "200px" }}>
                    <Chart options={donutOptions} series={donutSeries} type="donut" height={200} />
                  </div>

                  <div className="ms-donut-legend ps-2" style={{ minWidth: "150px" }}>
                    {donutItems.map((item, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between mb-1 fs-11px">
                        <div className="d-flex align-items-center gap-2">
                          <span className="ms-legend-dot" style={{ backgroundColor: item.color }}></span>
                          <span className="text-dark fw-600">{item.name}</span>
                        </div>
                        <span className="fw-700 text-dark">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted fs-12px my-auto py-2" style={{ minHeight: 200 }}>
                  No category data to chart yet.
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
        loading={incomesLoading}
        title="All Income Transactions"
        subtitle={`${periodOptions.find((p) => p.value === selectedPeriod)?.label || "This Month"} • ${tableData.length} income log(s)`}
        searchPlaceholder="Search by payer, source, or reference..."
        selectableRows={true}
        initialSortField="date"
        initialSortOrder="desc"
        defaultPageSize={10}
        onBulkDelete={handleBulkDelete}
        exportFileName="Income_Statements"
        filters={
          <div className="ur-inline-filters">
            {/* Period Filter — GET /incomes?month=&year= | ?all=true | (default current month) */}
            <Select
              value={periodOptions.find((p) => p.value === selectedPeriod)}
              onChange={(opt) => setSelectedPeriod(opt ? opt.value : "current")}
              options={periodOptions}
              styles={filterSelectStyles}
              isSearchable={false}
            />

            {/* Category Filter */}
            <Select
              value={CATEGORIES.map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === selectedCategory)}
              onChange={(opt) => setSelectedCategory(opt ? opt.value : "all")}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              styles={filterSelectStyles}
              isSearchable={false}
            />
          </div>
        }
      />

      {/* ===================================================================
          MODAL: ADD NEW INCOME
          =================================================================== */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon income">
                <FiPlus size={16} />
              </span>
              Record New Income
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Fill in the details below to record an income entry into Waltrio.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveAdd}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. TechCorp India Pvt Ltd"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Select
                    value={CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label }))}
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
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
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

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Description / Work Scope</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Monthly salary payout with milestone bonus"
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
                    <span>Attach Bill / Salary Slip / Receipt Image</span>
                    {formData.receiptImg && (
                      <span className="text-success fs-11px fw-600">✓ Image Attached</span>
                    )}
                  </Form.Label>

                  {!formData.receiptImg ? (
                    <div className="ur-receipt-upload-box">
                      <input
                        type="file"
                        id="income-receipt-file-add"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptFileChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="income-receipt-file-add" className="w-100 cursor-pointer mb-0">
                        <FiPaperclip size={20} className="text-primary mb-1" />
                        <div className="fw-700 text-dark fs-12px">Click to Upload Bill / Receipt Image</div>
                        <span className="text-muted fs-11px">Supports PNG, JPG, JPEG, PDF receipt</span>
                      </label>
                    </div>
                  ) : (
                    <div className="ur-receipt-preview-card">
                      <img src={formData.receiptImg} alt="Receipt preview" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                          {formData.receiptName || "Uploaded_Receipt_Image.png"}
                        </div>
                        <span className="text-success fs-10.5px fw-600">Receipt image loaded</span>
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

              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="recurring-income-chk"
                  label="Mark as recurring monthly income"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="ur-checkbox-label"
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowAddModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="ms-btn-income px-4" disabled={creating}>
              <FiPlus size={14} /> {creating ? "Saving..." : "Save Income"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: EDIT INCOME
          =================================================================== */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className="ur-modal-icon edit">
                <FiEdit2 size={15} />
              </span>
              Edit Income Record ({activeIncome?.id})
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">Modify information for this income log.</p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveEdit}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Income Source / Payer *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Category *</Form.Label>
                  <Select
                    value={CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label })).find((c) => c.value === formData.category)}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={CATEGORIES.filter((c) => c.value !== "all").map((c) => ({ value: c.value, label: c.label }))}
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
                    className="ur-form-input fw-700 text-success"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
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
                    <span>Attached Bill / Salary Slip / Receipt Image</span>
                    {formData.receiptImg && (
                      <span className="text-success fs-11px fw-600">✓ Image Attached</span>
                    )}
                  </Form.Label>

                  {!formData.receiptImg ? (
                    <div className="ur-receipt-upload-box">
                      <input
                        type="file"
                        id="income-receipt-file-edit"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptFileChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="income-receipt-file-edit" className="w-100 cursor-pointer mb-0">
                        <FiPaperclip size={20} className="text-primary mb-1" />
                        <div className="fw-700 text-dark fs-12px">Click to Upload Bill / Receipt Image</div>
                        <span className="text-muted fs-11px">Supports PNG, JPG, JPEG, PDF receipt</span>
                      </label>
                    </div>
                  ) : (
                    <div className="ur-receipt-preview-card">
                      <img src={formData.receiptImg} alt="Receipt preview" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px text-truncate" style={{ maxWidth: "260px" }}>
                          {formData.receiptName || "Uploaded_Receipt_Image.png"}
                        </div>
                        <span className="text-success fs-10.5px fw-600">Receipt image loaded</span>
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

              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="recurring-income-edit-chk"
                  label="Mark as recurring monthly income"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="ur-checkbox-label"
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowEditModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4" disabled={updating}>
              {updating ? "Updating..." : "Update Record"}
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
          <h5 className="fw-700 text-dark mb-1">Delete Income Record?</h5>
          <p className="text-muted fs-12px mb-3">
            Are you sure you want to delete <strong>{activeIncome?.source}</strong> (₹{activeIncome?.amount?.toLocaleString("en-IN")})? This action cannot be undone.
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
            <FiEye className="text-primary" /> Income Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          {activeIncome && (
            <div>
              {/* Highlight Card */}
              <div className="ur-details-highlight-card p-3 rounded-10px mb-3 text-center">
                <span className="text-muted fs-11px">TOTAL AMOUNT CREDITED</span>
                <div className="fw-800 text-success fs-24px my-1">
                  +₹{Number(activeIncome.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <Badge bg="success-subtle" className="text-success fs-11px px-2 py-1 rounded-6px">
                  Status: {activeIncome.status}
                </Badge>
              </div>

              {/* Information Grid */}
              <div className="d-flex flex-column gap-2 fs-12px">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Transaction ID:</span>
                  <span className="fw-700 text-dark">{activeIncome.id}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Source / Payer:</span>
                  <span className="fw-600 text-dark">{activeIncome.source}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Category:</span>
                  <span className="fw-600 text-primary">{activeIncome.category}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Credited Account:</span>
                  <span className="fw-600 text-dark">{activeIncome.account}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Date &amp; Timestamp:</span>
                  <span className="fw-600 text-dark">
                    {activeIncome.date} at {activeIncome.time}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Reference / UTR:</span>
                  <span className="fw-600 text-muted font-monospace">{activeIncome.referenceNo || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Notes:</span>
                  <span className="fw-500 text-dark text-end" style={{ maxWidth: "240px" }}>
                    {activeIncome.notes || activeIncome.description || "None"}
                  </span>
                </div>

                {/* Attached Receipt Preview */}
                <div className="py-2">
                  <span className="text-muted d-block mb-1">Attached Bill / Receipt:</span>
                  {activeIncome.receiptImg ? (
                    <div className="d-flex align-items-center gap-2 p-2 border rounded-8px bg-light">
                      <img src={activeIncome.receiptImg} alt="Receipt" className="ur-receipt-thumb" />
                      <div className="flex-grow-1">
                        <div className="fw-700 text-dark fs-12px">{activeIncome.receiptName || "Salary_Slip_Aug2026.png"}</div>
                        <span className="text-success fs-10.5px fw-600">Verified receipt document</span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="fs-11px py-1 px-2"
                        onClick={() => {
                          setPreviewReceiptImg(activeIncome.receiptImg);
                          setShowReceiptModal(true);
                        }}
                      >
                        View Full
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2 border rounded-8px bg-light text-muted fs-11.5px">
                      📄 No physical receipt attached (Standard electronic ledger transfer)
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
          MODAL: FULL RECEIPT IMAGE PREVIEW
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

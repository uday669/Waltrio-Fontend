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
  useIncomeVelocity,
  useIncomeRevenueShare,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from "../../hooks/useIncomes";
import { deleteIncome } from "../../api/incomes.api";
import { toast } from "../../lib/toast";
import { useCategories } from "../../context/CategoryContext";
import { useAuth } from "../../context/AuthContext";
import MonthYearFilter, { MONTHS } from "../../components/common/MonthYearFilter";
import AppDatePicker from "../../components/common/AppDatePicker";

export default function Income() {
  const queryClient = useQueryClient();
  const { currencySymbol } = useAuth();
  const { incomeCategories, getCategoryMeta } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMode, setSelectedMode] = useState("month");

  const selectedMonthName = useMemo(() => {
    return MONTHS.find((m) => m.value === Number(selectedMonth))?.label || "Month";
  }, [selectedMonth]);

  // Translate active filter mode into GET /incomes list query params:
  // ?month=10&year=2026 or ?filter=day&day=3&month=10&year=2026 or ?filter=year&year=2026
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
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear, selectedCategory, selectedStatus, page, limit]);

  // Summary Query Params: ?month=10&year=2026 or ?filter=day&day=3&month=10&year=2026 or ?filter=year&year=2026
  const summaryParams = useMemo(() => {
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
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // Revenue Share Query Params: only month & year (no day filter)
  const revenueShareParams = useMemo(() => {
    if (selectedMode === "date" && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length >= 3) {
        return {
          month: parts[1],
          year: parts[0],
        };
      }
    }
    if (selectedMode === "year") {
      return {
        year: Number(selectedYear),
      };
    }
    return {
      month: Number(selectedMonth),
      year: Number(selectedYear),
    };
  }, [selectedMode, selectedDate, selectedMonth, selectedYear]);

  // Velocity Query Params: year
  const velocityParams = useMemo(() => {
    return {
      year: Number(selectedYear),
    };
  }, [selectedYear]);

  // ---- Server data (TanStack Query) -------------------------------------
  const {
    data: incomesData,
    isLoading: incomesLoading,
    isError: incomesIsError,
    error: incomesErr,
  } = useIncomes(queryParams);

  // Surface a real API/auth failure instead of a silent empty table.
  React.useEffect(() => {
    if (incomesIsError) {
      console.error("[incomes] request failed:", incomesErr);
      toast.error(incomesErr?.message || "Could not load incomes.");
    }
  }, [incomesIsError, incomesErr]);

  // Only ever show real API data (empty array while loading / when none).
  const incomes = useMemo(() => incomesData || [], [incomesData]);
  const totalCount = incomesData?.total ?? incomesData?.pagination?.total ?? incomes.length;

  // GET /incomes/summary — the 3 metric cards.
  const { data: summaryData } = useIncomeSummary(summaryParams);

  // GET /incomes/velocity — data for Income Inflow Velocity chart.
  const { data: velocityData } = useIncomeVelocity(velocityParams);

  // GET /incomes/revenue-share — data for Revenue Share by Category donut chart (filtered by month & year).
  const { data: revenueShareData } = useIncomeRevenueShare(revenueShareParams);

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

    // Recurring incomes: items marked as isRecurring or recurring or status recurring
    const recurringList = incomes.filter(
      (i) => i.isRecurring === true || i.recurring === true || (i.status && i.status.toLowerCase() === "recurring")
    );
    const recurring = recurringList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const recurringPercentage = total > 0 ? Number(((recurring / total) * 100).toFixed(1)) : 0;

    // Find top category by total amount.
    const catMap = {};
    incomes.forEach((i) => {
      const c = i.category || "Other";
      catMap[c] = (catMap[c] || 0) + (Number(i.amount) || 0);
    });
    let topCat = "—";
    let maxVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    });

    return { total, recurring, recurringPercentage, recurringCount: recurringList.length, avg, topCat, maxVal };
  }, [incomes]);

  // Filtered dataset for table
  const tableData = useMemo(() => {
    return incomes.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchDate =
        selectedMode !== "date" ||
        !selectedDate ||
        item.date === selectedDate ||
        String(item.date).startsWith(selectedDate);
      return matchCat && matchStatus && matchDate;
    });
  }, [incomes, selectedCategory, selectedStatus, selectedMode, selectedDate]);

  // Prefer server summary (GET /incomes/summary); fall back to computed metrics.
  const s = summaryData?.data ?? summaryData?.Data ?? summaryData ?? {};
  const total = Number(s.totalInflow ?? s.total ?? s.totalIncome ?? s.amount ?? metrics.total);
  const recurringInflow = Number(s.recurringInflow ?? s.recurring ?? s.recurringTotal ?? metrics.recurring);
  const topStreamCategory =
    s.topRevenueStream?.category ||
    s.topRevenueStream?.name ||
    s.topStream?.name ||
    s.topCategory ||
    (typeof s.topStream === "string" ? s.topStream : null) ||
    metrics.topCat;
  const topStreamMeta = getCategoryMeta(topStreamCategory, "income");

  const recurringPct =
    s.recurringPercentage != null
      ? Number(s.recurringPercentage)
      : s.recurringPercent != null
      ? Number(s.recurringPercent)
      : total > 0
      ? Number(((recurringInflow / total) * 100).toFixed(1))
      : 0;

  const totalChange =
    s.totalInflowChange != null
      ? Number(s.totalInflowChange)
      : s.change != null
      ? Number(s.change)
      : s.growth != null
      ? Number(s.growth)
      : s.percentageChange != null
      ? Number(s.percentageChange)
      : 0;

  const cards = {
    total,
    totalChange,
    recurringInflow,
    recurringPercentage: recurringPct,
    avg: Number(s.averageIncome ?? s.average ?? s.avg ?? metrics.avg),
    topCat: topStreamCategory,
    maxVal: Number(
      s.topRevenueStream?.price ??
        s.topRevenueStream?.total ??
        s.topRevenueStream?.amount ??
        s.topStream?.amount ??
        metrics.maxVal
    ),
    count: Number(s.totalEntries ?? s.count ?? s.totalTransactions ?? totalCount),
  };

  // ---- Chart data -------------------------------------------------------
  // Use GET /incomes/velocity and GET /incomes/revenue-share from server API.
  const DONUT_COLORS = ["#10b981", "#6366f1", "#06b6d4", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#e11d48"];

  const { trendCategories, trendData, trendRawPoints, donutItems } = useMemo(() => {
    const velocity = velocityData?.data ?? velocityData?.Data ?? velocityData ?? {};
    const revenueShare = revenueShareData?.data ?? revenueShareData?.Data ?? revenueShareData ?? {};

    // --- Trend line (Income Inflow Velocity: GET /incomes/velocity) ---
    let tCats = [];
    let tData = [];
    let tPoints = [];

    const trendRaw =
      (Array.isArray(velocity) && velocity) ||
      (Array.isArray(velocity.incomeVelocity) && velocity.incomeVelocity) ||
      (Array.isArray(velocity.velocity) && velocity.velocity) ||
      (Array.isArray(velocity.trend) && velocity.trend) ||
      (Array.isArray(velocity.inflow) && velocity.inflow) ||
      (Array.isArray(velocity.monthly) && velocity.monthly) ||
      null;

    if (Array.isArray(trendRaw) && trendRaw.length) {
      tPoints = trendRaw;
      tCats = trendRaw.map((p) => p.label ?? p.monthName ?? (p.month ? MONTHS.find((m) => m.value === p.month)?.short : "") ?? p.name ?? "");
      tData = trendRaw.map((p) => Number(p.total ?? p.amount ?? p.value ?? 0));
    } else if (trendRaw && Array.isArray(trendRaw.labels) && Array.isArray(trendRaw.data)) {
      tCats = trendRaw.labels;
      tData = trendRaw.data.map(Number);
      tPoints = tCats.map((l, idx) => ({ label: l, total: tData[idx] }));
    } else if (incomes.length) {
      // Bucket by month; render the last 6 months (empty months as 0).
      const now = new Date();
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
        const lbl = d.toLocaleString("en-US", { month: "short" });
        const val = byMonth[key] || 0;
        tCats.push(lbl);
        tData.push(val);
        tPoints.push({ label: lbl, total: val, projected: false });
      }
    }

    // --- Category donut (Revenue Share by Category: GET /incomes/revenue-share) ---
    let dItems = [];
    const donutRaw =
      (Array.isArray(revenueShare?.categories) && revenueShare.categories) ||
      (Array.isArray(revenueShare?.revenueShare?.categories) && revenueShare.revenueShare.categories) ||
      (Array.isArray(revenueShare?.revenueShare) && revenueShare.revenueShare) ||
      (Array.isArray(revenueShare) && revenueShare) ||
      revenueShare?.categoryShare ||
      revenueShare?.byCategory ||
      revenueShare?.sources ||
      revenueShare?.breakdown ||
      null;

    if (Array.isArray(donutRaw) && donutRaw.length) {
      const raw = donutRaw.map((item) => {
        const catName = item.category ?? item.name ?? item.label ?? "Other";
        const meta = getCategoryMeta(catName, "income");
        return {
          name: catName,
          total: Number(item.total ?? item.amount ?? item.value ?? 0),
          percentage:
            item.percentage !== undefined
              ? Number(item.percentage)
              : item.percent !== undefined
              ? Number(item.percent)
              : item.pct !== undefined
              ? Number(item.pct)
              : null,
          color: meta?.color ?? item.color,
        };
      });

      const totalSum = raw.reduce((a, b) => a + (b.total || 0), 0);
      dItems = raw.map((it, i) => {
        let pct = it.percentage;
        if (pct === null || isNaN(pct)) {
          pct = totalSum > 0 ? Math.round((it.total / totalSum) * 100) : 0;
        }
        return {
          name: it.name,
          value: pct,
          total: it.total,
          color: it.color ?? DONUT_COLORS[i % DONUT_COLORS.length],
        };
      });
    } else if (incomes.length) {
      // Fallback: Compute category share from real records.
      const catMap = {};
      incomes.forEach((i) => {
        catMap[i.category || "Other"] = (catMap[i.category || "Other"] || 0) + (Number(i.amount) || 0);
      });
      const total = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
      dItems = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount], i) => {
          const cat = getCategoryMeta(name, "income");
          return {
            name,
            value: Math.round((amount / total) * 100),
            total: amount,
            color: cat?.color ?? DONUT_COLORS[i % DONUT_COLORS.length],
          };
        });
    }

    return { trendCategories: tCats, trendData: tData, trendRawPoints: tPoints, donutItems: dItems };
  }, [velocityData, revenueShareData, incomes, getCategoryMeta]);

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
            return `${currencySymbol}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
          }
          return `${currencySymbol}${Math.round(val)}`;
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
      y: {
        formatter: (val, opts) => {
          const idx = opts?.dataPointIndex;
          const pt = trendRawPoints?.[idx];
          return `${currencySymbol}${Number(val || 0).toLocaleString()}${pt?.projected ? " (Projected)" : ""}`;
        },
      },
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
    colors: donutColors.length ? donutColors : ["#4f46e5"],
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
              label: "Share",
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
      y: { formatter: (val) => `${val}%` },
    },
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      source: "",
      description: "",
      category: incomeCategories[0]?.name || "Salary",
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
      cell: (row) => {
        const catInfo = getCategoryMeta(row.category, "income");
        return (
          <div className="d-flex align-items-center gap-2">
            <div
              className="ur-income-avatar-box"
              style={{
                backgroundColor: catInfo.bg || "#ecfdf5",
                color: catInfo.color || "#10b981",
              }}
            >
              {catInfo.icon || <FiArrowUpRight size={15} />}
            </div>
            <div>
              <div className="fw-700 text-dark fs-12.5px">{row.source}</div>
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
      width: "140px",
      cell: (row) => {
        const catInfo = getCategoryMeta(row.category, "income");
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
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      width: "140px",
      cell: (row) => (
        <div className="text-end">
          <div className="fw-800 text-success fs-13px">
            +{currencySymbol}{Number(row.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
          <Button className="ms-btn-income" onClick={handleOpenAdd}>
            <FiPlus size={14} />
            <span>Add New Income</span>
          </Button>
        </div>
      </div>

      {/* ===================================================================
          2. TOP 3 METRICS CARDS (Powered by /incomes/summary)
          =================================================================== */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} md={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">
                    Total Inflow ({selectedMode === "date" ? "Day" : "Month"})
                  </div>
                  <div className="ms-stat-val text-success">
                    {currencySymbol}{cards.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiTrendingUp size={20} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                {cards.totalChange !== 0 ? (
                  <span className={`ms-trend-pill ${cards.totalChange >= 0 ? "positive" : "negative"}`}>
                    <FiTrendingUp size={11} /> {cards.totalChange >= 0 ? `+${cards.totalChange}%` : `${cards.totalChange}%`}
                  </span>
                ) : (
                  <span className="ms-trend-pill neutral">
                    <FiTrendingUp size={11} /> 0%
                  </span>
                )}
                <span className="ms-stat-sub-text">
                  {cards.count} {cards.count === 1 ? "entry" : "entries"} recorded
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Average Income / Entry</div>
                  <div className="ms-stat-val">
                    {currencySymbol}{cards.avg.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#f5f3ff" }}>
                  <FiDollarSign size={19} color="#8b5cf6" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">
                  {currencySymbol}{cards.avg.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </span>
                <span className="ms-stat-sub-text">Per transaction avg</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={4}>
          <Card className="ms-premium-card h-100 border-0">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Top Revenue Stream</div>
                  <div className="ms-stat-val fs-18px text-truncate" style={{ maxWidth: "160px" }}>
                    {cards.topCat}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: topStreamMeta?.bg || "#ecfeff" }}>
                  {topStreamMeta?.icon || <FiBriefcase size={19} color="#06b6d4" />}
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">
                  {currencySymbol}{cards.maxVal.toLocaleString("en-IN")}
                </span>
                <span className="ms-stat-sub-text">Top stream</span>
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
                    {trendCategories.length > 0 ? `${trendCategories.length}-Month` : "6-Month"} progression &amp; projected growth
                  </p>
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
        subtitle={`${selectedMonthName} ${selectedYear} • ${totalCount} income log(s)`}
        searchPlaceholder="Search by payer, source, or reference..."
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
        exportFileName="Income_Statements"
        filters={
          <div className="ur-inline-filters">
            {/* Category Filter */}
            <Select
              value={[
                { value: "all", label: "All Categories" },
                ...incomeCategories.map((c) => ({ value: c.name, label: c.name })),
              ].find((c) => c.value === selectedCategory) || { value: "all", label: "All Categories" }}
              onChange={(opt) => {
                setSelectedCategory(opt ? opt.value : "all");
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Categories" },
                ...incomeCategories.map((c) => ({ value: c.name, label: c.name })),
              ]}
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
                    value={incomeCategories.map((c) => ({ value: c.name, label: c.name })).find((c) => c.value === formData.category) || { value: formData.category, label: formData.category }}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={incomeCategories.map((c) => ({ value: c.name, label: c.name }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Amount ({currencySymbol}) *</Form.Label>
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
                  <AppDatePicker
                    value={formData.date}
                    onChange={(dateStr) => setFormData({ ...formData, date: dateStr })}
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
                    value={incomeCategories.map((c) => ({ value: c.name, label: c.name })).find((c) => c.value === formData.category) || { value: formData.category, label: formData.category }}
                    onChange={(opt) => setFormData({ ...formData, category: opt.value })}
                    options={incomeCategories.map((c) => ({ value: c.name, label: c.name }))}
                    styles={formSelectStyles}
                    menuPortalTarget={document.body}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="ur-form-label">Amount ({currencySymbol}) *</Form.Label>
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
            Are you sure you want to delete <strong>{activeIncome?.source}</strong> ({currencySymbol}{activeIncome?.amount?.toLocaleString()})? This action cannot be undone.
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
                  +{currencySymbol}{Number(activeIncome.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  <span className="text-muted">Date:</span>
                  <span className="fw-600 text-dark">
                    {activeIncome.date}
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

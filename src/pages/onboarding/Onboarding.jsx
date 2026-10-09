import React, { useState, useMemo, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiGlobe,
  FiBriefcase,
  FiCoffee,
  FiHome,
  FiShoppingBag,
  FiZap,
  FiTrendingUp,
  FiTrendingDown,
  FiLayers,
  FiGift,
  FiSmartphone,
  FiTruck,
  FiBook,
  FiHeart,
  FiMusic,
  FiDollarSign,
  FiStar,
  FiShield,
  FiX,
  FiSliders,
  FiCreditCard,
  FiPlus,
  FiDroplet,
  FiTag,
} from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENCIES, getCurrencySymbol } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";
import { extractUserData } from "../../hooks/useAuth";
import { updateProfile, getProfile } from "../../api/auth.api";
import { createCategory } from "../../api/categories.api";
import { CATEGORIES_KEY, toCreateCategoryPayload } from "../../hooks/useCategoriesApi";
import { getToken } from "../../api/client";
import {
  useCategories,
  AVAILABLE_ICONS,
  PRESET_COLORS,
  ICON_MAP,
} from "../../context/CategoryContext";
import { toast } from "../../lib/toast";
import "../../assets/css/onboarding.css";

// 16 Curated High-Grade Categories for Setup
const ONBOARDING_CATEGORIES = [
  // EXPENSE CATEGORIES
  {
    id: "food-dining",
    name: "Food & Dining",
    type: "expense",
    desc: "Groceries, delivery & dine-out meals",
    icon: <FiCoffee size={18} />,
    iconKey: "FiCoffee",
    color: "#f59e0b",
    bg: "#fffbeb",
    recommended: true,
  },
  {
    id: "rent-housing",
    name: "Rent & Housing",
    type: "expense",
    desc: "Monthly rent, mortgage & property upkeep",
    icon: <FiHome size={18} />,
    iconKey: "FiHome",
    color: "#4f46e5",
    bg: "#eef2ff",
    recommended: true,
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "expense",
    desc: "Fuel, public transit, maintenance & parking",
    icon: <FiTruck size={18} />,
    iconKey: "FiTruck",
    color: "#06b6d4",
    bg: "#ecfeff",
    recommended: true,
  },
  {
    id: "shopping-retail",
    name: "Shopping & Retail",
    type: "expense",
    desc: "Clothing, gadgets, household & personal",
    icon: <FiShoppingBag size={18} />,
    iconKey: "FiShoppingBag",
    color: "#ec4899",
    bg: "#fdf2f8",
    recommended: true,
  },
  {
    id: "bills-utilities",
    name: "Bills & Utilities",
    type: "expense",
    desc: "Electricity, internet, water & recurring bills",
    icon: <FiZap size={18} />,
    iconKey: "FiZap",
    color: "#eab308",
    bg: "#fefce8",
    recommended: true,
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    type: "expense",
    desc: "Doctor appointments, pharmacy & insurance",
    icon: <FiHeart size={18} />,
    iconKey: "FiHeart",
    color: "#ef4444",
    bg: "#fef2f2",
    recommended: false,
  },
  {
    id: "entertainment",
    name: "Entertainment & Leisure",
    type: "expense",
    desc: "Streaming, movies, gaming & weekend outings",
    icon: <FiMusic size={18} />,
    iconKey: "FiMusic",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    recommended: true,
  },
  {
    id: "travel-vacation",
    name: "Travel & Vacations",
    type: "expense",
    desc: "Flights, hotel bookings & trip experiences",
    icon: <FiGlobe size={18} />,
    iconKey: "FiGlobe",
    color: "#14b8a6",
    bg: "#f0fdfa",
    recommended: false,
  },
  {
    id: "education",
    name: "Education & Learning",
    type: "expense",
    desc: "Online courses, books & certifications",
    icon: <FiBook size={18} />,
    iconKey: "FiBook",
    color: "#3b82f6",
    bg: "#eff6ff",
    recommended: false,
  },
  {
    id: "subscriptions",
    name: "Digital Subscriptions",
    type: "expense",
    desc: "Cloud storage, SaaS tools & mobile apps",
    icon: <FiSmartphone size={18} />,
    iconKey: "FiSmartphone",
    color: "#6366f1",
    bg: "#eef2ff",
    recommended: false,
  },

  // INCOME CATEGORIES
  {
    id: "salary",
    name: "Salary & Wages",
    type: "income",
    desc: "Primary corporate salary & monthly payroll",
    icon: <FiBriefcase size={18} />,
    iconKey: "FiBriefcase",
    color: "#10b981",
    bg: "#ecfdf5",
    recommended: true,
  },
  {
    id: "freelance",
    name: "Freelance & Consulting",
    type: "income",
    desc: "Client projects, contract work & gigs",
    icon: <FiLayers size={18} />,
    iconKey: "FiLayers",
    color: "#06b6d4",
    bg: "#ecfeff",
    recommended: true,
  },
  {
    id: "investments",
    name: "Investments & Dividends",
    type: "income",
    desc: "Stock dividends, mutual funds & crypto yields",
    icon: <FiTrendingUp size={18} />,
    iconKey: "FiTrendingUp",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    recommended: false,
  },
  {
    id: "business-revenue",
    name: "Business Revenue",
    type: "income",
    desc: "E-commerce sales, product revenue & profit",
    icon: <FiDollarSign size={18} />,
    iconKey: "FiDollarSign",
    color: "#4f46e5",
    bg: "#eef2ff",
    recommended: false,
  },
  {
    id: "rental-income",
    name: "Rental Income",
    type: "income",
    desc: "Real estate rent & leasing inflows",
    icon: <FiHome size={18} />,
    iconKey: "FiHome",
    color: "#f59e0b",
    bg: "#fffbeb",
    recommended: false,
  },
  {
    id: "bonuses-gifts",
    name: "Bonuses & Rewards",
    type: "income",
    desc: "Year-end bonuses, cashbacks & financial gifts",
    icon: <FiGift size={18} />,
    iconKey: "FiGift",
    color: "#ec4899",
    bg: "#fdf2f8",
    recommended: false,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, currency: userCurrency, onboarding, isOnboarded } = useAuth();
  const { allCategories = [] } = useCategories();

  // Check if user has already completed onboarding
  const isAlreadyOnboarded = useMemo(() => {
    try {
      const cached = localStorage.getItem("waltrio_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.onboarding === true || parsed.isOnboarded === true) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return (
      onboarding === true ||
      isOnboarded === true ||
      user?.onboarding === true ||
      user?.isOnboarded === true
    );
  }, [onboarding, isOnboarded, user]);

  // Guard: if user has already completed onboarding, exit to dashboard
  useEffect(() => {
    if (isAlreadyOnboarded) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAlreadyOnboarded, navigate]);

  // Wizard step state: 1 (Currency) <-> 2 (Categories)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Currency Selection
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return userCurrency || user?.currency || "INR";
  });
  const [currencySearch, setCurrencySearch] = useState("");

  // Guard: if not authenticated, redirect to login
  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Keep currency in sync if loaded asynchronously from user profile
  useEffect(() => {
    if (userCurrency || user?.currency) {
      setSelectedCurrency((prev) => prev || userCurrency || user?.currency || "INR");
    }
  }, [userCurrency, user?.currency]);

  // Custom Category Builder Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategoryForm, setCustomCategoryForm] = useState({
    name: "",
    type: "expense",
    color: PRESET_COLORS[1].color,
    bg: PRESET_COLORS[1].bg,
    iconKey: "FiShoppingBag",
    description: "",
  });

  // Local list of newly created custom categories in this session
  const [localCustomCategories, setLocalCustomCategories] = useState([]);

  // Merge categories from backend + starter categories + newly created custom categories
  const combinedCategories = useMemo(() => {
    const list = [];
    const seenNames = new Set();

    // 1. Locally added custom categories from this session first
    for (const c of localCustomCategories) {
      const normKey = (c.name || "").trim().toLowerCase();
      if (normKey && !seenNames.has(normKey)) {
        seenNames.add(normKey);
        list.push(c);
      }
    }

    // Map of starter categories by normalized name for smart enrichment
    const starterMap = new Map(
      ONBOARDING_CATEGORIES.map((cat) => [cat.name.toLowerCase().trim(), cat])
    );

    // 2. Add categories existing in website / backend
    if (Array.isArray(allCategories) && allCategories.length > 0) {
      for (const c of allCategories) {
        const rawName = (c.name || c.categoryName || "").trim();
        if (!rawName) continue;
        const normKey = rawName.toLowerCase();
        if (!seenNames.has(normKey)) {
          seenNames.add(normKey);
          const matchedStarter = starterMap.get(normKey);
          const type = (c.type || matchedStarter?.type || "expense").toLowerCase() === "income" ? "income" : "expense";
          const iconKey = c.iconKey || c.categoryIcon || matchedStarter?.iconKey || (type === "income" ? "FiDollarSign" : "FiShoppingBag");
          const isTrulyCustom = Boolean(c.isCustom || !matchedStarter);

          list.push({
            id: c._id || c.id || rawName,
            backendId: c._id || c.id,
            name: rawName,
            type,
            desc: c.description || matchedStarter?.desc || (type === "income" ? "Income Channel" : "Expense Channel"),
            icon: ICON_MAP[iconKey] || matchedStarter?.icon || (type === "income" ? <FiDollarSign size={18} /> : <FiTag size={18} />),
            iconKey,
            color: c.color || c.themeColor || matchedStarter?.color || (type === "income" ? "#10b981" : "#4f46e5"),
            bg: c.bg || matchedStarter?.bg || (type === "income" ? "#ecfdf5" : "#eef2ff"),
            isCustom: isTrulyCustom,
          });
        }
      }
    }

    // 3. Add starter template categories if not already present
    for (const c of ONBOARDING_CATEGORIES) {
      const normKey = c.name.toLowerCase().trim();
      if (!seenNames.has(normKey)) {
        seenNames.add(normKey);
        list.push({ ...c, isCustom: false });
      }
    }

    return list;
  }, [allCategories, localCustomCategories]);

  // Step 2: Category Selection
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => {
    return ONBOARDING_CATEGORIES.filter((c) => c.recommended).map((c) => c.id);
  });
  const [categoryFilter, setCategoryFilter] = useState("all"); // 'all' | 'expense' | 'income'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter currencies by search
  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencySearch]);

  // Filter categories by type tab
  const filteredCategories = useMemo(() => {
    if (categoryFilter === "expense") {
      return combinedCategories.filter((c) => c.type === "expense");
    }
    if (categoryFilter === "income") {
      return combinedCategories.filter((c) => c.type === "income");
    }
    return combinedCategories;
  }, [combinedCategories, categoryFilter]);

  // Toggle Category selection
  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick category selection actions
  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(combinedCategories.map((c) => c.id));
  };

  const handleSelectRecommended = () => {
    const recommendedIds = combinedCategories
      .filter((c) => c.recommended)
      .map((c) => c.id);
    setSelectedCategoryIds(recommendedIds);
  };

  const handleClearCategories = () => {
    setSelectedCategoryIds([]);
  };

  // Open Create Custom Category Modal
  const handleOpenCreateCategory = (defaultType = "expense") => {
    const initialPreset = PRESET_COLORS[defaultType === "income" ? 0 : 1];
    setCustomCategoryForm({
      name: "",
      type: defaultType,
      color: initialPreset.color,
      bg: initialPreset.bg,
      iconKey: defaultType === "income" ? "FiDollarSign" : "FiShoppingBag",
      description: "",
    });
    setShowCategoryModal(true);
  };

  // Save Custom Category (only create, add to list, and show as selected without calling API)
  const handleSaveCustomCategory = (e) => {
    e.preventDefault();
    const trimmed = customCategoryForm.name.trim();
    if (!trimmed) {
      toast.error("Please enter a category name.");
      return;
    }

    const newId = `custom-${Date.now()}`;
    const newCatItem = {
      id: newId,
      backendId: null,
      name: trimmed,
      type: customCategoryForm.type,
      color: customCategoryForm.color,
      bg: customCategoryForm.bg,
      iconKey: customCategoryForm.iconKey,
      icon: ICON_MAP[customCategoryForm.iconKey] || (customCategoryForm.type === "income" ? <FiDollarSign size={18} /> : <FiTag size={18} />),
      desc: customCategoryForm.description || (customCategoryForm.type === "income" ? "Custom Income" : "Custom Expense"),
      isCustom: true,
    };

    setLocalCustomCategories((prev) => [newCatItem, ...prev]);
    setSelectedCategoryIds((prev) => [...new Set([...prev, newId])]);
    toast.success(`Category "${trimmed}" added and selected!`);
    setShowCategoryModal(false);
  };

  // Step 1 Completion -> Proceed to Step 2
  // Calls PUT /v1/api/auth/profile directly without calling profile GET API
  const handleContinueToCategories = async () => {
    try {
      await updateProfile({ currency: selectedCurrency });

      // Update cached user currency in localStorage without refetching profile GET
      try {
        const cached = localStorage.getItem("waltrio_user");
        const parsed = cached ? JSON.parse(cached) : {};
        parsed.currency = selectedCurrency;
        localStorage.setItem("waltrio_user", JSON.stringify(parsed));
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn("[onboarding] update currency error:", err);
    }
    setCurrentStep(2);
  };

  // Step 2 Completion -> Finish Onboarding & Go to Dashboard
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // 1. Call PUT /v1/api/auth/profile to save primary currency and mark onboarding: true
      await updateProfile({
        currency: selectedCurrency,
        onboarding: true,
      });

      // 2. Create missing categories concurrently in parallel
      const chosenCategories = combinedCategories.filter((c) =>
        selectedCategoryIds.includes(c.id)
      );
      const pendingCategories = chosenCategories.filter((cat) => !cat.backendId);

      if (pendingCategories.length > 0) {
        await Promise.allSettled(
          pendingCategories.map((cat) =>
            createCategory(
              toCreateCategoryPayload({
                name: cat.name,
                type: cat.type,
                color: cat.color,
                bg: cat.bg,
                iconKey: cat.iconKey,
                description: cat.desc || "",
              })
            )
          )
        );
      }

      // 3. Immediately update localStorage cached user so route transitions are instant
      try {
        const cached = localStorage.getItem("waltrio_user");
        const parsed = cached ? JSON.parse(cached) : {};
        parsed.onboarding = true;
        parsed.isOnboarded = true;
        parsed.currency = selectedCurrency;
        localStorage.setItem("waltrio_user", JSON.stringify(parsed));
      } catch {
        // ignore
      }

      // 4. Call profile GET API and check onboarding status
      try {
        const profileRes = await getProfile();
        const profileData = extractUserData(profileRes);
        if (profileData) {
          localStorage.setItem("waltrio_user", JSON.stringify(profileData));
        }
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      } catch (profileErr) {
        console.warn("[onboarding] getProfile check warning:", profileErr);
      }

      // 5. Invalidate categories cache so dashboard has fresh categories
      try {
        await queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      } catch {
        // ignore
      }

      // 6. All API calls completed -> Now redirect to Dashboard
      toast.success("Workspace configured successfully! Welcome to Waltrio.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("[onboarding] finish error:", err);
      toast.error(err?.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active currency object
  const activeCurrencyObj = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];
  }, [selectedCurrency]);

  if (isAlreadyOnboarded) {
    return null;
  }

  return (
    <div className="ur-onboarding-wrapper">
      {/* <div className="ur-onboarding-ambient" />
      <div className="ur-onboarding-ambient-2" /> */}

      {/* ===================================================================
          MAIN WIZARD CONTAINER (NO TOP HEADER, NO SKIP)
          =================================================================== */}
      <main className="flex-grow-1 d-flex align-items-center py-3 py-md-4">
        <Container style={{ maxWidth: "860px" }} className="px-2 px-sm-3">
          <div className="ur-onboarding-hero-card">
            {/* Elegant In-Card Step Stepper (Fully Clickable on all devices) */}
            <div className="ur-onboarding-stepper-row mb-3 mb-md-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`ur-in-card-step-pill ${currentStep === 1 ? "active" : "completed"}`}
                aria-label="Step 1: Primary Currency"
              >
                <div className="ur-in-card-step-badge">
                  {currentStep > 1 ? <FiCheck size={12} strokeWidth={3} /> : "1"}
                </div>
                <span className="ur-step-pill-label">1. Currency</span>
              </button>

              <div className="ur-in-card-step-line" />

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`ur-in-card-step-pill ${currentStep === 2 ? "active" : ""}`}
                aria-label="Step 2: Categories"
              >
                <div className="ur-in-card-step-badge">2</div>
                <span className="ur-step-pill-label">2. Categories</span>
              </button>
            </div>

            {/* ===============================================================
                STEP 1: SELECT CURRENCY
                =============================================================== */}
            {currentStep === 1 && (
              <div>
                <div className="ur-onboarding-header">
                  <h1 className="ur-onboarding-title">Set Your Primary Currency</h1>
                  <p className="ur-onboarding-subtitle">
                    Select the currency you use daily. Waltrio will automatically calculate balances,
                    income streams, and expense ceilings in this unit.
                  </p>
                </div>

                {/* Currency Search Input */}
                <div className="mb-3 position-relative" style={{ maxWidth: "380px", margin: "0 auto" }}>
                  <FiSearch
                    size={16}
                    className="position-absolute text-muted"
                    style={{ left: "14px", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    className="form-control rounded-12px fs-13px shadow-xs"
                    placeholder="Search currency, ISO code, or country..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    style={{
                      paddingLeft: "38px",
                      paddingRight: currencySearch ? "36px" : "14px",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      height: "44px",
                    }}
                  />
                  {currencySearch && (
                    <button
                      type="button"
                      onClick={() => setCurrencySearch("")}
                      className="btn btn-link p-0 position-absolute text-muted"
                      style={{ right: "12px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      <FiX size={15} />
                    </button>
                  )}
                </div>

                {/* Currency Selection Grid */}
                <div className="ur-currency-grid">
                  {filteredCurrencies.map((curr) => {
                    const isSelected = selectedCurrency === curr.code;
                    return (
                      <div
                        key={curr.code}
                        onClick={() => setSelectedCurrency(curr.code)}
                        className={`ur-currency-card ${isSelected ? "selected" : ""}`}
                      >
                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                          <div className="ur-currency-flag-box">{curr.flag}</div>
                          <div className="overflow-hidden">
                            <div className="ur-currency-code">{curr.code}</div>
                            <div className="ur-currency-name">{curr.name}</div>
                          </div>
                        </div>

                        <span className="ur-currency-symbol-badge">{curr.symbol}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="ur-onboarding-footer">
                  <div className="text-muted fs-12px d-none d-sm-block">
                    💡 You can change your primary currency anytime in Settings.
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleContinueToCategories}
                    className="ur-btn-primary-gradient rounded-12px px-4 py-2.5 fw-700 fs-13.5px d-flex align-items-center gap-2 ms-auto"
                  >
                    <span>Continue to Categories</span>
                    <FiArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* ===============================================================
                STEP 2: SELECT CATEGORIES ("WOW" EXPERIENCE + CUSTOM BUILDER)
                =============================================================== */}
            {currentStep === 2 && (
              <div>
                <div className="ur-onboarding-header">
                  <h1 className="ur-onboarding-title">Choose Categories to Track</h1>
                  <p className="ur-onboarding-subtitle">
                    Select the categories used in your workspace or create custom ones. Waltrio uses these
                    to power your visual analytics and monthly budget limits.
                  </p>
                </div>

                {/* Filter Tabs & Quick Action Bar */}
                <div className="ur-category-toolbar mb-3">
                  {/* Category Type Tabs */}
                  <div className="ur-category-filter-tabs">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`ur-filter-tab-btn ${categoryFilter === "all" ? "active" : ""}`}
                    >
                      All ({combinedCategories.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("expense")}
                      className={`ur-filter-tab-btn ${categoryFilter === "expense" ? "active" : ""}`}
                    >
                      Expenses ({combinedCategories.filter((c) => c.type === "expense").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("income")}
                      className={`ur-filter-tab-btn ${categoryFilter === "income" ? "active" : ""}`}
                    >
                      Income ({combinedCategories.filter((c) => c.type === "income").length})
                    </button>
                  </div>

                  {/* Quick Select Actions + Create Custom Button */}
                  <div className="ur-category-actions-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateCategory(categoryFilter === "income" ? "income" : "expense")}
                      className="ur-create-custom-btn"
                    >
                      <FiPlus size={14} />
                      <span>Create Custom</span>
                    </button>

                    <div className="d-flex align-items-center gap-2 fs-12px ms-sm-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllCategories}
                        className="btn btn-link text-primary p-0 fw-700 text-decoration-none fs-12px"
                      >
                        Select All
                      </button>
                      <span className="text-muted">·</span>
                      <button
                        type="button"
                        onClick={handleClearCategories}
                        className="btn btn-link text-muted p-0 fw-600 text-decoration-none fs-12px"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="ur-category-grid">
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`ur-onboard-cat-card ${isSelected ? "selected" : ""}`}
                      >
                        <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1 min-w-0">
                          {/* Vibrant Icon Box */}
                          <div
                            className="ur-category-icon-box flex-shrink-0"
                            style={{
                              backgroundColor: cat.bg,
                              color: cat.color,
                              boxShadow: isSelected ? `0 4px 12px ${cat.color}28` : "none",
                            }}
                          >
                            {cat.icon || <FiTag size={18} />}
                          </div>

                          {/* Info */}
                          <div className="overflow-hidden flex-grow-1 min-w-0 pe-2">
                            <div className="d-flex align-items-center gap-1 flex-nowrap">
                              <span className="ur-category-title text-truncate">{cat.name}</span>
                              <span className={`ur-type-badge ${cat.type} flex-shrink-0`}>
                                {cat.type}
                              </span>
                              {cat.isCustom && (
                                <span className="ur-custom-badge flex-shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="ur-category-desc text-truncate">{cat.desc}</div>
                          </div>
                        </div>

                        {/* Interactive Checkbox (Pinned to right, vertically centered) */}
                        <div className="ur-category-checkbox flex-shrink-0">
                          {isSelected && <FiCheck size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="ur-onboarding-footer">
                  <Button
                    variant="light"
                    onClick={() => setCurrentStep(1)}
                    className="rounded-12px px-3.5 py-2.5 border fw-600 fs-13px text-secondary d-flex align-items-center gap-1.5 w-100-mobile justify-content-center"
                    disabled={isSubmitting}
                  >
                    <FiArrowLeft size={15} />
                    <span>Back to Currency</span>
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleFinishOnboarding}
                    disabled={isSubmitting || selectedCategoryIds.length === 0}
                    className="ur-btn-primary-gradient rounded-12px px-4 py-2.5 fw-700 fs-13.5px d-flex align-items-center gap-2 w-100-mobile justify-content-center"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Launching your workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup &amp; Launch Dashboard</span>
                        <FiArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>

      {/* ===================================================================
          CUSTOM CATEGORY BUILDER MODAL (SAME AS WEBSITE FLOW)
          =================================================================== */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
        className="ur-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className={`ur-modal-icon ${customCategoryForm.type === "expense" ? "" : "income"}`}>
                {ICON_MAP[customCategoryForm.iconKey] || <FiTag size={16} />}
              </span>
              <span>Create Custom Category</span>
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Add your own custom spending or earnings channel to Waltrio.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveCustomCategory}>
          <Modal.Body className="py-3">
            {/* 1. Classification (Expense / Income) */}
            <div className="mb-3">
              <label className="ur-form-label">Classification *</label>
              <div className="cat-type-toggle-wrap">
                <button
                  type="button"
                  onClick={() => setCustomCategoryForm({ ...customCategoryForm, type: "expense" })}
                  className={`cat-type-toggle-btn expense ${customCategoryForm.type === "expense" ? "active" : ""}`}
                >
                  <FiTrendingDown size={14} />
                  <span>Expense Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomCategoryForm({ ...customCategoryForm, type: "income" })}
                  className={`cat-type-toggle-btn income ${customCategoryForm.type === "income" ? "active" : ""}`}
                >
                  <FiTrendingUp size={14} />
                  <span>Income Category</span>
                </button>
              </div>
            </div>

            {/* 2. Category Name */}
            <Form.Group className="mb-3">
              <Form.Label className="ur-form-label">Category Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Pet Care, Photography, Gym, Side Business"
                value={customCategoryForm.name}
                onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, name: e.target.value })}
                className="ur-form-input"
                autoFocus
              />
            </Form.Group>

            {/* 3. Description */}
            <Form.Group className="mb-3">
              <Form.Label className="ur-form-label">Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Brief notes for this category..."
                value={customCategoryForm.description}
                onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            {/* 4. Select Icon */}
            <div className="mb-3">
              <label className="ur-form-label">Select Icon</label>
              <div
                className="d-flex flex-wrap gap-2 p-2 rounded-8px border bg-light"
                style={{ borderColor: "#e2e8f0", maxHeight: "150px", overflowY: "auto" }}
              >
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = customCategoryForm.iconKey === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setCustomCategoryForm({ ...customCategoryForm, iconKey: item.key })}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#4f46e5" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#64748b",
                        border: isSelected ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                        fontSize: "16px",
                        transition: "all 0.15s ease",
                      }}
                      title={item.label}
                    >
                      {item.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Theme Palette Color */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <label className="ur-form-label mb-2 pb-1">Theme Palette Color</label>
                <span className="text-muted fs-11px fw-600">
                  {customCategoryForm.color ? customCategoryForm.color.toUpperCase() : "#4F46E5"}
                </span>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 pt-0.5">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = (customCategoryForm.color || "").toLowerCase() === preset.color.toLowerCase();
                  return (
                    <div
                      key={preset.name}
                      onClick={() =>
                        setCustomCategoryForm({
                          ...customCategoryForm,
                          color: preset.color,
                          bg: preset.bg,
                        })
                      }
                      style={{
                        backgroundColor: preset.color,
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isSelected
                          ? "0 0 0 2px #fff, 0 0 0 4px #4f46e5"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                      title={preset.name}
                    >
                      {isSelected && <FiCheck size={14} color="#ffffff" strokeWidth={3} />}
                    </div>
                  );
                })}

                {/* Custom Color Picker Swatch */}
                {(() => {
                  const isCustom = !PRESET_COLORS.some(
                    (p) => p.color.toLowerCase() === (customCategoryForm.color || "").toLowerCase()
                  );
                  return (
                    <label
                      style={{
                        position: "relative",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isCustom ? customCategoryForm.color : "#ffffff",
                        border: isCustom ? "none" : "1.5px dashed #cbd5e1",
                        boxShadow: isCustom
                          ? `0 0 0 2px #fff, 0 0 0 4px ${customCategoryForm.color}`
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                      title="Custom Color Picker"
                    >
                      <input
                        type="color"
                        value={customCategoryForm.color?.startsWith("#") ? customCategoryForm.color : "#4f46e5"}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setCustomCategoryForm({
                            ...customCategoryForm,
                            color: newColor,
                            bg: newColor + "18",
                          });
                        }}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "100%",
                          height: "100%",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                        }}
                      />
                      {isCustom ? (
                        <FiCheck size={14} color="#ffffff" strokeWidth={3} />
                      ) : (
                        <FiDroplet size={14} color="#64748b" />
                      )}
                    </label>
                  );
                })()}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              onClick={() => setShowCategoryModal(false)}
              className="rounded-8px px-3 py-2 text-muted fw-600 fs-13px"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="ur-btn-primary-gradient rounded-8px px-4 py-2 fw-700 fs-13px"
            >
              Create &amp; Select
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

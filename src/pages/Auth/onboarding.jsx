import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiDollarSign,
  FiPieChart,
  FiHome,
  FiShoppingBag,
  FiCoffee,
  FiZap,
  FiTruck,
  FiActivity,
  FiFilm,
  FiTrendingUp,
  FiGift,
  FiPlus,
  FiTrash2,
  FiCreditCard,
  FiX,
  FiCheckCircle,
  FiShield,
  FiAlertCircle,
  FiPercent,
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { BsBank2, BsStars } from "react-icons/bs";
import { SiGooglepay, SiPhonepe } from "react-icons/si";
import "../../assets/css/onboarding.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Currency options for Select2
  const currencyOptions = [
    {
      value: "INR",
      symbol: "₹",
      label: "🇮🇳 INR - Indian Rupee (₹)",
      flag: "🇮🇳",
      name: "Indian Rupee",
    },
    {
      value: "USD",
      symbol: "$",
      label: "🇺🇸 USD - US Dollar ($)",
      flag: "🇺🇸",
      name: "US Dollar",
    },
    {
      value: "EUR",
      symbol: "€",
      label: "🇪🇺 EUR - Euro (€)",
      flag: "🇪🇺",
      name: "Euro",
    },
    {
      value: "GBP",
      symbol: "£",
      label: "🇬🇧 GBP - British Pound (£)",
      flag: "🇬🇧",
      name: "British Pound",
    },
    {
      value: "AED",
      symbol: "د.إ",
      label: "🇦🇪 AED - UAE Dirham (د.إ)",
      flag: "🇦🇪",
      name: "UAE Dirham",
    },
    {
      value: "CAD",
      symbol: "C$",
      label: "🇨🇦 CAD - Canadian Dollar (C$)",
      flag: "🇨🇦",
      name: "Canadian Dollar",
    },
    {
      value: "SGD",
      symbol: "S$",
      label: "🇸🇬 SGD - Singapore Dollar (S$)",
      flag: "🇸🇬",
      name: "Singapore Dollar",
    },
  ];

  // Bank Options (Creatable / Selectable)
  const bankOptions = [
    { value: "HDFC Bank", label: "🏦 HDFC Bank" },
    { value: "State Bank of India", label: "🏦 State Bank of India (SBI)" },
    { value: "ICICI Bank", label: "🏦 ICICI Bank" },
    { value: "Axis Bank", label: "🏦 Axis Bank" },
    { value: "Kotak Mahindra Bank", label: "🏦 Kotak Mahindra Bank" },
    { value: "Punjab National Bank", label: "🏦 Punjab National Bank (PNB)" },
    { value: "Bank of Baroda", label: "🏦 Bank of Baroda" },
    { value: "Canara Bank", label: "🏦 Canara Bank" },
    { value: "Federal Bank", label: "🏦 Federal Bank" },
    { value: "IndusInd Bank", label: "🏦 IndusInd Bank" },
    { value: "Custom Bank", label: "➕ Add Other / Custom Bank..." },
  ];

  // Preset UPI App Options
  const presetUpiApps = [
    { name: "Google Pay", icon: <SiGooglepay size={16} color="#4285F4" /> },
    { name: "PhonePe", icon: <SiPhonepe size={16} color="#5f259f" /> },
    { name: "Paytm", icon: <span className="fw-bold fs-11px text-primary">Paytm</span> },
    { name: "CRED", icon: <span className="fw-bold fs-11px text-dark">CRED</span> },
    { name: "BHIM UPI", icon: <span className="fw-bold fs-11px text-success">BHIM</span> },
    { name: "Amazon Pay", icon: <span className="fw-bold fs-11px text-warning">Amazon</span> },
  ];

  // React-Select Custom Styling
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
      borderRadius: "12px",
      minHeight: "46px",
      height: "46px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.15)" : "none",
      fontSize: "14px",
      fontWeight: "500",
      color: "#0f172a",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
        ? "rgba(99, 102, 241, 0.08)"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#0f172a",
      fontSize: "13.5px",
      fontWeight: state.isSelected ? "600" : "500",
      borderRadius: "8px",
      margin: "3px 6px",
      width: "calc(100% - 12px)",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      boxShadow: "0 14px 30px -4px rgba(15, 23, 42, 0.12)",
      border: "1px solid #e2e8f0",
      padding: "4px",
      zIndex: 9999,
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
      fontWeight: "600",
      fontSize: "14px",
    }),
  };

  // Main Onboarding Form State
  const [setupData, setSetupData] = useState({
    // Step 1: Currency & Income
    selectedCurrency: currencyOptions[0],
    monthlyIncome: 50000,

    // Step 2: Bank Accounts (Multiple + Custom Bank + Custom UPI)
    accounts: [
      {
        id: "acc_1",
        bankName: "HDFC Bank",
        isCustomBank: false,
        customBankName: "",
        balance: 35000,
        upiApp: "Google Pay",
        isCustomUpi: false,
        customUpiName: "",
      },
    ],

    // Step 2: Credit Cards & Monthly Limit Management
    enableCreditCards: false,
    creditCards: [
      {
        id: "card_1",
        cardName: "HDFC Millennia Credit Card",
        creditLimit: 100000,
        monthlySpendLimit: 30000,
        utilizationPercent: 30,
        billingDay: 15,
      },
    ],

    // Step 3: Selected Categories
    selectedCategories: [
      "Housing & Rent",
      "Groceries & Essentials",
      "Food & Dining",
      "Bills & Utilities",
      "Transport & Fuel",
    ],
  });

  // Custom Category Input
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Preset Categories
  const defaultCategoryOptions = [
    { name: "Housing & Rent", icon: <FiHome />, color: "#4f46e5", bg: "#eef2ff" },
    { name: "Groceries & Essentials", icon: <FiShoppingBag />, color: "#10b981", bg: "#ecfdf5" },
    { name: "Food & Dining", icon: <FiCoffee />, color: "#f59e0b", bg: "#fffbeb" },
    { name: "Bills & Utilities", icon: <FiZap />, color: "#ef4444", bg: "#fef2f2" },
    { name: "Transport & Fuel", icon: <FiTruck />, color: "#06b6d4", bg: "#ecfeff" },
    { name: "Health & Fitness", icon: <FiActivity />, color: "#ec4899", bg: "#fdf2f8" },
    { name: "Entertainment & OTT", icon: <FiFilm />, color: "#8b5cf6", bg: "#f5f3ff" },
    { name: "Investments & SIP", icon: <FiTrendingUp />, color: "#14b8a6", bg: "#f0fdfa" },
    { name: "Shopping & Lifestyle", icon: <FiGift />, color: "#f97316", bg: "#fff7ed" },
  ];

  const currSymbol = setupData.selectedCurrency?.symbol || "₹";

  // Bank Account Handlers
  const handleAddAccount = () => {
    const newAcc = {
      id: `acc_${Date.now()}`,
      bankName: "State Bank of India",
      isCustomBank: false,
      customBankName: "",
      balance: 10000,
      upiApp: "PhonePe",
      isCustomUpi: false,
      customUpiName: "",
    };
    setSetupData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAcc],
    }));
  };

  const handleUpdateAccount = (id, updates) => {
    setSetupData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates } : acc
      ),
    }));
  };

  const handleDeleteAccount = (id) => {
    if (setupData.accounts.length <= 1) return;
    setSetupData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((acc) => acc.id !== id),
    }));
  };

  // Credit Card Handlers
  const handleAddCreditCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      cardName: "ICICI Amazon Pay Credit Card",
      creditLimit: 75000,
      monthlySpendLimit: 22500,
      utilizationPercent: 30,
      billingDay: 20,
    };
    setSetupData((prev) => ({
      ...prev,
      creditCards: [...prev.creditCards, newCard],
    }));
  };

  const handleUpdateCard = (id, updates) => {
    setSetupData((prev) => ({
      ...prev,
      creditCards: prev.creditCards.map((card) => {
        if (card.id !== id) return card;
        const updated = { ...card, ...updates };
        if (updates.creditLimit !== undefined || updates.monthlySpendLimit !== undefined) {
          const limit = Number(updated.creditLimit || 0);
          const spend = Number(updated.monthlySpendLimit || 0);
          updated.utilizationPercent = limit > 0 ? Math.round((spend / limit) * 100) : 0;
        }
        return updated;
      }),
    }));
  };

  const handleSetCardPercent = (id, percent) => {
    const card = setupData.creditCards.find((c) => c.id === id);
    if (!card) return;
    const limit = Number(card.creditLimit || 0);
    const calculatedSpend = Math.round((limit * percent) / 100);
    handleUpdateCard(id, {
      monthlySpendLimit: calculatedSpend,
      utilizationPercent: percent,
    });
  };

  const handleDeleteCard = (id) => {
    if (setupData.creditCards.length <= 1) {
      setSetupData((prev) => ({ ...prev, enableCreditCards: false }));
      return;
    }
    setSetupData((prev) => ({
      ...prev,
      creditCards: prev.creditCards.filter((card) => card.id !== id),
    }));
  };

  // Category Toggle
  const toggleCategory = (catName) => {
    setSetupData((prev) => {
      const exists = prev.selectedCategories.includes(catName);
      if (exists) {
        return {
          ...prev,
          selectedCategories: prev.selectedCategories.filter((c) => c !== catName),
        };
      } else {
        return {
          ...prev,
          selectedCategories: [...prev.selectedCategories, catName],
        };
      }
    });
  };

  // Add Custom Category
  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!customCategoryInput.trim()) return;
    const trimmed = customCategoryInput.trim();
    if (!setupData.selectedCategories.includes(trimmed)) {
      setSetupData((prev) => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, trimmed],
      }));
    }
    setCustomCategoryInput("");
  };

  // Finish Setup & Save
  const handleFinish = () => {
    localStorage.setItem("waltro_user_setup", JSON.stringify(setupData));
    localStorage.setItem("waltro_onboarding_completed", "true");
    navigate("/dashboard");
  };

  // Summary Calculations
  const totalBankBalance = setupData.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );
  const totalCreditLimit = setupData.enableCreditCards
    ? setupData.creditCards.reduce((sum, card) => sum + Number(card.creditLimit || 0), 0)
    : 0;
  const totalCardMonthlyLimit = setupData.enableCreditCards
    ? setupData.creditCards.reduce((sum, card) => sum + Number(card.monthlySpendLimit || 0), 0)
    : 0;

  const needsBudget = Math.round(setupData.monthlyIncome * 0.5);
  const wantsBudget = Math.round(setupData.monthlyIncome * 0.3);
  const savingsBudget = Math.round(setupData.monthlyIncome * 0.2);

  return (
    <div className="onboarding-page-wrapper">
      {/* Top Navigation Bar */}
      <header className="onboarding-navbar">
        <Container className="d-flex align-items-center justify-content-between">
          <div className="onboarding-brand">
            <div className="onboarding-brand-icon">
              <IoWalletOutline size={20} />
            </div>
            <span className="onboarding-brand-name">
              Wal<span>trio</span>
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="stepper-container d-none d-md-flex">
            {[
              { step: 1, label: "Currency & Inflow" },
              { step: 2, label: "Banks, UPI & Cards" },
              { step: 3, label: "Spend Categories" },
              { step: 4, label: "Ready" },
            ].map((item, idx, arr) => (
              <React.Fragment key={item.step}>
                <div
                  className={`stepper-item ${
                    currentStep === item.step
                      ? "active"
                      : currentStep > item.step
                      ? "completed"
                      : ""
                  }`}
                  onClick={() => currentStep > item.step && setCurrentStep(item.step)}
                >
                  <div className="stepper-bubble">
                    {currentStep > item.step ? <FiCheck size={14} /> : item.step}
                  </div>
                  <span className="stepper-label">{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`stepper-line ${
                      currentStep > item.step ? "completed" : ""
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Skip Button */}
          <button
            className="btn btn-sm btn-link text-decoration-none text-muted fw-bold d-flex align-items-center gap-1"
            onClick={handleFinish}
          >
            Skip Setup <FiArrowRight size={14} />
          </button>
        </Container>
      </header>

      {/* Main Body */}
      <main className="flex-grow-1 d-flex align-items-center py-4 py-md-5">
        <Container style={{ maxWidth: "880px" }}>
          <div className="onboarding-card-box">
            {/* ================= STEP 1: CURRENCY & MONTHLY INFLOW ================= */}
            {currentStep === 1 && (
              <div>
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-2"
                    style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
                  >
                    <FiDollarSign size={28} />
                  </div>
                  <h3 className="fw-bold text-dark mb-1">Set Currency & Monthly Inflow</h3>
                  <p className="text-muted fs-14px">
                    Choose your primary currency and estimated monthly income.
                  </p>
                </div>

                {/* Currency Select2 Dropdown */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark fs-14px mb-2">
                    Primary Currency
                  </label>
                  <Select
                    options={currencyOptions}
                    value={setupData.selectedCurrency}
                    onChange={(val) =>
                      setSetupData({ ...setupData, selectedCurrency: val })
                    }
                    styles={customSelectStyles}
                    isSearchable
                    placeholder="Search currency..."
                  />
                  <div className="form-text fs-12px text-muted mt-1">
                    Workspace will be formatted in {setupData.selectedCurrency?.name} ({currSymbol}).
                  </div>
                </div>

                {/* Monthly Income Input */}
                <div className="mb-4 pt-2">
                  <label className="form-label fw-bold text-dark fs-14px mb-2">
                    Expected Monthly Inflow / Salary
                  </label>
                  <div className="input-group mb-2">
                    <span className="input-group-text bg-white border-end-0 fw-bold fs-16px text-dark px-3">
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      className="form-control onboarding-input border-start-0 ps-1"
                      placeholder="50000"
                      value={setupData.monthlyIncome}
                      onChange={(e) =>
                        setSetupData({
                          ...setupData,
                          monthlyIncome: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* Preset Amount Chips */}
                  <div className="d-flex gap-2 flex-wrap align-items-center mt-2">
                    <span className="fs-12px text-muted fw-semibold">Quick picks:</span>
                    {[25000, 50000, 75000, 100000, 150000, 250000].map((amt) => (
                      <span
                        key={amt}
                        className={`preset-chip ${
                          setupData.monthlyIncome === amt ? "active" : ""
                        }`}
                        onClick={() =>
                          setSetupData({ ...setupData, monthlyIncome: amt })
                        }
                      >
                        {currSymbol}
                        {amt.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: BANKS, CUSTOM BANK/UPI & CREDIT CARDS ================= */}
            {currentStep === 2 && (
              <div>
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-2"
                    style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                  >
                    <BsBank2 size={28} />
                  </div>
                  <h3 className="fw-bold text-dark mb-1">Add Bank Accounts & Cards</h3>
                  <p className="text-muted fs-14px">
                    Add multiple bank accounts, custom banks, linked UPI apps, and credit cards with limits.
                  </p>
                </div>

                {/* Section A: Multiple Bank Accounts */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold text-dark mb-0 fs-15px">
                      🏦 Bank Accounts ({setupData.accounts.length})
                    </h6>
                    <span className="fs-12px text-muted">No cash in hand</span>
                  </div>

                  <div className="d-flex flex-column gap-3 mb-3">
                    {setupData.accounts.map((acc, index) => {
                      const isCustom =
                        acc.isCustomBank ||
                        !bankOptions.some((b) => b.value === acc.bankName);

                      const selectedBankOption = isCustom
                        ? { value: "Custom Bank", label: "➕ Custom / Other Bank" }
                        : bankOptions.find((b) => b.value === acc.bankName) || {
                            value: acc.bankName,
                            label: `🏦 ${acc.bankName}`,
                          };

                      return (
                        <div key={acc.id} className="bank-account-item-card">
                          <div className="bank-account-header">
                            <div className="d-flex align-items-center gap-2">
                              <span className="bank-number-badge">#{index + 1}</span>
                              <span className="fw-bold fs-14px text-dark">
                                {acc.isCustomBank && acc.customBankName
                                  ? acc.customBankName
                                  : acc.bankName || `Bank Account ${index + 1}`}
                              </span>
                            </div>

                            {setupData.accounts.length > 1 && (
                              <button
                                className="btn btn-sm btn-outline-danger p-1 border-0"
                                onClick={() => handleDeleteAccount(acc.id)}
                                title="Delete Account"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>

                          <Row className="g-3 mb-3">
                            {/* Bank Name Selector / Custom Bank */}
                            <Col md={6}>
                              <label className="form-label text-muted fs-12px fw-bold text-uppercase mb-1">
                                Bank Name
                              </label>
                              <Select
                                options={bankOptions}
                                value={selectedBankOption}
                                onChange={(val) => {
                                  if (val.value === "Custom Bank") {
                                    handleUpdateAccount(acc.id, {
                                      isCustomBank: true,
                                      bankName: "Custom Bank",
                                    });
                                  } else {
                                    handleUpdateAccount(acc.id, {
                                      isCustomBank: false,
                                      bankName: val.value,
                                    });
                                  }
                                }}
                                styles={customSelectStyles}
                                isSearchable
                              />

                              {/* Custom Bank Name Input */}
                              {acc.isCustomBank && (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    className="form-control onboarding-input fs-13px"
                                    placeholder="Enter your custom bank name (e.g. Jupiter, Niyo, Union Bank)..."
                                    value={acc.customBankName}
                                    onChange={(e) =>
                                      handleUpdateAccount(acc.id, {
                                        customBankName: e.target.value,
                                        bankName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </Col>

                            {/* Starting Balance */}
                            <Col md={6}>
                              <label className="form-label text-muted fs-12px fw-bold text-uppercase mb-1">
                                Starting Balance
                              </label>
                              <div className="input-group">
                                <span className="input-group-text bg-white fw-bold px-3">
                                  {currSymbol}
                                </span>
                                <input
                                  type="number"
                                  className="form-control onboarding-input"
                                  placeholder="35000"
                                  value={acc.balance}
                                  onChange={(e) =>
                                    handleUpdateAccount(acc.id, {
                                      balance: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* UPI App Linked Selection + Custom UPI */}
                          <div>
                            <label className="form-label text-muted fs-12px fw-bold text-uppercase mb-2 d-block">
                              Linked UPI App
                            </label>
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                              {presetUpiApps.map((upi) => (
                                <div
                                  key={upi.name}
                                  className={`upi-app-badge ${
                                    !acc.isCustomUpi && acc.upiApp === upi.name
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleUpdateAccount(acc.id, {
                                      upiApp: upi.name,
                                      isCustomUpi: false,
                                    })
                                  }
                                >
                                  {upi.icon}
                                  <span>{upi.name}</span>
                                  {!acc.isCustomUpi && acc.upiApp === upi.name && (
                                    <FiCheck size={14} className="text-primary ms-1" />
                                  )}
                                </div>
                              ))}

                              {/* Custom UPI Button */}
                              <div
                                className={`upi-app-badge ${
                                  acc.isCustomUpi ? "selected" : ""
                                }`}
                                onClick={() =>
                                  handleUpdateAccount(acc.id, {
                                    isCustomUpi: true,
                                    upiApp: acc.customUpiName || "Custom UPI",
                                  })
                                }
                              >
                                <FiPlus size={14} />
                                <span>Custom UPI</span>
                              </div>
                            </div>

                            {/* Custom UPI Text Input */}
                            {acc.isCustomUpi && (
                              <div className="mt-2" style={{ maxWidth: "340px" }}>
                                <input
                                  type="text"
                                  className="form-control onboarding-input fs-13px"
                                  placeholder="Enter UPI App name (e.g. WhatsApp Pay, Slice, Navi)..."
                                  value={acc.customUpiName}
                                  onChange={(e) =>
                                    handleUpdateAccount(acc.id, {
                                      customUpiName: e.target.value,
                                      upiApp: e.target.value || "Custom UPI",
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* + Add Another Bank Account Button */}
                  <button
                    type="button"
                    className="btn-add-account-card mb-4"
                    onClick={handleAddAccount}
                  >
                    <FiPlus size={18} /> Add Another Bank Account
                  </button>
                </div>

                {/* Section B: Credit Card & Monthly Spend Limit (% Breakdown) */}
                <div className="p-3 p-md-4 rounded-4 bg-light border">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="p-2 rounded-3 bg-white border text-primary"
                        style={{ width: "42px", height: "42px", display: "grid", placeItems: "center" }}
                      >
                        <FiCreditCard size={22} />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0 fs-14px">Credit Card & Spend Limit</h6>
                        <span className="text-muted fs-12px">
                          Track credit cards with safe monthly utilization percentage (% of limit)
                        </span>
                      </div>
                    </div>

                    <Form.Check
                      type="switch"
                      id="enable-credit-cards"
                      checked={setupData.enableCreditCards}
                      onChange={(e) =>
                        setSetupData({ ...setupData, enableCreditCards: e.target.checked })
                      }
                    />
                  </div>

                  {setupData.enableCreditCards && (
                    <div className="d-flex flex-column gap-3 mt-3 pt-3 border-top">
                      {setupData.creditCards.map((card, idx) => {
                        const percent = card.utilizationPercent || 30;
                        const isSafe = percent <= 30;
                        const isModerate = percent > 30 && percent <= 50;

                        return (
                          <div key={card.id} className="credit-card-item-card">
                            <div className="credit-card-header">
                              <div className="d-flex align-items-center gap-2">
                                <FiCreditCard size={18} className="text-info" />
                                <span className="fw-bold fs-14px text-white">
                                  {card.cardName || `Credit Card ${idx + 1}`}
                                </span>
                              </div>

                              <button
                                className="btn btn-sm text-danger border-0 p-0 opacity-75"
                                onClick={() => handleDeleteCard(card.id)}
                                title="Remove Card"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>

                            <Row className="g-3 mb-3">
                              {/* Card Name */}
                              <Col md={5}>
                                <label className="form-label text-white-50 fs-11px fw-bold text-uppercase mb-1">
                                  Card Name / Bank
                                </label>
                                <input
                                  type="text"
                                  className="form-control onboarding-input-dark"
                                  value={card.cardName}
                                  placeholder="e.g. HDFC Millennia, ICICI Amazon Pay"
                                  onChange={(e) =>
                                    handleUpdateCard(card.id, { cardName: e.target.value })
                                  }
                                />
                              </Col>

                              {/* Total Limit */}
                              <Col md={3}>
                                <label className="form-label text-white-50 fs-11px fw-bold text-uppercase mb-1">
                                  Total Limit
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text bg-dark border-secondary text-white fw-bold">
                                    {currSymbol}
                                  </span>
                                  <input
                                    type="number"
                                    className="form-control onboarding-input-dark"
                                    value={card.creditLimit}
                                    placeholder="100000"
                                    onChange={(e) =>
                                      handleUpdateCard(card.id, {
                                        creditLimit: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              </Col>

                              {/* Monthly Safe Limit */}
                              <Col md={4}>
                                <label className="form-label text-white-50 fs-11px fw-bold text-uppercase mb-1">
                                  Monthly Spend Limit ({percent}%)
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text bg-dark border-secondary text-white fw-bold">
                                    {currSymbol}
                                  </span>
                                  <input
                                    type="number"
                                    className="form-control onboarding-input-dark"
                                    value={card.monthlySpendLimit}
                                    placeholder="30000"
                                    onChange={(e) =>
                                      handleUpdateCard(card.id, {
                                        monthlySpendLimit: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              </Col>
                            </Row>

                            {/* Monthly % Preset Chips & Utilization Bar */}
                            <div className="pt-2 border-top border-secondary border-opacity-25">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="fs-11px text-white-50">Set Safe %:</span>
                                  {[20, 30, 40, 50].map((p) => (
                                    <span
                                      key={p}
                                      className={`percent-chip ${
                                        percent === p ? "active" : ""
                                      }`}
                                      onClick={() => handleSetCardPercent(card.id, p)}
                                    >
                                      {p}%
                                    </span>
                                  ))}
                                </div>

                                <span
                                  className="fs-12px fw-bold"
                                  style={{
                                    color: isSafe ? "#03FFB9" : isModerate ? "#f59e0b" : "#ef4444",
                                  }}
                                >
                                  {isSafe
                                    ? "🟢 Safe Utilization (<30%)"
                                    : isModerate
                                    ? "🟡 Moderate (30-50%)"
                                    : "🔴 High (>50%)"}
                                </span>
                              </div>

                              {/* Utilization Meter */}
                              <div className="utilization-meter-bar">
                                <div
                                  className="utilization-meter-fill"
                                  style={{
                                    width: `${Math.min(percent, 100)}%`,
                                    background: isSafe
                                      ? "#03FFB9"
                                      : isModerate
                                      ? "#f59e0b"
                                      : "#ef4444",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* + Add Another Card */}
                      <button
                        type="button"
                        className="btn-add-account-card bg-white"
                        onClick={handleAddCreditCard}
                      >
                        <FiPlus size={16} /> Add Another Credit Card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= STEP 3: SPEND CATEGORIES & CUSTOM CATEGORY ================= */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-2"
                    style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}
                  >
                    <FiPieChart size={28} />
                  </div>
                  <h3 className="fw-bold text-dark mb-1">Pick Your Spend Categories</h3>
                  <p className="text-muted fs-14px">
                    Select regular spending categories or add custom ones with the custom input below.
                  </p>
                </div>

                {/* Preset Categories Grid */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label fw-bold text-dark fs-14px mb-0">
                      Active Categories ({setupData.selectedCategories.length} selected)
                    </label>
                  </div>

                  <Row className="g-2">
                    {defaultCategoryOptions.map((cat) => {
                      const isSelected = setupData.selectedCategories.includes(cat.name);
                      return (
                        <Col xs={12} sm={6} md={4} key={cat.name}>
                          <div
                            className={`category-pill-tile ${isSelected ? "active" : ""}`}
                            onClick={() => toggleCategory(cat.name)}
                          >
                            <div
                              className="rounded-2 p-1 d-flex align-items-center justify-content-center"
                              style={{
                                background: cat.bg,
                                color: cat.color,
                                width: "32px",
                                height: "32px",
                              }}
                            >
                              {cat.icon}
                            </div>
                            <span className="fs-13px flex-grow-1 text-truncate">
                              {cat.name}
                            </span>
                            {isSelected && (
                              <FiCheck size={16} className="text-primary flex-shrink-0" />
                            )}
                          </div>
                        </Col>
                      );
                    })}

                    {/* Show user added custom categories */}
                    {setupData.selectedCategories
                      .filter(
                        (cat) => !defaultCategoryOptions.some((d) => d.name === cat)
                      )
                      .map((customCat) => (
                        <Col xs={12} sm={6} md={4} key={customCat}>
                          <div className="category-pill-tile active">
                            <div
                              className="rounded-2 p-1 d-flex align-items-center justify-content-center"
                              style={{
                                background: "#eef2ff",
                                color: "#4f46e5",
                                width: "32px",
                                height: "32px",
                              }}
                            >
                              <BsStars size={16} />
                            </div>
                            <span className="fs-13px flex-grow-1 text-truncate">
                              {customCat}
                            </span>
                            <span
                              className="text-danger cursor-pointer ms-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(customCat);
                              }}
                              title="Remove custom category"
                            >
                              <FiX size={16} />
                            </span>
                          </div>
                        </Col>
                      ))}
                  </Row>
                </div>

                {/* Custom Category Input Form */}
                <div className="custom-category-box mb-4">
                  <label className="form-label fw-bold text-dark fs-13px mb-2">
                    ➕ Add Custom Category
                  </label>
                  <form onSubmit={handleAddCustomCategory} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control onboarding-input"
                      placeholder="e.g. Gym & Fitness, Pet Care, Freelance, Crypto..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-4 fw-semibold rounded-3 text-nowrap"
                      disabled={!customCategoryInput.trim()}
                    >
                      <FiPlus size={16} className="me-1" /> Add
                    </button>
                  </form>
                </div>

                {/* Smart 50/30/20 Rule Insight */}
                <div className="p-3 rounded-3 bg-light border">
                  <div className="d-flex align-items-start gap-3">
                    <BsStars size={22} className="text-warning flex-shrink-0 mt-1" />
                    <div>
                      <h6 className="fw-bold mb-1 fs-13px">Smart Budget Allocation (50/30/20)</h6>
                      <p className="text-muted fs-12px mb-2">
                        Calculated from your {currSymbol}
                        {setupData.monthlyIncome.toLocaleString()} monthly inflow:
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-white text-dark border px-2 py-1 fs-12px">
                          🏠 50% Needs: <strong>{currSymbol}{needsBudget.toLocaleString()}</strong>
                        </span>
                        <span className="badge bg-white text-dark border px-2 py-1 fs-12px">
                          🍔 30% Wants: <strong>{currSymbol}{wantsBudget.toLocaleString()}</strong>
                        </span>
                        <span className="badge bg-white text-dark border px-2 py-1 fs-12px text-success">
                          💰 20% Savings: <strong>{currSymbol}{savingsBudget.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: REFRESHED READY & LAUNCH PAGE ================= */}
            {currentStep === 4 && (
              <div>
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex p-3 rounded-circle mb-2"
                    style={{ background: "rgba(3, 255, 185, 0.15)", color: "#059669" }}
                  >
                    <FiCheckCircle size={32} />
                  </div>
                  <h3 className="fw-bold text-dark mb-1">Your Workspace is Ready! 🎉</h3>
                  <p className="text-muted fs-14px">
                    Here is a quick summary of your configured financial profile.
                  </p>
                </div>

                {/* Top Luxury Dark Hero Card */}
                <div className="ready-hero-card mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3 border-secondary border-opacity-25">
                    <div>
                      <span
                        className="text-uppercase fs-11px fw-bold tracking-wide d-block mb-1"
                        style={{ color: "#03FFB9" }}
                      >
                        Total Initial Net Balance
                      </span>
                      <h2 className="fw-800 text-white mb-0">
                        {currSymbol}
                        {totalBankBalance.toLocaleString()}.00
                      </h2>
                    </div>
                    <span
                      className="badge px-3 py-2 rounded-pill fw-semibold"
                      style={{
                        background: "rgba(3, 255, 185, 0.2)",
                        color: "#03FFB9",
                      }}
                    >
                      {setupData.selectedCurrency?.value} Profile
                    </span>
                  </div>

                  {/* Connected Accounts Showcase */}
                  <div className="mb-3">
                    <div className="fs-12px opacity-75 text-uppercase fw-semibold mb-2">
                      Connected Bank Accounts ({setupData.accounts.length})
                    </div>
                    <Row className="g-2">
                      {setupData.accounts.map((acc) => {
                        const bankDisplayName =
                          acc.isCustomBank && acc.customBankName
                            ? acc.customBankName
                            : acc.bankName;
                        const upiDisplayName =
                          acc.isCustomUpi && acc.customUpiName
                            ? acc.customUpiName
                            : acc.upiApp;

                        return (
                          <Col xs={12} sm={6} key={acc.id}>
                            <div className="ready-bank-pill">
                              <div>
                                <div className="fw-bold fs-13px text-white text-truncate">
                                  {bankDisplayName}
                                </div>
                                <div className="fs-11px text-white-50">
                                  UPI: <span className="text-info fw-semibold">{upiDisplayName}</span>
                                </div>
                              </div>
                              <div className="fw-bold fs-13px text-white text-nowrap ms-2">
                                {currSymbol}
                                {Number(acc.balance || 0).toLocaleString()}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>

                  {/* Connected Credit Cards Showcase */}
                  {setupData.enableCreditCards && setupData.creditCards.length > 0 && (
                    <div className="pt-2 border-top border-secondary border-opacity-25">
                      <div className="fs-12px opacity-75 text-uppercase fw-semibold mb-2">
                        Connected Credit Cards ({setupData.creditCards.length})
                      </div>
                      <Row className="g-2">
                        {setupData.creditCards.map((card) => (
                          <Col xs={12} sm={6} key={card.id}>
                            <div className="ready-bank-pill">
                              <div>
                                <div className="fw-bold fs-13px text-white text-truncate">
                                  {card.cardName}
                                </div>
                                <div className="fs-11px text-white-50">
                                  Monthly Limit: <span className="text-warning fw-semibold">{currSymbol}{Number(card.monthlySpendLimit).toLocaleString()}</span> ({card.utilizationPercent}%)
                                </div>
                              </div>
                              <div className="fw-bold fs-13px text-white text-nowrap ms-2">
                                {currSymbol}{Number(card.creditLimit).toLocaleString()}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </div>

                {/* Stat Grid */}
                <Row className="g-3 mb-4">
                  <Col sm={6}>
                    <div className="ready-stat-box">
                      <div className="fs-12px text-muted fw-semibold">Monthly Income</div>
                      <div className="fw-bold fs-18px text-dark mt-1">
                        {currSymbol}
                        {Number(setupData.monthlyIncome).toLocaleString()}
                      </div>
                      <div className="fs-11px text-success fw-semibold mt-1">
                        + Configured for monthly cashflow
                      </div>
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="ready-stat-box">
                      <div className="fs-12px text-muted fw-semibold">Active Categories</div>
                      <div className="fw-bold fs-18px text-dark mt-1">
                        {setupData.selectedCategories.length} Categories
                      </div>
                      <div className="fs-11px text-muted mt-1">
                        Auto-assigned to expenses & budgets
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Final Launch Action */}
                <div className="text-center pt-2">
                  <button
                    className="btn-primary-onboarding px-5 py-3 fs-15px w-100 w-sm-auto"
                    onClick={handleFinish}
                  >
                    Launch My Waltrio Dashboard <FiArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Stepper Action Buttons */}
            {currentStep < 4 && (
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div className="d-flex align-items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      className="btn-secondary-onboarding"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                    >
                      <FiArrowLeft size={16} /> Back
                    </button>
                  )}
                  <button
                    className="btn-skip-onboarding"
                    onClick={handleFinish}
                  >
                    Skip setup
                  </button>
                </div>

                <button
                  className="btn-primary-onboarding"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                >
                  {currentStep === 3 ? "Review Setup" : "Continue"}{" "}
                  <FiArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiCheck,
  FiChevronDown,
  FiGlobe,
  FiSearch,
  FiX,
  FiTrash2,
  FiShield,
  FiKey,
  FiLayers,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  useProfile,
  useUpdateProfile,
  useSendDeleteAccountOtp,
  useDeleteAccount,
} from "../../hooks/useAuth";
import { getDeleteAccountStatus } from "../../api/auth.api";
import { toast } from "../../lib/toast";
import { CURRENCIES } from "../../utils/currency";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { mutateAsync: updateProfileMut, isPending: isSaving } = useUpdateProfile();
  const { mutateAsync: sendDeleteOtpMut, isPending: isSendingOtp } = useSendDeleteAccountOtp();
  const { mutateAsync: deleteAccountMut, isPending: isDeletingAccount } = useDeleteAccount();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currency: "INR",
  });

  // Modal Currency Selector State
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");

  // Modal Delete Account Confirmation & Multi-Step OTP State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState("CONFIRM"); // 'CONFIRM' | 'OTP' | 'PROCESSING' | 'COMPLETED'
  const [deleteOtp, setDeleteOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [deleteError, setDeleteError] = useState("");
  const [pollingStatus, setPollingStatus] = useState("processing");
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const otpRefs = useRef([]);
  const pollingTimerRef = useRef(null);

  // Sync profile data when fetched
  useEffect(() => {
    const source = profileData || user;
    if (source) {
      setFormData({
        name: source.name || source.fullName || "",
        email: source.email || "",
        phoneNumber: source.phoneNumber || source.phone || "",
        currency: source.currency || "INR",
      });
    }
  }, [profileData, user]);

  // Compute Avatar Initials
  const avatarInitials = useMemo(() => {
    const name = (formData.name || "").trim();
    if (!name) return "WA";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [formData.name]);

  // Current selected currency object
  const selectedCurrency = useMemo(() => {
    return (
      CURRENCIES.find(
        (c) => c.code.toLowerCase() === (formData.currency || "").toLowerCase()
      ) || CURRENCIES[1] // default INR
    );
  }, [formData.currency]);

  // Filtered currencies for modal search
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return CURRENCIES;
    const term = currencySearch.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term)
    );
  }, [currencySearch]);

  // Handle Form Submit -> PUT /profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfileMut({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        currency: formData.currency,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("[profile] update error:", err);
      toast.error(err.message || "Failed to update profile.");
    }
  };

  // Handle Resend OTP Timer Countdown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Handle Automatic Logout / Redirection Countdown on Completed Step
  useEffect(() => {
    let timer = null;
    if (deleteStep === "COMPLETED") {
      if (redirectCountdown > 0) {
        timer = setTimeout(() => {
          setRedirectCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        logout();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [deleteStep, redirectCountdown, logout]);

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, []);

  // Open Delete Modal
  const handleOpenDeleteModal = () => {
    if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    setDeleteStep("CONFIRM");
    setDeleteOtp(["", "", "", "", "", ""]);
    setDeleteError("");
    setPollingStatus("processing");
    setResendTimer(0);
    setRedirectCountdown(3);
    setShowDeleteModal(true);
  };

  // Step 1 -> Step 2: Send OTP
  const handleSendDeleteOtp = async () => {
    try {
      setDeleteError("");
      const res = await sendDeleteOtpMut();
      toast.success(
        res?.message || "A 6-digit verification OTP has been sent to your registered email."
      );
      setDeleteStep("OTP");
      setDeleteOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error("[delete-account] send otp error:", err);
      const msg = err.message || "Failed to send verification code. Please try again.";
      setDeleteError(msg);
      toast.error(msg);
    }
  };

  // Resend OTP
  const handleResendDeleteOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    try {
      setDeleteError("");
      const res = await sendDeleteOtpMut();
      toast.success(
        res?.message || "A fresh 6-digit verification OTP has been sent to your email."
      );
      setDeleteOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error("[delete-account] resend otp error:", err);
      const msg = err.message || "Failed to resend verification code. Please try again.";
      setDeleteError(msg);
      toast.error(msg);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...deleteOtp];
    nextOtp[index] = value.slice(-1);
    setDeleteOtp(nextOtp);
    if (deleteError) setDeleteError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !deleteOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    setDeleteOtp(digits);
    if (deleteError) setDeleteError("");
    otpRefs.current[5]?.focus();
  };

  // Poll /v1/api/auth/delete-account/status until completed
  const checkDeletionStatus = async () => {
    try {
      const res = await getDeleteAccountStatus();
      const status = (res?.data?.status || res?.status || "").toLowerCase();

      // If status === "completed" ➔ clear token and redirect to Login screen!
      if (status === "completed") {
        setDeleteStep("COMPLETED");
        setRedirectCountdown(3);
        toast.success("Account deleted successfully.");
        return;
      }

      // If status === "processing" ➔ wait 1 second and check again
      if (status === "processing" || status === "pending" || !status) {
        setPollingStatus(status || "processing");
        pollingTimerRef.current = setTimeout(() => {
          checkDeletionStatus();
        }, 1000);
        return;
      }

      if (status === "failed" || status === "error") {
        const errorMsg = res?.data?.message || res?.message || "Account deletion could not be completed.";
        setDeleteError(errorMsg);
        setDeleteStep("OTP");
        toast.error(errorMsg);
        return;
      }

      // Fallback completed
      setDeleteStep("COMPLETED");
      setRedirectCountdown(3);
    } catch (err) {
      // If 401 or 404, user account and session have already been deleted
      if (err.status === 401 || err.status === 404) {
        setDeleteStep("COMPLETED");
        setRedirectCountdown(3);
        return;
      }

      // Otherwise wait 1 second and retry
      pollingTimerRef.current = setTimeout(() => {
        checkDeletionStatus();
      }, 1000);
    }
  };

  // Step 2 -> Confirm with OTP and start polling status
  const handleConfirmDelete = async () => {
    const fullOtp = deleteOtp.join("").trim();
    if (fullOtp.length !== 6) {
      setDeleteError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setDeleteError("");
      const deleteRes = await deleteAccountMut({ otp: fullOtp });

      const initialStatus = (deleteRes?.data?.status || deleteRes?.status || "").toLowerCase();
      if (initialStatus === "completed") {
        setDeleteStep("COMPLETED");
        setRedirectCountdown(3);
        toast.success("Account deleted successfully.");
        return;
      }

      // Transition to PROCESSING and poll status every 1 second
      setDeleteStep("PROCESSING");
      setPollingStatus("processing");
      pollingTimerRef.current = setTimeout(() => {
        checkDeletionStatus();
      }, 1000);
    } catch (err) {
      console.error("[delete-account] deletion error:", err);
      const msg = err.message || "Invalid or expired verification code. Please try again.";
      setDeleteError(msg);
      toast.error(msg);
    }
  };

  // Immediate logout from completed modal
  const handleFinalLogout = () => {
    setShowDeleteModal(false);
    logout();
  };

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* ===================================================================
          1. PAGE HEADER
          =================================================================== */}
      <div className="ur-page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>User Profile</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              Account Center
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Manage your personal identity, contact details, primary currency, and security settings.
          </p>
        </div>

      </div>

      {/* ===================================================================
          2. TWO-COLUMN RESPONSIVE LAYOUT
          =================================================================== */}
      <Row className="g-4">
        {/* LEFT COLUMN: Profile Overview, Security, and Danger Zone */}
        <Col xs={12} lg={4}>
          <div className="d-flex flex-column gap-3">
            {/* Profile Overview Card */}
            <Card className="ms-premium-card border-0">
              <Card.Body className="p-4 text-center">
                {/* Avatar with Ring & Verified Badge */}
                <div className="position-relative d-inline-block mx-auto mb-3">
                  <div
                    style={{
                      width: "88px",
                      height: "88px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                      border: "3px solid #6366f1",
                      color: "#4f46e5",
                      fontSize: "28px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 18px rgba(99, 102, 241, 0.18)",
                    }}
                  >
                    {avatarInitials}
                  </div>
                  <span
                    title="Verified Account"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2.5px solid #ffffff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
                    }}
                  >
                    <FiCheck size={12} strokeWidth={3.5} />
                  </span>
                </div>

                <h4 className="fw-800 text-dark mb-1" style={{ fontSize: "19px" }}>
                  {formData.name || "Waltrio User"}
                </h4>
                <div className="mb-2">
                  <Badge
                    bg="primary-subtle"
                    className="text-primary fw-700 fs-11px px-2.5 py-1 rounded-pill"
                  >
                    Personal Account
                  </Badge>
                </div>

                {/* Email Pill Badge */}
                <div
                  className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill bg-light border text-truncate mb-3"
                  style={{ maxWidth: "100%" }}
                >
                  <FiMail size={13} className="text-secondary flex-shrink-0" />
                  <span className="text-truncate fs-12px text-secondary fw-600">
                    {formData.email || "user@waltrio.com"}
                  </span>
                </div>

                {/* Account Details Quick Stats */}
                <div className="pt-3 border-top text-start d-flex flex-column gap-2 fs-12px">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-500">Account Status:</span>
                    <span className="ur-status-pill success py-0 px-2 fs-11px gap-1">
                      <span className="ur-live-dot"></span> Active
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-500">Primary Currency:</span>
                    <span className="fw-700 text-dark d-flex align-items-center gap-1.5">
                      <span style={{ fontSize: "15px" }}>{selectedCurrency.flag}</span>
                      <span>{selectedCurrency.code}</span>
                      <span className="text-primary fw-800">({selectedCurrency.symbol})</span>
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Security Quick Overview */}
            <Card className="ms-premium-card border-0">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div
                    className="fw-800 fs-11.5px text-primary d-flex align-items-center gap-1.5"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    <FiShield size={14} /> SECURITY &amp; LOGIN
                  </div>
                </div>
                <p className="text-muted fs-11.5px mb-3">
                  Authentication credentials and security status for your Waltrio login.
                </p>

                <div className="d-flex flex-column gap-2.5">
                  {/* <div className="d-flex align-items-center justify-content-between p-2 rounded-8px bg-light border">
                    <div className="d-flex align-items-center gap-2">
                      <FiLock className="text-primary" size={15} />
                      <div>
                        <div className="fw-700 fs-12px text-dark">Password</div>
                        <div className="text-muted fs-10.5px">Protected &amp; Encrypted</div>
                      </div>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="btn btn-sm btn-outline-primary py-0 px-2 rounded-6px fs-11px fw-600"
                    >
                      Reset
                    </Link>
                  </div> */}

                  <div className="d-flex align-items-center justify-content-between p-2 rounded-8px bg-light border">
                    <div className="d-flex align-items-center gap-2">
                      <FiMail className="text-success" size={15} />
                      <div>
                        <div className="fw-700 fs-12px text-dark">Email Verification</div>
                        <div className="text-muted fs-10.5px">Primary Login Email</div>
                      </div>
                    </div>
                    <span className="ur-status-pill success py-0 px-2 fs-10.5px">
                      <FiCheck size={10} className="me-1" /> Verified
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Danger Zone Card */}
            <Card
              className="border-0"
              style={{
                borderRadius: "14px",
                border: "1px solid #fee2e2",
                backgroundColor: "#fffafa",
              }}
            >
              <Card.Body className="p-3">
                <div
                  className="d-flex align-items-center gap-1 text-danger fw-800 fs-16px mb-2"
                  style={{ letterSpacing: "0.5px" }}
                >
                  <FiTrash2 size={16} /> DANGER ZONE
                </div>
                <h6 className="fw-700 text-dark fs-14px mb-1">
                  Delete Profile &amp; Data
                </h6>
                <p className="text-muted fs-11.5px mb-3" style={{ lineHeight: "1.45" }}>
                  Permanently erase your account, login credentials, and all current transactions, income streams, expenses, and budgets. This action cannot be reversed.
                </p>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleOpenDeleteModal}
                  className="w-100 rounded-8px d-flex align-items-center justify-content-center gap-1 fs-16px fw-700 py-4"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <FiTrash2 size={16} />
                  <span>Delete Profile &amp; Account</span>
                </Button>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* RIGHT COLUMN: Account Credentials Form & Currency Settings */}
        <Col xs={12} lg={8}>
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="d-flex flex-column gap-3">
              {/* Card 1: Personal Credentials */}
              <Card className="ms-premium-card border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h5 className="ms-card-title mb-0 d-flex align-items-center gap-2">
                      <FiUser className="text-primary" size={17} /> Account Credentials
                    </h5>
                    <Badge bg="light" className="text-muted border fs-11px fw-600">
                      General Info
                    </Badge>
                  </div>
                  <p className="text-muted fs-12px mb-4">
                    Update your primary personal details. Your name will be used across reports, alerts, and shared statements.
                  </p>

                  <Row className="g-3">
                    {/* Full Name */}
                    <Col xs={12} sm={6}>
                      <label className="ur-form-label mb-1">Full Name *</label>
                      <div
                        className="d-flex align-items-center rounded-10px border px-3"
                        style={{
                          backgroundColor: "#f8fafc",
                          borderColor: "#e2e8f0",
                          height: "46px",
                        }}
                      >
                        <FiUser
                          size={16}
                          className="me-2.5 flex-shrink-0"
                          style={{ color: "#6366f1" }}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="border-0 bg-transparent w-100 text-dark fw-600"
                          style={{
                            outline: "none",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </Col>

                    {/* Phone Number */}
                    <Col xs={12} sm={6}>
                      <label className="ur-form-label mb-1">Phone Number</label>
                      <div
                        className="d-flex align-items-center rounded-10px border px-3"
                        style={{
                          backgroundColor: "#f8fafc",
                          borderColor: "#e2e8f0",
                          height: "46px",
                        }}
                      >
                        <FiPhone
                          size={16}
                          className="me-2.5 flex-shrink-0"
                          style={{ color: "#6366f1" }}
                        />
                        <input
                          type="tel"
                          placeholder="e.g. +1 555-0199"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          className="border-0 bg-transparent w-100 text-dark fw-500"
                          style={{
                            outline: "none",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </Col>

                    {/* Email Address (Read-only) */}
                    <Col xs={12}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="ur-form-label mb-0">Email Address</label>
                        <span className="text-muted fs-11px d-flex align-items-center gap-1">
                          <FiLock size={11} /> Primary identifier (Cannot be changed)
                        </span>
                      </div>
                      <div
                        className="d-flex align-items-center rounded-10px border px-3"
                        style={{
                          backgroundColor: "#f1f5f9",
                          borderColor: "#e2e8f0",
                          height: "46px",
                          cursor: "not-allowed",
                        }}
                      >
                        <FiMail
                          size={16}
                          className="me-2.5 flex-shrink-0"
                          style={{ color: "#94a3b8" }}
                        />
                        <input
                          type="email"
                          disabled
                          readOnly
                          value={formData.email}
                          className="border-0 bg-transparent w-100 text-muted"
                          style={{
                            outline: "none",
                            cursor: "not-allowed",
                            fontSize: "14px",
                            fontWeight: 500,
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Card 2: Primary Currency & Regional Preferences */}
              <Card className="ms-premium-card border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h5 className="ms-card-title mb-0 d-flex align-items-center gap-2">
                      <FiGlobe className="text-primary" size={17} /> Currency &amp; Regional Formatting
                    </h5>
                    <Badge bg="primary-subtle" className="text-primary fs-11px fw-700">
                      Live Dynamic
                    </Badge>
                  </div>
                  <p className="text-muted fs-12px mb-3">
                    Choose your primary currency. Waltrio uses this symbol dynamically across your entire dashboard, charts, income records, and expense caps.
                  </p>

                  {/* Active Currency Selector Box */}
                  <label className="ur-form-label mb-1.5">Primary Display Currency *</label>
                  <div
                    onClick={() => {
                      setCurrencySearch("");
                      setShowCurrencyModal(true);
                    }}
                    className="p-3 rounded-12px border bg-light d-flex align-items-center justify-content-between"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      border: "1.5px solid #e2e8f0",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        style={{
                          fontSize: "28px",
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          backgroundColor: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        }}
                      >
                        {selectedCurrency.flag}
                      </div>
                      <div>
                        <div className="fw-800 text-dark fs-14.5px">
                          {selectedCurrency.code}{" "}
                          <span className="text-primary fw-800">({selectedCurrency.symbol})</span>
                        </div>
                        <div className="text-muted fs-12px">{selectedCurrency.name}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="btn btn-sm btn-white border rounded-8px fs-12px fw-600 px-3 py-1 shadow-xs bg-white">
                        Change Currency
                      </span>
                      <FiChevronDown size={16} className="text-muted" />
                    </div>
                  </div>

                </Card.Body>
              </Card>

              {/* Save Changes Footer Card */}
              <div className="d-flex flex-wrap align-items-center justify-content-between p-3 rounded-12px border bg-white shadow-xs gap-2">
                <span className="text-muted fs-12px">
                  💡 Don't forget to save your profile after updating details or changing currency.
                </span>
                <Button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2 rounded-8px px-4 py-2 fs-13px fw-700"
                  disabled={isSaving || profileLoading}
                >
                  <FiCheck size={16} />
                  <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
                </Button>
              </div>
            </div>
          </form>
        </Col>
      </Row>

      {/* ===================================================================
          CURRENCY SELECTION MODAL
          =================================================================== */}
      <Modal
        show={showCurrencyModal}
        onHide={() => setShowCurrencyModal(false)}
        centered
        className="ur-currency-modal"
        dialogClassName="ur-currency-modal-dialog"
        contentClassName="border-0 shadow-lg"
        style={{ zIndex: 1060 }}
      >
        <div style={{ borderRadius: "20px", overflow: "hidden", backgroundColor: "#ffffff" }}>
          {/* Clean Modal Header */}
          <div
            className="d-flex align-items-center justify-content-between px-4 pt-3 pb-2"
            style={{ borderBottom: "1px solid #f1f5f9" }}
          >
            <h5 className="fw-700 text-dark mb-0" style={{ fontSize: "16px" }}>
              Select Primary Currency
            </h5>
            <button
              type="button"
              onClick={() => setShowCurrencyModal(false)}
              className="btn btn-link p-1 text-muted text-decoration-none"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Minimal Search Bar */}
          <div className="px-4 pt-3 pb-1">
            <div
              className="d-flex align-items-center px-3 rounded-12px"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                height: "44px",
              }}
            >
              <FiSearch size={16} className="text-muted me-2.5 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search currency by name, code (USD, EUR, INR)..."
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className="border-0 bg-transparent w-100 text-dark fw-500"
                style={{ outline: "none", fontSize: "13.5px" }}
              />
              {currencySearch && (
                <button
                  type="button"
                  onClick={() => setCurrencySearch("")}
                  className="btn btn-link p-0 text-muted text-decoration-none ms-1"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Currency List */}
          <div
            className="px-2 pt-2 pb-3"
            style={{
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {filteredCurrencies.length === 0 ? (
              <div className="py-4 text-center text-muted fs-13px">
                No currency matching "{currencySearch}"
              </div>
            ) : (
              filteredCurrencies.map((c, idx) => {
                const isSelected =
                  c.code.toLowerCase() === (formData.currency || "").toLowerCase();
                return (
                  <React.Fragment key={c.code}>
                    <div
                      onClick={() => {
                        setFormData({ ...formData, currency: c.code });
                        setShowCurrencyModal(false);
                      }}
                      className="d-flex align-items-center justify-content-between px-3 py-2 rounded-12px"
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#eef2ff" : "transparent",
                        transition: "background-color 0.12s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Left: Flag + Code + Name */}
                      <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: "22px", lineHeight: 1 }}>{c.flag}</span>
                        <div>
                          <div className="d-flex align-items-center gap-1.5">
                            <span className="fw-700 text-dark" style={{ fontSize: "13.5px" }}>
                              {c.code}
                            </span>
                            <span
                              style={{
                                color: "#4f46e5",
                                fontWeight: 700,
                                fontSize: "13px",
                              }}
                            >
                              ({c.symbol})
                            </span>
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {c.name}
                          </div>
                        </div>
                      </div>

                      {/* Right: Selected checkmark icon */}
                      {isSelected && (
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: "#4f46e5",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 5px rgba(79, 70, 229, 0.28)",
                            flexShrink: 0,
                          }}
                        >
                          <FiCheck size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Clean Inset Divider between items */}
                    {idx < filteredCurrencies.length - 1 && (
                      <div
                        style={{
                          height: "1px",
                          backgroundColor: "#f1f5f9",
                          margin: "2px 8px",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ===================================================================
          CONFIRM DELETE PROFILE & ACCOUNT MODAL (PERFECT MINIMAL SAAS DESIGN)
          =================================================================== */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (
            deleteStep !== "COMPLETED" &&
            deleteStep !== "PROCESSING" &&
            !isDeletingAccount
          ) {
            if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
            setShowDeleteModal(false);
          }
        }}
        centered
        className="ur-modal"
        dialogClassName="ur-account-delete-dialog"
        backdrop={
          deleteStep === "COMPLETED" || deleteStep === "PROCESSING"
            ? "static"
            : true
        }
        keyboard={deleteStep !== "COMPLETED" && deleteStep !== "PROCESSING"}
      >
        <div className="p-4" style={{ backgroundColor: "#ffffff" }}>
          {/* STEP 1: CONFIRMATION / PRE-WARNING */}
          {deleteStep === "CONFIRM" && (
            <div>
              <div className="text-center mb-3">
                <div className="ur-modal-avatar-badge danger">
                  <FiTrash2 size={24} />
                </div>
                <h5 className="fw-700 text-dark mb-1.5" style={{ fontSize: "17.5px" }}>
                  Delete Account?
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "12.5px", lineHeight: "1.55" }}>
                  This will permanently delete your profile, credentials, and all recorded financial data. This action cannot be reversed.
                </p>
              </div>

              {/* Registered Email Destination Row */}
              <div className="p-2.5 rounded-12px bg-light border my-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-8px bg-white border flex-shrink-0"
                    style={{ width: "28px", height: "28px" }}
                  >
                    <FiMail size={13} className="text-muted" />
                  </div>
                  <span className="text-truncate fs-12.5px fw-600 text-dark">
                    {formData.email || user?.email || "your registered email"}
                  </span>
                </div>
                <span className="badge bg-white text-secondary border fs-10.5px fw-600 px-2 py-1 rounded-6px flex-shrink-0">
                  Registered
                </span>
              </div>

              <p className="text-muted fs-11.5px text-center mb-3.5" style={{ lineHeight: "1.4" }}>
                We will send a 6-digit verification code to confirm ownership.
              </p>

              {deleteError && (
                <div className="alert alert-danger py-2 px-3 fs-12px mb-3 d-flex align-items-center gap-2 rounded-8px">
                  <FiAlertTriangle size={14} className="flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="d-flex gap-2 pt-1">
                <Button
                  variant="light"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-50 py-2 rounded-10px border fw-600 fs-13px text-secondary"
                  disabled={isSendingOtp}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleSendDeleteOtp}
                  className="w-50 py-2 rounded-10px fw-600 fs-13px d-flex align-items-center justify-content-center gap-1.5"
                  disabled={isSendingOtp}
                  style={{ backgroundColor: "#e11d48", borderColor: "#e11d48" }}
                >
                  {isSendingOtp ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <FiKey size={14} />
                      <span>Send Code</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {deleteStep === "OTP" && (
            <div>
              <div className="text-center mb-3">
                <div className="ur-modal-avatar-badge warning">
                  <FiShield size={24} />
                </div>
                <h5 className="fw-700 text-dark mb-1" style={{ fontSize: "17.5px" }}>
                  Enter Verification Code
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                  Please enter the 6-digit code sent to
                </p>
                <div className="fw-700 text-dark fs-12.5px text-truncate px-2 mt-0.5">
                  {formData.email || user?.email}
                </div>
              </div>

              {/* 6 Digit OTP Inputs */}
              <div className="d-flex justify-content-center gap-2 my-3">
                {deleteOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    disabled={isDeletingAccount}
                    autoFocus={idx === 0}
                    style={{
                      width: "42px",
                      height: "50px",
                      textAlign: "center",
                      fontSize: "19px",
                      fontWeight: 700,
                      borderRadius: "10px",
                      border: digit ? "2px solid #e11d48" : "1.5px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      outline: "none",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#e11d48";
                      e.target.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      if (!digit) {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.backgroundColor = "#f8fafc";
                      }
                    }}
                  />
                ))}
              </div>

              {/* Resend Timer / Action */}
              <div className="text-center mb-3 fs-12px">
                {resendTimer > 0 ? (
                  <span className="text-muted d-flex align-items-center justify-content-center gap-1">
                    <FiClock size={13} />
                    <span>Resend code in <strong>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
                  </span>
                ) : (
                  <div className="text-muted">
                    Didn't receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendDeleteOtp}
                      disabled={isSendingOtp}
                      className="btn btn-link p-0 text-danger fw-700 fs-12px text-decoration-none"
                    >
                      {isSendingOtp ? "Sending..." : "Resend Code"}
                    </button>
                  </div>
                )}
              </div>

              {deleteError && (
                <div className="alert alert-danger py-2 px-3 fs-12px mb-3 d-flex align-items-center gap-2 rounded-8px">
                  <FiAlertTriangle size={14} className="flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="d-flex gap-2 pt-1">
                <Button
                  variant="light"
                  onClick={() => {
                    setDeleteStep("CONFIRM");
                    setDeleteError("");
                  }}
                  className="w-50 py-2 rounded-10px border fw-600 fs-13px text-secondary"
                  disabled={isDeletingAccount}
                >
                  Back
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  className="w-50 py-2 rounded-10px fw-600 fs-13px d-flex align-items-center justify-content-center gap-1.5"
                  disabled={deleteOtp.join("").length !== 6 || isDeletingAccount}
                  style={{ backgroundColor: "#e11d48", borderColor: "#e11d48" }}
                >
                  {isDeletingAccount ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={14} />
                      <span>Delete Account</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2.5: PROCESSING STATUS CHECK (POLLING EVERY 1 SECOND) */}
          {deleteStep === "PROCESSING" && (
            <div className="text-center py-3">
              <div
                className="ur-modal-avatar-badge warning mb-3"
                style={{ width: "56px", height: "56px" }}
              >
                <span
                  className="spinner-border text-danger"
                  style={{ width: "24px", height: "24px", borderWidth: "3px" }}
                  role="status"
                />
              </div>
              <h5 className="fw-700 text-dark mb-1.5" style={{ fontSize: "17.5px" }}>
                Deleting Account...
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: "12.5px", lineHeight: "1.55" }}>
                Please wait while your financial data and account are being permanently wiped.
              </p>
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light border text-muted fs-11.5px">
                <span
                  className="ur-live-dot"
                  style={{
                    backgroundColor: "#e11d48",
                    boxShadow: "0 0 0 3px rgba(225, 29, 72, 0.2)",
                  }}
                />
                <span>
                  Status: <strong className="text-dark text-capitalize">{pollingStatus}</strong> (checking every 1s)...
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: DELETION COMPLETED (CLEAN SAAS FINISH - NO DELETION SUMMARY) */}
          {deleteStep === "COMPLETED" && (
            <div className="text-center py-2">
              <div className="ur-modal-avatar-badge success">
                <FiCheckCircle size={28} />
              </div>
              <h5 className="fw-700 text-dark mb-1" style={{ fontSize: "18px" }}>
                Account Deleted Successfully
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: "12.5px", lineHeight: "1.5" }}>
                Your account and all associated data have been permanently removed.
              </p>

              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light border text-muted fs-11.5px mb-3.5">
                <span className="spinner-border spinner-border-sm text-primary" style={{ width: "12px", height: "12px" }} />
                <span>Redirecting to login in <strong>{redirectCountdown}s</strong>...</span>
              </div>

              <Button
                variant="primary"
                onClick={handleFinalLogout}
                className="w-100 py-2.5 rounded-10px fw-700 fs-13px"
              >
                Return to Login Now
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </Container>
  );
}

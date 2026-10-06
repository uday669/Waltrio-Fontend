import React, { useState, useRef, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiRefreshCw,
  FiEdit2,
  FiKey,
  FiShield,
} from "react-icons/fi";
import Auth from "../../components/auth";
import {
  useForgotPassword,
  useVerifyForgotPasswordOtp,
  useResetForgotPassword,
} from "../../hooks/useAuth";
import { toast } from "../../lib/toast";
import "../../assets/css/style.css";
import "../../assets/css/responsive.css";

// OTP validity countdown (5 minutes = 300s)
const OTP_TIMER_SECONDS = 5 * 60;
const OTP_LENGTH = 4;
const EMPTY_OTP = Array(OTP_LENGTH).fill("");

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: 'email' -> Step 2: 'verify-otp' -> Step 3: 'new-password' -> Step 4: 'success'
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for OTP validity & resend
  useEffect(() => {
    let interval = null;
    if (step === "verify-otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer <= 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // ================= STEP 1: Request OTP =================
  const { mutate: requestOtp, isPending: requestingOtp } = useForgotPassword({
    onSuccess: (data) => {
      const msg = data?.message || `OTP has been sent successfully to ${email}. It is valid for 5 minutes.`;
      toast.success(msg);
      setStep("verify-otp");
      setTimer(OTP_TIMER_SECONDS);
      setCanResend(false);
      setError("");
      setOtp(EMPTY_OTP);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    },
    onError: (err) => {
      const message = err.message || "Failed to send reset code. Please check your email.";
      setError(message);
      toast.error(message);
    },
  });

  // ================= STEP 2: Verify OTP =================
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyForgotPasswordOtp({
    onSuccess: (data) => {
      const receivedToken = data?.data?.resetToken || data?.resetToken || "";
      const msg = data?.message || "OTP verified successfully. You can now reset your password.";
      toast.success(msg);
      setResetToken(receivedToken);
      setStep("new-password");
      setError("");
    },
    onError: (err) => {
      const message = err.message || "Invalid or expired OTP code. Please try again.";
      setError(message);
      toast.error(message);
    },
  });

  // ================= STEP 3: Reset Password =================
  const { mutate: resetPassword, isPending: resettingPassword } = useResetForgotPassword({
    onSuccess: (data) => {
      const msg = data?.message || "Password has been reset successfully. You can now log in with your new password.";
      toast.success(msg);
      setStep("success");
    },
    onError: (err) => {
      const message = err.message || "Could not reset password. Please restart the process.";
      setError(message);
      toast.error(message);
    },
  });

  // Handle Step 1 Submit
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    setError("");
    requestOtp({ email: cleanEmail });
  };

  // OTP inputs handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (error) setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (new RegExp(`^\\d{${OTP_LENGTH}}$`).test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      if (error) setError("");
    }
  };

  // Handle OTP Resend in Step 2
  const handleResend = () => {
    if (!canResend || requestingOtp) return;
    requestOtp({ email: email.trim() });
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 4000);
  };

  // Handle Step 2 Submit (Verify OTP)
  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits of your verification code.`);
      return;
    }
    setError("");
    verifyOtp({ email: email.trim(), otp: enteredOtp });
  };

  // Handle Step 3 Submit (Reset Password)
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (!resetToken) {
      setError("Session expired or missing token. Please start verification again.");
      setStep("email");
      return;
    }

    setError("");
    resetPassword({
      email: email.trim(),
      resetToken,
      newPassword,
    });
  };

  return (
    <Auth>
      <div className="after-lg-card">
        {/* ================= STEP 1: ENTER EMAIL ================= */}
        {step === "email" && (
          <>
            <div className="mb-4 text-center text-sm-start">
              <div className="auth-badge-pill">
                <span className="status-dot"></span>
                <span>Password Recovery</span>
              </div>
              <h2 className="auth-title">Forgot password? 🔑</h2>
              <p className="auth-subtitle">
                Enter your registered email and we'll send you a {OTP_LENGTH}-digit verification code to reset your password.
              </p>
            </div>

            {error && (
              <div className="auth-alert-error mb-3">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <Row className="g-3">
                <Col xs={12}>
                  <label className="form-label" htmlFor="forgot-email">
                    Registered Email Address
                  </label>
                  <div className="input-group-custom">
                    <span className="input-icon">
                      <FiMail />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="form-control"
                      placeholder="name@example.com"
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </Col>

                <Col xs={12} className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-theme w-100"
                    disabled={requestingOtp}
                  >
                    {requestingOtp ? (
                      <span className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Sending Recovery Code...</span>
                      </span>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <FiArrowRight size={17} />
                      </>
                    )}
                  </button>
                </Col>

                <Col xs={12} className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="d-inline-flex align-items-center gap-2 text-muted fs-13px fw-600 link-theme"
                  >
                    <FiArrowLeft size={15} />
                    <span>Back to Sign In</span>
                  </Link>
                </Col>
              </Row>
            </form>
          </>
        )}

        {/* ================= STEP 2: VERIFY OTP ================= */}
        {step === "verify-otp" && (
          <>
            <div className="mb-3 text-center text-sm-start">
              <div className="auth-badge-pill">
                <span className="status-dot"></span>
                <span>Security Verification</span>
              </div>
              <h2 className="auth-title">Enter OTP Code ✉️</h2>
              <p className="auth-subtitle">
                Enter the {OTP_LENGTH}-digit code sent to <strong className="text-dark">{email}</strong>
              </p>
            </div>

            {/* Email pill with edit option */}
            <div className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 bg-light fs-12px mb-3 border">
              <span className="text-muted text-truncate me-2">
                Code sent to: <strong className="text-dark">{email}</strong>
              </span>
              <button
                type="button"
                className="btn btn-link link-theme p-0 fs-12px fw-600 text-decoration-none d-flex align-items-center gap-1"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
              >
                <FiEdit2 size={12} />
                <span>Change</span>
              </button>
            </div>

            {error && (
              <div className="auth-alert-error mb-3">
                <span>{error}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 bg-success-subtle text-success fs-13px mb-3 border border-success-subtle">
                <FiCheckCircle size={16} />
                <span className="fw-600">A fresh {OTP_LENGTH}-digit recovery code has been sent!</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit}>
              <Row className="g-3">
                {/* 4-digit OTP box */}
                <Col xs={12}>
                  <label className="form-label d-block text-center text-sm-start mb-2">
                    Enter Verification Code
                  </label>
                  <div className="otp-container" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`otp-box ${digit ? "filled" : ""}`}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </Col>

                {/* Resend Code row */}
                <Col xs={12}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 fs-13px">
                    <span className="text-muted fs-12px">Didn't get the code?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="btn-resend-otp"
                        disabled={requestingOtp}
                      >
                        <FiRefreshCw size={13} />
                        <span>{requestingOtp ? "Sending..." : "Resend Code"}</span>
                      </button>
                    ) : (
                      <div className="d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-pill bg-light text-primary fw-600 fs-12px">
                        <span>
                          Valid for {String(Math.floor(timer / 60)).padStart(2, "0")}:
                          {String(timer % 60).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>
                </Col>

                {/* Verify OTP Button */}
                <Col xs={12} className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-theme w-100"
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? (
                      <span className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Verifying Code...</span>
                      </span>
                    ) : (
                      <>
                        <FiCheckCircle size={17} />
                        <span>Verify Code</span>
                      </>
                    )}
                  </button>
                </Col>

                {/* Back to Step 1 */}
                <Col xs={12} className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                    }}
                    className="btn btn-link link-theme text-decoration-none fs-13px fw-600 d-inline-flex align-items-center gap-1"
                  >
                    <FiArrowLeft size={14} />
                    <span>Back to Email</span>
                  </button>
                </Col>
              </Row>
            </form>
          </>
        )}

        {/* ================= STEP 3: CREATE NEW PASSWORD ================= */}
        {step === "new-password" && (
          <>
            <div className="mb-3 text-center text-sm-start">
              <div className="auth-badge-pill">
                <span className="status-dot"></span>
                <span>Reset Password</span>
              </div>
              <h2 className="auth-title">Create new password 🔒</h2>
              <p className="auth-subtitle">
                Your identity has been verified. Enter your new password below for <strong className="text-dark">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="auth-alert-error mb-3">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit}>
              <Row className="g-3">
                {/* New Password */}
                <Col xs={12}>
                  <label className="form-label" htmlFor="reset-new-password">
                    New Password
                  </label>
                  <div className="input-group-custom">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError("");
                      }}
                      className="form-control pe-5"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </Col>

                {/* Confirm New Password */}
                <Col xs={12}>
                  <label className="form-label" htmlFor="reset-confirm-password">
                    Confirm New Password
                  </label>
                  <div className="input-group-custom">
                    <span className="input-icon">
                      <FiLock />
                    </span>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError("");
                      }}
                      className="form-control pe-5"
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </Col>

                {/* Password Criteria Feedback */}
                {newPassword && (
                  <Col xs={12}>
                    <div className="ur-password-checklist">
                      <div className={`ur-checklist-item ${newPassword.length >= 6 ? "valid" : ""}`}>
                        <span>{newPassword.length >= 6 ? "✓" : "○"}</span>
                        <span>At least 6 characters</span>
                      </div>
                      {confirmPassword && (
                        <div className={`ur-checklist-item ${newPassword === confirmPassword ? "valid" : ""}`}>
                          <span>{newPassword === confirmPassword ? "✓" : "○"}</span>
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  </Col>
                )}

                {/* Submit Reset Button */}
                <Col xs={12} className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-theme w-100"
                    disabled={resettingPassword}
                  >
                    {resettingPassword ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Resetting Password...</span>
                      </span>
                    ) : (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <FiShield size={17} />
                        <span>Reset Password</span>
                      </span>
                    )}
                  </button>
                </Col>

                {/* Cancel Link */}
                <Col xs={12} className="pt-1 text-center">
                  <Link
                    to="/login"
                    className="d-inline-flex align-items-center gap-2 text-muted fs-13px fw-600 link-theme"
                  >
                    <FiArrowLeft size={15} />
                    <span>Cancel &amp; Back to Sign In</span>
                  </Link>
                </Col>
              </Row>
            </form>
          </>
        )}

        {/* ================= STEP 4: SUCCESS STATE ================= */}
        {step === "success" && (
          <div className="auth-success-screen">
            {/* Double-Ring Glowing Success Icon */}
            <div className="auth-success-icon-halo">
              <div className="auth-success-icon-core">
                <FiCheckCircle size={26} />
              </div>
            </div>

            {/* Badge */}
            <div className="auth-badge-pill auth-badge-success">
              <span className="status-dot" style={{ backgroundColor: "#10b981" }}></span>
              <span>Security Updated</span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="auth-title mb-2">Password Reset! 🎉</h2>
            <p className="auth-subtitle mb-4 text-center" style={{ maxWidth: "380px" }}>
              Your password has been reset successfully. You can now log in to your Waltrio account with your new credentials.
            </p>

            {/* Action CTA */}
            <button
              type="button"
              className="btn btn-theme w-100"
              onClick={() => navigate("/login", { state: { email, verified: true } })}
            >
              <span>Sign In to Account</span>
              <FiArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </Auth>
  );
}

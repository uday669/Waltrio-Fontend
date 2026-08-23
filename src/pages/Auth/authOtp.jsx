import React, { useState, useRef, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiRefreshCw, FiArrowLeft, FiShield } from "react-icons/fi";
import Auth from "../../components/auth";
import '../../assets/css/style.css';
import '../../assets/css/responsive.css';


export default function AuthOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email address";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (error) setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      if (error) setError("");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredCode = otp.join("");
    if (enteredCode.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 600);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
    setResendSuccess(true);
    setError("");
    inputRefs.current[0]?.focus();
    setTimeout(() => setResendSuccess(false), 4000);
  };

  return (
    <Auth>
      <div className="after-lg-card">
        <div className="mb-4 text-center text-sm-start">
          <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle ur-bg-1942C31A ur-text-theme mb-3">
            <FiShield size={26} />
          </div>
          <h2 className="auth-title">Verify Your Email ✉️</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to <strong className="text-dark">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="auth-alert-error mb-3">
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 bg-success-subtle text-success fs-13px mb-3">
            <FiCheckCircle size={16} />
            <span>A new 6-digit OTP code has been sent to your email!</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <Row className="g-4">
            {/* 6-Digit OTP Inputs */}
            <Col xs={12}>
              <div className="otp-container" onPaste={handlePaste}>
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
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-box ${digit ? "filled" : ""}`}
                    aria-label={`Digit ${index + 1}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </Col>

            {/* Resend Timer & Resend Trigger */}
            <Col xs={12}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 fs-14px">
                <span className="ur-text-5E5E5E fs-14px">Didn't receive the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="btn-resend-otp"
                  >
                    <FiRefreshCw size={14} />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <div className="d-inline-flex align-items-center gap-1 ur-text-theme fw-600">
                    <span>Resend in 00:{timer < 10 ? `0${timer}` : timer}</span>
                  </div>
                )}
              </div>
            </Col>

            {/* Verify Button */}
            <Col xs={12} className="pt-1">
              <button
                type="submit"
                className="btn btn-theme w-100"
                disabled={loading}
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    <span>Verify &amp; Continue</span>
                  </>
                )}
              </button>
            </Col>

            {/* Back to Login Link */}
            <Col xs={12}>
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="d-inline-flex align-items-center gap-2 ur-text-5E5E5E fs-14px fw-500 link-theme"
                >
                  <FiArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </Col>
          </Row>
        </form>
      </div>
    </Auth>
  );
}

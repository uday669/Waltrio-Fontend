import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import Auth from "../../components/auth";
import { useRegister } from "../../hooks/useAuth";
import { toast } from "../../lib/toast";
import '../../assets/css/style.css';
import '../../assets/css/responsive.css';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");

  const { mutate: register, isPending: loading } = useRegister({
    onSuccess: () => {
      // Backend has sent an OTP — move to verification with the email in state.
      toast.success("Account created! We sent a verification code to your email.");
      navigate("/otp", { state: { email: formData.email, from: "register" } });
    },
    onError: (err) => {
      const message = err.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check again.");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setError("");
    register({
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      agreeWaltrio: formData.agreeTerms,
    });
  };

  return (
    <Auth>
      <div className="after-lg-card">
        <div className="mb-3 text-center text-sm-start">
          <div className="auth-badge-pill">
            <span className="status-dot"></span>
            <span>Get Started Free</span>
          </div>
          <h2 className="auth-title">Create your account 🚀</h2>
          <p className="auth-subtitle">
            Join 50,000+ users taking full control of their finances
          </p>
        </div>

        {error && (
          <div className="auth-alert-error mb-3">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Full Name Field */}
            <Col xs={12}>
              <label className="form-label" htmlFor="reg-name">
                Full Name
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiUser />
                </span>
                <input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  required
                />
              </div>
            </Col>

            {/* Email Address Field */}
            <Col xs={12}>
              <label className="form-label" htmlFor="reg-email">
                Email Address
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiMail />
                </span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </Col>

            {/* Password Field */}
            <Col xs={12}>
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiLock />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control pe-5"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <Col xs={12}>
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiLock />
                </span>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-control pe-5"
                  placeholder="Re-enter password"
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

            {/* Password Criteria Feedback (if user started typing) */}
            {formData.password && (
              <Col xs={12}>
                <div className="ur-password-checklist">
                  <div className={`ur-checklist-item ${formData.password.length >= 6 ? "valid" : ""}`}>
                    <span>{formData.password.length >= 6 ? "✓" : "○"}</span>
                    <span>At least 6 characters</span>
                  </div>
                  {formData.confirmPassword && (
                    <div className={`ur-checklist-item ${formData.password === formData.confirmPassword ? "valid" : ""}`}>
                      <span>{formData.password === formData.confirmPassword ? "✓" : "○"}</span>
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              </Col>
            )}

            {/* Terms & Conditions Checkbox */}
            <Col xs={12}>
              <div className="form-check d-flex align-items-start gap-2 mb-0">
                <input
                  className="form-check-input mt-1"
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label fs-13px text-muted cursor-pointer" htmlFor="agreeTerms">
                  I agree to Waltrio's <a href="#" className="link-theme fw-600">Terms of Service</a> &amp; <a href="#" className="link-theme fw-600">Privacy Policy</a>
                </label>
              </div>
            </Col>

            {/* Submit Button */}
            <Col xs={12} className="pt-1">
              <button
                type="submit"
                className="btn btn-theme w-100"
                disabled={loading}
              >
                {loading ? (
                  <span className="d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <FiArrowRight size={17} />
                  </>
                )}
              </button>
            </Col>

            {/* Divider */}
            <Col xs={12}>
              <div className="d-flex align-items-center gap-2 my-1">
                <hr className="w-100 my-0" style={{ borderColor: "#e2e8f0" }} />
                <span className="text-muted fs-11px text-uppercase fw-700 letter-spacing-1px">OR</span>
                <hr className="w-100 my-0" style={{ borderColor: "#e2e8f0" }} />
              </div>
            </Col>

            {/* Google OAuth Button */}
            <Col xs={12}>
              <button type="button" className="btn-social">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.74 0 3.3.6 4.53 1.78l3.4-3.4C17.95 1.18 15.2 0 12 0 7.39 0 3.39 2.6 1.47 6.38l3.95 3.06C6.36 6.58 8.97 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.23c0-.84-.08-1.65-.22-2.43H12v4.6h6.45c-.28 1.5-1.1 2.77-2.34 3.62l3.78 2.93c2.2-2.03 3.61-5.02 3.61-8.72z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.42 14.44l-3.95 3.06C3.39 21.4 7.39 24 12 24c3.2 0 5.95-1.18 7.93-3.19l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c4.61 0 8.61-2.6 10.53-6.38l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56l-3.95 3.06C3.39 21.4 7.39 24 12 24z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </Col>

            {/* Bottom Link */}
            <Col xs={12} className="pt-2 text-center">
              <p className="text-muted fs-13px mb-0">
                Already have an account? <Link to="/login" className="link-theme fw-600">Sign in</Link>
              </p>
            </Col>
          </Row>
        </form>
      </div>
    </Auth>
  );
}

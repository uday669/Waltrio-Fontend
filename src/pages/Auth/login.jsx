import React, { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import Auth from "../../components/auth";
import { useLogin } from "../../hooks/useAuth";
import { toast } from "../../lib/toast";
import '../../assets/css/style.css';
import '../../assets/css/responsive.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified;
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const { mutate: login, isPending: loading } = useLogin({
    onSuccess: () => {
      toast.success("Welcome back! Signing you in.");
      navigate("/dashboard");
    },
    onError: (err) => {
      // If the account exists but isn't verified, send them to OTP.
      if (err.status === 403) {
        toast.info("Please verify your email to continue.");
        navigate("/otp", { state: { email: formData.email, from: "login" } });
        return;
      }
      const message = err.message || "Sign in failed. Please check your credentials.";
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
    if (!formData.email || !formData.password) {
      setError("Please enter both your email and password.");
      return;
    }

    setError("");
    login({ email: formData.email, password: formData.password });
  };

  return (
    <Auth>
      <div className="after-lg-card">
        <div className="mb-4 text-center text-sm-start">
          <h2 className="auth-title">Welcome Back! 👋</h2>
          <p className="auth-subtitle">
            Sign in to continue to your Waltrio account
          </p>
        </div>

        {verified && !error && (
          <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 bg-success-subtle text-success fs-13px mb-3">
            <FiCheckCircle size={16} />
            <span>Email verified! Please sign in to continue.</span>
          </div>
        )}

        {error && (
          <div className="auth-alert-error mb-3">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Email Address Field */}
            <Col xs={12}>
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiMail />
                </span>
                <input
                  id="login-email"
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
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="input-group-custom">
                <span className="input-icon">
                  <FiLock />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control pe-5"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <Col xs={12}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 fs-14px">
                <div className="form-check d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fs-14px ur-text-0B2538 cursor-pointer" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <Link to="/otp" className="link-theme fs-14px">
                  Forgot Password?
                </Link>
              </div>
            </Col>

            {/* Submit Button */}
            <Col xs={12} className="pt-2">
              <button
                type="submit"
                className="btn btn-theme w-100"
                disabled={loading}
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>
            </Col>

            {/* Divider */}
            <Col xs={12}>
              <div className="d-flex align-items-center gap-2 my-1">
                <hr className="ur-border-1942C31A w-100 my-0" />
                <span className="ur-text-5E5E5E fs-12px text-uppercase fw-600">OR</span>
                <hr className="ur-border-1942C31A w-100 my-0" />
              </div>
            </Col>

            {/* Google OAuth Button */}
            <Col xs={12}>
              <button type="button" className="btn-social">
                <svg width="20" height="20" viewBox="0 0 24 24">
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
              <p className="ur-text-5E5E5E fs-14px mb-0">
                Don't have an account? <Link to="/register" className="link-theme">Create account</Link>
              </p>
            </Col>
          </Row>
        </form>
      </div>
    </Auth>
  );
}

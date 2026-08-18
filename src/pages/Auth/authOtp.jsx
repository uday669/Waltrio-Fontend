import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import logo from "../../assets/image/logo/white-logo.png";
import Auth from "../../components/auth";
import '../../assets/css/aut.css'

export default function AuthOtp() {
  return (
    <>
      <Auth
        AutData={
          <>
            <div className="logo-brand d-lg-none justify-content-center">
              <img src={logo} alt="logo" className="w-100px" />
            </div>
            <Row className="gap-4 flex-wrap after-lg-card max-w-480px mx-auto">
              <Col sm={12}>
                <h5 className="fs-32px mb-1">Verify Your Email</h5>
                <p className="fs-16px mb-0">
                  Enter the 6-digit OTP sent to your email address.
                </p>
              </Col>
              <Col sm={12}>
                <div className="d-flex justify-content-center gap-2  otp-input">
                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />

                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />

                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />

                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />

                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />

                  <input
                    type="text"
                    maxLength="1"
                    className="form-control text-center"
                  />
                </div>
              </Col>
              <Col sm={12} className="d-flex flex-column gap-3">
                <button type="submit" className="btn btn-login">
                  Verify OTP
                </button>

                <div className="text-start fs-14px">
                  <span className="text-muted">Didn't receive the code? </span>
                  <a href="#" className="forgot-link">
                    Resend OTP
                  </a>
                </div>

                {/* <div className="text-center">
                  <a href="#" className="text-muted small text-decoration-none">
                    ← Back to Register
                  </a>
                </div> */}
              </Col>

              <Col xs={12}>
                <p className="signup-text">
                  Already have an account?{" "}
                  <a href="#" className="forgot-link">
                    Login
                  </a>
                </p>
              </Col>
            </Row>
          </>
        }
      />
    </>
  );
}

import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import whiteLogo from "../assets/image/logo/white-logo.png";
import {
  FiTrendingUp,
  FiPieChart,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiStar,
  FiArrowUpRight,
} from "react-icons/fi";

export default function Auth({ children, AutData }) {
  const content = children || AutData;

  return (
    <div className="auth-wrapper">
      <Row className="auth-row g-0">
        {/* Left Branding & Showcase Panel (Desktop & Large Screens) */}
        <Col className="left-panel d-none d-lg-flex" lg={6} xl={7}>
          {/* Grid Texture Background */}
          <div className="left-panel-grid"></div>

          <div className="left-panel-content">
            {/* Top Brand Header */}
            <div>
              <div className="brand-header">
                <div className="logo-brand mb-0">
                  <img src={whiteLogo} alt="Waltrio" className="w-140px" />
                </div>

                <div className="brand-badge">
                  <span className="status-dot"></span>
                  <span className="fs-13px fw-500">Smart Financial Platform</span>
                </div>
              </div>

              {/* Hero Headings */}
              <h1 className="change-fs-48px-26px change-line-height-54px-35px fw-800 ur-text-FFFFFF mb-12px">
                Smart Money Tracking.
                <br />
                <span className="ur-text-03FFB9">Faster Financial Growth.</span>
              </h1>

              <p className="change-fs-16px-14px ur-text-FAF9F6 opacity-75 mb-32px max-w-480px line-height-20px">
                Automate your expense tracking, master group settlements, and achieve your financial goals with Waltrio.
              </p>

              {/* Glassmorphism Live Financial Preview Widget */}
              <div className="glass-preview-container">
                {/* Floating Top Badge */}
                <div className="floating-glass-badge floating-badge-top">
                  <div className="floating-badge-icon hw-38px rounded-8px d-flex align-items-center justify-content-center ur-bg-03FFB91A ur-text-03FFB9">
                    <FiCheckCircle size={16} />
                  </div>
                  <div>
                    <p className="fs-12px fw-600 ur-text-FFFFFF mb-0">+₹4,500 Settled</p>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">Goa Trip Group • Just now</p>
                  </div>
                </div>

                {/* Main Glass Financial Card */}
                <div className="glass-main-card">
                  <div className="d-flex justify-content-between align-items-center mb-12px">
                    <span className="fs-12px fw-500 ur-text-FAF9F6 opacity-75 text-uppercase letter-spacing-1px">
                      Total Portfolio Balance
                    </span>
                    <span className="preview-pill-growth">
                      <FiArrowUpRight size={13} /> +18.4% this month
                    </span>
                  </div>

                  <div className="change-fs-32px fs-28px fw-800 ur-text-FFFFFF mb-16px d-flex align-items-baseline gap-6px">
                    <span className="fs-20px ur-text-03FFB9 fw-600">₹</span>1,48,250<span className="fs-14px opacity-75">.00</span>
                  </div>

                  {/* Multi-category Progress Track */}
                  <div className="preview-progress-track">
                    <div className="preview-progress-segment theme" title="Savings & Investments (48%)"></div>
                    <div className="preview-progress-segment teal" title="Monthly Budget (28%)"></div>
                    <div className="preview-progress-segment orange" title="Group Expenses (24%)"></div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div className="preview-stats-row">
                    <div className="d-flex flex-column">
                      <span className="fs-11px ur-text-FAF9F6 opacity-75 mb-2px">
                        ● Income
                      </span>
                      <span className="fs-14px fw-700 ur-text-FFFFFF">₹95,000</span>
                    </div>

                    <div className="d-flex flex-column">
                      <span className="fs-11px ur-text-FAF9F6 opacity-75 mb-2px">
                        ● Expenses
                      </span>
                      <span className="fs-14px fw-700 ur-text-FFFFFF">₹32,450</span>
                    </div>

                    <div className="d-flex flex-column">
                      <span className="fs-11px ur-text-03FFB9 mb-2px">
                        ● Saved
                      </span>
                      <span className="fs-14px fw-700 ur-text-03FFB9">₹62,550</span>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Badge */}
                <div className="floating-glass-badge floating-badge-bottom">
                  <div className="floating-badge-icon hw-38px rounded-8px d-flex align-items-center justify-content-center ur-bg-1942C324 ur-text-FFFFFF">
                    <FiTrendingUp size={16} />
                  </div>
                  <div>
                    <p className="fs-12px fw-600 ur-text-FFFFFF mb-0">Goal on Track 🎯</p>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">Emergency Fund: 78% achieved</p>
                  </div>
                </div>
              </div>

              {/* 4 Feature Mini Cards */}
              <div className="features-grid-mini">
                <div className="feature-card-mini">
                  <div className="feature-icon-mini purple">
                    <FiTrendingUp size={18} />
                  </div>
                  <div>
                    <h6 className="fs-13px fw-600 ur-text-FFFFFF mb-2px">Auto Expense Tracking</h6>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">Real-time analytics</p>
                  </div>
                </div>

                <div className="feature-card-mini">
                  <div className="feature-icon-mini teal">
                    <FiPieChart size={18} />
                  </div>
                  <div>
                    <h6 className="fs-13px fw-600 ur-text-FFFFFF mb-2px">Custom Budgets</h6>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">Spending limit alerts</p>
                  </div>
                </div>

                <div className="feature-card-mini">
                  <div className="feature-icon-mini blue">
                    <FiUsers size={18} />
                  </div>
                  <div>
                    <h6 className="fs-13px fw-600 ur-text-FFFFFF mb-2px">Seamless Bill Split</h6>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">1-click settlements</p>
                  </div>
                </div>

                <div className="feature-card-mini">
                  <div className="feature-icon-mini indigo">
                    <FiShield size={18} />
                  </div>
                  <div>
                    <h6 className="fs-13px fw-600 ur-text-FFFFFF mb-2px">Bank-Grade Security</h6>
                    <p className="fs-11px ur-text-FAF9F6 opacity-75 mb-0">256-bit encrypted data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer & Trust Proof */}
            <div className="left-panel-footer">
              <div className="d-flex align-items-center gap-6px ur-text-FAF9F6 fs-12px fw-500">
                <span className="star-gold d-flex gap-2px">
                  <FiStar fill="#f59e0b" size={13} />
                  <FiStar fill="#f59e0b" size={13} />
                  <FiStar fill="#f59e0b" size={13} />
                  <FiStar fill="#f59e0b" size={13} />
                  <FiStar fill="#f59e0b" size={13} />
                </span>
                <span>4.9/5 from 50,000+ happy users</span>
              </div>
              <div>
                <span className="fs-12px ur-text-FAF9F6 opacity-50">© {new Date().getFullYear()} Waltrio • Privacy • Terms</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Form Card Panel (Desktop & Mobile) */}
        <Col xs={12} lg={6} xl={5} className="right-panel">
          {/* Mobile-only Top Brand Header */}
          <div className="mobile-brand-header d-lg-none">
            <img src={whiteLogo} alt="Waltrio" />
            <p className="mobile-brand-subtitle">Smart Financial Management</p>
          </div>

          {content}
        </Col>
      </Row>
    </div>
  );
}

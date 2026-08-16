import React from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import logo from '../assets/image/logo/white-logo.png'

export default function Login() {
  return (
    <>
     <div className="overflow-hidden">
       <Row>
        <Col className="left-panel " lg={6} xl={7}>
                <div className="logo-brand">
                    <img src={logo} alt="logo" className="w-100px"/>
                </div>

                <h1 className="hero-title">
                    Track, Plan.<br/>
                    Save. <span className="highlight">Grow.</span>
                </h1>

                <p className="hero-subtitle">
                    All-in-one money management for you, your family and your groups.
                </p>

                <div className="features-list">
                    <div className="feature-item">
                        <div className="feature-icon purple">
                            <i className="bi bi-pie-chart-fill"></i>
                        </div>
                        <div className="feature-text">
                            <h5>Track Income &amp; Expenses</h5>
                            <p>Know where your money goes</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon teal">
                            <i className="bi bi-wallet2"></i>
                        </div>
                        <div className="feature-text">
                            <h5>Manage Budgets</h5>
                            <p>Set budgets and achieve your goals</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon blue">
                            <i className="bi bi-people-fill"></i>
                        </div>
                        <div className="feature-text">
                            <h5>Split &amp; Settle Easily</h5>
                            <p>Manage group or trip expenses</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon indigo">
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <div className="feature-text">
                            <h5>Secure &amp; Private</h5>
                            <p>Your data is 100% secure</p>
                        </div>
                    </div>
                </div>

                <div className="laptop-mockup d-none ">
                    <div className="laptop-screen">
                        <div className="laptop-screen-inner">
                            <div className="mockup-header">
                                <div className="mockup-dot"></div>
                                <div className="mockup-dot"></div>
                                <div className="mockup-dot" ></div>
                                <span >MoneyTrack</span>
                            </div>
                            <div className="mockup-content">
                                <div className="mockup-stats">
                                    <div className="mockup-stat">
                                        <div className="mockup-stat-label">Total Balance</div>
                                        <div className="mockup-stat-value">₹18,450</div>
                                    </div>
                                    <div className="mockup-stat">
                                        <div className="mockup-stat-label">Total Income</div>
                                        <div className="mockup-stat-value" >₹50,000</div>
                                    </div>
                                    <div className="mockup-stat">
                                        <div className="mockup-stat-label">Total Expenses</div>
                                        <div className="mockup-stat-value" >₹31,550</div>
                                    </div>
                                </div>
                                <div className="mockup-chart">
                                    <div className="mockup-chart-left">
                                        <div className="donut-chart"></div>
                                    </div>
                                    <div className="mockup-chart-right">
                                        <div className="mockup-list-item"><span>Food</span><span>₹12,500</span></div>
                                        <div className="mockup-list-item"><span>Travel</span><span>₹8,000</span></div>
                                        <div className="mockup-list-item"><span>Shopping</span><span>₹5,500</span></div>
                                        <div className="mockup-list-item"><span>Bills</span><span>₹3,550</span></div>
                                        <div className="mockup-list-item"><span>Others</span><span>₹2,000</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="laptop-base"></div>
                </div>
            </Col>
         <Col lg={6} xl={5} className="right-panel">
          <div className="logo-brand d-lg-none justify-content-center">
                    <img src={logo} alt="logo" className="w-100px"/>
                </div>
          <Row  className="row-gap-32px flex-wrap after-lg-card">
            
              <Col sm={12}>
                    <h5 className="fs-32px mb-1">Welcome Back! 👋</h5>
                    <p className="fs-16px mb-0">Login to continue to your MoneyTrack account</p>
              </Col>
              <Col sm={12}>
              <div className="input-group-custom">
                   <label className="form-label">Email Address</label>
                   <input type="email" className="form-control" placeholder="Enter your email address"></input>
                </div>
              </Col>
               <Col sm={12}>
                  <div className="input-group-custom">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" placeholder="Enter your email address"/>
                 </div>

              </Col>
              <Col sm={12}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="rememberMe" />
                                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                            </div>
                            <a href="#" className="forgot-link">Forgot Password?</a>
                        </div>
                </Col>
                <Col sm={12}>
                        <button type="submit" className="btn btn-login">
                            Login
                        </button>
                </Col>
                <Col sm={12}>
                <button class="btn-social">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.04c1.74 0 3.3.6 4.53 1.78l3.4-3.4C17.95 1.18 15.2 0 12 0 7.39 0 3.39 2.6 1.47 6.38l3.95 3.06C6.36 6.58 8.97 5.04 12 5.04z"></path>
                            <path fill="#4285F4" d="M23.5 12.23c0-.84-.08-1.65-.22-2.43H12v4.6h6.45c-.28 1.5-1.1 2.77-2.34 3.62l3.78 2.93c2.2-2.03 3.61-5.02 3.61-8.72z"></path>
                            <path fill="#FBBC05" d="M5.42 14.44l-3.95 3.06C3.39 21.4 7.39 24 12 24c3.2 0 5.95-1.18 7.93-3.19l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56z"></path>
                            <path fill="#34A853" d="M12 24c4.61 0 8.61-2.6 10.53-6.38l-3.78-2.93c-1.05.7-2.4 1.12-4.15 1.12-3.03 0-5.64-1.54-6.58-3.56l-3.95 3.06C3.39 21.4 7.39 24 12 24z"></path>
                        </svg>
                        Continue with Google
                    </button>
                    </Col>
                    <Col xs={12}>
                    <p class="signup-text">
                        Don't have an account? <a href="#">Sign up</a>
                    </p></Col>
          </Row>
         </Col>
      </Row>
     </div>
    </>
  )
}

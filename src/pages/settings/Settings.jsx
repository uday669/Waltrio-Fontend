import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import Alert from "react-bootstrap/Alert";
import {
  FiUser,
  FiLock,
  FiBell,
  FiShield,
  FiDownload,
  FiTrash2,
  FiCheckCircle,
  FiKey,
  FiGlobe,
  FiDollarSign,
  FiSave,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: "Uday Waltrio",
    email: "uday@waltro.com",
    phone: "+91 98765 43210",
    currency: "INR",
    timezone: "Asia/Kolkata (IST +5:30)",
    language: "English (US)",
    dateFormat: "DD/MM/YYYY",
  });

  // Security State
  const [security, setSecurity] = useState({
    twoFactor: true,
    appLockPin: true,
    biometricLogin: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    emiDueReminders: true,
    weeklyDigest: true,
    groupExpenseSplits: true,
    securityLogins: true,
    emailMarketing: false,
  });

  // Handle Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-4">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Account &amp; System Settings</span>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Manage your personal profile, security credentials, currency preferences, and notification triggers.
          </p>
        </div>

        {saveSuccess && (
          <Alert variant="success" className="py-2 px-3 mb-0 fs-12px rounded-8px d-flex align-items-center gap-2">
            <FiCheckCircle size={14} /> Preferences updated successfully!
          </Alert>
        )}
      </div>

      {/* 2. Main Tabbed Layout */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row className="g-4">
          {/* Left Navigation Sidebar for Settings */}
          <Col xs={12} md={3}>
            <Card className="ms-premium-card border-0">
              <Card.Body className="p-2">
                <Nav className="flex-column ur-settings-nav">
                  <Nav.Link eventKey="profile" className="ur-settings-nav-item">
                    <FiUser size={16} /> <span>Profile &amp; Regional</span>
                  </Nav.Link>
                  <Nav.Link eventKey="security" className="ur-settings-nav-item">
                    <FiLock size={16} /> <span>Security &amp; Password</span>
                  </Nav.Link>
                  <Nav.Link eventKey="notifications" className="ur-settings-nav-item">
                    <FiBell size={16} /> <span>Alerts &amp; Notifications</span>
                  </Nav.Link>
                  <Nav.Link eventKey="data" className="ur-settings-nav-item">
                    <FiShield size={16} /> <span>Data &amp; Privacy</span>
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Content Panels */}
          <Col xs={12} md={9}>
            <Tab.Content>
              {/* TAB 1: PROFILE & REGIONAL */}
              <Tab.Pane eventKey="profile">
                <Card className="ms-premium-card border-0">
                  <Card.Body className="p-4">
                    <h5 className="fw-700 text-dark mb-1">Personal Profile &amp; Preferences</h5>
                    <p className="text-muted fs-12px mb-4">Update your name, primary contact, and default financial currency.</p>

                    {/* Avatar Row */}
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-10px mb-4">
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          backgroundColor: "#4f46e5",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          fontWeight: "800",
                        }}
                      >
                        U
                      </div>
                      <div>
                        <h6 className="fw-700 text-dark mb-0">{profile.fullName}</h6>
                        <span className="text-muted fs-11.5px">{profile.email} • Primary Admin</span>
                      </div>
                      <Button variant="outline-primary" size="sm" className="ms-auto rounded-6px fs-11.5px">
                        Change Avatar
                      </Button>
                    </div>

                    <Form onSubmit={handleSaveProfile}>
                      <Row className="g-3">
                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              required
                              value={profile.fullName}
                              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                              className="ur-form-input"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              required
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              className="ur-form-input"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Phone Number</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              className="ur-form-input"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Default Base Currency</Form.Label>
                            <Form.Select
                              value={profile.currency}
                              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                              className="ur-form-input"
                            >
                              <option value="INR">₹ INR (Indian Rupee)</option>
                              <option value="USD">$ USD (US Dollar)</option>
                              <option value="EUR">€ EUR (Euro)</option>
                              <option value="GBP">£ GBP (British Pound)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Timezone</Form.Label>
                            <Form.Select
                              value={profile.timezone}
                              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                              className="ur-form-input"
                            >
                              <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                              <option value="America/New_York (EST)">America/New_York (EST -5:00)</option>
                              <option value="Europe/London (GMT)">Europe/London (GMT +0:00)</option>
                              <option value="Asia/Dubai (GST)">Asia/Dubai (GST +4:00)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Date Display Format</Form.Label>
                            <Form.Select
                              value={profile.dateFormat}
                              onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                              className="ur-form-input"
                            >
                              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 20/08/2026)</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/20/2026)</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-20)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="pt-3 mt-3 border-top d-flex justify-content-end">
                        <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4 d-flex align-items-center gap-1">
                          <FiSave size={14} /> Save Profile Changes
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB 2: SECURITY & PASSWORD */}
              <Tab.Pane eventKey="security">
                <Card className="ms-premium-card border-0 mb-4">
                  <Card.Body className="p-4">
                    <h5 className="fw-700 text-dark mb-1">Authentication &amp; Access Security</h5>
                    <p className="text-muted fs-12px mb-4">Manage multi-factor authentication and update your login password.</p>

                    {/* Security Toggles */}
                    <div className="d-flex flex-column gap-3 mb-4">
                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">Two-Factor Authentication (2FA)</div>
                          <span className="text-muted fs-11.5px">Require an SMS or authenticator OTP code on new logins</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="two-factor-sw"
                          checked={security.twoFactor}
                          onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">Biometric &amp; Quick App PIN</div>
                          <span className="text-muted fs-11.5px">Quick biometric face/touch unlock for mobile sessions</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="app-pin-sw"
                          checked={security.appLockPin}
                          onChange={(e) => setSecurity({ ...security, appLockPin: e.target.checked })}
                        />
                      </div>
                    </div>

                    {/* Change Password Form */}
                    <h6 className="fw-700 text-dark fs-14px mb-3 d-flex align-items-center gap-2">
                      <FiKey className="text-primary" /> Change Master Password
                    </h6>

                    <Row className="g-3">
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label className="ur-form-label">Current Password</Form.Label>
                          <Form.Control type="password" placeholder="••••••••" className="ur-form-input" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label className="ur-form-label">New Password</Form.Label>
                          <Form.Control type="password" placeholder="Min 8 chars" className="ur-form-input" />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label className="ur-form-label">Confirm New Password</Form.Label>
                          <Form.Control type="password" placeholder="Repeat new password" className="ur-form-input" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="pt-3 mt-3 border-top d-flex justify-content-end">
                      <Button variant="primary" size="sm" className="rounded-6px px-4">
                        Update Password
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB 3: NOTIFICATIONS & ALERTS */}
              <Tab.Pane eventKey="notifications">
                <Card className="ms-premium-card border-0">
                  <Card.Body className="p-4">
                    <h5 className="fw-700 text-dark mb-1">Notification &amp; Real-Time Alert Triggers</h5>
                    <p className="text-muted fs-12px mb-4">Choose which financial notifications you want to receive.</p>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">Budget Threshold Alerts (80% &amp; Over Limit)</div>
                          <span className="text-muted fs-11.5px">Instant push alert when category spend approaches limit</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="notif-budget"
                          checked={notifications.budgetAlerts}
                          onChange={(e) => setNotifications({ ...notifications, budgetAlerts: e.target.checked })}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">EMI &amp; Recurring Bill Due Reminders</div>
                          <span className="text-muted fs-11.5px">Reminder alert 3 days prior to auto-debit due dates</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="notif-emi"
                          checked={notifications.emiDueReminders}
                          onChange={(e) => setNotifications({ ...notifications, emiDueReminders: e.target.checked })}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">Groups Split &amp; Settlement Alerts</div>
                          <span className="text-muted fs-11.5px">Notify when friends add shared expenses or settle balances</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="notif-split"
                          checked={notifications.groupExpenseSplits}
                          onChange={(e) => setNotifications({ ...notifications, groupExpenseSplits: e.target.checked })}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 rounded-8px border bg-light">
                        <div>
                          <div className="fw-700 text-dark fs-13px">Weekly Financial Summary Email Digest</div>
                          <span className="text-muted fs-11.5px">Comprehensive weekly cash flow analysis sent every Sunday</span>
                        </div>
                        <Form.Check
                          type="switch"
                          id="notif-digest"
                          checked={notifications.weeklyDigest}
                          onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                        />
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-top d-flex justify-content-end">
                      <Button variant="primary" size="sm" className="rounded-6px px-4" onClick={() => setSaveSuccess(true)}>
                        Save Notification Rules
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB 4: DATA & PRIVACY */}
              <Tab.Pane eventKey="data">
                <Card className="ms-premium-card border-0 mb-4">
                  <Card.Body className="p-4">
                    <h5 className="fw-700 text-dark mb-1">Data Backup &amp; Portability</h5>
                    <p className="text-muted fs-12px mb-4">Download comprehensive encrypted copies of your transactions and ledger.</p>

                    <div className="d-flex flex-wrap gap-2 mb-4">
                      <Button variant="outline-primary" size="sm" className="rounded-8px px-3 py-2 d-flex align-items-center gap-2">
                        <FiDownload size={14} /> Export All Statements (CSV)
                      </Button>
                      <Button variant="outline-secondary" size="sm" className="rounded-8px px-3 py-2 d-flex align-items-center gap-2">
                        <FiDownload size={14} /> Backup Entire Ledger (JSON)
                      </Button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 rounded-10px border border-danger-subtle bg-danger-subtle bg-opacity-25 mt-4">
                      <h6 className="fw-800 text-danger fs-14px mb-1 d-flex align-items-center gap-2">
                        <FiTrash2 /> Danger Zone
                      </h6>
                      <p className="text-muted fs-12px mb-3">
                        Permanently reset your transactions or delete your Waltrio profile. This action cannot be undone.
                      </p>

                      <div className="d-flex flex-wrap gap-2">
                        <Button variant="outline-danger" size="sm" className="rounded-6px">
                          Reset Demo Data
                        </Button>
                        <Button variant="danger" size="sm" className="rounded-6px">
                          Delete Account Permanently
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

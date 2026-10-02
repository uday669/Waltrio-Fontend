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
import Modal from "react-bootstrap/Modal";
import {
  FiUser,
  FiLock,
  FiTrash2,
  FiCheckCircle,
  FiKey,
  FiGlobe,
  FiDollarSign,
  FiSave,
  FiEye,
  FiEyeOff,
  FiLayers,
  FiPlus,
  FiEdit2,
  FiCheck,
  FiTag,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import Select from "react-select";
import { formSelectStyles } from "../../utils/selectStyles";
import { useAuth } from "../../context/AuthContext";
import { useProfile, useUpdateProfile } from "../../hooks/useAuth";
import {
  useCategories,
  AVAILABLE_ICONS,
  PRESET_COLORS,
  ICON_MAP,
} from "../../context/CategoryContext";
import { toast } from "../../lib/toast";


export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { mutateAsync: updateProfileMut, isPending: profileUpdating } = useUpdateProfile();

  // Category Management Context
  const {
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading: categoriesLoading,
    creating,
    updating,
  } = useCategories();

  // Category Filtering State (Type toggle only, search removed per request)
  const [categoryTypeFilter, setCategoryTypeFilter] = useState("all"); // "all" | "expense" | "income"

  // Category Modals State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    type: "expense",
    color: "#4f46e5",
    bg: "#eef2ff",
    iconKey: "FiShoppingBag",
    description: "",
  });

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    currency: "INR",
  });

  React.useEffect(() => {
    const source = profileData || user;
    if (source) {
      setProfile({
        name: source.name || source.fullName || "",
        email: source.email || "",
        phoneNumber: source.phoneNumber || source.phone || "",
        currency: source.currency || "INR",
      });
    }
  }, [profileData, user]);

  const avatarInitial = (profile.name?.[0] || profile.email?.[0] || "U").toUpperCase();

  // Security State
  const [security, setSecurity] = useState({
    twoFactor: true,
    appLockPin: true,
    biometricLogin: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfileMut({
        name: profile.name.trim(),
        phoneNumber: profile.phoneNumber.trim(),
        currency: profile.currency,
      });
      setSaveSuccess(true);
      toast.success("Profile preferences saved successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Failed to update profile";
      toast.error(errMsg);
    }
  };

  // Open Add Category Modal
  const handleOpenAddCategory = (defaultType = "expense") => {
    setEditingCategory(null);
    const initialPreset = PRESET_COLORS[defaultType === "income" ? 0 : 1];
    setCategoryFormData({
      name: "",
      type: defaultType,
      color: initialPreset.color,
      bg: initialPreset.bg,
      iconKey: defaultType === "income" ? "FiDollarSign" : "FiShoppingBag",
      description: "",
    });
    setShowCategoryModal(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color || "#4f46e5",
      bg: cat.bg || "#eef2ff",
      iconKey: cat.iconKey || "FiTag",
      description: cat.description || "",
    });
    setShowCategoryModal(true);
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      toast.error("Please provide a category name.");
      return;
    }

    try {
      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id;
        await updateCategory(catId, {
          ...categoryFormData,
          name: categoryFormData.name.trim(),
        });
        toast.success(`Category "${categoryFormData.name}" updated successfully.`);
      } else {
        await addCategory({
          ...categoryFormData,
          name: categoryFormData.name.trim(),
        });
        toast.success(`Category "${categoryFormData.name}" added successfully.`);
      }
      setShowCategoryModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save category.");
    }
  };

  // Confirm Delete Category
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const catId = categoryToDelete._id || categoryToDelete.id;
      await deleteCategory(catId, categoryToDelete.type);
      toast.success(`Category "${categoryToDelete.name}" removed.`);
      setShowDeleteCatModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  // Filter Categories for display
  const displayedCategories = React.useMemo(() => {
    if (categoryTypeFilter === "expense") {
      return expenseCategories;
    }
    if (categoryTypeFilter === "income") {
      return incomeCategories;
    }
    return [...expenseCategories, ...incomeCategories];
  }, [categoryTypeFilter, expenseCategories, incomeCategories]);

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-2 mb-4">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Account &amp; System Settings</span>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Manage your personal profile, categories, budget allocations, and security credentials.
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
                  <Nav.Link eventKey="categories" className="ur-settings-nav-item">
                    <FiLayers size={16} /> <span>Categories &amp; Budgets</span>
                  </Nav.Link>
                  <Nav.Link eventKey="security" className="ur-settings-nav-item">
                    <FiLock size={16} /> <span>Security &amp; Password</span>
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
                        {avatarInitial}
                      </div>
                      <div>
                        <h6 className="fw-700 text-dark mb-0">{profile.name || "User"}</h6>
                        <span className="text-muted fs-11.5px">{profile.email} • Primary Account</span>
                      </div>
                    </div>

                    <Form onSubmit={handleSaveProfile}>
                      <Row className="g-3">
                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              required
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className="ur-form-input"
                              placeholder="Enter your full name"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Email Address (Read-only)</Form.Label>
                            <Form.Control
                              type="email"
                              disabled
                              readOnly
                              value={profile.email}
                              className="ur-form-input bg-light opacity-75 cursor-not-allowed"
                              placeholder="user@example.com"
                            />
                            <Form.Text className="text-muted fs-11px">Email address cannot be changed.</Form.Text>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Phone Number</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile.phoneNumber}
                              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                              className="ur-form-input"
                              placeholder="+919999988888"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="ur-form-label">Default Base Currency</Form.Label>
                            <Select
                              value={[
                                { value: "INR", label: "₹ INR (Indian Rupee)" },
                                { value: "USD", label: "$ USD (US Dollar)" },
                                { value: "EUR", label: "€ EUR (Euro)" },
                                { value: "GBP", label: "£ GBP (British Pound)" },
                              ].find((c) => c.value === profile.currency) || { value: profile.currency, label: profile.currency }}
                              onChange={(opt) => setProfile({ ...profile, currency: opt.value })}
                              options={[
                                { value: "INR", label: "₹ INR (Indian Rupee)" },
                                { value: "USD", label: "$ USD (US Dollar)" },
                                { value: "EUR", label: "€ EUR (Euro)" },
                                { value: "GBP", label: "£ GBP (British Pound)" },
                              ]}
                              styles={formSelectStyles}
                              menuPortalTarget={document.body}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="pt-3 mt-3 border-top d-flex justify-content-end">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={profileUpdating || profileLoading}
                          className="rounded-6px px-4 d-flex align-items-center gap-1"
                        >
                          <FiSave size={14} /> {profileUpdating ? "Saving..." : "Save Profile Changes"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB 2: CATEGORIES & BUDGETS */}
              <Tab.Pane eventKey="categories">
                <Card className="ms-premium-card border-0 mb-4">
                  <Card.Body className="p-4">
                    {/* Header with Title and Add button */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                      <div>
                        <h5 className="fw-700 text-dark mb-1 d-flex align-items-center gap-2">
                          <span>Categories &amp; Budget Allocations</span>
                          <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 px-2 py-1 rounded-6px">
                            {incomeCategories.length + expenseCategories.length} Total
                          </Badge>
                        </h5>
                        <p className="text-muted fs-12px mb-0">
                          Configure Income &amp; Expense categories, assign theme palettes, and configure category indicators.
                        </p>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-8px fs-12px fw-600 d-flex align-items-center gap-1 px-3"
                          onClick={() => handleOpenAddCategory(categoryTypeFilter === "income" ? "income" : "expense")}
                        >
                          <FiPlus size={15} /> Add Category
                        </Button>
                      </div>
                    </div>

                    {/* Stats Metrics Row (Showing Count Numbers) */}
                    <Row className="g-3 mb-4">
                      <Col xs={12} sm={4}>
                        <div className="p-3 rounded-10px border bg-light d-flex align-items-center justify-content-between">
                          <div>
                            <div className="text-muted fs-11.5px fw-600">Expense Categories</div>
                            <div className="fw-800 text-dark fs-20px">{expenseCategories.length}</div>
                          </div>
                          <div className="ur-category-icon-box" style={{ backgroundColor: "#fef2f2", color: "#e11d48" }}>
                            <FiTrendingDown size={18} />
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={4}>
                        <div className="p-3 rounded-10px border bg-light d-flex align-items-center justify-content-between">
                          <div>
                            <div className="text-muted fs-11.5px fw-600">Income Categories</div>
                            <div className="fw-800 text-dark fs-20px">{incomeCategories.length}</div>
                          </div>
                          <div className="ur-category-icon-box" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                            <FiTrendingUp size={18} />
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={4}>
                        <div className="p-3 rounded-10px border bg-light d-flex align-items-center justify-content-between">
                          <div>
                            <div className="text-muted fs-11.5px fw-600">Budget Categories</div>
                            <div className="fw-800 text-primary fs-20px">{expenseCategories.length}</div>
                          </div>
                          <div className="ur-category-icon-box" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                            <FiPieChart size={18} />
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Filter Segment Buttons (Search removed) */}
                    <div className="d-flex align-items-center gap-2 p-1.5 bg-light rounded-10px mb-4" style={{ width: "fit-content" }}>
                      <button
                        type="button"
                        className={`ur-category-tab-btn ${categoryTypeFilter === "all" ? "active" : ""}`}
                        onClick={() => setCategoryTypeFilter("all")}
                      >
                        All Categories ({incomeCategories.length + expenseCategories.length})
                      </button>
                      <button
                        type="button"
                        className={`ur-category-tab-btn ${categoryTypeFilter === "expense" ? "active" : ""}`}
                        onClick={() => setCategoryTypeFilter("expense")}
                      >
                        Expense ({expenseCategories.length})
                      </button>
                      <button
                        type="button"
                        className={`ur-category-tab-btn ${categoryTypeFilter === "income" ? "active" : ""}`}
                        onClick={() => setCategoryTypeFilter("income")}
                      >
                        Income ({incomeCategories.length})
                      </button>
                    </div>

                    {/* Category Cards Grid */}
                    {categoriesLoading && displayedCategories.length === 0 ? (
                      <div className="text-center py-5 border rounded-10px bg-light">
                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                        <h6 className="fw-700 text-dark mb-1">Loading categories...</h6>
                        <p className="text-muted fs-12px mb-0">Fetching your category rules from the server.</p>
                      </div>
                    ) : displayedCategories.length === 0 ? (
                      <div className="text-center py-5 border rounded-10px bg-light">
                        <FiTag size={32} className="text-muted mb-2 opacity-50" />
                        <h6 className="fw-700 text-dark">No categories found</h6>
                        <p className="text-muted fs-12px mb-3">Add a new category to get started.</p>
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-6px"
                          onClick={() => handleOpenAddCategory(categoryTypeFilter === "income" ? "income" : "expense")}
                        >
                          <FiPlus size={14} /> Add Category
                        </Button>
                      </div>
                    ) : (
                      <Row className="g-3">
                        {displayedCategories.map((cat) => {
                          const iconComp = ICON_MAP[cat.iconKey] || <FiTag size={16} />;
                          return (
                            <Col xs={12} sm={6} lg={4} key={cat.id || cat.name}>
                              <div className="ur-category-card">
                                <div>
                                  {/* Top Row: Icon + Type Badge */}
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div
                                      className="ur-category-icon-box"
                                      style={{
                                        backgroundColor: cat.bg || "#eef2ff",
                                        color: cat.color || "#4f46e5",
                                      }}
                                    >
                                      {iconComp}
                                    </div>
                                    <span className={`ur-category-type-pill ${cat.type}`}>
                                      {cat.type}
                                    </span>
                                  </div>

                                  {/* Name and Description */}
                                  <h6 className="fw-700 text-dark mb-1 fs-13.5px">{cat.name}</h6>
                                  <p className="text-muted fs-11.5px mb-2 text-truncate-2" style={{ minHeight: "34px" }}>
                                    {cat.description || `Standard ${cat.type} tracker category`}
                                  </p>

                                  {/* Color Indicator */}
                                  <div className="d-flex align-items-center gap-1 fs-11px text-muted pt-2 border-top border-light-subtle">
                                    <span
                                      style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: cat.color || "#4f46e5",
                                        display: "inline-block",
                                      }}
                                    />
                                    <span>Theme Color ({cat.color || "#4f46e5"})</span>
                                  </div>
                                </div>

                                {/* Card Actions */}
                                <div className="d-flex justify-content-end gap-1 pt-2 mt-2 border-top border-light-subtle">
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="ur-action-btn edit"
                                    onClick={() => handleOpenEditCategory(cat)}
                                    title="Edit Category"
                                  >
                                    <FiEdit2 size={13} />
                                  </Button>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="ur-action-btn delete"
                                    onClick={() => {
                                      setCategoryToDelete(cat);
                                      setShowDeleteCatModal(true);
                                    }}
                                    title="Delete Category"
                                  >
                                    <FiTrash2 size={13} />
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* TAB 3: SECURITY & PASSWORD */}
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
                      <Button variant="primary" size="sm" className="rounded-6px px-4" onClick={() => toast.success("Password updated successfully!")}>
                        Update Password
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>


      {/* ===================================================================
          MODAL: ADD / EDIT CATEGORY
          =================================================================== */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered size="lg" className="ur-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
            <span className="ur-modal-icon edit">
              <FiLayers size={16} />
            </span>
            {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveCategory}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              {/* 1. Category Type Selector */}
              <Col xs={12}>
                <Form.Label className="ur-form-label">Category Type *</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    variant={categoryFormData.type === "expense" ? "danger" : "outline-secondary"}
                    size="sm"
                    className="flex-fill py-2 rounded-8px fw-600 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      const p = PRESET_COLORS[1];
                      setCategoryFormData({
                        ...categoryFormData,
                        type: "expense",
                        color: p.color,
                        bg: p.bg,
                        iconKey: "FiShoppingBag",
                      });
                    }}
                  >
                    <FiTrendingDown size={15} /> Expense Category
                  </Button>
                  <Button
                    type="button"
                    variant={categoryFormData.type === "income" ? "success" : "outline-secondary"}
                    size="sm"
                    className="flex-fill py-2 rounded-8px fw-600 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      const p = PRESET_COLORS[0];
                      setCategoryFormData({
                        ...categoryFormData,
                        type: "income",
                        color: p.color,
                        bg: p.bg,
                        iconKey: "FiDollarSign",
                      });
                    }}
                  >
                    <FiTrendingUp size={15} /> Income Category
                  </Button>
                </div>
              </Col>

              {/* 2. Category Name (Full Width) */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Category Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Freelance Consulting, Gym & Sports, Crypto Staking..."
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              {/* 3. Description */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="ur-form-label">Description / Notes</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Payouts from web contracts, tech tools & domain fees"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="ur-form-input"
                  />
                </Form.Group>
              </Col>

              {/* 4. Theme Color Picker with Preset Swatches AND Custom Color Picker Input */}
              <Col xs={12}>
                <Form.Label className="ur-form-label d-flex align-items-center justify-content-between">
                  <span>Choose Theme Color</span>
                  <span className="text-muted fs-11px font-monospace fw-600">{categoryFormData.color}</span>
                </Form.Label>
                <div className="p-3 bg-light rounded-8px border">
                  {/* Preset color swatches */}
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = categoryFormData.color.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <div
                          key={preset.name}
                          className={`ur-palette-swatch ${isSelected ? "active" : ""}`}
                          style={{ backgroundColor: preset.color }}
                          onClick={() => setCategoryFormData({ ...categoryFormData, color: preset.color, bg: preset.bg })}
                          title={preset.name}
                        >
                          {isSelected && <FiCheck size={14} color="#ffffff" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom color picker input */}
                  <div className="d-flex align-items-center gap-2 pt-2 border-top border-light-subtle">
                    <span className="text-dark fs-12px fw-600">Custom Color:</span>
                    <input
                      type="color"
                      value={categoryFormData.color.startsWith("#") && categoryFormData.color.length === 7 ? categoryFormData.color : "#4f46e5"}
                      onChange={(e) => {
                        const col = e.target.value;
                        setCategoryFormData({
                          ...categoryFormData,
                          color: col,
                          bg: `${col}18`,
                        });
                      }}
                      style={{
                        width: "38px",
                        height: "32px",
                        padding: "2px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        cursor: "pointer",
                        backgroundColor: "#ffffff",
                      }}
                      title="Choose custom hex color"
                    />
                    <Form.Control
                      type="text"
                      size="sm"
                      value={categoryFormData.color}
                      onChange={(e) => {
                        const col = e.target.value;
                        setCategoryFormData({
                          ...categoryFormData,
                          color: col,
                          bg: col.startsWith("#") && col.length === 7 ? `${col}18` : categoryFormData.bg,
                        });
                      }}
                      placeholder="#4f46e5"
                      style={{ width: "110px", fontSize: "12px", fontFamily: "monospace" }}
                    />
                  </div>
                </div>
              </Col>

              {/* 5. Icon Picker */}
              <Col xs={12}>
                <Form.Label className="ur-form-label">Select Category Icon</Form.Label>
                <div className="ur-icon-select-grid border rounded-8px bg-light p-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const isSelected = categoryFormData.iconKey === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`ur-icon-select-btn ${isSelected ? "active" : ""}`}
                        onClick={() => setCategoryFormData({ ...categoryFormData, iconKey: item.key })}
                        title={item.label}
                      >
                        {item.icon}
                      </button>
                    );
                  })}
                </div>
              </Col>

              {/* 6. Live Preview Card */}
              <Col xs={12}>
                <Form.Label className="ur-form-label">Live Preview</Form.Label>
                <div className="p-3 rounded-10px border bg-white d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="ur-category-icon-box"
                      style={{
                        backgroundColor: categoryFormData.bg,
                        color: categoryFormData.color,
                      }}
                    >
                      {ICON_MAP[categoryFormData.iconKey] || <FiTag size={16} />}
                    </div>
                    <div>
                      <div className="fw-700 text-dark fs-13px">
                        {categoryFormData.name || "Category Name"}
                      </div>
                      <div className="text-muted fs-11px">
                        {categoryFormData.description || "Category description will appear here"}
                      </div>
                    </div>
                  </div>
                  <span className={`ur-category-type-pill ${categoryFormData.type}`}>
                    {categoryFormData.type}
                  </span>
                </div>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" size="sm" onClick={() => setShowCategoryModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="rounded-6px px-4" disabled={creating || updating}>
              <FiSave size={14} /> {editingCategory ? (updating ? "Saving..." : "Save Changes") : (creating ? "Creating..." : "Create Category")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          MODAL: DELETE CATEGORY CONFIRMATION
          ================================================================== */}
      <Modal show={showDeleteCatModal} onHide={() => setShowDeleteCatModal(false)} centered size="sm" className="ur-modal">
        <Modal.Body className="text-center p-4">
          <div className="ur-delete-icon-box mx-auto mb-3">
            <FiTrash2 size={24} color="#ef4444" />
          </div>
          <h5 className="fw-700 text-dark mb-1">Delete Category?</h5>
          <p className="text-muted fs-12px mb-3">
            Are you sure you want to remove <strong>"{categoryToDelete?.name}"</strong>? Transactions logged under this category will remain intact.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="light" size="sm" onClick={() => setShowDeleteCatModal(false)} className="rounded-6px px-3">
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDeleteCategory} className="rounded-6px px-3">
              Confirm Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

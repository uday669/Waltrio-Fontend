import React, { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTag,
  FiTrendingUp,
  FiTrendingDown,
  FiSearch,
  FiCheck,
  FiX,
  FiDollarSign,
  FiGrid,
  FiList,
  FiAlertTriangle,
  FiDroplet,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../hooks/useAuth";
import {
  useCategories,
  AVAILABLE_ICONS,
  PRESET_COLORS,
  ICON_MAP,
} from "../../context/CategoryContext";
import { toast } from "../../lib/toast";

export default function Settings() {
  const { user } = useAuth();
  const { data: profileData } = useProfile();

  // Category Context Hook
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

  // Filter & Search State
  const [filterType, setFilterType] = useState("all"); // "all" | "expense" | "income"
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "#4f46e5",
    bg: "#eef2ff",
    iconKey: "FiShoppingBag",
    description: "",
  });

  // Open Add Category Modal
  const handleOpenAdd = (defaultType = "expense") => {
    setEditingCategory(null);
    const initialPreset = PRESET_COLORS[defaultType === "income" ? 0 : 1];
    setFormData({
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
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      type: cat.type || "expense",
      color: cat.color || "#4f46e5",
      bg: cat.bg || "#eef2ff",
      iconKey: cat.iconKey || "FiTag",
      description: cat.description || "",
    });
    setShowCategoryModal(true);
  };

  // Submit Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    try {
      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id;
        await updateCategory(catId, {
          ...formData,
          name: formData.name.trim(),
        });
        toast.success(`Category "${formData.name}" updated successfully!`);
      } else {
        await addCategory({
          ...formData,
          name: formData.name.trim(),
        });
        toast.success(`Category "${formData.name}" created successfully!`);
      }
      setShowCategoryModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save category.");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const catId = categoryToDelete._id || categoryToDelete.id;
      await deleteCategory(catId, categoryToDelete.type);
      toast.success(`Category "${categoryToDelete.name}" removed.`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  // Filtered Categories
  const filteredList = useMemo(() => {
    let list = [];
    if (filterType === "expense") {
      list = expenseCategories;
    } else if (filterType === "income") {
      list = incomeCategories;
    } else {
      list = [...expenseCategories, ...incomeCategories];
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [filterType, expenseCategories, incomeCategories, searchQuery]);

  return (
    <Container fluid className="p-0 ur-page-container">
      {/* 1. Clean Page Header */}
      <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-start gap-3 mb-3">
        <div>
          <h1 className="ms-greeting-title mb-1 d-flex align-items-center gap-2">
            <span>Category Management</span>
            <Badge bg="primary-subtle" className="text-primary fs-11px fw-700 py-1 px-2 rounded-6px">
              Settings
            </Badge>
          </h1>
          <p className="ms-greeting-subtitle mb-0">
            Create and organize custom income and expense categories, color palettes, and icons.
          </p>
        </div>

        <div>
          <Button
            type="button"
            className="d-flex align-items-center gap-2 py-2 px-3.5 rounded-10px fw-700 fs-13px border-0 shadow-sm"
            style={{ backgroundColor: "#4f46e5", color: "#ffffff" }}
            onClick={() => handleOpenAdd(filterType === "income" ? "income" : "expense")}
          >
            <FiPlus size={16} strokeWidth={2.5} />
            <span>New Category</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <Row className="g-3 mb-3">
        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0 shadow-xs">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Total Categories</div>
                  <div className="ms-stat-val text-primary" style={{ color: "#4f46e5" }}>
                    {expenseCategories.length + incomeCategories.length}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#eef2ff" }}>
                  <FiLayers size={18} color="#4f46e5" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-primary fw-700 fs-11px">Available for tracking</span>
                <span className="ms-stat-sub-text">Inflow &amp; Outflow</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0 shadow-xs">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Expense Categories</div>
                  <div className="ms-stat-val text-danger">
                    {expenseCategories.length}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fff1f2" }}>
                  <FiTrendingDown size={18} color="#ef4444" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-danger fw-700 fs-11px">Spending &amp; Budgets</span>
                <span className="ms-stat-sub-text">Linked to caps</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0 shadow-xs">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Income Categories</div>
                  <div className="ms-stat-val text-success">
                    {incomeCategories.length}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#ecfdf5" }}>
                  <FiTrendingUp size={18} color="#10b981" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-success fw-700 fs-11px">Revenue Streams</span>
                <span className="ms-stat-sub-text">Salary, business, etc.</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="ms-premium-card h-100 border-0 shadow-xs">
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="ms-stat-title">Primary Currency</div>
                  <div className="ms-stat-val text-dark fs-18px">
                    {profileData?.currency || user?.currency || "INR"}
                  </div>
                </div>
                <div className="ms-stat-icon-box" style={{ backgroundColor: "#fef3c7" }}>
                  <FiDollarSign size={18} color="#d97706" />
                </div>
              </div>
              <div className="pt-2 border-top border-light-subtle d-flex align-items-center justify-content-between">
                <span className="text-dark fw-700 fs-11px">Operating Currency</span>
                <Link to="/profile" className="ms-stat-sub-text text-primary text-decoration-none fw-600">
                  Manage Profile →
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Controls & Filter Bar */}
      <Card className="ms-premium-card border-0 mb-3 shadow-xs">
        <Card.Body className="p-2.5">
          <div className="d-flex flex-md-row flex-column justify-content-between align-items-md-center align-items-stretch gap-2">
            {/* Filter Pill Tabs */}
            <div className="d-flex align-items-center gap-1.5 p-1 bg-light rounded-10px">
              <button
                type="button"
                className={`ur-category-tab-btn ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All Categories ({expenseCategories.length + incomeCategories.length})
              </button>
              <button
                type="button"
                className={`ur-category-tab-btn ${filterType === "expense" ? "active" : ""}`}
                onClick={() => setFilterType("expense")}
              >
                Expenses ({expenseCategories.length})
              </button>
              <button
                type="button"
                className={`ur-category-tab-btn ${filterType === "income" ? "active" : ""}`}
                onClick={() => setFilterType("income")}
              >
                Incomes ({incomeCategories.length})
              </button>
            </div>

            {/* Search Input & View Toggle */}
            <div className="d-flex align-items-center gap-2">
              <div className="position-relative" style={{ minWidth: "260px" }}>
                <FiSearch
                  size={14}
                  className="position-absolute text-muted"
                  style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control fs-12.5px"
                  style={{
                    height: "36px",
                    paddingLeft: "34px",
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    backgroundColor: "#ffffff",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn btn-link position-absolute p-0 text-muted"
                    style={{ right: "10px", top: "50%", transform: "translateY(-50%)", textDecoration: "none" }}
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* View Switcher */}
              <div className="d-flex align-items-center bg-light p-1 rounded-8px border border-light-subtle">
                <button
                  type="button"
                  className={`btn btn-sm p-1 border-0 rounded-6px ${viewMode === "grid" ? "bg-white shadow-xs text-primary" : "text-muted"}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`btn btn-sm p-1 border-0 rounded-6px ${viewMode === "list" ? "bg-white shadow-xs text-primary" : "text-muted"}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 4. Categories Presentation (Grid or List) */}
      {categoriesLoading && filteredList.length === 0 ? (
        <Card className="ms-premium-card border-0 py-5 text-center shadow-xs">
          <Card.Body>
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
            <h6 className="fw-700 text-dark mb-1">Loading Categories...</h6>
            <p className="text-muted fs-12px mb-0">Fetching your custom financial categories.</p>
          </Card.Body>
        </Card>
      ) : filteredList.length === 0 ? (
        <Card className="ms-premium-card border-0 py-5 text-center shadow-xs">
          <Card.Body>
            <FiTag size={36} className="text-muted mb-2 opacity-50" />
            <h6 className="fw-700 text-dark mb-1">No Categories Found</h6>
            <p className="text-muted fs-12px mb-3">
              {searchQuery
                ? `No categories matching "${searchQuery}".`
                : "Create custom categories to organize your incomes and expenses."}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="rounded-8px px-3"
              style={{ backgroundColor: "#4f46e5" }}
              onClick={() => handleOpenAdd(filterType === "income" ? "income" : "expense")}
            >
              <FiPlus size={14} className="me-1" /> Add Category
            </Button>
          </Card.Body>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW: 4 Balanced Cards Per Row */
        <Row className="g-3">
          {filteredList.map((cat) => {
            const iconComp = ICON_MAP[cat.iconKey] || <FiTag size={18} />;
            const isExpense = cat.type === "expense";
            const colorObj = PRESET_COLORS.find(
              (p) => p.color.toLowerCase() === (cat.color || "").toLowerCase()
            );
            const colorLabel = colorObj?.name || cat.color || "Theme";

            return (
              <Col xs={12} sm={6} lg={4} xl={3} key={cat.id || cat._id || cat.name}>
                <Card
                  className="ms-premium-card border-0 h-100 shadow-xs"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #edf2f7",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.06)";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "var(--ur-shadow-xs)";
                    e.currentTarget.style.borderColor = "#edf2f7";
                  }}
                >
                  <Card.Body className="p-3.5 d-flex flex-column justify-content-between">
                    <div>
                      {/* Top Header: Left Icon Box + Right (Title, Badge, Description) */}
                      <div className="d-flex align-items-start gap-3 mb-2.5">
                        {/* Spiced Glowing Icon Box */}
                        <div
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "12px",
                            backgroundColor: cat.bg || (isExpense ? "#fff1f2" : "#ecfdf5"),
                            color: cat.color || (isExpense ? "#ef4444" : "#10b981"),
                            border: `1.5px solid ${cat.color ? cat.color + "35" : (isExpense ? "#fecdd3" : "#a7f3d0")}`,
                            boxShadow: `0 3px 10px ${cat.color ? cat.color + "22" : "rgba(0,0,0,0.04)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "21px",
                            flexShrink: 0,
                          }}
                        >
                          {iconComp}
                        </div>

                        {/* Title & Badge Stack */}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center justify-content-between gap-1.5 mb-1">
                            <h5
                              className="fw-800 text-dark mb-0 text-truncate"
                              style={{
                                fontSize: "15.5px",
                                letterSpacing: "-0.2px",
                                lineHeight: 1.25,
                              }}
                            >
                              {cat.name}
                            </h5>

                            <span
                              className="badge rounded-pill fw-700 text-uppercase flex-shrink-0 d-inline-flex align-items-center gap-1"
                              style={{
                                fontSize: "9.5px",
                                letterSpacing: "0.5px",
                                padding: "3.5px 7px",
                                backgroundColor: isExpense ? "#fff1f2" : "#ecfdf5",
                                color: isExpense ? "#e11d48" : "#059669",
                                border: `1px solid ${isExpense ? "#fecdd3" : "#a7f3d0"}`,
                              }}
                            >
                              {isExpense ? <FiTrendingDown size={10} strokeWidth={2.5} /> : <FiTrendingUp size={10} strokeWidth={2.5} />}
                              <span>{cat.type}</span>
                            </span>
                          </div>

                          {/* Description directly aligned under Name */}
                          <p
                            className="text-muted mb-0 text-truncate-2"
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.45",
                              color: "#64748b",
                              minHeight: "35px",
                            }}
                          >
                            {cat.description || `Standard ${cat.type} category for transactions and analytics.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Color Swatch + Spaced Square Action Buttons */}
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        borderTop: "1px solid #edf2f7",
                        marginTop: "16px",
                        paddingTop: "14px",
                      }}
                    >
                      {/* Theme Color Badge */}
                      <div
                        className="d-flex align-items-center rounded-pill"
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          padding: "5px 12px",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: cat.color || "#4f46e5",
                            display: "inline-block",
                            flexShrink: 0,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#475569",
                            lineHeight: 1,
                          }}
                        >
                          {colorLabel}
                        </span>
                      </div>

                      {/* Action Buttons: Exact Square, Colorful, Spaced */}
                      <div className="d-flex align-items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="cat-action-btn cat-edit-btn"
                          title="Edit Category"
                        >
                          <FiEdit2 size={13} strokeWidth={2.2} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setShowDeleteModal(true);
                          }}
                          className="cat-action-btn cat-delete-btn"
                          title="Delete Category"
                        >
                          <FiTrash2 size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* LIST VIEW: Clean Table / Row Layout */
        <Card className="ms-premium-card border-0 shadow-xs">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="bg-light">
                  <tr className="border-bottom border-light-subtle text-muted fs-11px fw-700 text-uppercase">
                    <th className="ps-4 py-2.5">Category</th>
                    <th className="py-2.5">Classification</th>
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5">Theme Color</th>
                    <th className="pe-4 py-2.5 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((cat) => {
                    const iconComp = ICON_MAP[cat.iconKey] || <FiTag size={16} />;
                    const isExpense = cat.type === "expense";
                    const colorObj = PRESET_COLORS.find(
                      (p) => p.color.toLowerCase() === (cat.color || "").toLowerCase()
                    );
                    const colorLabel = colorObj?.name || cat.color || "Theme";

                    return (
                      <tr key={cat.id || cat._id || cat.name} className="border-bottom border-light-subtle">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-2.5">
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: cat.bg || (isExpense ? "#fee2e2" : "#d1fae5"),
                                color: cat.color || (isExpense ? "#ef4444" : "#10b981"),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {iconComp}
                            </div>
                            <span className="fw-700 text-dark fs-14px">{cat.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge rounded-pill fw-700 text-uppercase"
                            style={{
                              fontSize: "10.5px",
                              padding: "4px 9px",
                              backgroundColor: isExpense ? "#fee2e2" : "#d1fae5",
                              color: isExpense ? "#dc2626" : "#059669",
                            }}
                          >
                            {cat.type}
                          </span>
                        </td>
                        <td className="text-muted fs-12.5px" style={{ maxWidth: "340px" }}>
                          {cat.description || "—"}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              style={{
                                width: "11px",
                                height: "11px",
                                borderRadius: "50%",
                                backgroundColor: cat.color || "#4f46e5",
                                display: "inline-block",
                              }}
                            />
                            <span className="fs-12px fw-600 text-secondary">{colorLabel}</span>
                          </div>
                        </td>
                        <td className="pe-4 py-3 text-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="btn p-0 d-inline-flex align-items-center justify-content-center me-2"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#eff6ff",
                              color: "#4f46e5",
                              border: "1px solid #c7d2fe",
                              transition: "all 0.15s ease",
                            }}
                            title="Edit"
                          >
                            <FiEdit2 size={13} strokeWidth={2.2} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryToDelete(cat);
                              setShowDeleteModal(true);
                            }}
                            className="btn p-0 d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: "#fff1f2",
                              color: "#e11d48",
                              border: "1px solid #fecdd3",
                              transition: "all 0.15s ease",
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={13} strokeWidth={2.2} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ===================================================================
          CATEGORY BUILDER MODAL (ADD / EDIT)
          =================================================================== */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
        className="ur-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-700 fs-16px text-dark d-flex align-items-center gap-2">
              <span className={`ur-modal-icon ${formData.type === "expense" ? "" : "income"}`}>
                {ICON_MAP[formData.iconKey] || <FiTag size={16} />}
              </span>
              <span>{editingCategory ? "Edit Custom Category" : "New Custom Category"}</span>
            </Modal.Title>
            <p className="text-muted fs-11.5px mb-0">
              Configure classification, icon, name, and visual theme color.
            </p>
          </div>
        </Modal.Header>

        <Form onSubmit={handleSaveCategory}>
          <Modal.Body className="py-3">
            {/* 1. Classification (Segmented Switch) */}
            <div className="mb-3">
              <label className="ur-form-label">Classification *</label>
              <div className="cat-type-toggle-wrap">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`cat-type-toggle-btn expense ${formData.type === "expense" ? "active" : ""}`}
                >
                  <FiTrendingDown size={14} />
                  <span>Expense Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`cat-type-toggle-btn income ${formData.type === "income" ? "active" : ""}`}
                >
                  <FiTrendingUp size={14} />
                  <span>Income Category</span>
                </button>
              </div>
            </div>

            {/* 2. Category Name */}
            <Form.Group className="mb-3">
              <Form.Label className="ur-form-label">Category Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Dining, Freelance, Software, Groceries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            {/* 3. Description */}
            <Form.Group className="mb-3">
              <Form.Label className="ur-form-label">Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Brief description or notes for this category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="ur-form-input"
              />
            </Form.Group>

            {/* 4. Select Icon */}
            <div className="mb-3">
              <label className="ur-form-label">Select Icon</label>
              <div
                className="d-flex flex-wrap gap-2 p-2 rounded-8px border bg-light"
                style={{ borderColor: "#e2e8f0" }}
              >
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = formData.iconKey === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setFormData({ ...formData, iconKey: item.key })}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#4f46e5" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#64748b",
                        border: isSelected ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                        fontSize: "16px",
                        transition: "all 0.15s ease",
                      }}
                      title={item.label}
                    >
                      {item.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Theme Palette Color */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <label className="ur-form-label mb-2 pb-1">Theme Palette Color</label>
                <span className="text-muted fs-11px fw-600">
                  {formData.color ? formData.color.toUpperCase() : "#4F46E5"}
                </span>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2 pt-0.5">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = (formData.color || "").toLowerCase() === preset.color.toLowerCase();
                  return (
                    <div
                      key={preset.name}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          color: preset.color,
                          bg: preset.bg,
                        })
                      }
                      style={{
                        backgroundColor: preset.color,
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isSelected
                          ? "0 0 0 2px #fff, 0 0 0 4px #4f46e5"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                      title={preset.name}
                    >
                      {isSelected && <FiCheck size={14} color="#ffffff" strokeWidth={3} />}
                    </div>
                  );
                })}

                {/* Custom Color Picker Swatch */}
                {(() => {
                  const isCustom = !PRESET_COLORS.some(
                    (p) => p.color.toLowerCase() === (formData.color || "").toLowerCase()
                  );
                  return (
                    <label
                      htmlFor="custom-category-color-input"
                      className="position-relative m-0"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isCustom ? formData.color : "#ffffff",
                        border: isCustom ? "none" : "1.5px dashed #cbd5e1",
                        boxShadow: isCustom
                          ? `0 0 0 2px #fff, 0 0 0 4px ${formData.color}`
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                      title="Custom Color Picker"
                    >
                      <input
                        id="custom-category-color-input"
                        type="color"
                        value={formData.color?.startsWith("#") ? formData.color : "#4f46e5"}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setFormData({
                            ...formData,
                            color: newColor,
                            bg: newColor + "18", // soft 10% opacity tint for icon background
                          });
                        }}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          width: "100%",
                          height: "100%",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                        }}
                      />
                      {isCustom ? (
                        <FiCheck size={14} color="#ffffff" strokeWidth={3} />
                      ) : (
                        <FiDroplet size={14} color="#64748b" />
                      )}
                    </label>
                  );
                })()}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowCategoryModal(false)}
              className="rounded-6px px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={creating || updating}
              className="rounded-6px px-4"
              style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
            >
              <FiPlus size={14} />{" "}
              {creating || updating ? "Saving..." : editingCategory ? "Save Changes" : "Save Category"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===================================================================
          DELETE CONFIRMATION MODAL
          =================================================================== */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="ur-modal"
        dialogClassName="ur-delete-modal-dialog"
      >
        <div className="p-4 text-center">
          {/* Danger Icon Badge */}
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#dc2626",
            }}
          >
            <FiAlertTriangle size={24} strokeWidth={2.3} />
          </div>

          {/* Heading */}
          <h5
            className="fw-800 text-dark mb-1.5"
            style={{ fontSize: "17px", letterSpacing: "-0.2px" }}
          >
            Delete Category?
          </h5>

          {/* Subtext */}
          <p
            className="text-muted mb-4 mx-auto"
            style={{
              fontSize: "12.5px",
              lineHeight: 1.5,
              maxWidth: "280px",
              color: "#64748b",
            }}
          >
            Are you sure you want to delete{" "}
            <strong className="text-dark fw-700">
              "{categoryToDelete?.name}"
            </strong>
            ? Transactions linked to this category will not be affected.
          </p>

          {/* Actions */}
          <div className="d-flex align-items-center justify-content-center gap-2">
            <button
              type="button"
              className="btn flex-grow-1 border fw-600 fs-13px"
              style={{
                height: "40px",
                borderRadius: "9px",
                borderColor: "#e2e8f0",
                backgroundColor: "#ffffff",
                color: "#475569",
              }}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn flex-grow-1 border-0 fw-700 fs-13px text-white"
              style={{
                height: "40px",
                borderRadius: "9px",
                backgroundColor: "#dc2626",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
              }}
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}

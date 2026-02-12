import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Mail,
  ArrowLeft,
  Save,
  MoreHorizontal,
  LayoutTemplate,
  Eye,
  Zap,
  Clock,
  Send,
  Copy,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./emailtemplates.css";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  dark: "var(--dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowHuge: "var(--shadow-huge)",
};


// -----------------------
// Sub-Components
// -----------------------
const StatBadge = ({ value, label, color }) => (
  <div className="stat-badge">
    <div className="stat-badge-value" style={{ color: color }}>
      {value}
    </div>
    <div className="stat-badge-label">
      {label}
    </div>
  </div>
);

// -----------------------
// Main Component
// -----------------------
const EmailTemplateManager = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // Data State
  const [editorMode, setEditorMode] = useState("code"); // 'code' or 'preview'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // View State
  const [view, setView] = useState("list"); // 'list' or 'edit'
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form State
  const [editFormData, setEditFormData] = useState({ subject: "", body: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Account", "Assessment", "Survey"];

  // Toast State
  const [toast, setToast] = useState(null);

  // -----------------------
  // Toast Helper
  // -----------------------
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000); // Disappear after 3 seconds
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // -----------------------
  // Data Fetching
  // -----------------------
  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/email-templates/`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const mappedTemplates = data.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        body: t.body,
        description: t.subject,
        category: capitalizeFirstLetter(t.category),
        status: capitalizeFirstLetter(t.status),
        variables: t.variables ? Object.keys(t.variables) : [],
        lastUpdated: new Date(t.updated_at).toLocaleDateString(),
        openRate: Math.floor(Math.random() * 100) + "%",
      }));
      setTemplates(mappedTemplates);
    } catch (e) {
      console.error(e);
      showToast("Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  }

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // -----------------------
  // Handlers
  // -----------------------
  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditFormData({
      subject: template.subject,
      body: template.body,
    });
    setView("edit");
  };

  const handleGoBack = () => {
    setSelectedTemplate(null);
    setEditFormData({ subject: "", body: "" });
    setView("list");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyVariable = (variable) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    showToast(`Copied {{${variable}}} to clipboard!`, "success");
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);

    try {
      const payload = {
        subject: editFormData.subject,
        body: editFormData.body,
      };

      const res = await axios.patch(
        `${API_BASE}/api/email-templates/${selectedTemplate.id}/`,
        payload,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      const updatedBackendData = res.data;

      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id === selectedTemplate.id) {
            return {
              ...t,
              subject: updatedBackendData.subject,
              body: updatedBackendData.body,
              description: updatedBackendData.subject,
              lastUpdated: new Date(
                updatedBackendData.updated_at
              ).toLocaleDateString(),
            };
          }
          return t;
        })
      );

      setSelectedTemplate((prev) => ({
        ...prev,
        subject: updatedBackendData.subject,
        body: updatedBackendData.body,
        lastUpdated: new Date(
          updatedBackendData.updated_at
        ).toLocaleDateString(),
      }));

      // SUCCESS TOAST
      showToast("Template saved successfully!", "success");
    } catch (err) {
      console.error(err);
      // ERROR TOAST
      const errMsg = err.response?.data
        ? "Check your data inputs"
        : "Failed to save changes";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // -----------------------
  // RENDER: Editor View
  // -----------------------
  // -----------------------
  // RENDER: Editor View
  // -----------------------
  if (view === "edit" && selectedTemplate) {
    return (
      <div className="email-templates-page">
        <div className="main-wrapper">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="editor-header-left">
              <button
                onClick={handleGoBack}
                className="back-btn"
              >
                <ArrowLeft size={18} color={COLORS.textPrimary} /> Back
              </button>
              <div className="editor-header-title">
                <div className="editor-header-title-label">
                  Editing Template
                </div>
                <h2>
                  {selectedTemplate.name}
                </h2>
              </div>
            </div>
            <div className="editor-header-actions">
              <button
                className="primary-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* MODE TOGGLE TABS */}
          <div className="editor-tabs">
            <button
              onClick={() => setEditorMode("code")}
              className={editorMode === "code" ? "editor-tab editor-tab-active" : "editor-tab"}
            >
              Code Editor
            </button>
            <button
              onClick={() => setEditorMode("preview")}
              className={editorMode === "preview" ? "editor-tab editor-tab-active" : "editor-tab"}
            >
              Visual Preview
            </button>
          </div>

          {/* Editor Layout */}
          <div className="editor-layout">
            <div className="editor-main">
              {/* SUBJECT INPUT (Always Visible) */}
              <div className="editor-input-wrapper">
                <label className="editor-label">
                  Email Subject
                </label>
                <input
                  name="subject"
                  value={editFormData.subject}
                  onChange={handleInputChange}
                  className="input-focus editor-input"
                />
              </div>

              {/* CONDITIONAL RENDER: CODE vs PREVIEW */}
              {editorMode === "code" ? (
                <>
                  <label className="editor-label">
                    HTML Code
                  </label>
                  <textarea
                    name="body"
                    value={editFormData.body}
                    onChange={handleInputChange}
                    className="input-focus editor-textarea editor-textarea-code"
                    placeholder="Paste your HTML here..."
                  />
                </>
              ) : (
                <div className="editor-preview-frame">
                  {/* We use an iframe to safely render the HTML so CSS doesn't bleed 
                  into your React app 
                */}
                  <iframe
                    title="email-preview"
                    srcDoc={editFormData.body}
                  />
                </div>
              )}
            </div>

            {/* Sidebar (Same as before) */}
            <div className="editor-sidebar">
              <div className="variables-card">
                <h3>
                  <Zap size={16} color={COLORS.orange} />
                  Dynamic Variables
                </h3>
                <p>
                  Click to copy variables to clipboard.
                </p>
                <div className="variables-list">
                  {selectedTemplate.variables.map((v) => (
                    <div
                      key={v}
                      className="variable-item secondary-btn"
                      onClick={() => handleCopyVariable(v)}
                    >
                      <span>{`{{${v}}}`}</span>
                      <Copy size={12} color={COLORS.textMuted} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOAST (Keep existing toast code) */}
        {toast && (
          <div
            className={`email-templates-toast ${toast.type === "error" ? "email-templates-toast-error" : "email-templates-toast-success"}`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} color={COLORS.red} />
            ) : (
              <CheckCircle size={20} color={COLORS.primary} />
            )}
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  // -----------------------
  // RENDER: List View
  // -----------------------
  return (
    <div className="email-templates-page">
      <div className="main-wrapper">
        {/* Header */}
        <div className="header-flex">
          <div className="header-title-block">
            <div className="header-title-row">
              <div className="icon-box icon-box-primary-light">
                <LayoutTemplate size={24} color={COLORS.primary} />
              </div>
              <h1>
                Email Templates
              </h1>
            </div>
            <p>
              Manage, edit, and organize the automated emails sent by your
              application.
            </p>
          </div>
          <div className="search-container">
            <Search
              size={18}
              color={COLORS.textMuted}
              className="search-icon"
            />
            <input
              className="input-focus"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="stats-container">
          <div className="filters-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`pill ${selectedCategory === cat ? "pill-active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" && <Filter size={14} />} {cat}
              </button>
            ))}
          </div>
          <div className="stats-badges">
            <StatBadge
              value={templates.length}
              label="Total"
              color={COLORS.primary}
            />
            <StatBadge value="12.5k" label="Sent (Mo)" color={COLORS.blue} />
            <StatBadge value="4" label="Drafts" color={COLORS.orange} />
          </div>
        </div>

        {/* Grid */}
        <div className="template-grid">
          {loading && (
            <div className="loading-message">
              Loading...
            </div>
          )}
          {!loading &&
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="hover-card"
                onClick={() => handleEdit(template)}
              >
                <div className="template-card-header">
                  <div className="template-card-header-left">
                    <div className="template-icon-box">
                      <Mail size={20} color={COLORS.blue} />
                    </div>
                    <div>
                      <span
                        className={`tag ${template.status === "Active" ? "tag-green" : "tag-orange"}`}
                      >
                        {template.status}
                      </span>
                    </div>
                  </div>
                  <button className="template-more-btn">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="template-card-content">
                  <div className="template-card-category">
                    {template.category}
                  </div>
                  <h3 className="template-card-title">
                    {template.name}
                  </h3>
                  <p className="template-card-description">
                    {template.description}
                  </p>
                </div>
                <div className="template-card-footer">
                  <div className="template-card-footer-left">
                    <Clock size={12} /> {template.lastUpdated}
                  </div>
                  {template.status === "Active" && (
                    <div className="template-card-footer-right">
                      <Send size={12} /> {template.openRate} Open Rate
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        {!loading && filteredTemplates.length === 0 && (
          <div className="empty-message">
            <p>No templates found.</p>
          </div>
        )}

        {/* TOAST NOTIFICATION (List View) */}
        {toast && (
          <div
            className={`email-templates-toast ${toast.type === "error" ? "email-templates-toast-error" : "email-templates-toast-success"}`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} color={COLORS.red} />
            ) : (
              <CheckCircle size={20} color={COLORS.primary} />
            )}
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};
export default EmailTemplateManager;

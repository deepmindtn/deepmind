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
// Inline Styles
// -----------------------
const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative", // Needed for absolute positioning of toast if context changes
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
    minHeight: "85vh",
  },
  searchWrapper: { position: "relative", maxWidth: "500px", width: "100%" },
  iconBox: (bg) => ({
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  }),
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  pill: (active) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    border: active
      ? `1px solid ${COLORS.primary}`
      : `1px solid ${COLORS.borderColor}`,
    backgroundColor: active ? COLORS.primaryLight : COLORS.cardBg,
    color: active ? COLORS.primaryDark : COLORS.textSecondary,
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  }),
  tag: (tone) => {
    const tones = {
      green: { bg: COLORS.primaryLight, text: COLORS.primaryDark },
      blue: { bg: COLORS.blueLight, text: COLORS.blue },
      purple: { bg: COLORS.purpleLight, text: COLORS.purple },
      orange: { bg: COLORS.orangeLight, text: COLORS.orange },
      gray: { bg: "#f1f5f9", text: COLORS.textSecondary },
    };
    const t = tones[tone] || tones.gray;
    return {
      padding: "4px 10px",
      borderRadius: "6px",
      backgroundColor: t.bg,
      color: t.text,
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    };
  },
  editorInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    marginBottom: "24px",
    transition: "border 0.2s",
  },
  editorTextArea: {
    width: "100%",
    minHeight: "400px",
    padding: "24px",
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "15px",
    fontFamily: "'Monaco', 'Consolas', monospace",
    lineHeight: "1.6",
    resize: "vertical",
    backgroundColor: "#fafafa",
  },
};

const responsiveStyles = `
  @media (max-width: 1024px) {
    .template-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important; }
    .main-wrapper { padding: 32px 24px !important; }
    .header-flex { flex-direction: column !important; align-items: flex-start !important; gap: 24px !important; }
    .search-container { max-width: 100% !important; }
    .stats-container { flex-direction: column !important; }
    .editor-layout { flex-direction: column !important; }
    .editor-sidebar { width: 100% !important; margin-top: 24px !important; }
  }
  .hover-card:hover { 
    transform: translateY(-8px); 
    border-color: ${COLORS.primary} !important; 
    box-shadow: ${COLORS.shadowHuge} !important; 
  }
  .primary-btn { 
    background: ${COLORS.primary}; 
    color: white; 
    border: none; 
    padding: 10px 20px; 
    border-radius: 10px; 
    font-weight: 700; 
    font-size: 14px; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    cursor: pointer; 
    transition: 0.2s; 
  }
  .primary-btn:hover { background: ${COLORS.primaryDark}; }
  
  .secondary-btn {
    background: white;
    color: ${COLORS.textPrimary};
    border: 1px solid ${COLORS.borderColor};
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex; 
    align-items: center; 
    gap: 8px;
  }
  .secondary-btn:hover { background: #f8fafc; }
  .input-focus:focus { 
    border-color: ${COLORS.primary} !important; 
    outline: none; 
    box-shadow: 0 0 0 4px ${COLORS.primaryLight}; 
  }
`;

// -----------------------
// Sub-Components
// -----------------------
const StatBadge = ({ value, label, color }) => (
  <div
    style={{
      textAlign: "center",
      flex: 1,
      padding: "12px",
      borderRight: `1px solid ${COLORS.borderColor}`,
    }}
  >
    <div style={{ fontSize: "20px", fontWeight: "800", color: color }}>
      {value}
    </div>
    <div
      style={{
        fontSize: "11px",
        fontWeight: "700",
        color: COLORS.textMuted,
        textTransform: "uppercase",
      }}
    >
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
      <div style={styles.container}>
        <style>{responsiveStyles}</style>
        <div className="main-wrapper" style={styles.mainWrapperCard}>
          {/* Editor Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: `1px solid ${COLORS.borderColor}`,
              paddingBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={handleGoBack}
                className="secondary-btn"
                style={{
                  padding: "8px 12px",
                  backgroundColor: COLORS.cardBg, // button background
                  color: COLORS.textPrimary, // text color
                  border: `1px solid ${COLORS.borderColor}`, // border color
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={18} color={COLORS.textPrimary} /> Back
              </button>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  Editing Template
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {selectedTemplate.name}
                </h2>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="primary-btn"
                onClick={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.7 : 1 }}
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
          <div
            style={{
              display: "flex",
              gap: "0",
              marginBottom: "24px",
              borderBottom: `1px solid ${COLORS.borderColor}`,
            }}
          >
            <button
              onClick={() => setEditorMode("code")}
              style={{
                padding: "12px 24px",
                borderBottom:
                  editorMode === "code"
                    ? `2px solid ${COLORS.primary}`
                    : "2px solid transparent",
                color:
                  editorMode === "code" ? COLORS.primary : COLORS.textSecondary,
                fontWeight: "600",
                background: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
              }}
            >
              Code Editor
            </button>
            <button
              onClick={() => setEditorMode("preview")}
              style={{
                padding: "12px 24px",
                borderBottom:
                  editorMode === "preview"
                    ? `2px solid ${COLORS.primary}`
                    : "2px solid transparent",
                color:
                  editorMode === "preview"
                    ? COLORS.primary
                    : COLORS.textSecondary,
                fontWeight: "600",
                background: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
              }}
            >
              Visual Preview
            </button>
          </div>

          {/* Editor Layout */}
          <div
            className="editor-layout"
            style={{ display: "flex", gap: "32px" }}
          >
            <div style={{ flex: 3 }}>
              {/* SUBJECT INPUT (Always Visible) */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: COLORS.textSecondary,
                    fontSize: "14px",
                  }}
                >
                  Email Subject
                </label>
                <input
                  name="subject"
                  value={editFormData.subject}
                  onChange={handleInputChange}
                  className="input-focus"
                  style={{
                    ...styles.editorInput,
                    backgroundColor: COLORS.cardBg,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* CONDITIONAL RENDER: CODE vs PREVIEW */}
              {editorMode === "code" ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      color: COLORS.textSecondary,
                      fontSize: "14px",
                    }}
                  >
                    HTML Code
                  </label>
                  <textarea
                    name="body"
                    value={editFormData.body}
                    onChange={handleInputChange}
                    className="input-focus"
                    style={{
                      ...styles.editorTextArea,
                      backgroundColor: COLORS.cardBg,
                      color: COLORS.textPrimary,
                      fontFamily: "'Monaco', monospace",
                      fontSize: "13px",
                    }}
                    placeholder="Paste your HTML here..."
                  />
                </>
              ) : (
                <div
                  style={{
                    border: `1px solid ${COLORS.borderColor}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    height: "600px",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* We use an iframe to safely render the HTML so CSS doesn't bleed 
                  into your React app 
                */}
                  <iframe
                    title="email-preview"
                    srcDoc={editFormData.body}
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                </div>
              )}
            </div>

            {/* Sidebar (Same as before) */}
            <div className="editor-sidebar" style={{ flex: 1 }}>
              <div
                style={{
                  backgroundColor: COLORS.cardBg,
                  padding: "24px",
                  borderRadius: "16px",
                  border: `1px solid ${COLORS.borderColor}`,
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "16px",
                    color: COLORS.textPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Zap size={16} color={COLORS.orange} />
                  Dynamic Variables
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: COLORS.textSecondary,
                    marginBottom: "16px",
                  }}
                >
                  Click to copy variables to clipboard.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {selectedTemplate.variables.map((v) => (
                    <div
                      key={v}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "white",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.borderColor}`,
                        fontSize: "13px",
                        fontFamily: "monospace",
                        cursor: "pointer",
                      }}
                      className="secondary-btn"
                      onClick={() => handleCopyVariable(v)}
                    >
                      <span
                        style={{ color: COLORS.primaryDark }}
                      >{`{{${v}}}`}</span>
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
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
              border: `1px solid ${
                toast.type === "error" ? COLORS.red : COLORS.primary
              }`,
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "600",
              color: COLORS.textPrimary,
            }}
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
    <div style={styles.container}>
      <style>{responsiveStyles}</style>
      <div className="main-wrapper" style={styles.mainWrapperCard}>
        {/* Header */}
        <div
          className="header-flex"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            paddingBottom: "40px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={styles.iconBox(COLORS.primaryLight)}>
                <LayoutTemplate size={24} color={COLORS.primary} />
              </div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  margin: 0,
                  color: COLORS.textPrimary,
                }}
              >
                Email Templates
              </h1>
            </div>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: "16px",
                margin: 0,
                maxWidth: "600px",
              }}
            >
              Manage, edit, and organize the automated emails sent by your
              application.
            </p>
          </div>
          <div className="search-container" style={styles.searchWrapper}>
            <Search
              size={18}
              color={COLORS.textMuted}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              className="input-focus"
              style={{
                width: "100%",
                padding: "14px 16px 14px 48px",
                borderRadius: "14px",
                backgroundColor: COLORS.cardBg,
                color: COLORS.textPrimary,
                border: `1px solid ${COLORS.borderColor}`,
                fontSize: "15px",
                transition: "0.2s",
              }}
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats & Filters */}
        <div
          className="stats-container"
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "40px",
            alignItems: "center",
          }}
        >
          <div
            className="filters-scroll"
            style={{ display: "flex", gap: "8px", flex: 1, overflowX: "auto" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                style={styles.pill(selectedCategory === cat)}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" && <Filter size={14} />} {cat}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "16px",
              padding: "4px",
              minWidth: "320px",
            }}
          >
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
        <div
          className="template-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {loading && (
            <div style={{ gridColumn: "1/-1", textAlign: "center" }}>
              Loading...
            </div>
          )}
          {!loading &&
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="hover-card"
                style={styles.card}
                onClick={() => handleEdit(template)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        backgroundColor: COLORS.blueLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Mail size={20} color={COLORS.blue} />
                    </div>
                    <div>
                      <span
                        style={styles.tag(
                          template.status === "Active" ? "green" : "orange"
                        )}
                      >
                        {template.status}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.textMuted,
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: COLORS.secondary,
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {template.category}
                  </div>
                  <h3
                    style={{
                      fontSize: "19px",
                      fontWeight: "800",
                      color: COLORS.textPrimary,
                      marginBottom: "10px",
                      lineHeight: "1.3",
                    }}
                  >
                    {template.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: COLORS.textSecondary,
                      lineHeight: "1.6",
                      marginBottom: "20px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {template.description}
                  </p>
                </div>
                <div
                  style={{
                    borderTop: `1px solid ${COLORS.borderColor}`,
                    paddingTop: "16px",
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: COLORS.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    <Clock size={12} /> {template.lastUpdated}
                  </div>
                  {template.status === "Active" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: COLORS.primaryDark,
                        fontWeight: "700",
                      }}
                    >
                      <Send size={12} /> {template.openRate} Open Rate
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        {!loading && filteredTemplates.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", opacity: 0.6 }}>
            <p>No templates found.</p>
          </div>
        )}

        {/* TOAST NOTIFICATION (List View) */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
              border: `1px solid ${
                toast.type === "error" ? COLORS.red : COLORS.primary
              }`,
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "600",
              color: COLORS.textPrimary,
            }}
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

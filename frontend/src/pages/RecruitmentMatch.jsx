import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Plus,
  Upload,
  Search,
  Users,
  Send,
  FileText,
  Brain,
  Loader2,
  BarChart3,
  X,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  ChevronDown,
  Check,
  Mail,
  Eye,
  Clock,
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
// Assessment Options Data
// -----------------------
const ASSESSMENT_OPTIONS = [
  {
    group: "Personality & Behavior",
    items: [
      { code: "BIG_FIVE", label: "🧠 Big Five Personality Traits" },
      { code: "DISC", label: "💼 DISC Personality Assessment" },
    ],
  },
  {
    group: "Work Style & Motivation",
    items: [
      { code: "KARASEK", label: "⚖️ Karasek Job Demand-Control" },
      { code: "GCOS", label: "🎯 General Causality Orientations" },
      { code: "WSES", label: "✨ Work Self-Efficacy Scale" },
    ],
  },
  {
    group: "Cognitive & Creativity",
    items: [
      { code: "RIBS", label: "💡 Runco Ideational Behavior" },
      { code: "CAQ", label: "🎨 Creative Achievement" },
      { code: "ISE", label: "🚀 Innovation Self-Efficacy" },
    ],
  },
];

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: COLORS.textPrimary,
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
    minHeight: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowSm,
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnBulk: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: COLORS.blue,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#fff",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  dropZone: (isDragging) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "40px 20px",
    border: `2px dashed ${isDragging ? COLORS.primary : COLORS.borderColor}`,
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: isDragging ? COLORS.primaryLight : "#fcfcfd",
    textAlign: "center",
    position: "relative",
  }),
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#fff",
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: "12px",
    fontSize: "13px",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  badge: (status) => {
    const colors = {
      hired: { bg: "#ecfdf5", text: "#059669" },
      rejected: { bg: "#fef2f2", text: "#ef4444" },
      invited: { bg: "#eff6ff", text: "#3b82f6" },
      pending: { bg: "#fffbeb", text: "#d97706" },
      interview: { bg: "#fef3c7", text: "#d97706" },
      completed: { bg: "#ecfdf5", text: "#059669" },
      default: { bg: "#f3f4f6", text: "#6b7280" },
    };
    const style = colors[status?.toLowerCase()] || colors.default;
    return {
      padding: "4px 12px",
      borderRadius: "99px",
      fontSize: "12px",
      fontWeight: "600",
      backgroundColor: style.bg,
      color: style.text,
      textTransform: "capitalize",
    };
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: COLORS.primary,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(6px)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 20,
  },
};

// -----------------------
// Sub-components
// -----------------------
function StatusBadge({ status }) {
  return <span style={styles.badge(status)}>{status}</span>;
}

const Modal = ({ open, title, onClose, children, actions }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: "600px",
          padding: "24px",
          boxShadow: COLORS.shadowLg,
          overflow: "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          {actions}
        </div>
      </div>
    </div>,
    document.body
  );
};

// -----------------------
// Main Component
// -----------------------
export default function RecruitmentMatch() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // --- States ---
  const [toast, setToast] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [q, setQ] = useState("");

  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  // CRUD States
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    email: "",
    first_name: "",
    last_name: "",
    position: "",
    status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Assign Assessment States
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sendingAssessment, setSendingAssessment] = useState(false);

  // View Assignments States
  const [viewAssignmentsOpen, setViewAssignmentsOpen] = useState(false);
  const [viewAssignmentsCandidate, setViewAssignmentsCandidate] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // AI Matcher States
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // --- Toast Timer ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch(`${API_BASE}/api/recruitment/candidates/`, {
        headers: authHeader,
      });
      const data = await res.json();
      setCandidates(
        data.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
          email: c.email,
          position: c.position || "Not Specified",
          status: c.status || "Pending",
        }))
      );
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load candidates", type: "error" });
    }
  }

  // --- Bulk Selection Logic ---
  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.position.toLowerCase().includes(q.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openBulkAssignModal = () => {
    if (selectedIds.length === 0) return;
    setAssignRow(null);
    setSelectedCodes([]);
    setAssignOpen(true);
  };

  // --- CRUD Handlers ---
  const handleSaveCandidate = async () => {
    if (!formData.email || !formData.first_name) {
      setToast({ message: "Email and Name are required.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/recruitment/candidates/${formData.id}/`
        : `${API_BASE}/api/recruitment/candidates/`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save candidate");

      await fetchCandidates();
      setFormOpen(false);
      setToast({
        message: isEditing ? "Candidate updated!" : "Candidate added!",
        type: "success",
      });
    } catch (e) {
      setToast({ message: "Error saving candidate.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/recruitment/candidates/${deleteId}/`,
        {
          method: "DELETE",
          headers: authHeader,
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setCandidates(candidates.filter((c) => c.id !== deleteId));
      setSelectedIds(selectedIds.filter((id) => id !== deleteId));
      setDeleteOpen(false);
      setToast({ message: "Candidate removed.", type: "success" });
    } catch (e) {
      setToast({ message: "Failed to delete candidate.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setFormData({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      position: c.position,
      status: c.status,
    });
    setFormOpen(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      email: "",
      first_name: "",
      last_name: "",
      position: "",
      status: "pending",
    });
    setFormOpen(true);
  };

  // --- Assign Assessment Logic ---
  const toggleAssessment = (code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSendAssessment = async () => {
    if (selectedCodes.length === 0)
      return setToast({
        message: "Select at least one assessment.",
        type: "error",
      });

    setSendingAssessment(true);
    try {
      let targetEmails = [];
      if (assignRow) {
        targetEmails = [assignRow.email];
      } else {
        targetEmails = candidates
          .filter((c) => selectedIds.includes(c.id))
          .map((c) => c.email);
      }

      const res = await fetch(`${API_BASE}/api/assessments/assign-candidate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          candidate_emails: targetEmails,
          template_codes: selectedCodes,
        }),
      });

      if (!res.ok) throw new Error("Failed to send.");

      const data = await res.json();
      setToast({
        message: `Sent to ${
          data.sent_count || targetEmails.length
        } candidates!`,
        type: "success",
      });
      setAssignOpen(false);
      setSelectedCodes([]);

      if (!assignRow) {
        setSelectedIds([]);
      }
    } catch (e) {
      setToast({ message: "Error sending assessments.", type: "error" });
    } finally {
      setSendingAssessment(false);
    }
  };

  // --- View Assignments Logic ---
  const handleViewAssignments = async (candidate) => {
    setViewAssignmentsCandidate(candidate);
    setViewAssignmentsOpen(true);
    setLoadingAssignments(true);
    
    try {
      const res = await fetch(
        `${API_BASE}/api/candidates/${candidate.id}/assignments/`,
        { headers: authHeader }
      );
      
      if (!res.ok) throw new Error("Failed to fetch assignments");
      
      const data = await res.json();
      setAssignments(data);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load assignments", type: "error" });
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // --- AI Matcher Handlers ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length)
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  async function analyzeMatches() {
    if (!files.length || !jobDescription) {
      setToast({
        message: "Upload CVs and enter a description.",
        type: "error",
      });
      return;
    }
    setMatchLoading(true);
    const tempResults = [];
    for (const file of files) {
      const form = new FormData();
      form.append("cv", file);
      form.append("job_description", jobDescription);
      try {
        const res = await fetch(`${API_BASE}/api/recruitment/match/`, {
          method: "POST",
          headers: authHeader,
          body: form,
        });
        const data = await res.json();
        tempResults.push({ name: file.name, ...data });
      } catch (err) {
        tempResults.push({ name: file.name, error: "Failed to analyze" });
      }
    }
    setResults(tempResults);
    setMatchLoading(false);
    setToast({ message: "Analysis complete!", type: "success" });
  }

  return (
    <div style={styles.container}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div
          style={{
            ...styles.sectionHeader,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                padding: "10px",
                backgroundColor: COLORS.primaryLight,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={28} color={COLORS.primary} />
            </div>

            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
                Talent Matching
              </h1>
              <p
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                Centralized candidate management and AI assessment hub.
              </p>
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <button style={styles.btnBulk} onClick={openBulkAssignModal}>
              <Mail size={20} /> Send Assessment to {selectedIds.length}{" "}
              Selected
            </button>
          ) : (
            <button style={styles.btnPrimary} onClick={openAddModal}>
              <Plus size={20} /> Add Candidate
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "14px",
              color: COLORS.textMuted,
            }}
          />
          <input
            style={{
              ...styles.input,
              paddingLeft: "44px",
              backgroundColor: "#fcfcfd",
            }}
            placeholder="Search candidates by name, email, or role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Pipeline Table */}
        <div style={{ ...styles.card, marginBottom: "56px" }}>
          <div
            style={{
              padding: "20px",
              borderBottom: `1px solid ${COLORS.borderColor}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#fcfcfd",
            }}
          >
            <Users size={20} color={COLORS.primary} />
            <span style={{ fontWeight: "700" }}>Active Pipeline</span>
            {selectedIds.length > 0 && (
              <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                ({selectedIds.length} selected)
              </span>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead style={{ backgroundColor: "#fafafa" }}>
                <tr>
                  <th style={{ padding: "16px 20px", width: "40px" }}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      onChange={handleSelectAll}
                      checked={
                        filtered.length > 0 &&
                        selectedIds.length === filtered.length
                      }
                    />
                  </th>
                  {["Candidate", "Role", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "16px 20px",
                        color: COLORS.textSecondary,
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.borderColor}`,
                      backgroundColor: selectedIds.includes(c.id)
                        ? "#eff6ff"
                        : "transparent",
                    }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedIds.includes(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                      />
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: "600" }}>{c.name}</div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                        }}
                      >
                        {c.email}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "14px" }}>
                      {c.position}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleViewAssignments(c)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: COLORS.purple,
                          }}
                          title="View Assignments"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setAssignRow(c);
                            setSelectedCodes([]);
                            setAssignOpen(true);
                          }}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: COLORS.blue,
                          }}
                          title="Send Assessment"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: COLORS.textMuted,
                          }}
                          title="Edit Candidate"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(c.id);
                            setDeleteOpen(true);
                          }}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: COLORS.red,
                          }}
                          title="Delete Candidate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Matcher Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: COLORS.primaryLight,
                borderRadius: "12px",
              }}
            >
              <Brain size={28} color={COLORS.primary} />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "0px",
              }}
            >
              AI CV Matcher
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <div
              style={{
                ...styles.card,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                1. Upload CVs
              </h3>
              <div
                style={styles.dropZone(isDragging)}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: isDragging ? "#fff" : COLORS.blueLight,
                    borderRadius: "50%",
                    color: isDragging ? COLORS.primary : COLORS.blue,
                  }}
                >
                  <Upload size={32} />
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                    {isDragging ? "Drop to upload" : "Click or drag CVs here"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: COLORS.textSecondary,
                    }}
                  >
                    PDF or TXT files supported
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt"
                  onChange={(e) =>
                    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </div>
              {files.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: COLORS.textMuted,
                      }}
                    >
                      SELECTED FILES
                    </span>
                    <button
                      onClick={() => setFiles([])}
                      style={{
                        border: "none",
                        background: "none",
                        color: COLORS.red,
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      maxHeight: "180px",
                      overflowY: "auto",
                    }}
                  >
                    {files.map((f, i) => (
                      <div key={i} style={styles.fileItem}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <FileText size={16} color={COLORS.blue} />
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.name}
                          </span>
                        </div>
                        <X
                          size={14}
                          color={COLORS.textMuted}
                          onClick={() => removeFile(i)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ ...styles.card, padding: "24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                2. Job Description
              </h3>
              <textarea
                style={{
                  ...styles.input,
                  minHeight: "180px",
                  resize: "none",
                  backgroundColor: "#fcfcfd",
                }}
                placeholder="Paste the job requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <button
                onClick={analyzeMatches}
                disabled={matchLoading}
                style={{
                  ...styles.btnPrimary,
                  width: "100%",
                  marginTop: "20px",
                  justifyContent: "center",
                  backgroundColor: COLORS.dark,
                  padding: "14px",
                }}
              >
                {matchLoading ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <BarChart3 size={18} />
                )}
                {matchLoading ? "Analyzing..." : "Calculate Match Fit"}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                Analysis Results
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "16px",
                }}
              >
                {results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.card,
                      padding: "20px",
                      border: `1px solid ${COLORS.primary}33`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ fontWeight: "700" }}>{r.name}</div>
                      <div
                        style={{
                          color: COLORS.primary,
                          fontWeight: "800",
                          fontSize: "20px",
                        }}
                      >
                        {r.score}%
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "3px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: `${r.score}%`,
                          height: "100%",
                          backgroundColor: COLORS.primary,
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: COLORS.textSecondary,
                        margin: 0,
                      }}
                    >
                      <strong style={{ color: COLORS.textPrimary }}>
                        Fit: {r.fit}
                      </strong>{" "}
                      — {r.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        title={isEditing ? "Edit Candidate" : "Add New Candidate"}
        onClose={() => setFormOpen(false)}
        actions={
          <button
            style={styles.btnPrimary}
            onClick={handleSaveCandidate}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Candidate"}
          </button>
        }
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>First Name</label>
              <input
                style={styles.input}
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label style={styles.label}>Position</label>
            <input
              style={styles.input}
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
          </div>
          <div>
            <label style={styles.label}>Status</label>
            <select
              style={styles.input}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="invited">Invited</option>
              <option value="interview">Interview</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        title="Delete Candidate?"
        onClose={() => setDeleteOpen(false)}
        actions={
          <>
            <button
              onClick={() => setDeleteOpen(false)}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCandidate}
              style={{ ...styles.btnPrimary, backgroundColor: COLORS.red }}
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </>
        }
      >
        <div style={{ textAlign: "center" }}>
          <AlertTriangle
            size={40}
            color={COLORS.red}
            style={{ marginBottom: 16 }}
          />
          <p>
            Are you sure you want to remove this candidate? This action cannot
            be undone.
          </p>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        open={assignOpen}
        title={
          assignRow
            ? "Send Assessment"
            : `Bulk Send (${selectedIds.length} Candidates)`
        }
        onClose={() => setAssignOpen(false)}
        actions={
          <button
            style={styles.btnPrimary}
            onClick={handleSendAssessment}
            disabled={sendingAssessment}
          >
            {sendingAssessment ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            {sendingAssessment ? "Sending..." : "Send Now"}
          </button>
        }
      >
        {assignRow ? (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <strong>{assignRow.name}</strong>{" "}
            <span style={{ color: "#64748b" }}>({assignRow.email})</span>
          </div>
        ) : (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: "#eff6ff",
              borderRadius: 8,
              color: COLORS.blue,
            }}
          >
            <strong>Bulk Action:</strong> Sending to {selectedIds.length}{" "}
            selected candidates.
          </div>
        )}

        <label style={styles.label}>Select Assessments</label>

        <div style={{ position: "relative", marginBottom: "120px" }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              ...styles.input,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <span>
              {selectedCodes.length > 0
                ? `${selectedCodes.length} Selected`
                : "Select templates..."}
            </span>
            <ChevronDown size={16} />
          </div>

          {isDropdownOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 10 }}
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  zIndex: 20,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {ASSESSMENT_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f9fafb",
                        fontWeight: "bold",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const isSelected = selectedCodes.includes(item.code);
                      return (
                        <div
                          key={item.code}
                          onClick={() => toggleAssessment(item.code)}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            background: isSelected ? "#eff6ff" : "white",
                          }}
                        >
                          <span
                            style={{
                              color: isSelected
                                ? COLORS.blue
                                : COLORS.textPrimary,
                            }}
                          >
                            {item.label}
                          </span>
                          {isSelected && (
                            <Check size={16} color={COLORS.blue} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* View Assignments Modal */}
      <Modal
        open={viewAssignmentsOpen}
        title="Assessment Assignments"
        onClose={() => setViewAssignmentsOpen(false)}
        actions={
          <button
            style={{
              ...styles.btnPrimary,
              backgroundColor: COLORS.textMuted,
            }}
            onClick={() => setViewAssignmentsOpen(false)}
          >
            Close
          </button>
        }
      >
        {viewAssignmentsCandidate && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              backgroundColor: "#f8fafc",
              borderRadius: 12,
              border: `1px solid ${COLORS.borderColor}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  padding: 10,
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: 10,
                }}
              >
                <Users size={20} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {viewAssignmentsCandidate.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  {viewAssignmentsCandidate.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingAssignments ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Loader2 className="spin" size={32} color={COLORS.primary} />
          </div>
        ) : assignments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: COLORS.textSecondary,
            }}
          >
            <FileText
              size={40}
              color={COLORS.textMuted}
              style={{ marginBottom: 12 }}
            />
            <p style={{ margin: 0 }}>No assessments assigned yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  padding: 16,
                  backgroundColor: "#fff",
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    {assignment.template.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Clock size={12} />
                    Assigned{" "}
                    {new Date(assignment.assigned_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      ...styles.badge(assignment.status.toLowerCase()),
                      fontSize: 11,
                      padding: "6px 12px",
                    }}
                  >
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 9999,
            backgroundColor: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            border: `1px solid ${
              toast.type === "error" ? "#ef4444" : "#10b981"
            }`,
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              backgroundColor: toast.type === "error" ? "#fee2e2" : "#d1fae5",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={20} color="#dc2626" />
            ) : (
              <CheckCircle size={20} color="#059669" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: "700",
                color: toast.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              {toast.type === "error" ? "Error" : "Success"}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: toast.type === "error" ? "#b91c1c" : "#047857",
              }}
            >
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "4px",
              opacity: 0.6,
            }}
          >
            <X
              size={16}
              color={toast.type === "error" ? "#991b1b" : "#065f46"}
            />
          </button>
        </div>
      )}
    </div>
  );
}
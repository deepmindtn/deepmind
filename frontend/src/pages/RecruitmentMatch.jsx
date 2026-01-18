import React, { useEffect, useState } from "react";
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
  CheckCircle2,
  Briefcase,
  Trash2,
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  secondary: "#14b8a6",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  orange: "#f59e0b",
  red: "#ef4444",
  dark: "#475569",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

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
    flexDirection: "column"
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
};

// -----------------------
// Sub-components
// -----------------------
function StatusBadge({ status }) {
  return <span style={styles.badge(status)}>{status}</span>;
}

function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: "600px",
          padding: "24px",
          boxShadow: COLORS.shadowLg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
        {children}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          {actions}
        </div>
      </div>
    </div>
  );
}

// -----------------------
// Main Component
// -----------------------
export default function RecruitmentMatch() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // States
  const [candidates, setCandidates] = useState([]);
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);

  // AI Matcher States
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Form States
  const [newRecruitee, setNewRecruitee] = useState({
    email: "", first_name: "", last_name: "", position: "", status: "invited",
  });
  const [assignForm, setAssignForm] = useState({ template_code: "BIG_FIVE" });

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch(`${API_BASE}/api/recruitment/candidates/`, { headers: authHeader });
      const data = await res.json();
      setCandidates(data.map((c) => ({
        id: c.id,
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
        email: c.email,
        role: c.position || "Not Specified",
        status: c.status || "Pending",
      })));
    } catch (e) { console.error(e); }
  }

  // File Handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  async function analyzeMatches() {
    if (!files.length || !jobDescription) return alert("Upload CVs and enter job description");
    setMatchLoading(true);
    const tempResults = [];
    for (const file of files) {
      const form = new FormData();
      form.append("cv", file);
      form.append("job_description", jobDescription);
      try {
        const res = await fetch(`${API_BASE}/api/recruitment/match/`, { method: "POST", headers: authHeader, body: form });
        const data = await res.json();
        tempResults.push({ name: file.name, ...data });
      } catch (err) { tempResults.push({ name: file.name, error: "Failed to analyze" }); }
    }
    setResults(tempResults);
    setMatchLoading(false);
  }

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.role.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div style={styles.sectionHeader}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>Talent Matching</h1>
            <p style={{ color: COLORS.textSecondary, margin: 0, fontSize: "16px" }}>
              Centralized candidate management and AI assessment hub.
            </p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setAddOpen(true)}>
            <Plus size={20} /> Add Candidate
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: COLORS.textMuted }} />
          <input
            style={{ ...styles.input, paddingLeft: "44px", backgroundColor: "#fcfcfd" }}
            placeholder="Search candidates by name, email, or role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Pipeline Table */}
        <div style={{ ...styles.card, marginBottom: "56px" }}>
          <div style={{ padding: "20px", borderBottom: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fcfcfd" }}>
            <Users size={20} color={COLORS.primary} />
            <span style={{ fontWeight: "700" }}>Active Pipeline</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#fafafa" }}>
                <tr>
                  {["Candidate", "Role", "Status", "Action"].map((h) => (
                    <th key={h} style={{ padding: "16px 20px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.borderColor}` }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: "600" }}>{c.name}</div>
                      <div style={{ fontSize: "13px", color: COLORS.textSecondary }}>{c.email}</div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "14px" }}>{c.role}</td>
                    <td style={{ padding: "16px 20px" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "16px 20px" }}>
                      <button
                        onClick={() => { setAssignRow(c); setAssignOpen(true); }}
                        style={{ ...styles.btnPrimary, backgroundColor: "transparent", color: COLORS.primary, border: `1px solid ${COLORS.primary}`, padding: "6px 12px", fontSize: "13px" }}
                      >
                        <Send size={14} /> Send Assessment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Matcher Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ padding: "10px", backgroundColor: COLORS.primaryLight, borderRadius: "12px" }}>
              <Brain size={28} color={COLORS.primary} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "0px" }}>AI CV Matcher</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Modernized Upload Zone */}
            <div style={{ ...styles.card, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>1. Upload CVs</h3>
              <div 
                style={styles.dropZone(isDragging)}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <div style={{ padding: "16px", backgroundColor: isDragging ? "#fff" : COLORS.blueLight, borderRadius: "50%", color: isDragging ? COLORS.primary : COLORS.blue }}>
                  <Upload size={32} />
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>{isDragging ? "Drop to upload" : "Click or drag CVs here"}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: COLORS.textSecondary }}>PDF or TXT files supported</p>
                </div>
                <input type="file" multiple accept=".pdf,.txt" onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: COLORS.textMuted }}>SELECTED FILES</span>
                    <button onClick={() => setFiles([])} style={{ border: "none", background: "none", color: COLORS.red, fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>CLEAR ALL</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                    {files.map((f, i) => (
                      <div key={i} style={styles.fileItem}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                          <FileText size={16} color={COLORS.blue} />
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                        </div>
                        <X size={14} color={COLORS.textMuted} onClick={() => removeFile(i)} style={{ cursor: "pointer" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description Zone */}
            <div style={{ ...styles.card, padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>2. Job Description</h3>
              <textarea
                style={{ ...styles.input, minHeight: "180px", resize: "none", backgroundColor: "#fcfcfd" }}
                placeholder="Paste the job requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <button
                onClick={analyzeMatches}
                disabled={matchLoading}
                style={{ ...styles.btnPrimary, width: "100%", marginTop: "20px", justifyContent: "center", backgroundColor: COLORS.dark, padding: "14px" }}
              >
                {matchLoading ? <Loader2 className="spin" size={18} /> : <BarChart3 size={18} />}
                {matchLoading ? "Analyzing..." : "Calculate Match Fit"}
              </button>
            </div>
          </div>

          {/* AI Results */}
          {results.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Analysis Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {results.map((r, i) => (
                  <div key={i} style={{ ...styles.card, padding: "20px", border: `1px solid ${COLORS.primary}33` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <div style={{ fontWeight: "700" }}>{r.name}</div>
                      <div style={{ color: COLORS.primary, fontWeight: "800", fontSize: "20px" }}>{r.score}%</div>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", marginBottom: "16px" }}>
                      <div style={{ width: `${r.score}%`, height: "100%", backgroundColor: COLORS.primary, borderRadius: "3px" }} />
                    </div>
                    <p style={{ fontSize: "13px", color: COLORS.textSecondary, margin: 0 }}>
                      <strong style={{ color: COLORS.textPrimary }}>Fit: {r.fit}</strong> — {r.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={addOpen} title="Add New Candidate" onClose={() => setAddOpen(false)} actions={<button style={styles.btnPrimary} onClick={() => setAddOpen(false)}>Create Candidate</button>}>
         <div style={{ display: "grid", gap: 16 }}>
            <div><label style={styles.label}>Email</label><input style={styles.input} type="email" /></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><label style={styles.label}>First Name</label><input style={styles.input} /></div>
              <div style={{ flex: 1 }}><label style={styles.label}>Last Name</label><input style={styles.input} /></div>
            </div>
            <div><label style={styles.label}>Position</label><input style={styles.input} /></div>
         </div>
      </Modal>

      <Modal open={assignOpen} title="Send Assessment" onClose={() => setAssignOpen(false)} actions={<button style={styles.btnPrimary} onClick={() => setAssignOpen(false)}>Send Now</button>}>
        {assignRow && <div style={{ marginBottom: 20, padding: 12, backgroundColor: COLORS.bgMain, borderRadius: 10 }}>
          <div style={{ fontWeight: 700 }}>{assignRow.name}</div><div style={{ color: COLORS.textSecondary, fontSize: 13 }}>{assignRow.email}</div>
        </div>}
        <label style={styles.label}>Assessment Template</label>
        <select style={styles.input}>
          <option>🧠 Big Five Personality Traits</option>
          <option>💼 DISC Assessment</option>
        </select>
      </Modal>
    </div>
  );
}
// RecruitmentMatch.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Users,
  Briefcase,
  Send,
  Eye,
  User as UserIcon,
  X,
  FileText,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Target,
  Brain,
  Shield,
  CheckCircle,
  Star,
  Lightbulb,
  Loader2,
  BarChart3,
} from "lucide-react";

// -----------------------
// Shared Styles
// -----------------------
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
};
const button = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};
const primary = {
  ...button,
  background: "#4f46e5",
  borderColor: "#4f46e5",
  color: "#fff",
};
const input = {
  height: 40,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  padding: "0 12px",
  outline: "none",
};

// -----------------------
// Modal Component
// -----------------------
function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.25)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...card,
          maxWidth: 720,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
          <button style={button} onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ marginTop: 8 }}>{children}</div>
        {actions && (
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            {actions}
          </div>
        )}
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

  // -----------------------
  // Candidate management states
  // -----------------------
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Add Recruitee modal
  const [addOpen, setAddOpen] = useState(false);
  const [newRecruitee, setNewRecruitee] = useState({
    email: "",
    first_name: "",
    last_name: "",
    position: "",
    status: "invited",
  });

  // Assign Assessment modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [assignForm, setAssignForm] = useState({ template_code: "BIG_FIVE" });

  // -----------------------
  // AI Match Tool States
  // -----------------------
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // -----------------------
  // Fetch candidates
  // -----------------------
  useEffect(() => {
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/recruitment/candidates/`, {
          headers: { "Content-Type": "application/json", ...authHeader },
        });
        if (!res.ok) throw new Error("Failed to load candidates");
        const data = await res.json();
        setCandidates(
          data.map((c) => ({
            id: String(c.id),
            name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
            email: c.email,
            role: c.position || "—",
            status: c.status || "Pending",
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [API_BASE]);

  // -----------------------
  // Create Recruitee
  // -----------------------
  async function createRecruitee() {
    try {
      const res = await fetch(`${API_BASE}/api/recruitment/candidates/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(newRecruitee),
      });

      if (!res.ok) throw new Error("Failed to create recruitee");
      const data = await res.json();
      alert("Recruitee created successfully!");
      setAddOpen(false);
      setNewRecruitee({
        email: "",
        first_name: "",
        last_name: "",
        position: "",
        status: "invited",
      });

      setCandidates((prev) => [
        {
          id: String(data.id),
          name:
            `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            data.email,
          email: data.email,
          role: data.position || "—",
          status: data.status || "Pending",
        },
        ...prev,
      ]);
    } catch (e) {
      alert(e.message);
    }
  }

  // -----------------------
  // Assign Assessment
  // -----------------------
  async function assignRecruitmentAssessment() {
    try {
      const res = await fetch(`${API_BASE}/api/recruitment/assessments/assign/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          candidate_email: assignRow.email,
          template_code: assignForm.template_code,
        }),
      });
      if (!res.ok) throw new Error("Failed to assign recruitment assessment");
      alert("Recruitment assessment assigned!");
      setAssignOpen(false);
    } catch (e) {
      alert(e.message);
    }
  }

  // -----------------------
  // AI Recruitment Matching
  // -----------------------
  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  async function analyzeMatches() {
    if (files.length === 0 || !jobDescription.trim()) {
      alert("Please upload at least one CV and enter a job description.");
      return;
    }

    setMatchLoading(true);
    setResults([]);
    const tempResults = [];

    for (const file of files) {
      const form = new FormData();
      form.append("cv", file);
      form.append("job_description", jobDescription);

      try {
        const res = await fetch(`${API_BASE}/api/recruitment/match/`, {
          method: "POST",
          headers: { ...authHeader },
          body: form,
        });
        const data = await res.json();
        tempResults.push({
          name: file.name,
          ...data,
        });
      } catch (err) {
        tempResults.push({
          name: file.name,
          error: err.message || "Upload failed",
        });
      }
    }

    setResults(tempResults);
    setMatchLoading(false);
  }

  // -----------------------
  // Filter candidates
  // -----------------------
  const filtered = candidates.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.email.toLowerCase().includes(q.toLowerCase()) ||
      r.role.toLowerCase().includes(q.toLowerCase())
  );

  // -----------------------
  // Rendering UI
  // -----------------------
  return (
    <div style={{ padding: 20, fontFamily: "Inter, sans-serif" }}>
      {/* ---------- Section 1: Candidate Management ---------- */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>
            Recruitment Candidates
          </h1>
          <button style={primary} onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add Recruitee
          </button>
        </div>

        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <Search size={16} style={{ alignSelf: "center" }} />
          <input
            style={{ ...input, flex: 1 }}
            placeholder="Search candidate..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div style={card}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading…</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Role</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: 8 }}>{r.name}</td>
                    <td style={{ padding: 8 }}>{r.email}</td>
                    <td style={{ padding: 8 }}>{r.role}</td>
                    <td style={{ padding: 8 }}>{r.status}</td>
                    <td style={{ padding: 8 }}>
                      <button
                        style={button}
                        onClick={() => {
                          setAssignRow(r);
                          setAssignOpen(true);
                        }}
                      >
                        <Send size={16} /> Send Assessment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ---------- Section 2: AI CV Matching ---------- */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginTop: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Brain size={32} color="#4f46e5" />
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>AI Recruitment Match</h2>
        </div>
        <p style={{ color: "#475569", marginBottom: 24 }}>
          Upload one or more candidate CVs and paste a job description below.  
          The AI model will compare each CV to the job posting and generate a similarity score and fit summary.
        </p>

        {/* Upload CVs */}
        <div style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Upload Candidate CVs</h3>
          <label htmlFor="cvUpload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: "#eef2ff", color: "#3730a3", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>
            <Upload size={18} /> Choose Files (PDF or TXT)
          </label>
          <input id="cvUpload" type="file" multiple accept=".pdf,.txt" onChange={handleFiles} style={{ display: "none" }} />
          {files.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, marginTop: 10, color: "#334155", textAlign: "left" }}>
              {files.map((f, idx) => (
                <li key={idx}>
                  <FileText size={14} /> {f.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Job Description</h3>
          <textarea
            placeholder="Paste or type the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{
              width: "100%",
              minHeight: 140,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              outline: "none",
              fontSize: 14,
            }}
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeMatches}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 15,
            fontWeight: 600,
            backgroundColor: matchLoading ? "#a5b4fc" : "#4f46e5",
            cursor: matchLoading ? "not-allowed" : "pointer",
            transition: "0.2s",
          }}
          disabled={matchLoading}
        >
          {matchLoading ? <Loader2 className="spin" size={18} /> : <BarChart3 size={18} />}
          {matchLoading ? "Analyzing..." : "Analyze Matches"}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Results</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {results.map((r, idx) => (
                <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <h4 style={{ fontWeight: "bold", color: "#111" }}>{r.name}</h4>
                  {r.error ? (
                    <p style={{ color: "red" }}>{r.error}</p>
                  ) : (
                    <>
                      <p style={{ fontSize: 22, margin: "8px 0" }}>
                        Match Score:{" "}
                        <b
                          style={{
                            color:
                              r.score >= 85
                                ? "#16a34a"
                                : r.score >= 70
                                ? "#0284c7"
                                : r.score >= 50
                                ? "#ca8a04"
                                : "#dc2626",
                          }}
                        >
                          {r.score}%
                        </b>
                      </p>
                      <p style={{ color: "#334155" }}>
                        <b>{r.fit}</b> — {r.summary}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add & Send Assessment Modals */}
      <Modal
        open={addOpen}
        title="Add New Recruitee"
        onClose={() => setAddOpen(false)}
        actions={
          <button style={primary} onClick={createRecruitee}>
            <Send size={16} /> Create Recruitee
          </button>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input
              style={{ ...input, width: "100%" }}
              type="email"
              placeholder="candidate@company.com"
              value={newRecruitee.email}
              onChange={(e) =>
                setNewRecruitee((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>First Name</label>
              <input
                style={{ ...input, width: "100%" }}
                value={newRecruitee.first_name}
                onChange={(e) =>
                  setNewRecruitee((f) => ({ ...f, first_name: e.target.value }))
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600 }}>Last Name</label>
              <input
                style={{ ...input, width: "100%" }}
                value={newRecruitee.last_name}
                onChange={(e) =>
                  setNewRecruitee((f) => ({ ...f, last_name: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Position</label>
            <input
              style={{ ...input, width: "100%" }}
              placeholder="e.g. Software Engineer"
              value={newRecruitee.position}
              onChange={(e) =>
                setNewRecruitee((f) => ({ ...f, position: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Status</label>
            <select
              style={{ ...input, width: "100%" }}
              value={newRecruitee.status}
              onChange={(e) =>
                setNewRecruitee((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="pending">Pending</option>
              <option value="invited">Invited</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={assignOpen}
        title="Send Recruitment Assessment"
        onClose={() => setAssignOpen(false)}
        actions={
          <button style={primary} onClick={assignRecruitmentAssessment}>
            <Send size={16} /> Send Assessment
          </button>
        }
      >
        {assignRow && (
          <div style={{ marginBottom: 16 }}>
            <strong>Sending to:</strong> {assignRow.name}
            <div style={{ color: "#64748b" }}>{assignRow.email}</div>
          </div>
        )}
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Select Assessment Template
        </label>
        <select
          style={{ ...input, width: "100%" }}
          value={assignForm.template_code}
          onChange={(e) => setAssignForm({ template_code: e.target.value })}
        >
          <option value="BIG_FIVE">🧠 Big Five Personality Traits</option>
          <option value="DISC">💼 DISC Personality Assessment</option>
          <option value="JSS">😊 Job Satisfaction Survey (JSS)</option>
          <option value="KARASEK">⚖️ Karasek Job Demand-Control</option>
          <option value="MASLACH">🔥 Maslach Burnout Inventory</option>
          <option value="BRS">💪 Brief Resilience Scale (BRS)</option>
          <option value="CDRISC">🛡 Connor-Davidson Resilience</option>
          <option value="WSES">✨ Work Self-Efficacy Scale</option>
          <option value="GCOS">🎯 Causality Orientation (GCOS)</option>
          <option value="RIBS">💡 Ideational Behavior Scale</option>
          <option value="CAQ">🎨 Creative Achievement Questionnaire</option>
          <option value="ISE">🚀 Innovation Self-Efficacy Scale</option>
        </select>
      </Modal>
    </div>
  );
}

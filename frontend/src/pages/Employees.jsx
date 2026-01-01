import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import "./Employees.css";

// -----------------------
// Tiny style helpers
// -----------------------
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
};
const h2 = { fontSize: 28, fontWeight: 700, margin: "0 0 16px" };
const grid = { display: "grid", gap: 12 };
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
const select = input;

function Badge({ tone = "gray", children }) {
  const map = {
    gray: { bg: "#f1f5f9", color: "#0f172a" },
    green: { bg: "#ecfdf5", color: "#065f46" },
    yellow: { bg: "#fffbeb", color: "#92400e" },
    red: { bg: "#fef2f2", color: "#991b1b" },
  };
  const c = map[tone] || map.gray;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        border: "1px solid #e5e7eb",
      }}
    >
      {children}
    </span>
  );
}

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
// Main page
// -----------------------
export default function Employees() {
  const API_BASE = "http://localhost:8080";

  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [detailAssignments, setDetailAssignments] = useState([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [assignForm, setAssignForm] = useState({ template_code: "BIG_FIVE" });

  const [addOpen, setAddOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "",
    first_name: "",
    last_name: "",
    department: "",
  });
  const [inviteResult, setInviteResult] = useState(null);
  const [hrReport, setHrReport] = useState(null);
  const [hrReportOpen, setHrReportOpen] = useState(false);

  // Fetch users
  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/`, {
          headers: { "Content-Type": "application/json", ...authHeader },
        });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        if (!ignore) {
          const mapped = data.map((u) => ({
            id: String(u.id),
            name:
              `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
            role: u.role,
            department: u.department || "—",
            status: u.is_active ? "Active" : "Inactive",
            lastAssessment: u.last_assessment || null,
            email: u.email,
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [API_BASE]);

  // View details
  async function viewDetails(r) {
    try {
      const res = await fetch(
        `${API_BASE}/api/assessments/admin/?employee=${r.id}`,
        {
          headers: { ...authHeader },
        }
      );
      if (!res.ok) throw new Error("Failed to load assignments");
      const data = await res.json();
      setDetailRow(r);
      setDetailAssignments(data);
      setDetailOpen(true);
    } catch (e) {
      alert(e.message);
    }
  }

  async function generateHRReport() {
    try {
      const res = await fetch(`${API_BASE}/api/hr/report/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      const data = await res.json();
      setHrReport(data.report);
      setHrReportOpen(true);
    } catch (e) {
      alert("Failed to generate report.");
    }
  }

  function downloadAsPDF() {
    const blob = new Blob([hrReport], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hr_decision_report.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Assign assessment
  async function assignAssessment() {
    try {
      const res = await fetch(`${API_BASE}/api/assessments/assign/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          employee_email: assignRow.email,
          template_code: assignForm.template_code,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to assign assessment");
      }
      alert("Assessment assigned!");
      setAssignOpen(false);
      setAssignRow(null);
    } catch (e) {
      alert(e.message || "Could not assign assessment");
    }
  }

  // Invite
  async function createInvite() {
    try {
      const res = await fetch(`${API_BASE}/api/invites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(invite),
      });
      if (!res.ok) throw new Error("Failed to create invite");
      const data = await res.json();
      setInviteResult(data);
    } catch (e) {
      alert(e.message);
    }
  }

  const departments = useMemo(
    () => [
      "All",
      ...Array.from(new Set(rows.map((r) => r.department))).filter(Boolean),
    ],
    [rows]
  );

  const filtered = rows.filter((r) => {
    const matchQ =
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.role.toLowerCase().includes(q.toLowerCase()) ||
      r.email.toLowerCase().includes(q.toLowerCase());
    const matchDep = dep === "All" || r.department === dep;
    const matchStatus = status === "All" || r.status === status;
    return matchQ && matchDep && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const all = rows.length;
    const active = rows.filter((r) => r.status === "Active").length;
    const leave = rows.filter((r) => r.status === "On Leave").length;
    return { all, active, leave };
  }, [rows]);

  return (

    <div className="employees-container">
    <h1 className="employees-title mb-4">Employee Management Page</h1>

    {/* Separator */}
    <hr className="mb-4" />


      {/* Quick Stats */}
      <div
        style={{
          ...grid,
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          marginBottom: 12,
        }}
      >
        <div style={card}>
          <div>Total Employees</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.all}</div>
        </div>
        <div style={card}>
          <div>Active</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.active}</div>
        </div>
        <div style={card}>
          <div>On Leave</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.leave}</div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div
        style={{
          ...card,
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "nowrap", // keep everything in one row
          overflowX: "auto", // scroll if too wide
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, position: "relative", minWidth: 250 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            style={{
              ...input,
              paddingLeft: 34,
              width: "100%",
              height: 36,
              boxSizing: "border-box",
            }}
            placeholder="Search name, role, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Filter Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            backgroundColor: "#f1f5f9",
            cursor: "pointer",
          }}
        >
          <Filter size={16} color="#64748b" />
        </div>

        {/* Department Select */}
        <select
          style={{
            ...select,
            height: 36,
            width: 120,
            paddingLeft: 8,
            marginTop: 0,
          }}
          value={dep}
          onChange={(e) => setDep(e.target.value)}
        >
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        {/* Status Select */}
        <select
          style={{
            ...select,
            height: 36,
            width: 100,
            paddingLeft: 8,
            marginTop: 0,
          }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All", "Active", "On Leave", "Inactive"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* Buttons */}
        <button
          style={{
            ...button,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Upload size={16} /> Import CSV
        </button>

        <button
          style={{
            ...primary,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
          onClick={() => {
            setInvite({
              email: "",
              first_name: "",
              last_name: "",
              department: "",
            });
            setInviteResult(null);
            setAddOpen(true);
          }}
        >
          <Plus size={16} /> Add Employee
        </button>

        <button
          style={{
            ...primary,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
          onClick={generateHRReport}
        >
          📄 Generate Report
        </button>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            Loading…
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: 12,
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th style={{ padding: "10px 12px" }}>Avatar</th>
                  <th style={{ padding: "10px 12px" }}>Name</th>
                  <th style={{ padding: "10px 12px" }}>Email</th>
                  <th style={{ padding: "10px 12px" }}>Role</th>
                  <th style={{ padding: "10px 12px" }}>Department</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Avatar Column */}
                    <td style={{ padding: "10px 12px" }}>
                      <UserIcon size={24} color="#64748b" />
                    </td>

                    <td style={{ padding: "10px 12px" }}>{r.name}</td>
                    <td style={{ padding: "10px 12px" }}>{r.email}</td>
                    <td style={{ padding: "10px 12px" }}>{r.role}</td>
                    <td style={{ padding: "10px 12px" }}>{r.department}</td>
                    <td style={{ padding: "10px 12px" }}>{r.status}</td>
                    <td
                      style={{ padding: "10px 12px", display: "flex", gap: 6 }}
                    >
                      <button
                        style={{
                          ...button,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          height: 32,
                          padding: "0 8px",
                        }}
                        onClick={() => viewDetails(r)}
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        style={{
                          ...button,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          height: 32,
                          padding: "0 8px",
                        }}
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
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        title={`Employee: ${detailRow?.name}`}
        onClose={() => setDetailOpen(false)}
      >
        {detailRow && (
          <div>
            <p>
              <b>Email:</b> {detailRow.email}
            </p>
            <p>
              <b>Role:</b> {detailRow.role}
            </p>
            <p>
              <b>Department:</b> {detailRow.department}
            </p>
            <h4>Assessments</h4>
            <div style={{ display: "grid", gap: 12 }}>
              {detailAssignments.map((a) => (
                <div key={a.id} style={{ ...card }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h5>{a.template_name}</h5>
                    <Badge tone={a.status === "COMPLETED" ? "green" : "yellow"}>
                      {a.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    {a.completed_at
                      ? `Completed: ${new Date(
                          a.completed_at
                        ).toLocaleDateString()}`
                      : "Not completed"}
                  </div>
                  {/* JSS (Job Satisfaction Survey) */}
                  {a.template_code === "JSS" && a.metrics?.subscores && (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <b>Score global:</b> {a.metrics.total} / 216
                      </div>
                      {Object.entries(a.metrics.subscores).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{k}</span>
                            <span>
                              {v} ({a.metrics.interpretation?.[k]})
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e5e7eb",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${(v / 24) * 100}%`,
                                height: "100%",
                                background: "#3b82f6", // blue
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {/* BRS */}
                  {a.template_code === "BRS" && a.metrics?.average && (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <b>Score moyen:</b> {a.metrics.average} / 5
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <b>Niveau:</b> {a.metrics.level}
                      </div>
                      {a.metrics?.scores &&
                        a.metrics.scores.map((v, idx) => (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            <div>
                              Q{idx + 1}: {v}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(v / 5) * 100}%`,
                                  height: "100%",
                                  background: "#3b82f6", // bleu
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* DISC */}
                  {a.template_code === "DISC" && a.metrics?.discScores && (
                    <>
                      {Object.entries(a.metrics.discScores).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div>
                            {k}: {v}
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e5e7eb",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${v}%`,
                                height: "100%",
                                background: "#6366f1", // Indigo tone
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {a.metrics?.dominantStyle && (
                        <div>
                          <b>Dominant Style:</b> {a.metrics.dominantStyle}
                        </div>
                      )}
                    </>
                  )}

                  {/* Big Five */}
                  {a.template_code === "BIG_FIVE" &&
                    a.metrics?.traitScores &&
                    Object.entries(a.metrics.traitScores).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <div>
                          {k}: {v}
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "#e5e7eb",
                            borderRadius: 8,
                          }}
                        >
                          <div
                            style={{
                              width: `${v}%`,
                              height: "100%",
                              background: "#4f46e5",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  {/* CD-RISC (Connor-Davidson Resilience Scale) */}
                  {a.template_code === "CDRISC" && a.metrics?.total && (
                    <>
                      <div>
                        <b>Score total:</b> {a.metrics.total} / 40
                      </div>
                      <div>
                        <b>Niveau:</b> {a.metrics.level}
                      </div>
                      {a.metrics?.items &&
                        Object.entries(a.metrics.items).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 6 }}>
                            <div>
                              {k}: {v}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(v / 4) * 100}%`,
                                  height: "100%",
                                  background: "#3b82f6",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* WSES (Work Self-Efficacy Scale) */}
                  {a.template_code === "WSES" && a.metrics?.average && (
                    <>
                      <div>
                        <b>Score moyen:</b> {a.metrics.average} / 5
                      </div>
                      <div>
                        <b>Niveau d'auto-efficacité:</b> {a.metrics.level}
                      </div>
                      {a.metrics?.items &&
                        a.metrics.items.map((v, idx) => (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            <div>
                              Q{idx + 1}: {v}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(v / 5) * 100}%`,
                                  height: "100%",
                                  background: "#10b981",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* GCOS (General Causality Orientations Scale - mini) */}
                  {a.template_code === "GCOS" && a.metrics?.orientations && (
                    <>
                      {Object.entries(a.metrics.orientations).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div>
                            {k}: {v} / 5
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e5e7eb",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${(v / 5) * 100}%`,
                                height: "100%",
                                background: "#6366f1",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <div>
                        <b>Orientation dominante:</b> {a.metrics.dominant}
                      </div>
                    </>
                  )}

                  {/* RIBS (Runco Ideational Behavior Scale) */}
                  {a.template_code === "RIBS" && a.metrics?.average && (
                    <>
                      <div>
                        <b>Score moyen:</b> {a.metrics.average} / 5
                      </div>
                      <div>
                        <b>Niveau d’idéation:</b> {a.metrics.level}
                      </div>
                      {a.metrics?.items &&
                        a.metrics.items.map((v, idx) => (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            <div>
                              Q{idx + 1}: {v}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(v / 5) * 100}%`,
                                  height: "100%",
                                  background: "#f59e0b",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* CAQ (Creative Achievement Questionnaire) */}
                  {a.template_code === "CAQ" && a.metrics?.domains && (
                    <>
                      {Object.entries(a.metrics.domains).map(
                        ([domain, score]) => (
                          <div key={domain} style={{ marginBottom: 6 }}>
                            <div>
                              {domain}: {score}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(score / 3) * 100}%`,
                                  height: "100%",
                                  background: "#a855f7",
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                      <div>
                        <b>Score total:</b> {a.metrics.total} / 30
                      </div>
                    </>
                  )}

                  {/* ISE (Innovation Self-Efficacy Scale) */}
                  {a.template_code === "ISE" && a.metrics?.average && (
                    <>
                      <div>
                        <b>Score moyen:</b> {a.metrics.average} / 5
                      </div>
                      <div>
                        <b>Niveau de confiance en innovation:</b>{" "}
                        {a.metrics.level}
                      </div>
                      {a.metrics?.items &&
                        a.metrics.items.map((v, idx) => (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            <div>
                              Q{idx + 1}: {v}
                            </div>
                            <div
                              style={{
                                height: 6,
                                background: "#e5e7eb",
                                borderRadius: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: `${(v / 5) * 100}%`,
                                  height: "100%",
                                  background: "#3b82f6",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </>
                  )}

                  {/* Karasek */}
                  {a.template_code === "KARASEK" && a.metrics?.dimScores && (
                    <>
                      {Object.entries(a.metrics.dimScores).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div>
                            {k}: {v}
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e5e7eb",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${v}%`,
                                height: "100%",
                                background: "#10b981",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <div>
                        Quadrant: <b>{a.metrics.quadrant}</b>
                      </div>
                    </>
                  )}
                  {/* Maslach */}
                  {a.template_code === "MASLACH" &&
                    (a.metrics?.burnout || a.metrics?.EE) &&
                    Object.entries(a.metrics.burnout || a.metrics).map(
                      ([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}>
                          <div>
                            {k}: {v}
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#e5e7eb",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${v}%`,
                                height: "100%",
                                background: "#f59e0b",
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      
      {/* Send Assessment Modal */}
      <Modal 
        open={assignOpen} 
        title="Send Assessment" 
        onClose={() => setAssignOpen(false)} 
        actions={
          <button className="btn btn-primary px-4" onClick={assignAssessment}>
            <Send size={16} className="me-2" />
            Send Assessment
          </button>
        }
      >
        {assignRow && (
          <div className="alert alert-info mb-3">
            <div className="d-flex align-items-center">
              <Users size={20} className="me-2" />
              <div>
                <strong>Sending to:</strong> {assignRow.name}
                <div className="small text-muted">{assignRow.email}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="assessmentSelect" className="form-label fw-semibold">
            Select Assessment Template
          </label>
          <select
            id="assessmentSelect"
            className="form-select form-select-lg"
            value={assignForm.template_code}
            onChange={(e) => setAssignForm({ template_code: e.target.value })}
          >
            <optgroup label="Personality & Behavior">
              <option value="BIG_FIVE">🧠 Big Five Personality Traits</option>
              <option value="DISC">💼 DISC Personality Assessment</option>
            </optgroup>
            <optgroup label="Work Stress & Burnout">
              <option value="KARASEK">⚖️ Karasek Job Demand-Control</option>
              <option value="MASLACH">🔥 Maslach Burnout Inventory</option>
              <option value="JSS">😊 Job Satisfaction Survey (JSS)</option>
            </optgroup>
            <optgroup label="Resilience & Self-Efficacy">
              <option value="BRS">💪 Brief Resilience Scale (BRS)</option>
              <option value="CDRISC">🛡️ Connor-Davidson Resilience (CD-RISC 10)</option>
              <option value="WSES">✨ Work Self-Efficacy Scale (WSES)</option>
            </optgroup>
            <optgroup label="Motivation & Creativity">
              <option value="GCOS">🎯 General Causality Orientations (GCOS)</option>
              <option value="RIBS">💡 Runco Ideational Behavior Scale (RIBS)</option>
              <option value="CAQ">🎨 Creative Achievement Questionnaire (CAQ)</option>
              <option value="ISE">🚀 Innovation Self-Efficacy Scale (ISE)</option>
            </optgroup>
          </select>
          <div className="form-text">
            Choose the most appropriate assessment based on your evaluation goals.
          </div>
        </div>
      </Modal>
      
      {/* Add Employee Modal */}
      <Modal
        open={addOpen}
        title={
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
              style={{ width: '40px', height: '40px' }}
            >
              <Plus size={20} className="text-primary" />
            </div>
            <div>
              <h5 className="mb-0">Add New Employee</h5>
              <small className="text-muted">Create access credentials and send invite</small>
            </div>
          </div>
        }
        onClose={() => { setAddOpen(false); setInviteResult(null); }}
        actions={
          <>
            <button className="btn btn-light" onClick={() => setAddOpen(false)}>
              <X size={16} className="me-2" />
              Cancel
            </button>
            {!inviteResult && (
              <button className="btn btn-primary" onClick={createInvite}>
                <Send size={16} className="me-2" />
                Create & Send Invite
              </button>
            )}
          </>
        }
      >
        {!inviteResult ? (
          <>
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-start">
                <FileText size={20} className="me-2 mt-1" />
                <div>
                  <strong>How it works:</strong>
                  <p className="mb-0 small">Fill in the employee details below. An invite link will be generated that you can share with the new employee to complete their registration.</p>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="employee@company.com"
                    value={invite.email}
                    onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-text">This will be used for login credentials</div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John"
                  value={invite.first_name}
                  onChange={(e) => setInvite((f) => ({ ...f, first_name: e.target.value }))}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Doe"
                  value={invite.last_name}
                  onChange={(e) => setInvite((f) => ({ ...f, last_name: e.target.value }))}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={invite.department}
                  onChange={(e) => setInvite((f) => ({ ...f, department: e.target.value }))}
                  required
                >
                  <option value="">Select a department...</option>
                  <option value="sales">💼 Sales</option>
                  <option value="hr">👥 HR</option>
                  <option value="finance">💰 Finance</option>
                  <option value="operations">⚙️ Operations</option>
                  <option value="design">🎨 Design</option>
                  <option value="product">🚀 Product</option>
                  <option value="other">📋 Other</option>
                </select>
                <div className="form-text">Assign the employee to their primary department</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10 mx-auto mb-3"
              style={{ width: '60px', height: '60px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-success" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
            </div>
            
            <h5 className="mb-2">Invite Created Successfully!</h5>
            <p className="text-muted mb-4">Share this link with {invite.first_name} {invite.last_name} to complete registration</p>
            
            <div className="card bg-light border-0 mb-3">
              <div className="card-body">
                <label className="form-label small text-muted mb-2">Invitation Link</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control font-monospace small" 
                    value={`${window.location.origin}/accept-invite?token=${inviteResult.id}`}
                    readOnly
                  />
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/accept-invite?token=${inviteResult.id}`);
                      alert('Link copied to clipboard!');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="alert alert-warning">
              <small>
                <strong>⚠️ Important:</strong> This link should be sent securely to the employee. 
                They will use it to set up their password and access the system.
              </small>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={hrReportOpen}
        title="AI-Powered HR Report"
        onClose={() => setHrReportOpen(false)}
        actions={
          <button
            style={primary}
            onClick={() => {
              const blob = new Blob([hrReport], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "HR_Decision_Support_Report.txt";
              link.click();
            }}
          >
            Download Report
          </button>
        }
      >
        <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>
          {hrReport}
        </div>
      </Modal>
    </div>
  );
}

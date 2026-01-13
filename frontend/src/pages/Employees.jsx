import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
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
  CheckCircle,
  AlertTriangle,
  Mail,
  // 👇 Icons for the Department Selector
  Layers, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast, CheckCircle as CheckIcon, 
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap, Wrench
} from "lucide-react";
import "./Employees.css";

// -----------------------
// ICON MAPPING
// -----------------------
const ICON_MAP = {
  Layers, Users, Briefcase, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast, CheckCircle: CheckIcon, 
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, Send, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap, Wrench
};

const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers; 
  return <IconComponent size={size} color={color} />;
};

// -----------------------
// Style Helpers
// -----------------------
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
};
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

// -----------------------
// MODAL COMPONENT
// -----------------------
function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
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
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
    </div>,
    document.body
  );
}

// -----------------------
// Main page
// -----------------------
export default function Employees() {
  const API_BASE = "http://localhost:8080";

  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};
  const [isInviting, setIsInviting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // 👇 New: Store fetched departments here
  const [availableDepts, setAvailableDepts] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [detailAssignments, setDetailAssignments] = useState([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [assignForm, setAssignForm] = useState({ template_code: "BIG_FIVE" });
  
  const [importOpen, setImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  // Updated Invite State to hold ID
  const [invite, setInvite] = useState({
    email: "",
    first_name: "",
    last_name: "",
    department_id: null,
  });
  const [inviteResult, setInviteResult] = useState(null);
  const [hrReport, setHrReport] = useState(null);
  const [hrReportOpen, setHrReportOpen] = useState(false);

  // 1. Fetch Users
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

  // 2. Fetch Departments (For the Selector & Filters)
  useEffect(() => {
    async function fetchDepts() {
      try {
        const res = await fetch(`${API_BASE}/api/departments/`, { headers: { ...authHeader } });
        if (res.ok) {
          const data = await res.json();
          setAvailableDepts(data);
        }
      } catch (e) { console.error("Failed to load departments", e); }
    }
    fetchDepts();
  }, []);

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

  // Handle CSV Import
  async function handleImportCSV() {
    if (!csvFile) {
      alert("Please select a CSV file first.");
      return;
    }

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await fetch(`${API_BASE}/api/employees/import/`, {
        method: "POST",
        headers: {
          ...authHeader,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import CSV");
      }

      setImportResult(data);
      
    } catch (e) {
      alert(e.message);
    } finally {
      setImporting(false);
    }
  }

  function closeImportAndRefresh() {
    setImportOpen(false);
    setCsvFile(null);
    setImportResult(null);
    window.location.reload();
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
    setIsInviting(true);
    try {
      const res = await fetch(`${API_BASE}/api/invites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(invite), // Sends department_id
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create invite");
      }
      const data = await res.json();
      setInviteResult(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsInviting(false);
    }
  }

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
          flexWrap: "nowrap",
          overflowX: "auto",
        }}
      >
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
          <option value="All">All Depts</option>
          {/* Dynamic Departments Filter */}
          {availableDepts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>

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
          onClick={() => {
            setCsvFile(null);
            setImportResult(null);
            setImportOpen(true);
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
              department_id: null,
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

      {/* Import CSV Modal */}
      <Modal
        open={importOpen}
        title="Import Employees from CSV"
        onClose={() => importResult ? closeImportAndRefresh() : setImportOpen(false)}
        actions={
          !importResult ? (
            <>
              <button className="btn btn-light" onClick={() => setImportOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleImportCSV}
                disabled={importing}
              >
                {importing ? "Importing..." : "Submit Import"}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={closeImportAndRefresh}>
              Close & Refresh
            </button>
          )
        }
      >
        {!importResult ? (
          <div className="p-3">
            <div className="alert alert-info mb-3">
              <h6 className="alert-heading fw-bold">Instructions</h6>
              <p className="mb-0 small">
                Upload a CSV file with the following headers (case-sensitive):
              </p>
              <ul className="mb-0 small mt-2">
                <li><code>Email Address</code></li>
                <li><code>First Name</code></li>
                <li><code>Last Name</code></li>
                <li><code>Department</code></li>
              </ul>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Select CSV File</label>
              <div className="input-group">
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
              </div>
              <div className="form-text">
                The application will import all records from the CSV file into the database first. Once the data is saved successfully,
                an email invitation will be sent to each listed recipient.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="d-flex align-items-center mb-3">
              <CheckCircle size={32} className="text-success me-2" />
              <h5 className="mb-0">Import Completed</h5>
            </div>
            
            <p className="lead fs-6">{importResult.message}</p>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="alert alert-warning mt-3">
                <div className="d-flex align-items-center mb-2">
                  <AlertTriangle size={20} className="me-2" />
                  <strong>Skipped / Errors:</strong>
                </div>
                <div 
                  className="bg-white p-2 rounded border" 
                  style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem' }}
                >
                  <ul className="mb-0 ps-3">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx} className="text-danger">{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

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
        </div>
      </Modal>
      
      {/* Add Employee Modal with Dynamic Department Selector */}
      <Modal open={addOpen} title="Add New Employee" onClose={() => { setAddOpen(false); setInviteResult(null); }}
        actions={
          <>
            <button className="btn btn-light" onClick={() => setAddOpen(false)} disabled={isInviting}>Cancel</button>
            {!inviteResult && <button className="btn btn-primary" onClick={createInvite} disabled={isInviting || !invite.department_id || !invite.email}>{isInviting ? "Sending..." : "Create Invite"}</button>}
          </>
        }>
        {!inviteResult ? (
          <>
            <div className="alert alert-info mb-4"><small>This will send an invitation link to the new employee.</small></div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                <input type="email" className="form-control" value={invite.email} onChange={(e) => setInvite(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">First Name</label>
                <input type="text" className="form-control" value={invite.first_name} onChange={(e) => setInvite(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Last Name</label>
                <input type="text" className="form-control" value={invite.last_name} onChange={(e) => setInvite(f => ({ ...f, last_name: e.target.value }))} />
              </div>
              
              {/* 👇 DYNAMIC DEPARTMENT SELECTOR */}
              <div className="col-12">
                <label className="form-label fw-semibold">Select Department <span className="text-danger">*</span></label>
                
                {availableDepts.length === 0 ? (
                    <div style={{padding: 15, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#64748b"}}>
                        No departments found. Go to "Departments" page to create one.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, maxHeight: 200, overflowY: "auto", padding: 4 }}>
                    {availableDepts.map(dept => {
                        const isSelected = invite.department_id === dept.id;
                        return (
                            <div 
                                key={dept.id}
                                onClick={() => setInvite(f => ({ ...f, department_id: dept.id }))}
                                style={{
                                    border: isSelected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                                    background: isSelected ? "#eef2ff" : "#fff",
                                    borderRadius: 10,
                                    padding: "10px",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ 
                                    color: isSelected ? "#4f46e5" : "#64748b",
                                    background: isSelected ? "#fff" : "#f1f5f9",
                                    padding: 8,
                                    borderRadius: "50%"
                                }}>
                                    <DynamicIcon name={dept.icon} size={20} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? "#4f46e5" : "#1e293b", textAlign: "center" }}>
                                    {dept.name}
                                </span>
                                {isSelected && <CheckCircle size={14} color="#4f46e5" style={{position:"absolute", top: 8, right: 8}} />}
                            </div>
                        );
                    })}
                    </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
             {inviteResult.email_sent ? 
                <div className="alert alert-success d-flex align-items-center justify-content-center gap-2 mb-3">
                    <Mail size={24} />
                    <div className="text-start">
                        <strong>Email Sent Successfully!</strong><br/>
                        <small>An invitation has been emailed to {inviteResult.email}</small>
                    </div>
                </div> : 
                <div className="alert alert-danger d-flex align-items-center justify-content-center gap-2 mb-3">
                    <AlertTriangle size={24} />
                    <div className="text-start">
                        <strong>Email Failed!</strong><br/>
                        <small>{inviteResult.email_error || "Could not send email. Please copy the link manually."}</small>
                    </div>
                </div>
             }
             
             <h5 className="mb-2">Invite Created</h5>
             <p className="text-muted mb-4">You can copy the backup link below:</p>

             <div className="card bg-light border-0 mb-3">
               <div className="card-body">
                 <label className="form-label small text-muted mb-2">Invitation Link (Backup)</label>
                 <div className="input-group">
                    <input type="text" className="form-control font-monospace small" value={inviteResult.invite_link} readOnly />
                    <button className="btn btn-outline-primary" onClick={() => {
                        navigator.clipboard.writeText(inviteResult.invite_link);
                        alert('Link copied!');
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1 2-2h1v1H2Z"/>
                        </svg>
                    </button>
                 </div>
               </div>
             </div>
          </div>
        )}
      </Modal>

      {/* HR Report Modal */}
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
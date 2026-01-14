import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Download,
  AlertTriangle,
  Layers,
  Users,
  Briefcase,
  DollarSign,
  Code,
  Megaphone,
  Shield,
  Activity,
  PenTool,
  Truck,
  Coffee,
  Home,
  Settings,
  Database,
  Cloud,
  Server,
  Smartphone,
  Monitor,
  Cpu,
  Globe,
  Anchor,
  Archive,
  Award,
  BarChart,
  Battery,
  Bell,
  Book,
  Box,
  Calendar,
  Camera,
  Cast,
  CheckCircle,
  Clipboard,
  Clock,
  Compass,
  CreditCard,
  Flag,
  Folder,
  Gift,
  Heart,
  Image,
  Key,
  Lock,
  Map,
  Mic,
  Music,
  Package,
  PieChart,
  Play,
  Power,
  Printer,
  Radio,
  Save,
  Scissors,
  Send,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Star,
  Sun,
  Tag,
  Terminal,
  Umbrella,
  Video,
  Voicemail,
  Wifi,
  Zap,
  Wrench,
  ChevronRight,
} from "lucide-react";

// -----------------------
// Theme & Constants
// -----------------------
const COLORS = {
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  secondary: "#14b8a6",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  red: "#ef4444",
  redLight: "#fef2f2",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const ICON_MAP = {
  Layers,
  Users,
  Briefcase,
  DollarSign,
  Code,
  Megaphone,
  Shield,
  Activity,
  PenTool,
  Truck,
  Coffee,
  Home,
  Settings,
  Database,
  Cloud,
  Server,
  Smartphone,
  Monitor,
  Cpu,
  Globe,
  Anchor,
  Archive,
  Award,
  BarChart,
  Battery,
  Bell,
  Book,
  Box,
  Calendar,
  Camera,
  Cast,
  CheckCircle,
  Clipboard,
  Clock,
  Compass,
  CreditCard,
  Flag,
  Folder,
  Gift,
  Heart,
  Image,
  Key,
  Lock,
  Map,
  Mic,
  Music,
  Package,
  PieChart,
  Play,
  Power,
  Printer,
  Radio,
  Save,
  Scissors,
  Send,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Star,
  Sun,
  Tag,
  Terminal,
  Umbrella,
  Video,
  Voicemail,
  Wifi,
  Zap,
  Wrench,
};

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
  },
  iconBox: (bg) => ({
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
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
// Shared Components
// -----------------------
const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent size={size} color={color} />;
};

const Modal = ({ open, title, onClose, children, actions }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "500px",
          padding: "32px",
          boxShadow: COLORS.shadowHuge,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "800",
              color: COLORS.textPrimary,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: COLORS.textMuted,
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
        {actions && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "32px",
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// -----------------------
// Main Page
// -----------------------
export default function Departments() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    icon: "Layers",
  });
  const [submitting, setSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/`, {
        headers: authHeader,
      });
      const data = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(q.toLowerCase())
  );
  const filteredIcons = useMemo(
    () =>
      Object.keys(ICON_MAP).filter((key) =>
        key.toLowerCase().includes(iconSearch.toLowerCase())
      ),
    [iconSearch]
  );

  const handleExportCSV = async () => {
    const res = await fetch(`${API_BASE}/api/departments/export/`, {
      headers: authHeader,
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments.csv";
    a.click();
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/departments/${formData.id}/`
        : `${API_BASE}/api/departments/`;
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(formData),
      });
      fetchDepartments();
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/api/departments/${deleteId}/`, {
        method: "DELETE",
        headers: authHeader,
      });
      setRows(rows.filter((r) => r.id !== deleteId));
      setDeleteOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .dept-card:hover { transform: translateY(-5px); border-color: ${COLORS.primary} !important; box-shadow: ${COLORS.shadowHuge} !important; }
        .emerald-btn { background: ${COLORS.primary}; color: white; border: none; padding: 10px 20px; borderRadius: 12px; fontWeight: 700; cursor: pointer; display: flex; alignItems: center; gap: 8px; transition: 0.2s; }
        .emerald-btn:hover { background: ${COLORS.primaryDark}; }
        .outline-btn { background: white; border: 1px solid ${COLORS.borderColor}; padding: 10px 20px; borderRadius: 12px; fontWeight: 700; color: ${COLORS.textSecondary}; cursor: pointer; display: flex; alignItems: center; gap: 8px; }
        .danger-btn { background: ${COLORS.red}; color: white; border: none; padding: 10px 20px; borderRadius: 12px; fontWeight: 700; cursor: pointer; }
        .icon-grid-item:hover { background: ${COLORS.primaryLight} !important; color: ${COLORS.primary} !important; }
      `}</style>

      <div style={styles.mainWrapperCard}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "40px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            paddingBottom: "40px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "10px",
                }}
              >
                <Layers size={24} color={COLORS.primary} />
              </div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  margin: 0,
                  color: COLORS.textPrimary,
                }}
              >
                Departments
              </h1>
            </div>
            <p style={{ color: COLORS.textSecondary, margin: 0 }}>
              Structure and manage your organization's business units.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="outline-btn" onClick={handleExportCSV}>
              <Download size={18} /> Export CSV
            </button>
            <button
              className="emerald-btn"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  id: null,
                  name: "",
                  description: "",
                  icon: "Layers",
                });
                setOpen(true);
              }}
            >
              <Plus size={18} /> Add Department
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            position: "relative",
            maxWidth: "400px",
            marginBottom: "32px",
          }}
        >
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
            style={{
              ...styles.input,
              paddingLeft: "48px",
              height: "48px",
              backgroundColor: "#f1f5f9",
              border: "none",
            }}
            placeholder="Quick search departments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((r) => (
            <div
              key={r.id}
              className="dept-card"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: "20px",
                padding: "28px",
                transition: "0.3s ease",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={styles.iconBox(COLORS.primaryLight)}>
                  <DynamicIcon name={r.icon} size={24} color={COLORS.primary} />
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.textMuted,
                    }}
                    onClick={() => {
                      setIsEditing(true);
                      setFormData(r);
                      setOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.red,
                    }}
                    onClick={() => {
                      setDeleteId(r.id);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: COLORS.textPrimary,
                    margin: "0 0 8px 0",
                  }}
                >
                  {r.name}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: COLORS.textSecondary,
                    lineHeight: "1.6",
                    margin: 0,
                    minHeight: "44px",
                  }}
                >
                  {r.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={open}
        title={isEditing ? "Edit Department" : "New Department"}
        onClose={() => setOpen(false)}
        actions={
          <>
            <button className="outline-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="emerald-btn" onClick={handleSubmit}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: COLORS.textSecondary,
                marginBottom: "8px",
              }}
            >
              DEPARTMENT ICON
            </label>
            <div
              style={{
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#f8fafc",
                  borderBottom: `1px solid ${COLORS.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Search size={14} color={COLORS.textMuted} />
                <input
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: "13px",
                    outline: "none",
                    width: "100%",
                  }}
                  placeholder="Search icons..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: "8px",
                  padding: "12px",
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                {filteredIcons.map((key) => (
                  <div
                    key={key}
                    onClick={() => setFormData({ ...formData, icon: key })}
                    className="icon-grid-item"
                    style={{
                      cursor: "pointer",
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor:
                        formData.icon === key ? COLORS.primary : "#fff",
                      color: formData.icon === key ? "#fff" : COLORS.textMuted,
                      border: `1px solid ${COLORS.borderColor}`,
                    }}
                  >
                    <DynamicIcon name={key} size={18} color="currentColor" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: COLORS.textSecondary,
                marginBottom: "8px",
              }}
            >
              NAME
            </label>
            <input
              style={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Creative Engineering"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "700",
                color: COLORS.textSecondary,
                marginBottom: "8px",
              }}
            >
              DESCRIPTION
            </label>
            <textarea
              style={{ ...styles.input, height: "100px", resize: "none" }}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What does this department do?"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteOpen}
        title="Permanently Delete?"
        onClose={() => setDeleteOpen(false)}
        actions={
          <>
            <button
              className="outline-btn"
              onClick={() => setDeleteOpen(false)}
            >
              Go Back
            </button>
            <button className="danger-btn" onClick={handleDelete}>
              {deleting ? "Deleting..." : "Delete Department"}
            </button>
          </>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: COLORS.redLight,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
            }}
          >
            <AlertTriangle color={COLORS.red} size={32} />
          </div>
          <p
            style={{
              color: COLORS.textSecondary,
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            This action is irreversible. All associations with this department
            will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
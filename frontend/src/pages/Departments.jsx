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
  CheckCircle,
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
} from "lucide-react";

// -----------------------
// Theme & Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  red: "#ef4444", // Usually remains red in both modes
  shadowHuge: "var(--shadow-huge)",
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
    minHeight: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column",
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
    padding: "20px",
  },
};

// -----------------------
// Components
// -----------------------
const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent size={size} color={color} />;
};

const Modal = ({ open, title, onClose, children, actions }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
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
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>,
    document.body
  );
};

export default function Departments() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [toast, setToast] = useState(null);
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/`, {
        headers: authHeader,
      });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ message: "Failed to load departments", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/departments/export/`, {
        headers: authHeader,
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "departments.csv";
      a.click();
      setToast({ message: "Export started!", type: "success" });
    } catch (e) {
      setToast({ message: "Export failed.", type: "error" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name)
      return setToast({ message: "Name required.", type: "error" });
    setSubmitting(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/departments/${formData.id}/`
        : `${API_BASE}/api/departments/`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      await fetchDepartments();
      setOpen(false);
      setToast({
        message: `Department ${isEditing ? "updated" : "created"}!`,
        type: "success",
      });
    } catch (e) {
      setToast({ message: "Save failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/${deleteId}/`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!res.ok) throw new Error();
      setRows(rows.filter((r) => r.id !== deleteId));
      setDeleteOpen(false);
      setToast({ message: "Deleted successfully!", type: "success" });
    } catch (e) {
      setToast({ message: "Delete failed.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

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

  return (
    <div style={styles.container}>
      <style>{`
        .responsive-wrapper { padding: 48px; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid ${COLORS.borderColor}; padding-bottom: 40px; }
        .action-btns { display: flex; gap: 12px; }
        .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        .modal-container { background: #fff; border-radius: 20px; width: 100%; max-width: 500px; padding: 32px; box-shadow: ${COLORS.shadowHuge}; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; }
        .icon-selector { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; padding: 12px; max-height: 160px; overflow-y: auto; }
        
        .emerald-btn { background: ${COLORS.primary}; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .outline-btn { background: ${COLORS.cardBg}; border: 1px solid ${COLORS.borderColor}; padding: 10px 20px; border-radius: 12px; font-weight: 700; color: ${COLORS.textSecondary}; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .danger-btn { background: ${COLORS.red}; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }

        @media (max-width: 1024px) { .responsive-wrapper { padding: 24px; } }
        @media (max-width: 768px) {
          .header-flex { flex-direction: column; align-items: flex-start; gap: 20px; padding-bottom: 24px; }
          .action-btns { width: 100%; flex-direction: column; }
          .action-btns button { width: 100%; justify-content: center; }
          .dept-grid { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column; }
          .modal-actions button { width: 100%; }
          .icon-selector { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>

      <div className="responsive-wrapper" style={styles.mainWrapperCard}>
        <div className="header-flex">
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
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
                Departments
              </h1>
            </div>
            <p style={{ color: COLORS.textSecondary, margin: 0 }}>
              Manage your organization's business units.
            </p>
          </div>
          <div className="action-btns">
            <button className="outline-btn" onClick={handleExportCSV}>
              <Download size={18} /> Export
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
              <Plus size={18} /> Add New
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "400px",
            marginBottom: "32px",
            width: "100%",
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
            placeholder="Search departments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="dept-grid">
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: "20px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={styles.iconBox(COLORS.primaryLight)}>
                  <DynamicIcon name={r.icon} size={24} color={COLORS.primary} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setFormData(r);
                      setOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.textMuted,
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(r.id);
                      setDeleteOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: COLORS.red,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>
                {r.name}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.textSecondary,
                  margin: 0,
                }}
              >
                {r.description || "No description."}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={open}
        title={isEditing ? "Edit Department" : "New Department"}
        onClose={() => setOpen(false)}
        actions={
          <React.Fragment>
            <button className="outline-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="emerald-btn" onClick={handleSubmit}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </React.Fragment>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                gap: "8px",
              }}
            >
              <Search size={14} />
              <input
                style={{ border: "none", background: "none", width: "100%" }}
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </div>
            <div className="icon-selector">
              {filteredIcons.map((key) => (
                <div
                  key={key}
                  onClick={() => setFormData({ ...formData, icon: key })}
                  style={{
                    cursor: "pointer",
                    width: "36px",
                    height: "36px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "8px",
                    backgroundColor:
                      formData.icon === key ? COLORS.primary : "transparent",
                    color: formData.icon === key ? "#fff" : COLORS.textMuted,
                  }}
                >
                  <DynamicIcon name={key} size={18} color="currentColor" />
                </div>
              ))}
            </div>
          </div>
          <input
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <textarea
            style={{ ...styles.input, height: "100px" }}
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete?"
        onClose={() => setDeleteOpen(false)}
        actions={
          <React.Fragment>
            <button
              className="outline-btn"
              onClick={() => setDeleteOpen(false)}
            >
              No
            </button>
            <button className="danger-btn" onClick={handleDelete}>
              Delete
            </button>
          </React.Fragment>
        }
      >
        <p>This action cannot be undone.</p>
      </Modal>

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
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
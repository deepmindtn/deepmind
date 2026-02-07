import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Layers,
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
  Download,
  ChevronDown,
  Check,
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
  tableRow: "var(--table-row)",
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
    group: "Work Stress & Burnout",
    items: [
      { code: "KARASEK", label: "⚖️ Karasek Job Demand-Control" },
      { code: "MASLACH", label: "🔥 Maslach Burnout Inventory" },
      { code: "JSS", label: "😊 Job Satisfaction Survey (JSS)" },
    ],
  },
  {
    group: "Resilience & Self-Efficacy",
    items: [
      { code: "BRS", label: "💪 Brief Resilience Scale (BRS)" },
      { code: "CDRISC", label: "🛡️ Connor-Davidson Resilience (CD-RISC 10)" },
      { code: "WSES", label: "✨ Work Self-Efficacy Scale (WSES)" },
    ],
  },
  {
    group: "Motivation & Creativity",
    items: [
      { code: "GCOS", label: "🎯 General Causality Orientations (GCOS)" },
      { code: "RIBS", label: "💡 Runco Ideational Behavior Scale (RIBS)" },
      { code: "CAQ", label: "🎨 Creative Achievement Questionnaire (CAQ)" },
      { code: "ISE", label: "🚀 Innovation Self-Efficacy Scale (ISE)" },
    ],
  },
];

const getStyles = (isMobile, isTablet) => ({
  container: {
    padding: isMobile ? "5px 8px" : "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: COLORS.textPrimary,
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: isMobile ? "16px" : "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: isMobile ? "20px" : isTablet ? "32px" : "48px",
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
    alignItems: isMobile ? "flex-start" : "center",
    marginBottom: "32px",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "16px" : "0",
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
    justifyContent: "center",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    justifyContent: "center",
  },
  btnLight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: COLORS.cardBg,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    justifyContent: "center",
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
  badge: (status) => {
    const colors = {
      active: { bg: "#ecfdf5", text: "#059669" },
      inactive: { bg: "#fef2f2", text: "#ef4444" },
      "on leave": { bg: "#fffbeb", text: "#d97706" },
      completed: { bg: "#ecfdf5", text: "#059669" },
      pending: { bg: "#fffbeb", text: "#d97706" },
      assigned: { bg: "#eff6ff", text: "#3b82f6" },
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
});

// -----------------------
// Icon Mapping
// -----------------------
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

const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent size={size} color={color} />;
};

// -----------------------
// Sub-components
// -----------------------
function StatusBadge({ status, styles }) {
  return <span style={styles.badge(status)}>{status}</span>;
}

function Modal({ open, title, onClose, children, actions }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!open) return null;

  const styles = getStyles(isMobile, false);

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
        padding: isMobile ? "16px" : "0",
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: isMobile ? "100%" : "720px",
          padding: isMobile ? "20px" : "24px",
          boxShadow: COLORS.shadowLg,
          maxHeight: isMobile ? "calc(100vh - 32px)" : "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            alignItems: "flex-start",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: "700",
              flex: 1,
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
              padding: "0",
              marginLeft: "12px",
            }}
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
            flexDirection: isMobile ? "column-reverse" : "row",
          }}
        >
          {actions}
        </div>
      </div>
    </div>
  );
}

// -----------------------
// Main Component
// -----------------------
export default function Employees() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // --- Responsive States ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  // --- States ---
  const [toast, setToast] = useState(null);
  const [isInviting, setIsInviting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [availableDepts, setAvailableDepts] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [detailAssignments, setDetailAssignments] = useState([]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [assignForm, setAssignForm] = useState({ template_codes: [] });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);

  const [importOpen, setImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "",
    first_name: "",
    last_name: "",
    department_id: null,
  });
  const [inviteResult, setInviteResult] = useState(null);
  const [hrReport, setHrReport] = useState(null);
  const [hrReportOpen, setHrReportOpen] = useState(false);

  const styles = useMemo(
    () => getStyles(isMobile, isTablet),
    [isMobile, isTablet]
  );

  // --- Responsive Handler ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Toast Timer ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Dropdown Logic ---
  const handleToggleDropdown = () => {
    if (!isDropdownOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: "300px",
        zIndex: 9999,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleAssessment = (code) => {
    setAssignForm((prev) => {
      const currentCodes = prev.template_codes || [];
      if (currentCodes.includes(code)) {
        return {
          ...prev,
          template_codes: currentCodes.filter((c) => c !== code),
        };
      } else {
        return { ...prev, template_codes: [...currentCodes, code] };
      }
    });
  };

  // --- Data Fetching ---
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
  }, []);

  useEffect(() => {
    async function fetchDepts() {
      try {
        const res = await fetch(`${API_BASE}/api/departments/`, {
          headers: { ...authHeader },
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableDepts(data);
        }
      } catch (e) {
        console.error("Failed to load departments", e);
      }
    }
    fetchDepts();
  }, []);

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
      setToast({ message: e.message, type: "error" });
    }
  }

  async function handleImportCSV() {
    if (!csvFile) {
      setToast({ message: "Please select a CSV file first.", type: "error" });
      return;
    }
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      const res = await fetch(`${API_BASE}/api/employees/import/`, {
        method: "POST",
        headers: { ...authHeader },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import CSV");
      setImportResult(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
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
      setToast({ message: "Failed to generate report.", type: "error" });
    }
  }

  async function assignAssessment() {
    console.log("🚀 assignAssessment triggered");

    if (!assignForm.template_codes || assignForm.template_codes.length === 0) {
      console.warn("❌ No assessments selected");
      setToast({
        message: "Please select at least one assessment.",
        type: "error",
      });
      return;
    }

    if (!assignRow) {
      console.error("❌ assignRow is null");
      return;
    }

    const payload = {
      employee_email: assignRow.email,
      template_codes: assignForm.template_codes,
    };

    console.log("📤 Sending payload:", payload);

    try {
      const res = await fetch(`${API_BASE}/api/assessments/assign/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);

      const data = await res.json().catch(() => null);
      console.log("📥 Response body:", data);

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to assign assessment");
      }

      setToast({
        message: "Assessments assigned successfully!",
        type: "success",
      });

      console.log("✅ Assignment success");

      setAssignOpen(false);
      setAssignRow(null);
      setAssignForm({ template_codes: [] });
    } catch (e) {
      console.error("🔥 Assignment error:", e);
      setToast({
        message: e.message || "Could not assign assessment",
        type: "error",
      });
    }
  }

  async function createInvite() {
    setIsInviting(true);
    try {
      const res = await fetch(`${API_BASE}/api/invites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(invite),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create invite");
      }
      const data = await res.json();
      setInviteResult(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
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
    <div style={styles.container}>
      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div style={styles.sectionHeader}>
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              {/* Icon Badge Header (NEW) */}
              <div
                className="dashboard-header-icon-wrapper"
                style={{
                  padding: isMobile ? "8px" : "10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={isMobile ? 20 : 24} color={COLORS.primary} />
              </div>

              <h1
                style={{
                  fontSize: isMobile ? "24px" : "32px",
                  fontWeight: "800",
                  margin: 0,
                }}
              >
                Employee Management
              </h1>
            </div>

            <p
              style={{
                color: COLORS.textSecondary,
                margin: 0,
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              Manage your workforce, track assessments, and generate insights.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              width: isMobile ? "100%" : "auto",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <button
              style={{
                ...styles.btnSecondary,
                width: isMobile ? "100%" : "auto",
              }}
              onClick={() => {
                setCsvFile(null);
                setImportResult(null);
                setImportOpen(true);
              }}
            >
              <Upload size={18} /> Import CSV
            </button>

            <button
              style={{
                ...styles.btnPrimary,
                width: isMobile ? "100%" : "auto",
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
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "repeat(2, 1fr)"
              : "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ ...styles.card, padding: "20px" }}>
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
                  padding: "10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                }}
              >
                <Users size={24} color={COLORS.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: COLORS.textSecondary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Total
                </div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>
                  {stats.all}
                </div>
              </div>
            </div>
          </div>
          <div style={{ ...styles.card, padding: "20px" }}>
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
                  padding: "10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                }}
              >
                <CheckCircle size={24} color={COLORS.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: COLORS.textSecondary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Active
                </div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>
                  {stats.active}
                </div>
              </div>
            </div>
          </div>
          <div style={{ ...styles.card, padding: "20px" }}>
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
                  padding: "10px",
                  backgroundColor: "#fffbeb",
                  borderRadius: "12px",
                }}
              >
                <AlertTriangle size={24} color={COLORS.orange} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: COLORS.textSecondary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  On Leave
                </div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>
                  {stats.leave}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
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
              backgroundColor: COLORS.cardBg,
              color: COLORS.textPrimary,
            }}
            placeholder="Search employees by name, email, or role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "32px",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <select
            style={{
              ...styles.input,
              width: isMobile ? "100%" : "auto",
              padding: "10px 16px",
              backgroundColor: COLORS.cardBg,
              color: COLORS.textPrimary,
            }}
            value={dep}
            onChange={(e) => setDep(e.target.value)}
          >
            <option value="All">All Departments</option>
            {availableDepts.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            style={{
              ...styles.input,
              width: isMobile ? "100%" : "auto",
              padding: "10px 16px",
              backgroundColor: COLORS.cardBg,
              color: COLORS.textPrimary,
            }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All", "Active", "On Leave", "Inactive"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button
            style={{
              ...styles.btnPrimary,
              width: isMobile ? "100%" : "auto",
            }}
            onClick={generateHRReport}
          >
            <FileText size={18} /> Generate Report
          </button>
        </div>

        {/* Employee Table */}
        <div style={styles.card}>
          <div
            style={{
              padding: isMobile ? "16px" : "20px",
              borderBottom: `1px solid ${COLORS.borderColor}`,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Users size={20} color={COLORS.primary} />
            <span
              style={{
                fontWeight: "700",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              Employee Directory
            </span>
          </div>
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: COLORS.textSecondary,
              }}
            >
              Loading employees...
            </div>
          ) : isMobile ? (
            // Mobile Card View
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {current.map((r) => (
                <div
                  key={r.id}
                  style={{
                    ...styles.card,
                    padding: "16px",
                    border: `1px solid ${COLORS.borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: COLORS.primaryLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <UserIcon size={20} color={COLORS.primary} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                        {r.name}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                          marginBottom: "4px",
                          wordBreak: "break-word",
                        }}
                      >
                        {r.email}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                          marginBottom: "4px",
                        }}
                      >
                        <strong>Role:</strong> {r.role}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                          marginBottom: "8px",
                        }}
                      >
                        <strong>Dept:</strong> {r.department}
                      </div>
                      <StatusBadge status={r.status} styles={styles} />
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => viewDetails(r)}
                      style={{
                        ...styles.btnSecondary,
                        padding: "8px 14px",
                        fontSize: "13px",
                        flex: 1,
                      }}
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => {
                        setAssignRow(r);
                        setAssignOpen(true);
                      }}
                      style={{
                        ...styles.btnSecondary,
                        padding: "8px 14px",
                        fontSize: "13px",
                        flex: 1,
                      }}
                    >
                      <Send size={14} /> Assess
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead style={{ backgroundColor: COLORS.tableRow }}>
                  <tr>
                    {[
                      "Employee",
                      "Role",
                      "Department",
                      "Status",
                      "Actions",
                    ].map((h) => (
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
                  {current.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.borderColor}`,
                      }}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: COLORS.primaryLight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <UserIcon size={20} color={COLORS.primary} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "600" }}>{r.name}</div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: COLORS.textSecondary,
                              }}
                            >
                              {r.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px" }}>
                        {r.role}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px" }}>
                        {r.department}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <StatusBadge status={r.status} styles={styles} />
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => viewDetails(r)}
                            style={{
                              ...styles.btnSecondary,
                              padding: "6px 12px",
                              fontSize: "13px",
                            }}
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => {
                              setAssignRow(r);
                              setAssignOpen(true);
                            }}
                            style={{
                              ...styles.btnSecondary,
                              padding: "6px 12px",
                              fontSize: "13px",
                            }}
                          >
                            <Send size={14} /> Assess
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Import CSV Modal */}
      <Modal
        open={importOpen}
        title="Import Employees from CSV"
        onClose={() =>
          importResult ? closeImportAndRefresh() : setImportOpen(false)
        }
        actions={
          !importResult ? (
            <>
              <button
                style={styles.btnLight}
                onClick={() => setImportOpen(false)}
              >
                Cancel
              </button>
              <button
                style={styles.btnPrimary}
                onClick={handleImportCSV}
                disabled={importing}
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </>
          ) : (
            <button style={styles.btnPrimary} onClick={closeImportAndRefresh}>
              Close & Refresh
            </button>
          )
        }
      >
        {!importResult ? (
          <div>
            <div
              style={{
                padding: "16px",
                backgroundColor: COLORS.blueLight,
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <h6
                style={{
                  fontWeight: "700",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                CSV Format Requirements
              </h6>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                Upload a CSV file with the following headers (case-sensitive):
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                <li>
                  <code>Email Address</code>
                </li>
                <li>
                  <code>First Name</code>
                </li>
                <li>
                  <code>Last Name</code>
                </li>
                <li>
                  <code>Department</code>
                </li>
              </ul>
            </div>
            <div>
              <label style={styles.label}>Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{ ...styles.input, padding: "10px" }}
              />
              <div
                style={{
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  marginTop: "8px",
                }}
              >
                Data will be imported first, then invitation emails will be sent
                to each employee.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <CheckCircle size={32} color={COLORS.primary} />
              <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                Import Completed
              </h5>
            </div>
            <p style={{ fontSize: "14px", marginBottom: "16px" }}>
              {importResult.message}
            </p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fffbeb",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.orange}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <AlertTriangle size={20} color={COLORS.orange} />
                  <strong style={{ fontSize: "14px" }}>
                    Skipped / Errors:
                  </strong>
                </div>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    fontSize: "13px",
                  }}
                >
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      color: COLORS.red,
                    }}
                  >
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
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
            <div
              style={{
                padding: "16px",
                backgroundColor: COLORS.bgMain,
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Email:</strong> {detailRow.email}
              </p>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Role:</strong> {detailRow.role}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Department:</strong> {detailRow.department}
              </p>
            </div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Assessment History
            </h4>
            <div style={{ display: "grid", gap: "12px" }}>
              {detailAssignments.map((a) => (
                <div key={a.id} style={{ ...styles.card, padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <h5
                      style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}
                    >
                      {a.template_name}
                    </h5>
                    <StatusBadge status={a.status} styles={styles} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal
        open={assignOpen}
        title="Send Assessment"
        onClose={() => setAssignOpen(false)}
        actions={
          <button style={styles.btnPrimary} onClick={assignAssessment}>
            <Send size={16} /> Send Assessment
          </button>
        }
      >
        {assignRow && (
          <div
            style={{
              padding: "16px",
              backgroundColor: COLORS.blueLight,
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} color={COLORS.blue} />
              <div>
                <strong>{assignRow.name}</strong>
                <div style={{ fontSize: "13px", color: COLORS.textSecondary }}>
                  {assignRow.email}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ position: "relative", marginBottom: "40px" }}>
          <label style={styles.label}>Select Assessment Templates</label>

          <div
            ref={triggerRef}
            onClick={handleToggleDropdown}
            style={{
              ...styles.input,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLORS.cardBg,
            }}
          >
            <span style={{ color: COLORS.textPrimary }}>
              {assignForm.template_codes && assignForm.template_codes.length > 0
                ? `${assignForm.template_codes.length} Assessment(s) Selected`
                : "Select assessments..."}
            </span>
            <ChevronDown size={16} color={COLORS.textSecondary} />
          </div>

          {isDropdownOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => setIsDropdownOpen(false)}
              />

              <div
                style={{
                  ...dropdownStyle,
                  overflowY: "auto",
                  backgroundColor: "white",
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {ASSESSMENT_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: COLORS.tableRow,
                        fontWeight: "bold",
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        borderBottom: `1px solid ${COLORS.tableRow}`,
                        borderTop: `1px solid ${COLORS.tableRow}`,
                      }}
                    >
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const isSelected = assignForm.template_codes.includes(
                        item.code
                      );
                      return (
                        <div
                          key={item.code}
                          onClick={() => toggleAssessment(item.code)}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: isSelected
                              ? COLORS.primaryLight
                              : COLORS.cardBg,
                            transition: "background-color 0.1s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              color: isSelected
                                ? COLORS.blue
                                : COLORS.textPrimary,
                            }}
                          >
                            {item.label}
                          </span>
                          {isSelected && (
                            <div style={{ color: COLORS.blue }}>
                              <Check size={18} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: COLORS.textSecondary,
            }}
          >
            {assignForm.template_codes?.length || 0} selected.
          </div>
        </div>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        open={addOpen}
        title="Add New Employee"
        onClose={() => {
          setAddOpen(false);
          setInviteResult(null);
        }}
        actions={
          <>
            <button
              style={styles.btnLight}
              onClick={() => setAddOpen(false)}
              disabled={isInviting}
            >
              Cancel
            </button>
            {!inviteResult && (
              <button
                style={styles.btnPrimary}
                onClick={createInvite}
                disabled={isInviting || !invite.department_id || !invite.email}
              >
                {isInviting ? "Sending..." : "Create Invite"}
              </button>
            )}
          </>
        }
      >
        {!inviteResult ? (
          <>
            <div
              style={{
                padding: "16px",
                backgroundColor: COLORS.blueLight,
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <small style={{ fontSize: "13px" }}>
                This will send an invitation link to the new employee.
              </small>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={styles.label}>
                  Email <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={invite.email}
                  onChange={(e) =>
                    setInvite((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="email@company.com"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={invite.first_name}
                    onChange={(e) =>
                      setInvite((f) => ({ ...f, first_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={invite.last_name}
                    onChange={(e) =>
                      setInvite((f) => ({ ...f, last_name: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  Select Department <span style={{ color: COLORS.red }}>*</span>
                </label>
                {availableDepts.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: COLORS.bgMain,
                      borderRadius: "12px",
                      textAlign: "center",
                      color: COLORS.textSecondary,
                    }}
                  >
                    No departments found. Go to "Departments" page to create
                    one.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2, 1fr)"
                        : "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "10px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      padding: "4px",
                    }}
                  >
                    {availableDepts.map((dept) => {
                      const isSelected = invite.department_id === dept.id;
                      return (
                        <div
                          key={dept.id}
                          onClick={() =>
                            setInvite((f) => ({ ...f, department_id: dept.id }))
                          }
                          style={{
                            position: "relative",
                            border: isSelected
                              ? `2px solid ${COLORS.primary}`
                              : `1px solid ${COLORS.borderColor}`,
                            background: isSelected
                              ? COLORS.primaryLight
                              : COLORS.cardBg,
                            borderRadius: "10px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              color: isSelected
                                ? COLORS.primary
                                : COLORS.textSecondary,
                              background: isSelected ? "#fff" : COLORS.bgMain,
                              padding: "8px",
                              borderRadius: "50%",
                            }}
                          >
                            <DynamicIcon name={dept.icon} size={20} />
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "500",
                              color: isSelected
                                ? COLORS.primary
                                : COLORS.textPrimary,
                              textAlign: "center",
                            }}
                          >
                            {dept.name}
                          </span>
                          {isSelected && (
                            <CheckCircle
                              size={14}
                              color={COLORS.primary}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {inviteResult.email_sent ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              >
                <Mail size={24} color={COLORS.primary} />
                <div style={{ textAlign: "left" }}>
                  <strong>Email Sent Successfully!</strong>
                  <br />
                  <small style={{ color: COLORS.textSecondary }}>
                    An invitation has been emailed to {inviteResult.email}
                  </small>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              >
                <AlertTriangle size={24} color={COLORS.red} />
                <div style={{ textAlign: "left" }}>
                  <strong>Email Failed!</strong>
                  <br />
                  <small style={{ color: COLORS.textSecondary }}>
                    {inviteResult.email_error ||
                      "Could not send email. Please copy the link manually."}
                  </small>
                </div>
              </div>
            )}

            <h5
              style={{
                marginBottom: "8px",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Invite Created
            </h5>
            <p style={{ color: COLORS.textSecondary, marginBottom: "20px" }}>
              You can copy the backup link below:
            </p>

            <div
              style={{
                ...styles.card,
                padding: "16px",
                backgroundColor: COLORS.bgMain,
              }}
            >
              <label
                style={{
                  ...styles.label,
                  fontSize: "12px",
                  color: COLORS.textSecondary,
                  textTransform: "uppercase",
                }}
              >
                Invitation Link (Backup)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "8px",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <input
                  type="text"
                  style={{
                    ...styles.input,
                    fontFamily: "monospace",
                    fontSize: "12px",
                    flex: 1,
                  }}
                  value={inviteResult.invite_link}
                  readOnly
                />
                <button
                  style={{
                    ...styles.btnPrimary,
                    padding: "10px 16px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(inviteResult.invite_link);
                    setToast({ message: "Link copied!", type: "success" });
                  }}
                >
                  Copy
                </button>
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
            style={styles.btnPrimary}
            onClick={() => {
              const blob = new Blob([hrReport], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "HR_Decision_Support_Report.txt";
              link.click();
            }}
          >
            <Download size={16} /> Download Report
          </button>
        }
      >
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "14px",
            lineHeight: "1.6",
            padding: "16px",
            backgroundColor: COLORS.bgMain,
            borderRadius: "12px",
            maxHeight: isMobile ? "60vh" : "400px",
            overflowY: "auto",
          }}
        >
          {hrReport}
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "16px" : "32px",
            right: isMobile ? "16px" : "32px",
            left: isMobile ? "16px" : "auto",
            zIndex: 9999,
            backgroundColor: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
            border: `1px solid ${
              toast.type === "error" ? "#ef4444" : "#10b981"
            }`,
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: isMobile ? "auto" : "300px",
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

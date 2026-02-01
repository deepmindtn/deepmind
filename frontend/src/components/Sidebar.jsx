import React from "react";
import {
  Heart,
  Users,
  Home,
  ClipboardList,
  Bolt,
  Brain,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Briefcase,
  Zap,
  FileText,
  Mail,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
  const role = storedUser.role || "HR"; // Defaulting to HR for visualization
  const userName = `${storedUser.first_name || "User"} ${
    storedUser.last_name || ""
  }`;

  // 1. CORE OPERATIONAL MENUS
  const hrMenu = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Team Management", icon: Users },
    { path: "/assessments", label: "Health Insights", icon: Zap },
    { path: "/recruitment", label: "AI Recruitment", icon: Brain },
    { path: "/assesement-description", label: "Library", icon: Search },
  ];

  // 2. SYSTEM/CONFIGURATION MENUS (Moved out of the main list)
  const hrSystemMenu = [
    { path: "/departments", label: "Departments", icon: Briefcase },
    { path: "/email-templates", label: "Email Templates", icon: Mail },
  ];

  const employeeMenu = [
    { path: "/my-assessments", label: "My Growth", icon: ClipboardList },
    { path: "/surveys", label: "My Surveys", icon: FileText },
    { path: "/wellbeing-techniques", label: "Well-Being", icon: Heart },
    { path: "/productivity-tools", label: "Focus Tools", icon: Bolt },
    { path: "/assesement-description", label: "Library", icon: Search },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) toggleSidebar();
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Helper to render menu items to avoid repetition
  const renderLinks = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.path);
      return (
        <button
          key={item.label}
          onClick={() => handleNavClick(item.path)}
          className={`nav-link ${active ? "active" : ""}`}
        >
          <div className={`nav-icon-container ${active ? "active" : ""}`}>
            <Icon size={20} />
          </div>
          {isOpen && <span className="nav-text">{item.label}</span>}
          {active && isOpen && <div className="active-indicator" />}
        </button>
      );
    });

  return (
    <div className={`sidebar-island ${!isOpen ? "collapsed" : ""}`}>
      {!isMobile && (
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      <div className="sidebar-header">
        <div className="logo-box-emerald">
          <img src="/icon_sidebar.png" alt="Logo" width={22} height={22} />
        </div>
        {isOpen && <span className="brand-name">DeepMind</span>}
      </div>

      <div className="sidebar-content">
        <nav className="nav-stack">
          {renderLinks(role === "HR" ? hrMenu : employeeMenu)}
        </nav>
      </div>

      <div className="sidebar-footer">
        {/* --- SYSTEM SETUP MOVED HERE --- */}
        {role === "HR" && (
          <div className="sidebar-system-section">
            {isOpen && <span className="section-label">System Setup</span>}
            <div className="nav-stack bottom-nav">
              {renderLinks(hrSystemMenu)}
            </div>
          </div>
        )}

        <div className={`profile-mini-card ${!isOpen ? "collapsed" : ""}`}>
          <div className="avatar-emerald" onClick={() => navigate("/profile")}>
            <User size={20} color="white" />
          </div>
          {isOpen && (
            <div className="profile-details">
              <span className="profile-sidebar-name">{userName}</span>
              <span className="profile-role-tag">
                {role === "HR" ? "Admin" : "Member"}
              </span>
            </div>
          )}
          <button
            className="logout-action"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import {
  Heart,
  Users,
  BarChart3,
  LogOut,
  User,
  Home,
  TrendingUp,
  Calendar,
  FileText,
  ClipboardList,
  Bolt,
  Brain, 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ userName = "MizouH", isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ read role from localStorage (set at login in LoginPage)
  const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
  const role = storedUser.role || "EMPLOYEE"; // fallback if not logged

  // ✅ HR menu
  const hrMenu = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Employee Management", icon: Users },
    { path: "/assessments", label: "Health Assessments", icon: FileText },
    { path: "/recruitment", label: "AI Recruitment", icon: Brain }, // 🧠 NEW LINE
    { path: "/assesement-description", label: "Assessment Library", icon: Brain }, // 🧠 NEW LINE
  ];

  // ✅ Employee menu
  const employeeMenu = [
    { path: "/my-assessments", label: "My Assessments", icon: ClipboardList },
    { path: "/wellbeing-techniques", label: "Well-Being Techniques", icon: Heart },
    { path: "/productivity-tools", label: "Productivity Tools", icon: Bolt },
    { path: "/assesement-description", label: "Assessment Library", icon: Brain }, // 🧠 NEW LINE
  ];

  // ✅ Pick menu based on role
  const menuItems = role === "HR" ? hrMenu : employeeMenu;

  const handleNavigation = (path) => navigate(path);

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("me"); // ✅ clear stored profile
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = () => navigate("/profile");

  const isActivePath = (itemPath) =>
    location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");

  return (
    <div className={`sidebar ${!isOpen ? "collapsed" : ""}`}>
      <button
        className={`sidebar-toggle ${isOpen ? "sidebar-open" : "sidebar-collapsed"}`}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
      >
        ☰
      </button>

      <div className="sidebar-logo">
        <div className="logo-container">
          <div className="logo-icon">
            <Heart className="logo-heart" />
          </div>
          {isOpen && <span className="logo-text">DeepMind</span>}
        </div>
      </div>

      <div className="sidebar-nav">
        <nav className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon className="nav-icon" />
                {isOpen && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-profile">
        <div className="profileName-container">
          <div className="profile-avatar">
            <User className="avatar-icon" />
          </div>
          {isOpen && (
            <div className="profile-info">
              <button onClick={handleProfileClick} className="sideprofile-name">
                {storedUser.first_name
                  ? `${storedUser.first_name} ${storedUser.last_name || ""}`
                  : userName}
              </button>
              <p className="profile-role">
                {role === "HR" ? "Administrator" : "Employee"}
              </p>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut className="logout-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

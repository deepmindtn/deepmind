import React from "react";
import {
  Heart, Users, Home, ClipboardList, Bolt, Brain, 
  LogOut, User, ChevronLeft, ChevronRight,
  Search, Briefcase, Zap, FileText, Mail 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("me") || "{}");
  const role = storedUser.role || "EMPLOYEE";
  const userName = `${storedUser.first_name || "User"} ${storedUser.last_name || ""}`;

  const hrMenu = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/employees", label: "Team Management", icon: Users },
    { path: "/assessments", label: "Health Insights", icon: Zap },
    { path: "/departments", label: "Departments", icon: Briefcase }, 
    { path: "/recruitment", label: "AI Recruitment", icon: Brain },
    { path: "/assesement-description", label: "Library", icon: Search },
    { path: "/email-templates", label: "Email Templates", icon: Mail },,
  ];

  const employeeMenu = [
    { path: "/my-assessments", label: "My Growth", icon: ClipboardList },
    // ✅ 2. Added the Survey Button here
    { path: "/surveys", label: "My Surveys", icon: FileText }, 
    { path: "/wellbeing-techniques", label: "Well-Being", icon: Heart },
    { path: "/productivity-tools", label: "Focus Tools", icon: Bolt },
    { path: "/assesement-description", label: "Library", icon: Search },
  ];

  const menuItems = role === "HR" ? hrMenu : employeeMenu;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) toggleSidebar(); 
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className={`sidebar-island ${!isOpen ? "collapsed" : ""}`}>
      {!isMobile && (
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      <div className="sidebar-header">
        <div className="logo-box-emerald">
          <img
            src="/icon_sidebar.png"
            alt="DeepMind logo"
            width={22}
            height={22}
            style={{ objectFit: "contain" }}
          />
        </div>
        {isOpen && <span className="brand-name">DeepMind</span>}
      </div>

      <div className="sidebar-content">
        <nav className="nav-stack">
          {menuItems.map((item) => {
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
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className={`profile-mini-card ${!isOpen ? "collapsed" : ""}`}>
          <div className="avatar-emerald" onClick={() => navigate("/profile")}>
            <User size={20} color="white" />
          </div>
          
          {isOpen && (
            <div className="profile-details">
              <span className="profile-sidebar-name">{userName}</span>
              <span className="profile-role-tag">{role === "HR" ? "Admin" : "Member"}</span>
            </div>
          )}

          <button className="logout-action" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
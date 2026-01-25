import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sun, Moon, CheckCircle2, LifeBuoy } from "lucide-react";

const CandidateLayout = () => {
  // --- Theme State (Same logic as Admin Layout) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Sync theme with localStorage and Body class
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div
      className={`candidate-layout ${isDarkMode ? "dark-theme" : ""}`}
      style={{
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease, color 0.3s ease",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ---------------------------------------------------- 
          SHARED STYLES & VARIABLES
         ---------------------------------------------------- */}
      <style>{`
        :root {
          /* Main Branding & Accents (Emerald) */
          --primary: #10b981;
          --primary-light: #ecfdf5;
          --primary-dark: #059669;
          --secondary: #14b8a6;
          
          /* Semantic Colors (Required for Charts/Tools) */
          --blue: #3b82f6;
          --blue-light: #eff6ff;
          --purple: #8b5cf6;
          --purple-light: #f5f3ff;
          --orange: #f59e0b;
          --orange-light: #fffbeb;
          --red: #ef4444;
          --dark: #475569;

          /* Layout Colors (Light Mode) */
          --bg-main: #f8fafc;
          --bg-header: #ffffff;
          --card-bg: #ffffff;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --border-color: #e5e7eb;

          /* Shadows (Light Mode) */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-huge: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .dark-theme {
          /* Branding Adjustments */
          --primary-light: #064e3b;
          --primary-dark: #34d399;
          
          /* Semantic Colors (Dark Mode Adjustments) */
          --blue: #60a5fa;
          --blue-light: #1e3a8a;
          --purple: #a78bfa;
          --purple-light: #4c1d95;
          --orange: #fbbf24;
          --orange-light: #78350f;
          --dark: #94a3b8;

          /* Layout Colors (Dark Mode) */
          --bg-main: #0f172a;
          --bg-header: #1e293b;
          --card-bg: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --border-color: #334155;

          /* Shadows (Dark Mode) */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          --shadow-huge: 0 20px 25px -5px rgba(0, 0, 0, 0.8);
        }

        /* Floating Theme Toggle */
        .theme-toggle-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.1);
          border-color: var(--primary);
        }

        /* Header Animation */
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* --- TOP HEADER (Replaces Sidebar) --- */}
      <header
        style={{
          height: "70px",
          backgroundColor: "var(--bg-header)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px", // Contained width
          position: "sticky",
          top: 0,
          zIndex: 50,
          animation: "slideDown 0.5s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo / Brand Area */}
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "var(--primary)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <CheckCircle2 size={22} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Candidate Portal
          </span>
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--text-secondary)",
              padding: "8px 16px",
              borderRadius: "20px",
              backgroundColor: "var(--bg-main)",
            }}
          >
            <LifeBuoy size={16} />
            <span style={{ display: "none", md: "inline" }}>Support</span>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1200px", // Constrain width for better readability on big screens
          margin: "0 auto",
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: "var(--text-muted)",
          fontSize: "13px",
          borderTop: "1px solid var(--border-color)",
          marginTop: "auto", // Pushes footer to bottom
        }}
      >
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Deepmind Assessment Platform. All rights reserved.
        </p>
      </footer>

      {/* --- FLOATING THEME TOGGLE --- */}
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
        title="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <Sun size={22} fill="#fbbf24" color="#fbbf24" />
        ) : (
          <Moon size={22} fill="#4b5563" color="#4b5563" />
        )}
      </button>
    </div>
  );
};

export default CandidateLayout;
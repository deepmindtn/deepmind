import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "../Sidebar";
import { Menu, Sun, Moon } from "lucide-react";

const LayoutComponent = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme with localStorage and Body class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme'); // Apply here so Modals see it
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const SIDEBAR_LEFT_OFFSET = 14;
  const currentSidebarWidth = isSidebarOpen ? 280 : 88;
  const dynamicMargin = isMobile ? 0 : (SIDEBAR_LEFT_OFFSET + currentSidebarWidth);

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme' : ''}`} 
         style={{ display: 'flex', backgroundColor: 'var(--bg-main)', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      
      <style>{`
        :root {
    /* Main Branding & Accents */
    --primary: #10b981;
    --primary-light: #ecfdf5;
    --primary-dark: #059669;
    --secondary: #14b8a6;
    
    /* Semantic Colors (Light Mode) */
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
    --card-bg: #1e293b;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border-color: #334155;

    /* Shadows (Dark Mode - subtle depth) */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    --shadow-huge: 0 20px 25px -5px rgba(0, 0, 0, 0.8);
  }

        .theme-toggle-btn {
          position: fixed;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          box-shadow: var(--shadow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle-btn:hover {
          transform: translateY(-50%) scale(1.1);
          border-color: var(--primary-emerald);
        }

        .mobile-top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          z-index: 100;
        }

        .mobile-logo-text {
          font-weight: 800;
          color: var(--primary-emerald);
          font-size: 18px;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 150;
        }

        @media (max-width: 768px) {
          .theme-toggle-btn {
            top: auto;
            bottom: 24px;
            right: 24px;
            transform: none;
          }
          .theme-toggle-btn:hover {
            transform: scale(1.1);
          }
        }
      `}</style>

      {/* Floating Mode Switcher */}
      <button 
        className="theme-toggle-btn" 
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <Sun size={20} className="sun-icon" fill="#fbbf24" color="#fbbf24" />
        ) : (
          <Moon size={20} className="moon-icon" fill="#4b5563" color="#4b5563" />
        )}
      </button>
      
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
        isDarkMode={isDarkMode} // Pass theme to sidebar if needed
      />

      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: dynamicMargin,
          transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          padding: isMobile ? '16px' : '24px',
          paddingTop: isMobile ? '80px' : '24px',
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary)' // Apply global text color
        }}
      >
        {isMobile && (
          <header className="mobile-top-nav">
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
              onClick={toggleSidebar}
            >
              <Menu size={24} color="#10b981" />
            </button>
            <span className="mobile-logo-text">DeepMind</span>
            <div style={{ width: 40 }} />
          </header>
        )}

        {children}
      </div>
    </div>
  );
};

LayoutComponent.propTypes = { children: PropTypes.node.isRequired };
export default LayoutComponent;
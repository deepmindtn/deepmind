import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "../Sidebar";
import { Menu } from "lucide-react"; // Import Menu icon

const LayoutComponent = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true); // Always open on desktop
      else setIsSidebarOpen(false); // Always closed on resize to mobile
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const SIDEBAR_LEFT_OFFSET = 14;
  const currentSidebarWidth = isSidebarOpen ? 280 : 88;
  const dynamicMargin = isMobile ? 0 : (SIDEBAR_LEFT_OFFSET + currentSidebarWidth);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Mobile Overlay: Only shows when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - we pass isMobile to handle specific mobile logic like closing on click */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
      />

      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: dynamicMargin,
          transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          padding: isMobile ? '16px' : '24px', // Tighter padding on mobile
          paddingTop: isMobile ? '80px' : '24px', // Leave room for Mobile Header
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mobile Header: Fixed top bar for the menu button */}
        {isMobile && (
          <header className="mobile-top-nav">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} color="#10b981" />
            </button>
            <span className="mobile-logo-text">DeepMind</span>
            <div style={{ width: 40 }} /> {/* Spacer for centering */}
          </header>
        )}

        {children}
      </div>
    </div>
  );
};

LayoutComponent.propTypes = { children: PropTypes.node.isRequired };
export default LayoutComponent;
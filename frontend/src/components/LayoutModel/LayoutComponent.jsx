import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "../Sidebar";

const LayoutComponent = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // open by default
  const [userName, setUserName] = useState('Guest');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // collapsed on mobile by default
      } else {
        setIsSidebarOpen(true); // expanded on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.userName || 'Guest');
      } catch {
        setUserName('Guest');
      }
    }
  }, []);

  // Dynamic sidebar width
  const sidebarWidth = isSidebarOpen ? 280 : 80; // match your Sidebar CSS

  return (
    <div className="dashboard-layout" style={{ display: 'flex' }}>
      <Sidebar 
        userName={userName} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
      />

      <div
        className="main-content"
        style={{
          flex: 1,
          padding: '1rem',
          marginLeft: isMobile ? 0 : sidebarWidth, // dynamic margin
          transition: 'margin-left 0.4s ease',
          minHeight: '100vh',
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
        }}
      >
        {children}
      </div>
    </div>
  );
};

LayoutComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LayoutComponent;

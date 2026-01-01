import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Sidebar from "../Sidebar";

const LayoutComponent = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // open on mobile by default
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

  return (
    <div className="dashboard-layout" style={{ display: 'flex' }}>
      <Sidebar 
        userName={userName} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
      />
      <div className="main-content" style={{ flex: 1, padding: '1rem' }}>
        {children}
      </div>
    </div>
  );
};

LayoutComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LayoutComponent;

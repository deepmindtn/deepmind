import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ label, value, change, icon, color }) => (
  <div className="stat-card">
    <div className="stat-content">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-change positive">↗ {change}</p>
      </div>
      <div className={`stat-icon-container ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'purple']).isRequired
};

export default StatCard;

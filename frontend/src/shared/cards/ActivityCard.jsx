import React from 'react';
import PropTypes from 'prop-types';

const ActivityCard = ({ icon, color, main, sub, time }) => (
  <div className="activity-item">
    <div className={`activity-icon-container ${color}`}>
      {icon}
    </div>
    <div className="activity-content">
      <p className="activity-main">{main}</p>
      <p className="activity-sub">{sub}</p>
    </div>
    <span className="activity-time">{time}</span>
  </div>
);

ActivityCard.propTypes = {
  icon: PropTypes.element.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'purple']).isRequired,
  main: PropTypes.string.isRequired,
  sub: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired
};

export default ActivityCard;

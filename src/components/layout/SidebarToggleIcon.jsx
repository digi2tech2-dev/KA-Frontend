import React from 'react';

const SidebarToggleIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={`sidebar-toggle-icon ${className}`}
  >
    <path d="M3.9 6.7h16.2M3.9 12h16.2M3.9 17.3h16.2" className="sidebar-toggle-icon__content" />
  </svg>
);

export default SidebarToggleIcon;

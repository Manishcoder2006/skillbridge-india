import React from 'react';
import { Menu } from 'lucide-react';

export const Header = ({ toggleMobileMenu }) => {
  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <span className="announcement-left">SKILLBRIDGE INDIA  •  CONNECTING TALENT WITH OPPORTUNITY</span>
      </div>

      <div className="header-right">
        <span className="announcement-right">STUDENTS  •  ACADEMIA  •  INDUSTRY</span>
      </div>
    </header>
  );
};

import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';

export const Header = ({ toggleMobileMenu }) => {
  const { user, role } = useAuth();

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#20B8A6',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            className="announcement-left"
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#071019',
            }}
          >
            SKILLBRIDGE INDIA <span style={{ color: '#94a3b8', margin: '0 0.35rem' }}>•</span> <span style={{ color: '#475569', fontWeight: 600 }}>CONNECTING TALENT WITH OPPORTUNITY</span>
          </span>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="announcement-right" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
          STUDENTS &nbsp;•&nbsp; ACADEMIA &nbsp;•&nbsp; INDUSTRY
        </span>
        {role && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid #e2e8f0' }}>
            <Badge role={role} />
            {user?.full_name && (
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#071019', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

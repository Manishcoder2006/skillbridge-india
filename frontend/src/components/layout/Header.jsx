import React from 'react';
import { Menu, Building, Shield, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';

export const Header = ({ toggleMobileMenu }) => {
  const { user, role, logout } = useAuth();

  const getTenantDisplay = () => {
    if (role === 'super_admin') {
      return (
        <div className="tenant-badge" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          <Shield size={14} />
          <span>Global Platform Scope</span>
        </div>
      );
    }
    if (role === 'industry_hr') {
      return (
        <div className="tenant-badge" style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber-dark)' }}>
          <Building size={14} />
          <span>Corporate Tenancy</span>
        </div>
      );
    }
    return (
      <div className="tenant-badge">
        <Building size={14} />
        <span>Institution Isolated</span>
      </div>
    );
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={toggleMobileMenu}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-700)',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        {getTenantDisplay()}
      </div>

      <div className="header-right">
        {user?.role && <Badge role={user.role} />}
        {user?.verification_status && <Badge status={user.verification_status} />}

        <div className="user-profile-menu">
          <div className="user-avatar">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }} className="user-info-desktop">
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.full_name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

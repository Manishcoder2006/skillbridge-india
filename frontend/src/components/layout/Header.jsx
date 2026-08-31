import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Building, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';

export const Header = ({ toggleMobileMenu }) => {
  const { user, role } = useAuth();

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

  const getProfileRoute = () => {
    switch (role) {
      case 'student':
        return '/dashboard/student/profile';
      case 'academician':
        return '/dashboard/academician/profile';
      case 'industry_hr':
        return '/dashboard/industry/profile';
      default:
        return '/dashboard/student/profile';
    }
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

        {/* Small circular profile avatar in top-right as direct navigation trigger to My Profile */}
        <Link
          to={getProfileRoute()}
          className="user-avatar-link"
          aria-label="View My Profile"
          title="View My Profile"
        >
          <div className="user-avatar">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

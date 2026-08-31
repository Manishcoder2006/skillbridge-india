import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  User,
  Brain,
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  FileCheck2,
  Building2,
  Users,
  Layers,
  ShieldCheck,
  LogOut,
  X,
  Bell,
  GraduationCap,
  Handshake,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const { user, role, logout } = useAuth();

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
          { label: 'My Profile', path: '/dashboard/student/profile', icon: User },
          { label: 'Skills & Career', path: '/dashboard/student/skills', icon: BarChart3 },
          { label: 'Skill Assessment', path: '/dashboard/student/assessments', icon: Brain },
          { label: 'Learning', path: '/dashboard/student/learning', icon: BookOpen },
          { label: 'Jobs & Internships', path: '/dashboard/student/opportunities', icon: Briefcase },
          { label: 'Applications', path: '/dashboard/student/applications', icon: FileText },
          { label: 'Resume Builder', path: '/dashboard/student/resume', icon: FileCheck2 },
        ];
      case 'academician':
        return [
          { label: 'Dashboard', path: '/dashboard/academician', icon: LayoutDashboard },
          { label: 'My Profile', path: '/dashboard/academician/profile', icon: User },
          { label: 'My Students', path: '/dashboard/academician/students', icon: GraduationCap },
          { label: 'Student Analytics', path: '/dashboard/academician/analytics', icon: BarChart3 },
          { label: 'Learning Content', path: '/dashboard/academician/content', icon: BookOpen },
          { label: 'Opportunities', path: '/dashboard/academician/opportunities', icon: Briefcase },
          { label: 'Collaboration', path: '/dashboard/academician/collaboration', icon: Handshake },
          { label: 'Notifications', path: '/dashboard/academician/notifications', icon: Bell },
        ];
      case 'industry_hr':
        return [
          { label: 'Dashboard', path: '/dashboard/industry', icon: LayoutDashboard },
          { label: 'Company Profile', path: '/dashboard/industry/profile', icon: Building2 },
          { label: 'Jobs & Internships', path: '/dashboard/industry/postings', icon: Briefcase },
          { label: 'AI Candidate Matching', path: '/dashboard/industry/matching', icon: Brain },
          { label: 'Candidates & Applications', path: '/dashboard/industry/candidates', icon: Users },
          { label: 'Learning & Collaboration', path: '/dashboard/industry/collaboration', icon: Handshake },
          { label: 'Analytics', path: '/dashboard/industry/analytics', icon: BarChart3 },
        ];
      case 'institution_admin':
        return [
          { label: 'Institution Dashboard', path: '/dashboard/institution', icon: LayoutDashboard },
          { label: 'Department Management', path: '/dashboard/institution/departments', icon: Building2 },
          { label: 'Faculty & Student Roster', path: '/dashboard/institution/members', icon: Users },
        ];
      case 'super_admin':
        return [
          { label: 'Platform Super Admin', path: '/dashboard/admin', icon: ShieldCheck },
          { label: 'Institutions Directory', path: '/dashboard/admin/institutions', icon: Building2 },
          { label: 'System Health & RLS', path: '/dashboard/admin/system', icon: Layers },
        ];
      default:
        return [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Subtle Geometric Constellation Line Art */}
      <svg
        className="sidebar-constellation-bg"
        viewBox="0 0 260 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="180" r="2.5" fill="#20B8A6" />
        <circle cx="80" cy="120" r="3" fill="#20B8A6" />
        <circle cx="160" cy="190" r="2" fill="#20B8A6" />
        <circle cx="220" cy="140" r="3" fill="#20B8A6" />
        <circle cx="110" cy="220" r="2.5" fill="#20B8A6" />
        <path
          d="M20 180L80 120M80 120L160 190M160 190L220 140M80 120L110 220M110 220L160 190M20 180L110 220"
          stroke="#20B8A6"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="2 3"
        />
      </svg>

      {/* Sidebar Header with Unified SB Logo */}
      <div className="sidebar-header">
        <Logo theme="dark" size="sm" variant="compact" to="/" />
        <button
          onClick={closeMobileMenu}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: isMobileOpen ? 'block' : 'none',
          }}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              end={item.path === '/dashboard/student' || item.path === '/dashboard/academician' || item.path === '/dashboard/industry' || item.path === '/dashboard/institution' || item.path === '/dashboard/admin'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            SIH 2026 Foundation
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
            Problem Statement 26044
          </div>
        </div>

        <button
          onClick={logout}
          className="nav-item"
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            color: '#f87171',
            padding: '0.625rem 0.875rem',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

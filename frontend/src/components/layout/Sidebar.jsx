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

export const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const { user, role, logout } = useAuth();

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
          { label: 'My Profile', path: '/dashboard/student/profile', icon: User },
          { label: 'Skill Assessment', path: '/dashboard/student/assessments', icon: Brain },
          { label: 'Skills & Career', path: '/dashboard/student/skills', icon: BarChart3 },
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
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-brand" onClick={closeMobileMenu}>
          <div className="brand-badge">SB</div>
          <span>SkillBridge India</span>
        </NavLink>
        <button
          onClick={closeMobileMenu}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: isMobileOpen ? 'block' : 'none',
          }}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', padding: '0.5rem 0.875rem' }}>
          Student Ecosystem
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              end={item.path === '/dashboard/student'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize' }}>
              {role?.replace('_', ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm btn-block"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#f87171', borderColor: 'transparent' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

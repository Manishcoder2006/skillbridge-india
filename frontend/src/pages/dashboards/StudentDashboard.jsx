import React from 'react';
import { GraduationCap, ShieldCheck, BookOpen, Layers, Award, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Portal Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.full_name || 'Student'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge role="student" />
          <Badge status="verified" />
        </div>
      </div>

      {/* Tenancy & Identity Card */}
      <Card style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#166534', marginBottom: '0.25rem' }}>
              Student Privacy & Institutional Isolation Active
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: 1.4 }}>
              Your private student profile and academic metrics are strictly isolated within your registered institution.
              Cross-institutional access is blocked by Row Level Security (RLS).
            </p>
          </div>
        </div>
      </Card>

      {/* Foundation Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Academic Record</div>
            <div className="stat-value">Active</div>
            <div className="stat-sub">Semester 6 &bull; Roll: 2026CS101</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Skill Mapping</div>
            <div className="stat-value">Phase 1 Ready</div>
            <div className="stat-sub">Awaiting Phase 2 AI Mapping</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Internships & Placement</div>
            <div className="stat-value">Foundation Ready</div>
            <div className="stat-sub">Enterprise portal connected</div>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card title="Student Profile Overview (Phase 1 Foundation)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</span>
            <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Email</span>
            <div style={{ fontWeight: 600 }}>{user?.email}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role Clearance</span>
            <div><Badge role="student" /></div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenancy Status</span>
            <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>Institutional Isolation Enforced</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

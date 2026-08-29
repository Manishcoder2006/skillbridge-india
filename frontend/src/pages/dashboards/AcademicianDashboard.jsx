import React from 'react';
import { Building2, Users, BookOpen, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AcademicianDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty & Academician Portal</h1>
          <p className="page-subtitle">Welcome, {user?.full_name || 'Professor'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge role="academician" />
          <Badge status="verified" />
        </div>
      </div>

      {/* Department Scoping Security Card */}
      <Card style={{ marginBottom: '1.5rem', backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#ede9fe',
              color: '#6d28d9',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#5b21b6', marginBottom: '0.25rem' }}>
              Department-Scoped Access Clearance Active
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6d28d9', lineHeight: 1.4 }}>
              Security Rule 5 Enforced: Your access permissions are securely scoped to your assigned academic department.
              Unrestricted cross-department or unauthorized student access is prevented by database RLS policies.
            </p>
          </div>
        </div>
      </Card>

      {/* Foundation Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Department Scope</div>
            <div className="stat-value">Computer Science</div>
            <div className="stat-sub">Faculty / Academician</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Mentored Students</div>
            <div className="stat-value">Department Scoped</div>
            <div className="stat-sub">Assigned student cohort</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Curriculum Alignment</div>
            <div className="stat-value">Phase 1 Ready</div>
            <div className="stat-sub">Industry skill mapping ready</div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <Card title="Academic Profile & Clearance Overview">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Faculty Name</span>
            <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Email</span>
            <div style={{ fontWeight: 600 }}>{user?.email}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Access Tier</span>
            <div style={{ fontWeight: 600, color: '#6d28d9' }}>Department-Level Faculty Scope</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification Status</span>
            <div><Badge status={user?.verification_status || 'verified'} /></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

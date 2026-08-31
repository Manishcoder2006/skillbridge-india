import React from 'react';
import { Briefcase, Building, Users, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const IndustryDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Industry & Corporate HR Portal</h1>
          <p className="page-subtitle">Welcome, {user?.full_name || 'HR Partner'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge role="industry_hr" />
          <Badge status="verified" />
        </div>
      </div>

      {/* Corporate Tenancy Card */}
      <Card style={{ marginBottom: '1.5rem', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#92400e', marginBottom: '0.25rem' }}>
              Corporate Tenancy Decoupled from Academic Tenancy
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#b45309', lineHeight: 1.4 }}>
              Security Rule 7 Enforced: Industry / HR organizations operate within an independent corporate tenancy domain.
              Corporate postings and candidate discovery are safely governed.
            </p>
          </div>
        </div>
      </Card>

      {/* Foundation Metric Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Corporate Organization</div>
            <div className="stat-value">TCS / Corporate</div>
            <div className="stat-sub">Industry HR Lead</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Talent Discovery</div>
            <div className="stat-value">Phase 1 Ready</div>
            <div className="stat-sub">Curated skill benchmarks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <Building size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-title">Institutional Outreach</div>
            <div className="stat-value">4+ Institutes</div>
            <div className="stat-sub">Verified network access</div>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <Card title="Corporate Profile & Outreach Status">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Representative</span>
            <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Email</span>
            <div style={{ fontWeight: 600 }}>{user?.email}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization Tenancy</span>
            <div style={{ fontWeight: 600, color: 'var(--accent-amber-dark)' }}>Corporate Domain (Non-Academic)</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification Clearance</span>
            <div><Badge status="verified" /></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

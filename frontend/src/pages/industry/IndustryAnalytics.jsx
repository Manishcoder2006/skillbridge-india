import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Compass,
} from 'lucide-react';
import {
  RolePageHeader,
  RoleStatCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const IndustryAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await apiService.getIndustryAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load recruitment analytics:', err);
      setError('Unable to load corporate recruitment analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating recruitment funnel and skill demand analytics..." />;
  }

  if (error && !analytics) {
    return (
      <div className="portal-page">
        <ErrorState
          title="Recruitment Analytics Unavailable"
          message={error}
          onRetry={() => fetchAnalytics()}
        />
      </div>
    );
  }

  const funnel = analytics?.recruitment_funnel || {};
  const statusDist = analytics?.status_breakdown || {};
  const totalApps = analytics?.total_applications_received || 0;
  const inDemandSkills = analytics?.top_in_demand_skills || [];
  const shortlistCount = funnel.shortlisted || statusDist.shortlisted || 0;
  const shortlistRate = totalApps > 0 ? Math.round((shortlistCount / totalApps) * 100) : 0;

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Corporate Recruitment Analytics"
        subtitle={`Enterprise Talent Analytics • ${analytics?.company_name || 'Organization'}`}
        description="Recruitment pipeline progression, hiring funnel conversion, applicant status distribution, and technical skill requirement benchmarks."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="portal-btn secondary"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        }
      />

      {/* 2. Top Metric Cards */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Total Applications"
          value={totalApps}
          subtext="Cumulative Candidate Inflow"
          icon={Users}
          variant="blue"
        />
        <RoleStatCard
          title="Job Vacancies Posted"
          value={analytics?.total_job_postings || 0}
          subtext="Full-Time Engineering Openings"
          icon={Briefcase}
          variant="teal"
        />
        <RoleStatCard
          title="Internship Postings"
          value={analytics?.total_internship_postings || 0}
          subtext="University Cohort Positions"
          icon={TrendingUp}
          variant="purple"
        />
        <RoleStatCard
          title="Candidate Shortlist Rate"
          value={`${shortlistRate}%`}
          subtext={`${shortlistCount} Shortlisted`}
          subtextType="positive"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* 3. Recruitment Pipeline Funnel Visualization */}
      <div className="portal-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          Recruitment Conversion Funnel
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
          Hiring progression stages across all published job and internship openings.
        </p>

        <div className="portal-funnel">
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">1. Applied</div>
            <div className="portal-funnel-value">{funnel.applied ?? totalApps}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>100% Inflow</div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">2. Under Review</div>
            <div className="portal-funnel-value" style={{ color: '#b45309' }}>
              {funnel.under_review ?? 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              {totalApps > 0 ? Math.round(((funnel.under_review || 0) / totalApps) * 100) : 0}% of Total
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">3. Shortlisted</div>
            <div className="portal-funnel-value" style={{ color: '#6d28d9' }}>
              {funnel.shortlisted ?? 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              {totalApps > 0 ? Math.round(((funnel.shortlisted || 0) / totalApps) * 100) : 0}% of Total
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">4. Interview</div>
            <div className="portal-funnel-value" style={{ color: '#0f766e' }}>
              {funnel.interview ?? 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              {totalApps > 0 ? Math.round(((funnel.interview || 0) / totalApps) * 100) : 0}% of Total
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">5. Selected</div>
            <div className="portal-funnel-value" style={{ color: '#15803d' }}>
              {funnel.selected ?? 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              {totalApps > 0 ? Math.round(((funnel.selected || 0) / totalApps) * 100) : 0}% Hired
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Analytics: Status Breakdown + Top In-Demand Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Application Status Distribution */}
        <div className="portal-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieChart size={18} color="#0d9488" />
            Application Status Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(statusDist).length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>
                No status records available yet.
              </div>
            ) : (
              Object.entries(statusDist).map(([statusKey, count]) => {
                const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                return (
                  <div key={statusKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                        {statusKey.replace('_', ' ')}
                      </span>
                      <span style={{ color: '#64748b' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background:
                            statusKey === 'selected'
                              ? '#15803d'
                              : statusKey === 'interview'
                              ? '#0d9488'
                              : statusKey === 'shortlisted'
                              ? '#7c3aed'
                              : statusKey === 'under_review'
                              ? '#d97706'
                              : statusKey === 'rejected'
                              ? '#dc2626'
                              : '#2563eb',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Top In-Demand Skills */}
        <div className="portal-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={18} color="#0d9488" />
            Top Skill Requirements in Postings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {inDemandSkills.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>
                Skill demand data will appear as positions are published with required skill tags.
              </div>
            ) : (
              inDemandSkills.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#f0fdf9',
                        color: '#0d9488',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                      {item.skill}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                    }}
                  >
                    {item.demand_count} Openings
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Source-Level Telemetry Notice (EmptyState) */}
      <EmptyState
        icon={Compass}
        title="Source-Level Candidate Attribution in Progress"
        description="Candidate source attribution (referrals, direct college placement portals, national hackathon pipelines) will populate once source-level application tracking telemetry is fully enabled."
      />
    </div>
  );
};

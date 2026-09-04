import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  PlusCircle,
  Brain,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  UserCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  RolePageHeader,
  RoleStatCard,
  ResponsiveTable,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const IndustryOverview = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await apiService.getIndustryDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load industry dashboard summary:', err);
      setError('Unable to load recruitment dashboard data. Please verify your recruiter session.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return <LoadingState message="Loading corporate recruitment intelligence and candidate pipeline..." />;
  }

  if (error) {
    return (
      <div className="portal-page">
        <ErrorState
          title="Recruiter Authentication Required"
          message={error}
          onRetry={() => fetchSummary()}
        />
      </div>
    );
  }

  const company = summary?.company || {};
  const isVerified = company.verification_status === 'verified';
  const recentApps = summary?.recent_applications || [];
  const recentPostings = summary?.recent_postings || [];

  // Table Column Definitions for Recent Applications
  const applicationColumns = [
    {
      key: 'candidate_name',
      header: 'Candidate',
      isPrimary: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.candidate_name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.candidate_institution} &bull; {row.candidate_department}
          </div>
        </div>
      ),
    },
    {
      key: 'opportunity_title',
      header: 'Applied Role',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{row.opportunity_title}</div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#0d9488',
            }}
          >
            {row.opportunity_type}
          </span>
        </div>
      ),
    },
    {
      key: 'skill_match_percent',
      header: 'Skill Match',
      render: (row) => (
        <span
          className={`portal-score-badge ${
            row.skill_match_percent >= 80 ? 'high' : row.skill_match_percent >= 60 ? 'moderate' : 'low'
          }`}
        >
          {row.skill_match_percent}%
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      isBadge: true,
      render: (row) => (
        <span className={`portal-status-badge ${row.status}`}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Link
          to="/dashboard/industry/candidates"
          className="portal-btn secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem', textDecoration: 'none' }}
        >
          Review
        </Link>
      ),
    },
  ];

  return (
    <div className="portal-page">
      {/* 1. Recruiter Enterprise Header */}
      <RolePageHeader
        title={company.name || 'Corporate Recruitment Portal'}
        subtitle={
          company.headquarters_city
            ? `${company.industry_type || 'Industry Partner'} • ${company.headquarters_city}, ${company.headquarters_state || 'India'}`
            : company.industry_type || 'Enterprise Recruiter'
        }
        description="Unified corporate talent intelligence workspace for managing job openings, screening applicants, executing AI candidate matching, and tracking hiring funnel conversion."
        badge={
          company.code ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                background: '#f0fdfa',
                color: '#0d9488',
                border: '1px solid #ccfbf1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              <Building2 size={12} />
              {company.code} &bull; {company.company_type || 'Corporate'}
            </span>
          ) : null
        }
        actions={
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="portal-btn secondary"
              onClick={() => fetchSummary(true)}
              disabled={refreshing}
              title="Refresh Recruitment Pipeline"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
            <Link
              to="/dashboard/industry/matching"
              className="portal-btn secondary"
              style={{ textDecoration: 'none' }}
            >
              <Brain size={15} />
              AI Matching
            </Link>
            <Link
              to="/dashboard/industry/postings"
              className="portal-btn primary"
              style={{ textDecoration: 'none' }}
            >
              <PlusCircle size={16} />
              Post New Role
            </Link>
          </div>
        }
      />

      {/* 2. Recruitment Funnel Stat Cards */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Active Job Openings"
          value={summary?.active_jobs ?? 0}
          subtext="Full-Time Engineering Roles"
          icon={Briefcase}
          variant="teal"
        />
        <RoleStatCard
          title="Active Internships"
          value={summary?.active_internships ?? 0}
          subtext="Academic Internships"
          icon={TrendingUp}
          variant="blue"
        />
        <RoleStatCard
          title="Total Applications"
          value={summary?.total_applications ?? 0}
          subtext="Received Across Campuses"
          icon={Users}
          variant="purple"
        />
        <RoleStatCard
          title="Awaiting Review"
          value={summary?.awaiting_review ?? 0}
          subtext="Pending Screening"
          subtextType={summary?.awaiting_review > 0 ? 'attention' : 'neutral'}
          icon={Clock}
          variant="amber"
        />
        <RoleStatCard
          title="Shortlisted"
          value={summary?.shortlisted_candidates ?? 0}
          subtext="Ready for Next Rounds"
          subtextType="positive"
          icon={CheckCircle2}
          variant="emerald"
        />
        <RoleStatCard
          title="Interviews"
          value={summary?.interviews_scheduled ?? 0}
          subtext="Scheduled Technical Rounds"
          icon={Calendar}
          variant="teal"
        />
      </div>

      {/* 3. Visual Recruitment Funnel */}
      <div className="portal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recruitment Conversion Funnel
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Real-time candidate progression through screening and evaluation stages.
            </p>
          </div>
          <Link
            to="/dashboard/industry/candidates"
            style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d9488', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span>Full Pipeline</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="portal-funnel">
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">Total Applied</div>
            <div className="portal-funnel-value">{summary?.total_applications ?? 0}</div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">Under Review</div>
            <div className="portal-funnel-value" style={{ color: '#b45309' }}>
              {summary?.awaiting_review ?? 0}
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">Shortlisted</div>
            <div className="portal-funnel-value" style={{ color: '#6d28d9' }}>
              {summary?.shortlisted_candidates ?? 0}
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">Interview</div>
            <div className="portal-funnel-value" style={{ color: '#0f766e' }}>
              {summary?.interviews_scheduled ?? 0}
            </div>
          </div>
          <div className="portal-funnel-step">
            <div className="portal-funnel-label">Selected</div>
            <div className="portal-funnel-value" style={{ color: '#15803d' }}>
              {summary?.selected_candidates ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Two-Column Section: Recent Applications + Recent Postings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Recent Applications */}
        <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Candidate Applications
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Latest submissions from affiliated colleges
              </p>
            </div>
            <Link
              to="/dashboard/industry/candidates"
              className="portal-btn secondary"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem', textDecoration: 'none' }}
            >
              View All ({summary?.total_applications ?? 0})
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Applications Received Yet"
              description="Candidate applications will appear here as students discover and apply to your open postings."
            />
          ) : (
            <ResponsiveTable
              columns={applicationColumns}
              data={recentApps.slice(0, 5)}
            />
          )}
        </div>

        {/* Right Column: Active Job & Internship Postings */}
        <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Active Opportunities
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Currently published campus recruitment drives
              </p>
            </div>
            <Link
              to="/dashboard/industry/postings"
              className="portal-btn secondary"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem', textDecoration: 'none' }}
            >
              Manage Postings
            </Link>
          </div>

          {recentPostings.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No Active Postings"
              description="Publish jobs or internship opportunities to attract top engineering talent."
              action={
                <Link
                  to="/dashboard/industry/postings"
                  className="portal-btn primary"
                  style={{ textDecoration: 'none' }}
                >
                  <PlusCircle size={15} />
                  Post First Opportunity
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentPostings.slice(0, 4).map((posting) => (
                <div
                  key={posting.id}
                  style={{
                    padding: '0.85rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {posting.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                      <span style={{ textTransform: 'capitalize', color: '#0d9488', fontWeight: 600 }}>
                        {posting.type}
                      </span>{' '}
                      &bull; {posting.location || 'Remote'} &bull; Deadline:{' '}
                      {posting.application_deadline ? new Date(posting.application_deadline).toLocaleDateString() : 'Rolling'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      {posting.applications_count ?? 0}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Applied</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  RolePageHeader,
  RoleStatCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';
import {
  Users,
  AlertTriangle,
  Brain,
  BookOpen,
  Briefcase,
  Handshake,
  Bell,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AcademicianOverview = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAcademicianSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load academician summary:', err);
      setError('Unable to load faculty dashboard metrics. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading faculty dashboard and cohort metrics..." />;
  }

  if (error) {
    return <ErrorState title="Dashboard Error" message={error} onRetry={fetchSummary} />;
  }

  const academician = summary?.academician || {};
  const metrics = summary?.cohort_metrics || {};
  const needsAttention = summary?.students_needing_attention || [];
  const notifications = summary?.unread_notifications || [];

  return (
    <div className="portal-page">
      {/* 1. Page Header */}
      <RolePageHeader
        title={`Welcome, ${academician.full_name || user?.full_name || 'Faculty Member'}`}
        subtitle={`${academician.department_name || 'Computer Science & Engineering'} • ${academician.institution_name || 'Academic Institution'}`}
        badge={<Badge role="academician" />}
        description="Monitor cohort skill proficiency, address diagnostic skill gaps, recommend industry opportunities, and mentor academic batches."
        actions={
          <>
            <Link
              to="/dashboard/academician/students"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                minHeight: '42px',
                padding: '0 1.1rem',
              }}
            >
              <Users size={16} /> Manage Student Roster
            </Link>
            <Link
              to="/dashboard/academician/content"
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                minHeight: '42px',
                padding: '0 1.1rem',
              }}
            >
              <BookOpen size={16} /> Curate Content
            </Link>
          </>
        }
      />

      {/* 2. Key Faculty & Student KPI Metrics Grid */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Authorized Students"
          value={metrics.total_authorized_students || 0}
          subtext="Enrolled department cohort"
          icon={Users}
          variant="blue"
        />
        <RoleStatCard
          title="Requires Attention"
          value={metrics.students_needing_attention || 0}
          subtext={metrics.students_needing_attention > 0 ? "Skill deficits detected" : "All students on track"}
          subtextType={metrics.students_needing_attention > 0 ? "attention" : "positive"}
          icon={AlertTriangle}
          variant="rose"
        />
        <RoleStatCard
          title="Assessment Rate"
          value={`${metrics.assessment_participation_rate || 0}%`}
          subtext={`Avg score: ${metrics.average_cohort_score || 0}%`}
          subtextType="positive"
          icon={Brain}
          variant="emerald"
        />
        <RoleStatCard
          title="Learning Modules"
          value={metrics.active_learning_resources || 0}
          subtext="Faculty curated"
          icon={BookOpen}
          variant="purple"
        />
        <RoleStatCard
          title="Opportunity Recs"
          value={metrics.active_recommendations || 0}
          subtext="Shared with cohort"
          icon={Briefcase}
          variant="amber"
        />
        <RoleStatCard
          title="Industry Initiatives"
          value={metrics.open_collaborations || 0}
          subtext="FDPs & partnerships"
          icon={Handshake}
          variant="teal"
        />
      </div>

      {/* 3. Main Sections: Students Needing Attention & Department Notifications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: '1.25rem',
          width: '100%',
        }}
      >
        {/* Students Requiring Academic Attention */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.35rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#e11d48" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Students Requiring Academic Attention
              </h3>
            </div>
            <Link
              to="/dashboard/academician/students?status=needs_attention"
              style={{
                fontSize: '0.8125rem',
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View Roster <ArrowRight size={14} />
            </Link>
          </div>

          {needsAttention.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All Students On Track"
              description="No active students have assessment scores below the academic threshold or unresolved critical skill gaps."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {needsAttention.map((st) => (
                <div
                  key={st.id}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.875rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: '180px', flex: '1 1 200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a' }}>
                        {st.full_name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: '#ffffff',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                        }}
                      >
                        Sem {st.current_semester}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      CGPA: <strong style={{ color: '#0f172a' }}>{st.cgpa}</strong> • Assessment Score:{' '}
                      <strong style={{ color: '#e11d48' }}>{st.latest_assessment_score}%</strong>
                    </div>
                    {st.skill_gaps && st.skill_gaps.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {st.skill_gaps.map((gap, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              fontWeight: 600,
                            }}
                          >
                            Gap: {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/dashboard/academician/students?view=${st.id}`}
                    className="btn btn-outline"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.4rem 0.75rem',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      minHeight: '36px',
                    }}
                  >
                    Inspect Record
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Notifications & Quick Actions */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.35rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#0d9488" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Department Announcements & Alerts
              </h3>
            </div>
            <Link
              to="/dashboard/academician/notifications"
              style={{
                fontSize: '0.8125rem',
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              All Alerts ({summary?.unread_notifications_count || 0}) <ArrowRight size={14} />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Notifications"
              description="No active announcements or pending academic alerts for your department."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    background: notif.is_read ? '#f8fafc' : '#f0fdf9',
                    border: notif.is_read ? '1px solid #e2e8f0' : '1px solid #ccfbf1',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notif.is_read ? 'transparent' : '#0d9488',
                      marginTop: '0.45rem',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions Bar */}
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.6rem' }}>
              Direct Faculty Portals
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <Link
                to="/dashboard/academician/analytics"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.825rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  minHeight: '42px',
                }}
              >
                <TrendingUp size={15} color="#0d9488" /> Skill Analytics
              </Link>
              <Link
                to="/dashboard/academician/collaboration"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.825rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  minHeight: '42px',
                }}
              >
                <Handshake size={15} color="#2563eb" /> Industry Collab
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

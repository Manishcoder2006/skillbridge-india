import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
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
  Award,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';

export const AcademicianOverview = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAcademicianSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load academician summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const academician = summary?.academician || {};
  const metrics = summary?.cohort_metrics || {};
  const needsAttention = summary?.students_needing_attention || [];
  const activities = summary?.recent_activities || [];
  const notifications = summary?.unread_notifications || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.15) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Badge variant="primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                🎓 Faculty & Department Portal
              </Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {academician.department_name} • {academician.institution_name}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
              Welcome, {academician.full_name || user?.full_name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.5 }}>
              Monitor student skill growth, curate learning resources, recommend industry opportunities, and collaborate with corporate partners.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard/academician/students"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <Users size={16} /> Manage Student Roster
            </Link>
            <Link
              to="/dashboard/academician/content"
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <BookOpen size={16} /> Add Learning Resource
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (6 Key KPI Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Authorized Students</span>
            <Users size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{metrics.total_authorized_students || 0}</div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
            <CheckCircle2 size={12} /> CSE Department Cohort
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Needs Attention</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{metrics.students_needing_attention || 0}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Skill gaps / low assessment
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Assessment Participation</span>
            <Brain size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{metrics.assessment_participation_rate || 0}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Avg score: {metrics.average_cohort_score || 0}%
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Learning Resources</span>
            <BookOpen size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{metrics.active_learning_resources || 0}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Curated by department
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Opportunity Recs</span>
            <Briefcase size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{metrics.active_recommendations || 0}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Shared with students
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Industry Initiatives</span>
            <Handshake size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>{metrics.open_collaborations || 0}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            FDPs & Joint R&D
          </span>
        </Card>
      </div>

      {/* Main Grid: Students Needing Attention & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Students Needing Attention */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Students Requiring Academic Attention
              </h3>
            </div>
            <Link
              to="/dashboard/academician/students?status=needs_attention"
              style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              View all
            </Link>
          </div>

          {needsAttention.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>All authorized students are currently on track!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {needsAttention.map((st) => (
                <div
                  key={st.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'var(--color-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{st.full_name}</span>
                      <Badge variant="warning" style={{ fontSize: '0.75rem' }}>
                        Sem {st.current_semester}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      CGPA: <strong>{st.cgpa}</strong> • Last Score:{' '}
                      <strong style={{ color: '#ef4444' }}>{st.latest_assessment_score}%</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      {st.skill_gaps?.map((gap, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          Needs {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/academician/students?view=${st.id}`}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    View Record
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Notifications & Activity */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Department Announcements & Alerts
              </h3>
            </div>
            <Link
              to="/dashboard/academician/notifications"
              style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              All notifications ({summary?.unread_notifications_count || 0})
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: notif.is_read ? 'var(--color-bg)' : 'rgba(37, 99, 235, 0.06)',
                  border: notif.is_read ? '1px solid var(--color-border)' : '1px solid rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: notif.is_read ? 'transparent' : '#3b82f6',
                    marginTop: '0.4rem',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{notif.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.6rem' }}>
              ⚡ Quick Faculty Actions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <Link
                to="/dashboard/academician/analytics"
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                }}
              >
                <TrendingUp size={14} color="#10b981" /> Skill Analytics
              </Link>
              <Link
                to="/dashboard/academician/collaboration"
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                }}
              >
                <Handshake size={14} color="#8b5cf6" /> Industry Collab
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

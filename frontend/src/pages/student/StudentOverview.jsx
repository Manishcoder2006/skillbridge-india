import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  CheckCircle,
  TrendingUp,
  Brain,
  BookOpen,
  Briefcase,
  FileCheck2,
  ArrowRight,
  Target,
  Sparkles,
  Award,
  Clock,
} from 'lucide-react';

export const StudentOverview = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudentDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>👋</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Welcome back, {user?.full_name || 'Student'}
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px' }}>
            Track your verified competencies, bridge skill gaps with targeted learning, and discover curated job and internship opportunities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/student/assessments" className="btn btn-primary btn-sm">
            <Brain size={16} /> Take Assessment
          </Link>
          <Link to="/dashboard/student/resume" className="btn btn-secondary btn-sm">
            <FileCheck2 size={16} /> Resume Builder
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid-responsive grid-cols-4">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Profile Strength</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#14b8a6', marginTop: '0.25rem' }}>
                {summary?.profile_completion_percent || 85}%
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(20, 184, 166, 0.1)', borderRadius: 'var(--radius-md)', color: '#14b8a6' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', marginTop: '0.75rem' }}>
            <div
              style={{
                width: `${summary?.profile_completion_percent || 85}%`,
                background: '#14b8a6',
                height: '100%',
                borderRadius: '4px',
              }}
            />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Verified Skills</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
                {summary?.total_skills_count || 6}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: '#f59e0b' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            <Link to="/dashboard/student/skills" style={{ color: '#f59e0b', fontWeight: 600 }}>Manage Matrix &rarr;</Link>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Assessments Completed</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                {summary?.assessments_completed || 1}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 'var(--radius-md)', color: '#38bdf8' }}>
              <Brain size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            <span style={{ color: '#4ade80' }}>● Score: 80% Average</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Active Applications</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7', marginTop: '0.25rem' }}>
                {summary?.applications_count || 1}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-md)', color: '#a855f7' }}>
              <Briefcase size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            <Link to="/dashboard/student/applications" style={{ color: '#a855f7', fontWeight: 600 }}>Track Status &rarr;</Link>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid-responsive grid-cols-2">
        {/* Left Column: Career Readiness & Strengths */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Career Pathways */}
          <Card title="Career Role Readiness" subtitle="Deterministic skill match against industry standards">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summary?.career_paths?.map((path, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{path.role_name}</span>
                    <Badge variant={path.match_percentage >= 70 ? 'success' : 'warning'}>
                      {path.match_percentage}% Ready
                    </Badge>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px' }}>
                    <div
                      style={{
                        width: `${path.match_percentage}%`,
                        background: path.match_percentage >= 70 ? '#14b8a6' : '#f59e0b',
                        height: '100%',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Acquired:</span>
                    {path.acquired_skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(20,184,166,0.15)', color: '#14b8a6', padding: '2px 6px', borderRadius: '4px' }}>
                        ✓ {s}
                      </span>
                    ))}
                    {path.missing_skills.length > 0 && (
                      <>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>Gaps:</span>
                        {path.missing_skills.slice(0, 2).map((s, i) => (
                          <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 6px', borderRadius: '4px' }}>
                            + {s}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths & Identified Gaps */}
          <Card title="Skill Competency Diagnostic">
            <div className="grid-responsive grid-cols-2" style={{ gap: '1rem' }}>
              <div style={{ padding: '0.875rem', background: 'rgba(20, 184, 166, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(20, 184, 166, 0.15)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14b8a6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} /> Top Strengths
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {summary?.top_strengths?.map((st, i) => (
                    <Badge key={i} variant="success">{st}</Badge>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0.875rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Target size={14} /> Identified Skill Gaps
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {summary?.identified_gaps?.map((gp, i) => (
                    <Badge key={i} variant="danger">{gp}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Opportunities & Learning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recommended Opportunities */}
          <Card
            title="Curated Opportunities"
            subtitle="Matched based on your verified skills"
            action={<Link to="/dashboard/student/opportunities" style={{ fontSize: '0.8rem', color: '#14b8a6' }}>View All</Link>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary?.recommended_opportunities?.map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    padding: '0.875rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{opp.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{opp.company_name} • {opp.location}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <Badge variant="primary">{opp.type}</Badge>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>{opp.stipend_or_salary}</span>
                    </div>
                  </div>
                  <Link to="/dashboard/student/opportunities" className="btn btn-secondary btn-sm">
                    Details
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Learning */}
          <Card
            title="Targeted Learning"
            subtitle="Bridge your skill gaps with curated resources"
            action={<Link to="/dashboard/student/learning" style={{ fontSize: '0.8rem', color: '#14b8a6' }}>Explore Catalog</Link>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary?.recommended_learning?.map((res) => (
                <div
                  key={res.id}
                  style={{
                    padding: '0.875rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>{res.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{res.provider} • {res.duration}</div>
                  </div>
                  <Badge variant={res.progress_status === 'completed' ? 'success' : 'neutral'}>
                    {res.progress_status === 'completed' ? 'Done' : res.progress_status === 'in_progress' ? 'Learning' : 'Start'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  PieChart,
  Layers,
} from 'lucide-react';

export const StudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudentAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
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

  const {
    total_students = 0,
    average_cgpa = 0,
    average_assessment_score = 0,
    assessment_completion_rate = 0,
    learning_progress_rate = 0,
    top_verified_skills = [],
    top_skill_gaps = [],
    semester_distribution = {},
    readiness_distribution = {},
  } = analytics || {};

  const [aiInsights, setAiInsights] = useState(null);
  const [runningAI, setRunningAI] = useState(false);

  const handleRunAIInsights = async () => {
    try {
      setRunningAI(true);
      const res = await apiService.getAICohortInsights();
      setAiInsights(res);
    } catch (err) {
      console.error('Failed to load AI cohort insights:', err);
    } finally {
      setRunningAI(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              Department Cohort Intelligence
            </Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Computer Science & Engineering • Aggregated Metrics
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Student Skill Analytics & Placement Readiness
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Departmental insights into student skill proficiencies, assessment metrics, critical skill gaps, and industry readiness tiers.
          </p>
        </div>

        <button
          onClick={handleRunAIInsights}
          disabled={runningAI}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
          }}
        >
          <Sparkles size={16} /> {runningAI ? 'Synthesizing AI Cohort Insights...' : '✨ AI Cohort Pedagogical Insights'}
        </button>
      </div>

      {/* AI Pedagogical Insights Panel */}
      {aiInsights && (
        <div
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(180deg, #ede9fe 0%, #f8fafc 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#4f46e5', letterSpacing: '0.05em' }}>
                AI Academic Diagnostic Report • {aiInsights.ai_meta?.model_used}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                Cohort Placement Readiness: <span style={{ color: '#0d9488' }}>{aiInsights.mean_readiness_score}% Mean Score</span>
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Evaluated {aiInsights.total_students_evaluated} Authorized Students
            </div>
          </div>

          <div className="grid-responsive grid-cols-2" style={{ gap: '1rem' }}>
            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={14} /> Systemic Cohort Skill Gaps
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#1e293b', fontSize: '0.8rem', lineHeight: '1.6' }}>
                {aiInsights.critical_cohort_skill_gaps?.map((gap, idx) => (
                  <li key={idx}>
                    <strong style={{ color: 'var(--text-primary)' }}>{gap.skill}</strong> — {gap.affected_percentage}% of students affected ({gap.severity} severity)
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Brain size={14} /> Recommended Pedagogical Interventions
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#1e293b', fontSize: '0.8rem', lineHeight: '1.6' }}>
                {aiInsights.pedagogical_interventions?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Department Avg CGPA</span>
            <GraduationCap size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)' }}>{average_cgpa}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Across {total_students} authorized students
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Assessment Score</span>
            <Brain size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981' }}>{average_assessment_score}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Cohort mean test performance
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Assessment Participation</span>
            <Award size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)' }}>{assessment_completion_rate}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Verified evaluation attempts
          </span>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Learning Progress</span>
            <TrendingUp size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)' }}>{learning_progress_rate}%</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Department course completion
          </span>
        </Card>
      </div>

      {/* Main Analytics Grid: Placement Readiness Tiers & Top Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1.5rem' }}>
        {/* Industry Placement Readiness Distribution */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Industry Placement Readiness Tiers
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* High Readiness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#10b981' }}>High Placement Ready (70%+ Score)</span>
                <strong>{readiness_distribution.high_readiness || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#10b981',
                    width: total_students > 0 ? `${((readiness_distribution.high_readiness || 0) / total_students) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Moderate Readiness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>Moderate Ready (40-70% Score)</span>
                <strong>{readiness_distribution.moderate_readiness || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#f59e0b',
                    width: total_students > 0 ? `${((readiness_distribution.moderate_readiness || 0) / total_students) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Critical Upskilling Needed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>Critical Skill Gaps (&lt;40% Score)</span>
                <strong>{readiness_distribution.needs_improvement || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#ef4444',
                    width: total_students > 0 ? `${((readiness_distribution.needs_improvement || 0) / total_students) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Top Department Skills */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Top Cohort Competencies
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {top_department_skills.map((skill, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{skill.skill_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verified across {skill.verified_count || 0} students</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Row: Critical Skill Gaps & Semester Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1.5rem' }}>
        {/* Critical Skill Gaps */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Top Identified Skill Gaps (Curriculum Action Areas)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {top_skill_gaps.map((gap, i) => (
              <div
                key={i}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>{gap.skill_gap}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.15rem' }}>
                    Detected in {gap.affected_students} student evaluations
                  </span>
                </div>
                <Badge variant="danger">Intervention Needed</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Semester Distribution */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Cohort Distribution by Semester
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {Object.entries(semester_distribution).map(([sem, count]) => (
              <div
                key={sem}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
                  Semester {sem}
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.35rem 0' }}>
                  {count}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {total_students > 0 ? Math.round((count / total_students) * 100) : 0}% of cohort
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              All metrics update dynamically when students take assessments or complete learning modules.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  RolePageHeader,
  RoleStatCard,
  LoadingState,
  ErrorState,
} from '../../components/portal';
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
  const [error, setError] = useState(null);

  const [aiInsights, setAiInsights] = useState(null);
  const [runningAI, setRunningAI] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getStudentAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
      setError('Unable to fetch department analytics. Please ensure backend services are active.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <LoadingState message="Aggregating department skill analytics and cohort metrics..." />;
  }

  if (error) {
    return <ErrorState title="Analytics Unavailable" message={error} onRetry={fetchAnalytics} />;
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

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Student Skill Analytics & Placement Readiness"
        subtitle="Department Cohort Intelligence"
        badge={<Badge role="academician" />}
        description="Comprehensive visibility into student skill proficiencies, assessment metrics, systemic skill gaps, and industry readiness tiers across your department."
        actions={
          <button
            type="button"
            onClick={handleRunAIInsights}
            disabled={runningAI}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '42px',
              padding: '0 1.25rem',
              fontWeight: 700,
            }}
          >
            <Sparkles size={16} />
            {runningAI ? 'Synthesizing Insights...' : 'AI Cohort Insights'}
          </button>
        }
      />

      {/* 2. AI Pedagogical Insights Panel (When generated) */}
      {aiInsights && (
        <div
          style={{
            padding: '1.35rem 1.5rem',
            background: '#f8fafc',
            border: '1px solid #ccfbf1',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.06)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.04em' }}>
                AI Cohort Intelligence Report
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                Mean Readiness Score: <span style={{ color: '#0d9488' }}>{aiInsights.mean_readiness_score}%</span>
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Evaluated {aiInsights.total_students_evaluated} Authorized Students
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
              <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} /> Systemic Cohort Skill Gaps
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#334155', fontSize: '0.8rem', lineHeight: '1.55', margin: 0 }}>
                {aiInsights.critical_cohort_skill_gaps?.map((gap, idx) => (
                  <li key={idx}>
                    <strong style={{ color: '#0f172a' }}>{gap.skill}</strong> — {gap.affected_percentage}% of students affected
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Brain size={15} /> Pedagogical Interventions
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#334155', fontSize: '0.8rem', lineHeight: '1.55', margin: 0 }}>
                {aiInsights.pedagogical_interventions?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. Top 4 KPI Metric Cards */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Department CGPA"
          value={average_cgpa}
          subtext={`Across ${total_students} students`}
          icon={GraduationCap}
          variant="teal"
        />
        <RoleStatCard
          title="Assessment Score"
          value={`${average_assessment_score}%`}
          subtext="Cohort mean test score"
          subtextType="positive"
          icon={Brain}
          variant="emerald"
        />
        <RoleStatCard
          title="Participation Rate"
          value={`${assessment_completion_rate}%`}
          subtext="Verified evaluations"
          icon={Award}
          variant="purple"
        />
        <RoleStatCard
          title="Learning Progress"
          value={`${learning_progress_rate}%`}
          subtext="Module completion rate"
          icon={TrendingUp}
          variant="blue"
        />
      </div>

      {/* 4. Main Analytics: Readiness Tiers & Top Skills Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Placement Readiness Tiers */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.35rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="#0d9488" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Industry Placement Readiness Tiers
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* High Readiness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.825rem' }}>
                <span style={{ fontWeight: 700, color: '#059669' }}>High Placement Ready (&ge; 70% Score)</span>
                <strong>{readiness_distribution.high_readiness || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#059669',
                    width: total_students > 0 ? `${((readiness_distribution.high_readiness || 0) / total_students) * 100}%` : '0%',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Moderate Readiness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.825rem' }}>
                <span style={{ fontWeight: 700, color: '#d97706' }}>Moderate Ready (40–70% Score)</span>
                <strong>{readiness_distribution.moderate_readiness || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#d97706',
                    width: total_students > 0 ? `${((readiness_distribution.moderate_readiness || 0) / total_students) * 100}%` : '0%',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Needs Attention */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.825rem' }}>
                <span style={{ fontWeight: 700, color: '#e11d48' }}>Needs Mentoring (&lt; 40% Score)</span>
                <strong>{readiness_distribution.needs_attention || 0} Students</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#e11d48',
                    width: total_students > 0 ? `${((readiness_distribution.needs_attention || 0) / total_students) * 100}%` : '0%',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Verified Skills & Critical Gaps */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.35rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Cohort Skill Distribution & Deficits
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.4rem' }}>
                Top Verified Proficiencies
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {top_verified_skills && top_verified_skills.length > 0 ? (
                  top_verified_skills.map((sk, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #dbeafe',
                        fontWeight: 600,
                      }}
                    >
                      {sk.skill || sk} ({sk.count || sk.proficiency || 'Verified'})
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No verified skill records yet.</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.4rem' }}>
                Systemic Skill Deficits Requiring Curriculum Focus
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {top_skill_gaps && top_skill_gaps.length > 0 ? (
                  top_skill_gaps.map((gap, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        background: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fecdd3',
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ {gap.skill || gap}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={14} /> No widespread skill deficits reported.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

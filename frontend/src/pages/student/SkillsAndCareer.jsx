import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Spinner } from '../../components/common/Spinner';
import {
  BarChart3,
  Layers,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  TrendingUp,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const SkillsAndCareer = () => {
  const { showSuccess, showError } = useToast();
  const [skills, setSkills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Skill form state
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    category: 'technical',
    proficiency_level: 'intermediate',
  });
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsList, dashSummary] = await Promise.all([
        apiService.getStudentSkills(),
        apiService.getStudentDashboardSummary(),
      ]);
      setSkills(skillsList);
      setSummary(dashSummary);
    } catch (err) {
      showError('Failed to load skill matrix.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name) return;
    try {
      setAddingSkill(true);
      const created = await apiService.addStudentSkill(newSkill);
      setSkills([...skills, created]);
      setNewSkill({ skill_name: '', category: 'technical', proficiency_level: 'intermediate' });
      showSuccess(`Skill "${created.skill_name}" added to matrix!`);
      // refresh career benchmarks
      const updatedSummary = await apiService.getStudentDashboardSummary();
      setSummary(updatedSummary);
    } catch (err) {
      showError('Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    try {
      await apiService.deleteStudentSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
      showSuccess(`Skill "${name}" removed.`);
      const updatedSummary = await apiService.getStudentDashboardSummary();
      setSummary(updatedSummary);
    } catch (err) {
      showError('Failed to remove skill.');
    }
  };

  const technicalSkills = skills.filter((s) => s.category === 'technical');
  const softSkills = skills.filter((s) => s.category === 'soft');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // AI Skill Gap State
  const [aiGapAnalysis, setAiGapAnalysis] = useState(null);
  const [runningAI, setRunningAI] = useState(false);

  const runAISkillGap = async (targetRole = 'Full Stack Cloud Engineer') => {
    try {
      setRunningAI(true);
      const res = await apiService.getAISkillGapAnalysis(targetRole);
      setAiGapAnalysis(res);
      showSuccess(`AI analysis synthesized by ${res.ai_meta?.model_used || 'Gemini 1.5'}!`);
    } catch (err) {
      showError('Failed to run AI skill gap analysis.');
    } finally {
      setRunningAI(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Skills & Career Pathways</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Map your verified competencies against industry benchmarks and analyze skill gaps with Google Gemini & Grok.
          </p>
        </div>
        <button
          onClick={() => runAISkillGap('Full Stack Cloud Engineer')}
          disabled={runningAI}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
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
          {runningAI ? 'Synthesizing AI Diagnostics...' : '✨ Run AI Skill Gap Analysis'}
        </button>
      </div>

      {/* AI Skill Gap Results Panel */}
      {aiGapAnalysis && (
        <div
          style={{
            padding: '1.5rem',
            background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
                AI Diagnostic Report • {aiGapAnalysis.ai_meta?.model_used}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                Target Role: {aiGapAnalysis.target_role}
              </h2>
            </div>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Readiness Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{aiGapAnalysis.readiness_percentage}%</div>
            </div>
          </div>

          <div className="grid-responsive grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
            {/* Strengths */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} /> Confirmed Strengths
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: '1.6' }}>
                {aiGapAnalysis.strengths?.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={14} /> Priority Skill Gaps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {aiGapAnalysis.identified_gaps?.map((gap, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                    <strong style={{ color: '#ffffff' }}>{gap.skill_name}</strong> ({gap.gap_severity} Gap)
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{gap.remediation_hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Career Roles Benchmarks */}
      <Card title="Target Career Path Readiness" subtitle="Deterministic skill coverage computed against hiring benchmarks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {summary?.career_paths?.map((path, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{path.role_name}</span>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {path.acquired_skills.length} of {path.required_skills.length} Required Skills Verified
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge variant={path.match_percentage >= 70 ? 'success' : 'warning'}>
                    {path.match_percentage}% Career Match
                  </Badge>
                  <Link to="/dashboard/student/learning" className="btn btn-secondary btn-sm">
                    <BookOpen size={14} /> Bridge Gaps
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '8px', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: `${path.match_percentage}%`,
                    background: path.match_percentage >= 70 ? 'linear-gradient(90deg, #14b8a6, #0d9488)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                    height: '100%',
                    borderRadius: '4px',
                  }}
                />
              </div>

              {/* Acquired vs Missing Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 700, marginBottom: '0.35rem' }}>
                    ACQUIRED COMPETENCIES ({path.acquired_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {path.acquired_skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(20,184,166,0.15)', color: '#14b8a6', padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {path.missing_skills.length > 0 && (
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, marginBottom: '0.35rem' }}>
                      RECOMMENDED UPSKILLING GAPS ({path.missing_skills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {path.missing_skills.map((s, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '3px 8px', borderRadius: '4px' }}>
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add New Skill Card */}
      <Card title="Add Skill to Competency Matrix">
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <Input
              label="Skill Name"
              placeholder="e.g. Docker, TypeScript, System Design"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              label="Category"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              options={[
                { value: 'technical', label: 'Technical' },
                { value: 'soft', label: 'Soft Skill' },
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              label="Proficiency Level"
              value={newSkill.proficiency_level}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
              options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
                { value: 'expert', label: 'Expert' },
              ]}
            />
          </div>
          <Button type="submit" disabled={addingSkill} variant="primary">
            <Plus size={16} /> Add Skill
          </Button>
        </form>
      </Card>

      {/* Skill Matrix Grids (Technical & Soft) */}
      <div className="grid-responsive grid-cols-2">
        <Card title={`Technical Skills (${technicalSkills.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {technicalSkills.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{s.skill_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                    Level: {s.proficiency_level}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {s.is_verified && <Badge variant="success">Verified</Badge>}
                  <button
                    onClick={() => handleDeleteSkill(s.id, s.skill_name)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Soft & Professional Skills (${softSkills.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {softSkills.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{s.skill_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                    Level: {s.proficiency_level}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {s.is_verified && <Badge variant="success">Verified</Badge>}
                  <button
                    onClick={() => handleDeleteSkill(s.id, s.skill_name)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

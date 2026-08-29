import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const SkillAssessment = () => {
  const { showSuccess, showError } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active quiz runner state
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assList, resList] = await Promise.all([
        apiService.getAssessments(),
        apiService.getAssessmentResults(),
      ]);
      setAssessments(assList);
      setAttempts(resList);
    } catch (err) {
      showError('Failed to load assessment data.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (id) => {
    try {
      setLoading(true);
      const detail = await apiService.getAssessmentDetail(id);
      setActiveAssessment(detail);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setResult(null);
    } catch (err) {
      showError('Failed to start assessment.');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    try {
      setSubmitting(true);
      const evalResult = await apiService.submitAssessment(activeAssessment.id, answers);
      setResult(evalResult);
      showSuccess(`Assessment completed! Score: ${evalResult.score}/${evalResult.total_marks}`);
      // Refresh previous attempts
      const updatedAttempts = await apiService.getAssessmentResults();
      setAttempts(updatedAttempts);
    } catch (err) {
      showError('Failed to submit assessment answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const exitQuiz = () => {
    setActiveAssessment(null);
    setResult(null);
    setAnswers({});
  };

  if (loading && !activeAssessment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // View: Active Quiz Runner / Result
  if (activeAssessment) {
    const questions = activeAssessment.questions || [];
    const currentQ = questions[currentQuestionIdx];
    const isAnswered = currentQ && answers[currentQ.id] !== undefined;
    const answeredCount = Object.keys(answers).length;

    if (result) {
      return (
        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: result.passed ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: result.passed ? '#14b8a6' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                {result.passed ? <Award size={36} /> : <AlertTriangle size={36} />}
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {result.passed ? 'Assessment Passed!' : 'Assessment Incomplete'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {result.assessment_title}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1.5rem 0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Score</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                    {result.score} / {result.total_marks}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Percentage</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: result.passed ? '#14b8a6' : '#f59e0b' }}>
                    {result.percentage}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <Badge variant={result.passed ? 'success' : 'danger'}>
                      {result.passed ? 'VERIFIED' : 'NEEDS PRACTICE'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Diagnostic breakdown */}
              <div className="grid-responsive grid-cols-2" style={{ gap: '1rem', textAlign: 'left', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20, 184, 166, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                  <div style={{ fontWeight: 700, color: '#14b8a6', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> Demonstrated Strengths
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {result.strengths?.length > 0 ? (
                      result.strengths.map((s, i) => <Badge key={i} variant="success">{s}</Badge>)
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Review fundamental topics</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={16} /> Targeted Skill Gaps
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {result.skill_gaps?.length > 0 ? (
                      result.skill_gaps.map((g, i) => <Badge key={i} variant="danger">{g}</Badge>)
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>All tested topics verified!</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Button onClick={exitQuiz} variant="primary">
                  Return to Assessments
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Quiz Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#14b8a6', fontWeight: 700, textTransform: 'uppercase' }}>
              {activeAssessment.category}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              {activeAssessment.title}
            </h2>
          </div>
          <Button onClick={exitQuiz} variant="secondary" size="sm">
            Exit Quiz
          </Button>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} Answered</span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px' }}>
            <div
              style={{
                width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
                background: '#14b8a6',
                height: '100%',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card>
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Badge variant="primary">{currentQ.skill_tag}</Badge>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>1 Point</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {currentQ.question_text}
              </h3>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQ.options?.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(currentQ.id, optIdx)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '2px solid #14b8a6' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #14b8a6' : '1px solid #64748b',
                          background: isSelected ? '#14b8a6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Button
                  onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                  disabled={currentQuestionIdx === 0}
                  variant="secondary"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                    variant="primary"
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || answeredCount === 0}
                    variant="success"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Assessment'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // View: Assessment Catalog and Past Results
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Skill Assessments</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Evaluate your technical proficiency against National Occupational Standards (NOS). Verified scores unlock high-matching internship and job recommendations.
        </p>
      </div>

      {/* Available Assessments Grid */}
      <div className="grid-responsive grid-cols-2">
        {assessments.map((ass) => (
          <Card key={ass.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <Badge variant="primary">{ass.category}</Badge>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> {ass.duration_minutes} Mins
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{ass.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 1rem', lineHeight: 1.5 }}>
              {ass.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {ass.total_questions} Questions • Pass: {ass.passing_percentage}%
              </span>
              <Button onClick={() => startAssessment(ass.id)} variant="primary" size="sm">
                Start Test <ChevronRight size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Past Assessment Attempts History */}
      <Card title="Completed Assessment Attempts" subtitle="Verified scores recorded in your talent profile">
        {attempts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No assessments completed yet. Take an assessment above to verify your skills.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attempts.map((att) => (
              <div
                key={att.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                    {att.assessment_title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Completed on {new Date(att.completed_at).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Strengths:</span>
                    {att.strengths?.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(20,184,166,0.15)', color: '#14b8a6', padding: '2px 6px', borderRadius: '4px' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: att.passed ? '#14b8a6' : '#f59e0b' }}>
                      {att.percentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {att.score} / {att.total_marks} Marks
                    </div>
                  </div>
                  <Badge variant={att.passed ? 'success' : 'warning'}>
                    {att.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

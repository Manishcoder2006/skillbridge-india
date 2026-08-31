import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Target,
  FileText,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

export const InterviewReport = ({ report, onPracticeAgain, onBackToHub }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>No report data available.</p>
        <Button onClick={onBackToHub}>Back to Skills & Career</Button>
      </div>
    );
  }

  const overallScore = report.overall_score || 80;
  const isHighMatch = overallScore >= 75;

  const toggleQuestion = (idx) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '920px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <div>
        <button
          type="button"
          onClick={onBackToHub}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            padding: '0.25rem 0',
          }}
        >
          <ArrowLeft size={16} /> Back to Skills & Career Hub
        </button>
      </div>

      {/* Hero Performance Header Banner */}
      <div
        style={{
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.6rem',
            }}
          >
            <Sparkles size={13} color="#fde047" /> {report.interview_type?.toUpperCase()} EVALUATION REPORT
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            {report.role || 'Software Engineer'}
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Multi-model AI synthesis based on verified industry benchmarks & recruitment standards.
          </p>
        </div>

        {/* Overall Score Circle Badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem 1.75rem',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '150px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 700, textTransform: 'uppercase' }}>
            Readiness Score
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: isHighMatch ? '#a7f3d0' : '#fde68a', lineHeight: 1.1 }}>
            {overallScore}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#e0e7ff', marginTop: '0.2rem', fontWeight: 600 }}>
            {overallScore >= 85 ? 'Placement Ready ★★★' : overallScore >= 70 ? 'Proficient Candidate ★★' : 'Needs Targeted Upskilling ★'}
          </div>
        </div>
      </div>

      {/* Category Breakdown Card */}
      {report.category_scores && report.category_scores.length > 0 && (
        <Card title="Competency Category Breakdown">
          <div
            className="grid-responsive"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {report.category_scores.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: cat.score >= 75 ? '#0f766e' : '#b45309',
                    }}
                  >
                    {cat.score}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '3px' }}>
                  <div
                    style={{
                      width: `${cat.score}%`,
                      background: cat.score >= 75 ? 'linear-gradient(90deg, #0d9488, #0f766e)' : 'linear-gradient(90deg, #d97706, #b45309)',
                      height: '100%',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Standout Strengths & Weaknesses Grid */}
      <div
        className="grid-responsive"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Strengths */}
        <Card title="Confirmed Standout Strengths">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {report.strengths?.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.6rem 0.8rem',
                  background: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.83rem',
                  color: '#166534',
                  lineHeight: '1.4',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{st}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Areas for Growth */}
        <Card title="Priority Growth & Improvement Areas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {report.weaknesses?.map((wk, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.6rem 0.8rem',
                  background: '#fffbeb',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fde68a',
                  fontSize: '0.83rem',
                  color: '#92400e',
                  lineHeight: '1.4',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{wk}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Question-by-Question Deep Dive Review Accordions */}
      {report.question_reviews && report.question_reviews.length > 0 && (
        <Card title={`Detailed Question-by-Question Review (${report.question_reviews.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {report.question_reviews.map((qr, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleQuestion(idx)}
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, paddingRight: '1rem' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: qr.score >= 8 ? '#dcfce7' : '#fef3c7',
                          color: qr.score >= 8 ? '#15803d' : '#b45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {qr.question_number || idx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {qr.question_text}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Category: {qr.category || 'Core Skill'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          background: qr.score >= 8 ? '#ecfdf5' : '#fffbeb',
                          border: qr.score >= 8 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                          color: qr.score >= 8 ? '#065f46' : '#92400e',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}
                      >
                        {qr.score}/10
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '1rem 1.25rem 1.25rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      {/* Candidate Submitted Answer */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          YOUR SUBMITTED RESPONSE:
                        </div>
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#ffffff',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.85rem',
                            color: '#334155',
                            lineHeight: '1.5',
                            fontStyle: 'italic',
                          }}
                        >
                          "{qr.answer_text}"
                        </div>
                      </div>

                      {/* Evaluation Breakdown */}
                      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {/* Strengths */}
                        <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#166534', marginBottom: '0.35rem' }}>
                            ✓ What You Did Well
                          </div>
                          <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.78rem', color: '#1e293b', lineHeight: '1.4' }}>
                            {qr.strengths?.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#92400e', marginBottom: '0.35rem' }}>
                            ⚡ Key Points to Strengthen
                          </div>
                          <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.78rem', color: '#1e293b', lineHeight: '1.4' }}>
                            {qr.improvements?.map((im, i) => (
                              <li key={i}>{im}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Suggested Skills to Practice & Recommendations */}
      <Card title="Actionable Upskilling Recommendations">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Recommended Skills Pills */}
          {report.suggested_skills_to_practice && report.suggested_skills_to_practice.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                TARGET SKILLS TO PRACTICE FOR {report.role?.toUpperCase()}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {report.suggested_skills_to_practice.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#ede9fe',
                      color: '#4338ca',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Steps */}
          {report.recommended_next_steps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                RECOMMENDED IMMEDIATE ACTIONS:
              </div>
              {report.recommended_next_steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-primary)' }}>
                  <Target size={14} color="var(--primary-600)" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 0 2rem',
        }}
      >
        <Button onClick={onBackToHub} variant="secondary">
          <ArrowLeft size={16} /> Back to Skills & Career
        </Button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/student/resume" className="btn btn-secondary">
            <FileText size={16} /> Optimize Resume
          </Link>
          <Button onClick={onPracticeAgain} variant="primary">
            <RotateCcw size={16} /> Practice Another Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

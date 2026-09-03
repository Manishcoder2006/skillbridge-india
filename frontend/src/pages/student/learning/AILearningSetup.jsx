import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  GraduationCap,
  Play,
  RotateCcw,
  Zap,
  Target,
  Sliders,
  Cpu
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

export const AILearningSetup = ({
  onGeneratePath,
  pastPaths = [],
  onSelectPastPath,
  isLoading = false,
}) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('interview_prep');

  const quickTopics = [
    { label: 'Frontend Development', category: 'Web' },
    { label: 'FastAPI & Async Python', category: 'Backend' },
    { label: 'React Hooks & State', category: 'Frontend' },
    { label: 'PostgreSQL Indexing', category: 'Database' },
    { label: 'Docker & Container Basics', category: 'DevOps' },
    { label: 'System Design Fundamentals', category: 'Architecture' },
    { label: 'DSA: Binary Search & Trees', category: 'Algorithms' },
    { label: 'CSS Flexbox & Grid', category: 'Design' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGeneratePath({
      topic: topic.trim(),
      difficulty,
      learning_goal: learningGoal,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0d9488 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.35)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={13} color="#fde047" /> AI Micro-Learning Tutor
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, lineHeight: 1.25 }}>
            Learn Any Concept in 60-Second Micro-Videos
          </h1>
          <p style={{ color: '#ccfbf1', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Enter any topic or technology. Your personal AI Tutor synthesizes a short, structured learning path with spoken explanations, interactive code examples, and visual diagrams.
          </p>
        </div>

        {/* Quick Value Metrics */}
        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fde047' }}>30-90s</div>
            <div style={{ fontSize: '0.72rem', color: '#ccfbf1', fontWeight: 600 }}>Per Lesson</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '1.25rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#a7f3d0' }}>100% Free</div>
            <div style={{ fontSize: '0.72rem', color: '#ccfbf1', fontWeight: 600 }}>Browser Voice</div>
          </div>
        </div>
      </div>

      {/* Main Input Card */}
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              What do you want to learn?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Type any engineering topic, framework, algorithmic concept, or interview topic.
            </p>
          </div>

          {/* Topic Input Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Frontend Development, FastAPI Concurrency, Flexbox, React Hooks..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              style={{
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                opacity: isLoading || !topic.trim() ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#ffffff' }} />
                  Synthesizing Micro-Path...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate Learning Path
                </>
              )}
            </button>
          </div>

          {/* Quick Topic Chips */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              POPULAR TOPICS TO EXPLORE:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(item.label)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: topic === item.label ? '#ccfbf1' : '#f8fafc',
                    border: '1px solid',
                    borderColor: topic === item.label ? '#0d9488' : '#e2e8f0',
                    color: topic === item.label ? '#0f766e' : '#475569',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: topic === item.label ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Options (Difficulty & Goal) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            {/* Difficulty Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Target Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <option value="beginner">Beginner (Foundational & Intuitive)</option>
                <option value="intermediate">Intermediate (Implementation & Tradeoffs)</option>
                <option value="advanced">Advanced (Production Scaling & Edge Cases)</option>
              </select>
            </div>

            {/* Learning Goal Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Primary Learning Objective
              </label>
              <select
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <option value="interview_prep">Campus Placement & Technical Interview Prep</option>
                <option value="quick_revision">Rapid Conceptual Revision</option>
                <option value="practical_skills">Hands-on Engineering Skills</option>
              </select>
            </div>
          </div>
        </form>
      </Card>

      {/* Past Active Learning Paths */}
      {pastPaths && pastPaths.length > 0 && (
        <Card title="Your Active Micro-Learning Paths">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pastPaths.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '1rem 1.25rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {p.topic}
                    </span>
                    <Badge variant="primary" style={{ textTransform: 'capitalize' }}>
                      {p.difficulty}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.completed_lessons} of {p.total_lessons} Lessons Completed • Created {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Progress Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${p.completion_percentage}%`,
                          height: '100%',
                          background: p.completion_percentage === 100 ? '#16a34a' : '#0d9488',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {p.completion_percentage}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPastPath(p.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.9rem',
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Play size={13} fill="#ffffff" /> Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

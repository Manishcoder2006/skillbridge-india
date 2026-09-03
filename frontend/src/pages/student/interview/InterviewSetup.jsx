import React, { useState, useEffect } from 'react';
import {
  Code,
  Users,
  Sliders,
  Sparkles,
  CheckCircle2,
  FileText,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  Cpu,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';

export const InterviewSetup = ({
  initialMode = 'technical',
  studentProfile,
  studentResume,
  onStart,
  onCancel,
  isLoading,
}) => {
  const [interviewType, setInterviewType] = useState(initialMode);
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [resumePersonalization, setResumePersonalization] = useState(true);
  const [skillsInput, setSkillsInput] = useState('');
  const [interviewFocus, setInterviewFocus] = useState('technical');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [jobDescription, setJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Populate default role and skills from profile/resume
  useEffect(() => {
    if (studentResume?.data?.target_role) {
      setRole(studentResume.data.target_role);
    } else if (studentProfile?.department_name) {
      setRole('Software Engineer');
    } else {
      setRole('Backend Developer');
    }

    if (studentResume?.data?.skills && studentResume.data.skills.length > 0) {
      setSkillsInput(studentResume.data.skills.join(', '));
    } else {
      setSkillsInput('React, Python, FastAPI, PostgreSQL, Docker, REST APIs');
    }
  }, [studentProfile, studentResume]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsList = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      interview_type: interviewType,
      role: role.trim() || 'Software Engineer',
      experience_level: experienceLevel,
      skills: skillsList,
      interview_focus: interviewFocus,
      number_of_questions: parseInt(numberOfQuestions, 10) || 5,
      resume_personalization: resumePersonalization,
      job_description: jobDescription.trim() || undefined,
      custom_instructions: customInstructions.trim() || undefined,
    };

    onStart(payload);
  };

  const quickRoles = [
    'Backend Developer',
    'Full Stack Engineer',
    'Frontend Developer',
    'Data Scientist / AI Engineer',
    'DevOps & Cloud Engineer',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Back Action */}
      <div>
        <button
          type="button"
          onClick={onCancel}
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

      {/* Two-Column Setup Layout */}
      <div
        className="grid-responsive"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Feature Information Panel (Fresher.Ai inspired) */}
        <div
          style={{
            background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={13} color="#fde047" /> AI Interview Suite
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: '1.25', margin: 0 }}>
              Your AI interview, built for you
            </h2>
            <p style={{ color: '#c7d2fe', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Master high-stakes campus placements and corporate hiring rounds with adaptive multi-model AI evaluation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '8px' }}>
                <Cpu size={18} color="#a5f3fc" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Personalized AI Questions</div>
                <div style={{ fontSize: '0.78rem', color: '#c7d2fe', lineHeight: '1.4' }}>
                  Dynamic inquiries tailored specifically to your chosen role, skills, and experience level.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '8px' }}>
                <FileText size={18} color="#86efac" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Resume-Based Interview</div>
                <div style={{ fontSize: '0.78rem', color: '#c7d2fe', lineHeight: '1.4' }}>
                  Optionally test directly on your verified projects, coursework, and portfolio technologies.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '8px' }}>
                <TrendingUp size={18} color="#fde047" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Detailed Performance Report</div>
                <div style={{ fontSize: '0.78rem', color: '#c7d2fe', lineHeight: '1.4' }}>
                  Receive instant category scoring across Technical Depth, Communication, Problem Solving, and Relevance.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '8px' }}>
                <ShieldCheck size={18} color="#f472b6" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Real Interview Experience</div>
                <div style={{ fontSize: '0.78rem', color: '#c7d2fe', lineHeight: '1.4' }}>
                  Simulate real-time pressure with live answer evaluation, voice dictation, and structured feedback.
                </div>
              </div>
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.8rem',
              color: '#e0e7ff',
              lineHeight: '1.4',
            }}
          >
            <strong>💡 Preparation Tip:</strong> Speak or write clearly, structure technical reasoning with tradeoffs, and follow the <strong>STAR</strong> method for HR questions.
          </div>
        </div>

        {/* RIGHT COLUMN: Interview Configuration Form */}
        <Card title="Interview Configuration">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 1. Target Role */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                What role are you preparing for? <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <Input
                placeholder="e.g. Backend Developer, Data Scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
                {quickRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      background: role === r ? 'var(--primary-100)' : '#f1f5f9',
                      color: role === r ? 'var(--primary-800)' : 'var(--text-secondary)',
                      border: role === r ? '1px solid var(--primary-400)' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontWeight: role === r ? 700 : 500,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choose Interview Type (3 Selectable Cards) */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                Choose your interview type <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {/* Technical Card */}
                <div
                  onClick={() => setInterviewType('technical')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: interviewType === 'technical' ? '2px solid var(--primary-600)' : '1px solid #e2e8f0',
                    background: interviewType === 'technical' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ padding: '0.4rem', background: '#e0e7ff', borderRadius: '6px', color: '#4338ca' }}>
                      <Code size={18} />
                    </div>
                    {interviewType === 'technical' && <CheckCircle2 size={16} color="var(--primary-600)" />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    Technical
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    Coding, DSA, CS fundamentals & architecture.
                  </div>
                </div>

                {/* HR Card */}
                <div
                  onClick={() => setInterviewType('hr')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: interviewType === 'hr' ? '2px solid var(--primary-600)' : '1px solid #e2e8f0',
                    background: interviewType === 'hr' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ padding: '0.4rem', background: '#fef3c7', borderRadius: '6px', color: '#b45309' }}>
                      <Users size={18} />
                    </div>
                    {interviewType === 'hr' && <CheckCircle2 size={16} color="var(--primary-600)" />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    HR & Behavioral
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    STAR situations, communication & culture fit.
                  </div>
                </div>

                {/* Custom Card */}
                <div
                  onClick={() => setInterviewType('custom')}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: interviewType === 'custom' ? '2px solid var(--primary-600)' : '1px solid #e2e8f0',
                    background: interviewType === 'custom' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ padding: '0.4rem', background: '#dcfce7', borderRadius: '6px', color: '#15803d' }}>
                      <Sliders size={18} />
                    </div>
                    {interviewType === 'custom' && <CheckCircle2 size={16} color="var(--primary-600)" />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    Custom
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                    Define skills, focus areas & custom job descriptions.
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Resume Personalization Toggle */}
            <div
              style={{
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} color="var(--primary-600)" />
                  Personalise with your resume
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {resumePersonalization
                    ? 'AI will tailor questions based on your verified skills, projects, and portfolio.'
                    : 'Standard role-based interview without personal profile context.'}
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setResumePersonalization(!resumePersonalization)}
                style={{
                  width: '46px',
                  height: '24px',
                  borderRadius: '999px',
                  background: resumePersonalization ? 'var(--primary-600)' : '#cbd5e1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '3px',
                    left: resumePersonalization ? '24px' : '4px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            {/* 4. Experience Level Selection */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                Experience Level
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: experienceLevel === lvl ? '1.5px solid var(--primary-600)' : '1px solid #e2e8f0',
                      background: experienceLevel === lvl ? 'var(--primary-50)' : '#ffffff',
                      color: experienceLevel === lvl ? 'var(--primary-800)' : 'var(--text-secondary)',
                      fontWeight: experienceLevel === lvl ? 700 : 500,
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Custom Mode Specific Fields */}
            {interviewType === 'custom' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                  Custom Interview Settings
                </div>

                {/* Focus Area */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    Interview Focus Area
                  </label>
                  <Select
                    value={interviewFocus}
                    onChange={(e) => setInterviewFocus(e.target.value)}
                    options={[
                      { value: 'technical', label: 'Technical Core (DSA & Concepts)' },
                      { value: 'system_design', label: 'System Design & Architecture' },
                      { value: 'project_based', label: 'Project-Based & Practical Scenarios' },
                      { value: 'hr', label: 'HR, Behavioral & Leadership' },
                      { value: 'mixed', label: 'Comprehensive Mixed (Technical + HR)' },
                    ]}
                  />
                </div>

                {/* Target Skills */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    Target Skills / Topics (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. React, Docker, GraphQL, Kubernetes"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                </div>

                {/* Question Count Selection */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    Number of Questions
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumberOfQuestions(num)}
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          borderRadius: '6px',
                          border: numberOfQuestions === num ? '1.5px solid var(--primary-600)' : '1px solid #e2e8f0',
                          background: numberOfQuestions === num ? '#ede9fe' : '#ffffff',
                          color: numberOfQuestions === num ? '#4338ca' : 'var(--text-secondary)',
                          fontWeight: numberOfQuestions === num ? 700 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {num} Questions
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Job Description */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    Target Job Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste JD requirements or hiring guidelines to tailor questions to a specific company..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical' }}
                  />
                </div>

                {/* Optional Custom Instructions */}
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                    Custom Prompt Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus heavily on SQL query optimization and concurrency locks"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            )}

            {/* Voice + Video Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#15803d',
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" />
              <span>
                <strong>Real-Time Voice + Video Mode:</strong> Your camera and microphone will activate locally in the browser room. You will hear questions spoken aloud and reply by speaking.
              </span>
            </div>

            {/* Submit Action */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isLoading || !role.trim()}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: isLoading || !role.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  opacity: isLoading || !role.trim() ? 0.7 : 1,
                  transition: 'transform 0.15s ease',
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#ffffff' }} />
                    Generating AI Interview Room...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Start Real-Time Voice + Video Interview
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

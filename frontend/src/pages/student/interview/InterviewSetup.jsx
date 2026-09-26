import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  UploadCloud,
  Upload,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileUp
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';
import { apiService } from '../../../services/api';

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
  const [uploadedResume, setUploadedResume] = useState(() => {
    if (studentResume?.data?.uploaded_file) {
      return {
        filename: studentResume.data.uploaded_file.filename,
        file_type: studentResume.data.uploaded_file.file_type,
        file_size: studentResume.data.uploaded_file.file_size,
        file_size_formatted: studentResume.data.uploaded_file.file_size_formatted,
        uploaded_at: studentResume.data.uploaded_file.uploaded_at,
        skills: studentResume.data.skills || [],
        projects_count: studentResume.data.projects?.length || 0,
        experience_count: studentResume.data.experience?.length || 0,
      };
    }
    if (studentResume?.data?.headline || (studentResume?.data?.skills && studentResume.data.skills.length > 0)) {
      return {
        filename: 'Verified Profile Resume.pdf',
        file_type: 'pdf',
        file_size_formatted: 'From Profile',
        is_profile_resume: true,
        skills: studentResume.data.skills || [],
        projects_count: studentResume.data.projects?.length || 0,
        experience_count: studentResume.data.experience?.length || 0,
      };
    }
    return null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');
    setValidationError('');

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setUploadError('Unsupported file format. Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB limit. Please select a smaller file.');
      return;
    }

    if (file.size === 0) {
      setUploadError('Uploaded file is empty (0 bytes). Please select a valid document.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(25);

      const result = await apiService.uploadInterviewResume(file, (progressEvent) => {
        if (progressEvent && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadProgress(100);
      setUploadedResume({
        filename: result.filename,
        file_type: result.file_type,
        file_size: result.file_size,
        file_size_formatted: result.file_size_formatted,
        skills: result.extracted_skills || [],
        projects_count: result.projects_count || 0,
        experience_count: result.experience_count || 0,
        raw_text_preview: result.raw_text_preview,
        uploaded_at: new Date().toISOString(),
      });

      setUploadSuccess(`Resume "${result.filename}" (${result.file_size_formatted}) parsed successfully!`);

      // Auto-append or update skills with extracted skills
      if (result.extracted_skills && result.extracted_skills.length > 0) {
        setSkillsInput((prev) => {
          const existing = prev ? prev.split(',').map((s) => s.trim()).filter(Boolean) : [];
          const combined = Array.from(new Set([...result.extracted_skills, ...existing]));
          return combined.join(', ');
        });
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to upload and parse resume.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveResume = async () => {
    try {
      await apiService.removeInterviewResume().catch(() => null);
    } catch (e) {
      // Ignore
    }
    setUploadedResume(null);
    setUploadSuccess('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Require valid resume before starting if personalization is enabled
    if (resumePersonalization && !uploadedResume) {
      setValidationError('Please upload your resume (PDF or DOCX) to generate personalized questions, or disable resume personalization.');
      return;
    }

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
      uploaded_resume_text: uploadedResume?.raw_text_preview || undefined,
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
                onClick={() => {
                  setResumePersonalization(!resumePersonalization);
                  setValidationError('');
                }}
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

            {/* Resume Upload Section - Shown when Personalise with Resume is enabled */}
            {resumePersonalization && (
              <div
                style={{
                  padding: '1.25rem',
                  background: isDragging ? 'var(--primary-50, #eff6ff)' : '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: isDragging
                    ? '2px dashed var(--primary-600)'
                    : validationError
                    ? '1.5px solid var(--danger-500, #ef4444)'
                    : '1.5px dashed #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Hidden native file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  id="interview-resume-upload-input"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <UploadCloud size={18} color="var(--primary-600)" />
                      Upload Your Resume
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                      Upload your resume to generate interview questions based on your skills, projects, education, and experience.
                    </div>
                  </div>
                  {uploadedResume && (
                    <Badge variant="success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} /> Active Resume
                    </Badge>
                  )}
                </div>

                {/* If Resume is uploaded, show Resume Card */}
                {uploadedResume ? (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: uploadedResume.file_type === 'pdf' ? '#fee2e2' : '#e0e7ff',
                          color: uploadedResume.file_type === 'pdf' ? '#dc2626' : '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {uploadedResume.file_type?.toUpperCase() || 'DOC'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {uploadedResume.filename}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
                          <span>{uploadedResume.file_size_formatted}</span>
                          <span>•</span>
                          <span style={{ textTransform: 'uppercase' }}>{uploadedResume.file_type} Document</span>
                          {uploadedResume.projects_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{uploadedResume.projects_count} Project{uploadedResume.projects_count > 1 ? 's' : ''} detected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <RefreshCw size={13} /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        disabled={isUploading}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #fee2e2',
                          background: '#fff1f2',
                          color: '#e11d48',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        title="Remove resume"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and drop upload zone */
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: isDragging ? 'var(--primary-100)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <Upload size={22} color="var(--primary-600)" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Drag and drop your resume here or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-600)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        Browse Files
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Supported formats: PDF, DOCX · Maximum size: 5 MB
                    </div>
                  </div>
                )}

                {/* Upload Progress Indicator */}
                {isUploading && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>Uploading and parsing competencies...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          background: 'var(--primary-600)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {uploadSuccess && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#059669',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                {/* Error Message */}
                {uploadError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#dc2626',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Validation Error Message */}
                {validationError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#b91c1c',
                      background: '#fff1f2',
                      border: '1px solid #fda4af',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            )}

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

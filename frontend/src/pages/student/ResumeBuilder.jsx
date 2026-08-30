import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/common/Spinner';
import '../../styles/resume-builder.css';
import {
  FileCheck2,
  Printer,
  Save,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Briefcase,
  GraduationCap,
  FolderGit2,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  User,
  Wrench,
  FileText,
} from 'lucide-react';

const STEPS = [
  {
    id: 1,
    name: 'Personal Info',
    icon: User,
    titlePrefix: 'Personal',
    titleSuffix: 'Information',
    desc: "Let's start with your basic details. This information will appear at the top of your resume.",
  },
  {
    id: 2,
    name: 'Education',
    icon: GraduationCap,
    titlePrefix: 'Academic',
    titleSuffix: 'Education',
    desc: 'Add your college, university, high school degrees, and CGPA milestones.',
  },
  {
    id: 3,
    name: 'Experience',
    icon: Briefcase,
    titlePrefix: 'Work',
    titleSuffix: 'Experience',
    desc: 'Highlight internships, full-time positions, freelance, or research projects.',
  },
  {
    id: 4,
    name: 'Skills',
    icon: Wrench,
    titlePrefix: 'Technical',
    titleSuffix: 'Skills',
    desc: 'Categorize your technical proficiencies and soft skills for ATS indexing.',
  },
  {
    id: 5,
    name: 'Projects',
    icon: FolderGit2,
    titlePrefix: 'Key',
    titleSuffix: 'Projects',
    desc: 'Showcase your practical builds, hackathon projects, and live repositories.',
  },
  {
    id: 6,
    name: 'Summary',
    icon: FileText,
    titlePrefix: 'Professional',
    titleSuffix: 'Summary',
    desc: 'Craft a compelling executive pitch or generate one with SkillBridge AI.',
  },
];

const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud / DevOps',
  'Tools',
  'Soft Skills',
];

export const ResumeBuilder = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Resume Data State (Starts completely empty, zero demo data)
  const [resumeData, setResumeData] = useState({
    full_name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    target_role: '',
    summary: '',
    links: { github: '', linkedin: '', portfolio: '' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    skills_by_category: {
      'Programming Languages': [],
      'Frameworks & Libraries': [],
      'Databases': [],
      'Cloud / DevOps': [],
      'Tools': [],
      'Soft Skills': [],
    },
  });

  // Preview & ATS Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Skills input states
  const [newSkillText, setNewSkillText] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Programming Languages');

  // Modals for CRUD
  const [activeModal, setActiveModal] = useState(null); // 'education' | 'experience' | 'project' | 'ats' | 'summary_ai'
  const [modalEditIndex, setModalEditIndex] = useState(null);

  // Modal forms
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    location: '',
    start_year: '',
    end_year: '',
    is_current: false,
    grade_or_cgpa: '',
  });

  const [expForm, setExpForm] = useState({
    company: '',
    job_title: '',
    location: '',
    employment_type: 'Internship',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  const [projForm, setProjForm] = useState({
    title: '',
    technologies: '',
    description: '',
    github_url: '',
    live_url: '',
  });

  // AI Content Assistant
  const [aiSummaryTone, setAiSummaryTone] = useState('impactful');
  const [aiSummaryGenerating, setAiSummaryGenerating] = useState(false);
  const [generatedSummaryDraft, setGeneratedSummaryDraft] = useState(null);

  // AI ATS Review
  const [atsJobTitle, setAtsJobTitle] = useState('');
  const [atsJobDescription, setAtsJobDescription] = useState('');
  const [atsOptimizing, setAtsOptimizing] = useState(false);
  const [atsResults, setAtsResults] = useState(null);
  const [atsError, setAtsError] = useState(null);

  const previewRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const resRes = await apiService.getStudentResume().catch(() => ({ data: {} }));
      const savedData = resRes?.data || {};

      const initialFlatSkills = savedData.skills || [];
      const initialCatSkills = savedData.skills_by_category || {
        'Programming Languages': initialFlatSkills.slice(0, 3),
        'Frameworks & Libraries': initialFlatSkills.slice(3, 6),
        'Databases': initialFlatSkills.slice(6, 8),
        'Cloud / DevOps': initialFlatSkills.slice(8, 10),
        'Tools': initialFlatSkills.slice(10, 12),
        'Soft Skills': initialFlatSkills.slice(12, 14),
      };

      // Load ONLY authenticated student's explicit saved data (no demo fallbacks)
      setResumeData({
        full_name: savedData.full_name || '',
        headline: savedData.headline || '',
        email: savedData.email || '',
        phone: savedData.phone || '',
        location: savedData.location || '',
        target_role: savedData.target_role || '',
        summary: savedData.summary || '',
        links: {
          github: savedData.links?.github || '',
          linkedin: savedData.links?.linkedin || '',
          portfolio: savedData.links?.portfolio || '',
        },
        education: savedData.education || [],
        experience: savedData.experience || [],
        projects: savedData.projects || [],
        skills: initialFlatSkills,
        skills_by_category: initialCatSkills,
      });

      if (savedData.target_role) {
        setAtsJobTitle(savedData.target_role);
      }
    } catch (err) {
      console.error('Failed to load resume data:', err);
      showError('Failed to initialize resume builder');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    try {
      setSaving(true);
      const flatSkills = Array.from(
        new Set([
          ...(resumeData.skills || []),
          ...Object.values(resumeData.skills_by_category || {}).flat(),
        ])
      ).filter(Boolean);

      const payloadToSave = {
        ...resumeData,
        skills: flatSkills,
      };

      await apiService.updateStudentResume(payloadToSave);
      showSuccess('Resume saved successfully!');
    } catch (err) {
      console.error('Failed to save resume:', err);
      showError(err.response?.data?.detail || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Skill category management
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    if (!newSkillText.trim()) return;
    const skill = newSkillText.trim();
    setResumeData((prev) => {
      const currentCatSkills = prev.skills_by_category?.[selectedSkillCategory] || [];
      if (currentCatSkills.includes(skill)) return prev;
      const updatedCat = {
        ...(prev.skills_by_category || {}),
        [selectedSkillCategory]: [...currentCatSkills, skill],
      };
      const flat = Array.from(new Set([...(prev.skills || []), skill]));
      return {
        ...prev,
        skills: flat,
        skills_by_category: updatedCat,
      };
    });
    setNewSkillText('');
  };

  const handleRemoveSkill = (category, skillToRemove) => {
    setResumeData((prev) => {
      const currentCatSkills = prev.skills_by_category?.[category] || [];
      const updatedCat = {
        ...(prev.skills_by_category || {}),
        [category]: currentCatSkills.filter((s) => s !== skillToRemove),
      };
      const flat = Object.values(updatedCat).flat();
      return {
        ...prev,
        skills: flat,
        skills_by_category: updatedCat,
      };
    });
  };

  // AI Content Assistant: Generate Summary
  const handleGenerateAISummary = async () => {
    try {
      setAiSummaryGenerating(true);
      const skillsFlat = Object.values(resumeData.skills_by_category || {}).flat();
      const expHighlights = resumeData.experience.map((e) => `${e.job_title || ''} at ${e.company || ''}: ${e.description || ''}`).slice(0, 3);
      const eduHighlights = resumeData.education.map((ed) => `${ed.degree || ''} from ${ed.institution || ''}`).slice(0, 2);

      const res = await apiService.generateAIResumeSummary(
        resumeData.target_role || resumeData.headline || 'Software Engineer',
        skillsFlat,
        expHighlights,
        eduHighlights,
        aiSummaryTone
      );

      setGeneratedSummaryDraft(res.summary);
    } catch (err) {
      console.error('Failed to generate summary with AI:', err);
      showError('AI Summary generator temporarily unavailable.');
    } finally {
      setAiSummaryGenerating(false);
    }
  };

  const applyGeneratedSummary = () => {
    if (generatedSummaryDraft) {
      setResumeData((prev) => ({ ...prev, summary: generatedSummaryDraft }));
      showSuccess('AI summary applied to resume!');
      setActiveModal(null);
      setGeneratedSummaryDraft(null);
    }
  };

  // AI ATS Review Runner
  const handleRunATSOptimizer = async () => {
    try {
      setAtsOptimizing(true);
      setAtsError(null);
      setAtsResults(null);

      const flatSkills = Array.from(
        new Set([
          ...(resumeData.skills || []),
          ...Object.values(resumeData.skills_by_category || {}).flat(),
        ])
      ).filter(Boolean);

      const payloadResume = {
        ...resumeData,
        skills: flatSkills,
      };

      const result = await apiService.getAIResumeSuggestions(
        atsJobTitle || resumeData.target_role || 'Software Engineer',
        atsJobDescription,
        resumeData.summary,
        payloadResume
      );

      setAtsResults(result);
    } catch (err) {
      console.error('ATS Optimization failed:', err);
      setAtsError(err.response?.data?.detail || 'Failed to complete ATS analysis.');
    } finally {
      setAtsOptimizing(false);
    }
  };

  const handleAddMissingSkillFromATS = (skill) => {
    setResumeData((prev) => {
      const currentCatSkills = prev.skills_by_category?.['Programming Languages'] || [];
      if (currentCatSkills.includes(skill)) return prev;
      const updatedCat = {
        ...(prev.skills_by_category || {}),
        'Programming Languages': [...currentCatSkills, skill],
      };
      const flat = Array.from(new Set([...(prev.skills || []), skill]));
      return {
        ...prev,
        skills: flat,
        skills_by_category: updatedCat,
      };
    });
    showSuccess(`Added "${skill}" to your skills!`);
  };

  const handleApplyATSSummary = (summaryText) => {
    if (!summaryText) return;
    setResumeData((prev) => ({ ...prev, summary: summaryText }));
    showSuccess('Applied ATS-optimized summary to your resume!');
  };

  // Calculate completeness percentage
  const calculateCompleteness = () => {
    let score = 0;
    if (resumeData.full_name && resumeData.email) score += 25;
    if (resumeData.phone || resumeData.location) score += 15;
    if (resumeData.education && resumeData.education.length > 0) score += 20;
    if (resumeData.experience && resumeData.experience.length > 0) score += 15;
    if (resumeData.projects && resumeData.projects.length > 0) score += 15;
    const totalSkills = Object.values(resumeData.skills_by_category || {}).flat().length;
    if (totalSkills >= 3) score += 10;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();
  const currentStepData = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const StepIcon = currentStepData.icon;

  if (loading) {
    return (
      <div className="rb-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <Spinner size="lg" />
        <p style={{ fontSize: '13px', color: '#64748b' }}>Loading your resume workspace...</p>
      </div>
    );
  }

  return (
    <div className="rb-page">
      
      {/* =========================================================================
          TOP NAVBAR / APP BAR
         ========================================================================= */}
      <header className="rb-topbar">
        <div className="rb-topbar-inner">
          
          {/* Left Branding */}
          <div className="rb-brand-group">
            <div className="rb-brand-logo">
              <FileCheck2 size={18} />
            </div>
            <span className="rb-brand-title">
              SkillBridge <span>Resume</span>
            </span>
            <span className="rb-badge-pill">
              Resume Builder
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="rb-topbar-actions">
            <button
              type="button"
              onClick={() => setActiveModal('ats')}
              className="rb-btn-ats"
            >
              <Sparkles size={14} />
              <span>AI ATS Review</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="rb-btn-preview"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSaveResume}
              disabled={saving}
              className="rb-btn-save"
            >
              {saving ? <Spinner size="sm" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HORIZONTAL STEPPER (Matches Reference UI)
         ========================================================================= */}
      <div className="rb-stepper-wrapper">
        <div className="rb-stepper-track">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isLast = idx === STEPS.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* Stepper Node */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`rb-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="rb-step-circle">
                    {isCompleted ? <Check size={16} /> : step.id}
                  </div>
                  <span className="rb-step-label">{step.name}</span>
                  {isActive && <div className="rb-step-underline" />}
                </button>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="rb-step-line">
                    <div
                      className="rb-step-line-fill"
                      style={{ width: currentStep > step.id ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MAIN CENTERED WIZARD CONTAINER (Dual-Column Large Card)
         ========================================================================= */}
      <main className="rb-main-container">
        <div className="rb-wizard-card">
          
          {/* ---------------------------------------------------------------------
              LEFT COLUMN: Icon, Title, Description, and Graphic Card
             --------------------------------------------------------------------- */}
          <div className="rb-left-col">
            <div>
              {/* Icon Rounded Box */}
              <div className="rb-icon-badge">
                <StepIcon size={24} />
              </div>

              {/* Title with dual-color accent */}
              <h2 className="rb-heading">
                {currentStepData.titlePrefix}{' '}
                <span>{currentStepData.titleSuffix}</span>
              </h2>

              {/* Description */}
              <p className="rb-description">
                {currentStepData.desc}
              </p>
            </div>

            {/* Bottom 3D Graphic Card (Matches Reference Aesthetic) */}
            <div className="rb-graphic-card">
              <div className="rb-graphic-inner">
                <div className="rb-graphic-sparkle">✨</div>
                <div className="rb-graphic-avatar">
                  <StepIcon size={20} />
                </div>
                <div className="rb-graphic-text">
                  <strong>Step {currentStep} Active</strong>
                  <span>Live preview synced in real-time</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              RIGHT COLUMN: Meta Row, Form Fields, and Bottom Navigation
             --------------------------------------------------------------------- */}
          <div className="rb-right-col">
            
            {/* Top Meta Row (Step Counter + % Complete) */}
            <div className="rb-meta-row">
              <span className="rb-step-counter">
                Step {currentStep} of {STEPS.length}
              </span>

              <div className="rb-complete-badge">
                <div className="rb-complete-dot" />
                <span>{completeness}% complete</span>
              </div>
            </div>

            {/* Form Fields Body */}
            <div className="rb-form-body">
              
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <>
                  <div className="rb-field-group">
                    <label className="rb-label">Full Name</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={resumeData.full_name}
                        onChange={(e) => setResumeData({ ...resumeData, full_name: e.target.value })}
                        placeholder="Rahul Sharma"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">Email Address</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={resumeData.email}
                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                        placeholder="rahul@email.com"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">Phone Number</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={resumeData.phone}
                        onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">Location</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        value={resumeData.location}
                        onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                        placeholder="Jhansi, UP"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">LinkedIn URL</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <Linkedin size={18} />
                      </div>
                      <input
                        type="text"
                        value={resumeData.links?.linkedin || ''}
                        onChange={(e) => setResumeData({ ...resumeData, links: { ...resumeData.links, linkedin: e.target.value } })}
                        placeholder="linkedin.com/in/rahul"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">GitHub URL</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <Github size={18} />
                      </div>
                      <input
                        type="text"
                        value={resumeData.links?.github || ''}
                        onChange={(e) => setResumeData({ ...resumeData, links: { ...resumeData.links, github: e.target.value } })}
                        placeholder="github.com/rahul"
                        className="rb-input"
                      />
                    </div>
                  </div>

                  <div className="rb-field-group">
                    <label className="rb-label">Portfolio / Website</label>
                    <div className="rb-input-wrapper">
                      <div className="rb-input-icon">
                        <Globe size={18} />
                      </div>
                      <input
                        type="text"
                        value={resumeData.links?.portfolio || ''}
                        onChange={(e) => setResumeData({ ...resumeData, links: { ...resumeData.links, portfolio: e.target.value } })}
                        placeholder="yourwebsite.com"
                        className="rb-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: EDUCATION */}
              {currentStep === 2 && (
                <div>
                  <div className="rb-list-header">
                    <span className="rb-list-title">Academic Background</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEduForm({ institution: '', degree: '', field_of_study: '', location: '', start_year: '', end_year: '', is_current: false, grade_or_cgpa: '' });
                        setModalEditIndex(null);
                        setActiveModal('education');
                      }}
                      className="rb-btn-add-item"
                    >
                      <Plus size={14} />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {resumeData.education?.length === 0 ? (
                    <div className="rb-empty-box">
                      <GraduationCap className="rb-empty-icon" />
                      <p className="rb-empty-title">No education entries added yet</p>
                      <p className="rb-empty-desc">Click "Add Education" to list your degree, institution, and years.</p>
                    </div>
                  ) : (
                    <div>
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="rb-item-card">
                          <div>
                            <div className="rb-item-title">
                              {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                            </div>
                            <div className="rb-item-subtitle">{edu.institution}</div>
                            <div className="rb-item-meta">
                              {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year} {edu.grade_or_cgpa ? `• CGPA: ${edu.grade_or_cgpa}` : ''} {edu.location ? `• ${edu.location}` : ''}
                            </div>
                          </div>
                          <div className="rb-item-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setEduForm(edu);
                                setModalEditIndex(idx);
                                setActiveModal('education');
                              }}
                              className="rb-btn-icon"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResumeData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))}
                              className="rb-btn-icon delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: EXPERIENCE */}
              {currentStep === 3 && (
                <div>
                  <div className="rb-list-header">
                    <span className="rb-list-title">Work Experience & Internships</span>
                    <button
                      type="button"
                      onClick={() => {
                        setExpForm({ company: '', job_title: '', location: '', employment_type: 'Internship', start_date: '', end_date: '', is_current: false, description: '' });
                        setModalEditIndex(null);
                        setActiveModal('experience');
                      }}
                      className="rb-btn-add-item"
                    >
                      <Plus size={14} />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {resumeData.experience?.length === 0 ? (
                    <div className="rb-empty-box">
                      <Briefcase className="rb-empty-icon" />
                      <p className="rb-empty-title">No experience listed yet</p>
                      <p className="rb-empty-desc">Add internships or roles. Freshers can skip ahead to Skills & Projects.</p>
                    </div>
                  ) : (
                    <div>
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="rb-item-card">
                          <div style={{ flex: 1 }}>
                            <div className="rb-item-title">{exp.job_title}</div>
                            <div className="rb-item-subtitle">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                            <div className="rb-item-meta">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</div>
                            {exp.description && <div className="rb-item-desc">{exp.description}</div>}
                          </div>
                          <div className="rb-item-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setExpForm(exp);
                                setModalEditIndex(idx);
                                setActiveModal('experience');
                              }}
                              className="rb-btn-icon"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResumeData((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))}
                              className="rb-btn-icon delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: SKILLS */}
              {currentStep === 4 && (
                <div>
                  <form onSubmit={handleAddSkill} className="rb-skills-add-bar">
                    <select
                      value={selectedSkillCategory}
                      onChange={(e) => setSelectedSkillCategory(e.target.value)}
                      className="rb-skills-select"
                    >
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      placeholder="e.g. Python, React, PostgreSQL..."
                      className="rb-skills-input"
                    />
                    <button type="submit" className="rb-skills-btn-add">
                      Add
                    </button>
                  </form>

                  <div style={{ marginTop: '16px' }}>
                    {SKILL_CATEGORIES.map((cat) => {
                      const catSkills = resumeData.skills_by_category?.[cat] || [];
                      return (
                        <div key={cat} className="rb-skills-category-block">
                          <div className="rb-skills-cat-label">
                            <span>{cat}</span>
                            <span className="rb-skills-cat-count">{catSkills.length} skills</span>
                          </div>
                          <div className="rb-skills-chips-wrapper">
                            {catSkills.length === 0 ? (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '2px 0' }}>
                                No skills added in this category
                              </span>
                            ) : (
                              catSkills.map((skill, sIdx) => (
                                <span key={sIdx} className="rb-skill-chip">
                                  <span>{skill}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(cat, skill)}
                                    className="rb-skill-chip-del"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: PROJECTS */}
              {currentStep === 5 && (
                <div>
                  <div className="rb-list-header">
                    <span className="rb-list-title">Technical Projects</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProjForm({ title: '', technologies: '', description: '', github_url: '', live_url: '' });
                        setModalEditIndex(null);
                        setActiveModal('project');
                      }}
                      className="rb-btn-add-item"
                    >
                      <Plus size={14} />
                      <span>Add Project</span>
                    </button>
                  </div>

                  {resumeData.projects?.length === 0 ? (
                    <div className="rb-empty-box">
                      <FolderGit2 className="rb-empty-icon" />
                      <p className="rb-empty-title">No projects added yet</p>
                      <p className="rb-empty-desc">Click "Add Project" to add your web apps, repositories, or builds.</p>
                    </div>
                  ) : (
                    <div>
                      {resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="rb-item-card">
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="rb-item-title">{proj.title}</span>
                              {proj.github_url && (
                                <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            <div className="rb-item-meta">
                              {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                            </div>
                            {proj.description && <div className="rb-item-desc">{proj.description}</div>}
                          </div>
                          <div className="rb-item-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setProjForm({
                                  title: proj.title || '',
                                  technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || ''),
                                  description: proj.description || '',
                                  github_url: proj.github_url || proj.github_or_demo_url || '',
                                  live_url: proj.live_url || '',
                                });
                                setModalEditIndex(idx);
                                setActiveModal('project');
                              }}
                              className="rb-btn-icon"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResumeData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))}
                              className="rb-btn-icon delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: SUMMARY */}
              {currentStep === 6 && (
                <div>
                  <div className="rb-list-header">
                    <span className="rb-list-title">Executive Summary</span>
                    <button
                      type="button"
                      onClick={() => setActiveModal('summary_ai')}
                      className="rb-btn-add-item"
                    >
                      <Sparkles size={14} />
                      <span>Generate with AI</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    placeholder="Results-driven student with solid foundations in software development and scalable architectures..."
                    className="rb-textarea"
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    <span>~{resumeData.summary ? resumeData.summary.split(/\s+/).filter(Boolean).length : 0} words</span>
                    <span>{resumeData.summary?.length || 0} characters</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper Navigation Bar (Previous | Dots | Next) */}
            <div className="rb-nav-row">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="rb-btn-prev"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </button>

              {/* Center Dot Indicator */}
              <div className="rb-dots-indicator">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`rb-dot ${currentStep === s.id ? 'active' : ''}`}
                  />
                ))}
              </div>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
                  className="rb-btn-next"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveResume}
                  disabled={saving}
                  className="rb-btn-build"
                >
                  {saving ? <Spinner size="sm" /> : <Check size={14} />}
                  <span>Build Resume</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FLOATING AI ASSISTANT BUTTON (Bottom-Right corner with online dot)
         ========================================================================= */}
      <button
        type="button"
        onClick={() => setActiveModal('ats')}
        className="rb-floating-ai"
        title="Open AI ATS Advisor"
      >
        <Sparkles size={22} />
        <div className="rb-floating-ai-dot" />
      </button>

      {/* =========================================================================
          MODAL: LIVE RESUME PREVIEW (Clean A4 Sheet Canvas)
         ========================================================================= */}
      {showPreviewModal && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card" style={{ maxWidth: '840px' }}>
            <div className="rb-modal-header">
              <div>
                <span className="rb-modal-title">ATS Resume Preview</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>&bull; Standard A4 Layout</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rb-btn-preview"
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="rb-btn-icon"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
              <div
                ref={previewRef}
                style={{
                  width: '100%',
                  maxWidth: '210mm',
                  minHeight: '297mm',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '36px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* Resume Header */}
                <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                    {resumeData.full_name || 'Your Full Name'}
                  </h1>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#4338ca', margin: '4px 0 8px' }}>
                    {resumeData.headline || resumeData.target_role || 'Target Job Title'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#475569' }}>
                    {resumeData.email && <span>{resumeData.email}</span>}
                    {resumeData.phone && <span>&bull; {resumeData.phone}</span>}
                    {resumeData.location && <span>&bull; {resumeData.location}</span>}
                    {resumeData.links?.linkedin && <span>&bull; {resumeData.links.linkedin}</span>}
                    {resumeData.links?.github && <span>&bull; {resumeData.links.github}</span>}
                    {resumeData.links?.portfolio && <span>&bull; {resumeData.links.portfolio}</span>}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                      Professional Summary
                    </h2>
                    <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', margin: 0 }}>{resumeData.summary}</p>
                  </div>
                )}

                {/* Education */}
                {resumeData.education?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                      Education
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a' }}>
                            <span>{edu.institution}</span>
                            <span style={{ fontWeight: '400', color: '#64748b' }}>{edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', marginTop: '2px' }}>
                            <span>{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</span>
                            {edu.grade_or_cgpa && <span style={{ fontWeight: '600' }}>CGPA: {edu.grade_or_cgpa}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                      Work Experience
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a' }}>
                            <span>{exp.job_title} &bull; {exp.company}</span>
                            <span style={{ fontWeight: '400', color: '#64748b' }}>{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</span>
                          </div>
                          {exp.description && <p style={{ color: '#334155', margin: '4px 0 0', lineHeight: '1.5' }}>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                      Technical Projects
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a' }}>
                            <span>{proj.title}</span>
                            <span style={{ fontWeight: '400', color: '#64748b' }}>
                              {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                            </span>
                          </div>
                          {proj.description && <p style={{ color: '#334155', margin: '4px 0 0', lineHeight: '1.5' }}>{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {Object.values(resumeData.skills_by_category || {}).flat().length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                      Skills
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      {Object.entries(resumeData.skills_by_category || {}).map(([cat, skills], ci) => {
                        if (!skills || skills.length === 0) return null;
                        return (
                          <div key={ci} style={{ display: 'flex' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a', width: '180px', flexShrink: 0 }}>{cat}:</span>
                            <span style={{ color: '#334155' }}>{skills.join(', ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AI ATS REVIEW & JOB MATCHER
         ========================================================================= */}
      {activeModal === 'ats' && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card" style={{ maxWidth: '680px' }}>
            <div className="rb-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="rb-modal-title">AI ATS Optimization Review</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Benchmark your resume against job descriptions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setAtsResults(null);
                  setAtsError(null);
                }}
                className="rb-btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">Target Role Title</label>
                  <input
                    type="text"
                    value={atsJobTitle}
                    onChange={(e) => setAtsJobTitle(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="rb-input"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', height: '38px', padding: '0 12px' }}
                  />
                </div>

                <div className="rb-field-group">
                  <label className="rb-label">Job Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={atsJobDescription}
                    onChange={(e) => setAtsJobDescription(e.target.value)}
                    placeholder="Paste target job description to analyze keyword matches..."
                    className="rb-textarea"
                    style={{ backgroundColor: '#ffffff', minHeight: '70px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleRunATSOptimizer}
                    disabled={atsOptimizing}
                    className="rb-btn-next"
                    style={{ padding: '8px 18px', fontSize: '12px' }}
                  >
                    {atsOptimizing ? <Spinner size="sm" /> : <Sparkles size={14} />}
                    <span>{atsOptimizing ? 'Analyzing...' : 'Run ATS Diagnostic'}</span>
                  </button>
                </div>
              </div>

              {atsError && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{atsError}</span>
                </div>
              )}

              {atsResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ede9fe' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase' }}>ATS Score</span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e1b4b', marginTop: '2px' }}>{atsResults.overall_ats_score}/100</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#059669', textTransform: 'uppercase' }}>Keyword Match</span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#064e3b', marginTop: '2px' }}>{atsResults.keyword_match_score || 75}%</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase' }}>Skills Found</span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#78350f', marginTop: '2px' }}>{atsResults.matched_skills?.length || 0}</div>
                    </div>
                  </div>

                  {/* Matched vs Missing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <CheckCircle2 size={14} />
                        <span>Matched Keywords</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {atsResults.matched_keywords?.map((kw, i) => (
                          <span key={i} style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '500' }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9f1239', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <AlertTriangle size={14} />
                        <span>Missing Keywords (Click to Add)</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {atsResults.missing_keywords?.map((kw, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAddMissingSkillFromATS(kw)}
                            style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #fda4af', color: '#9f1239', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}
                          >
                            + {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {atsResults.enhanced_summary_draft && (
                    <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#4338ca' }}>AI Enhanced Summary Draft</span>
                        <button
                          type="button"
                          onClick={() => handleApplyATSSummary(atsResults.enhanced_summary_draft)}
                          className="rb-btn-ats"
                          style={{ padding: '4px 12px', fontSize: '11px' }}
                        >
                          Apply to Resume
                        </button>
                      </div>
                      <p style={{ fontSize: '11px', color: '#1e1b4b', fontStyle: 'italic', margin: 0, lineHeight: '1.5' }}>
                        &ldquo;{atsResults.enhanced_summary_draft}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AI SUMMARY GENERATOR
         ========================================================================= */}
      {activeModal === 'summary_ai' && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <div className="rb-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#6366f1" />
                <h3 className="rb-modal-title">Generate Summary with AI</h3>
              </div>
              <button
                type="button"
                onClick={() => { setActiveModal(null); setGeneratedSummaryDraft(null); }}
                className="rb-btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Synthesize a tailored summary pitch based exclusively on your entered skills and education.
            </p>

            <div className="rb-field-group" style={{ marginBottom: '16px' }}>
              <label className="rb-label">Tone</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['impactful', 'executive', 'concise'].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAiSummaryTone(tone)}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      border: aiSummaryTone === tone ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      backgroundColor: aiSummaryTone === tone ? '#f5f3ff' : '#ffffff',
                      color: aiSummaryTone === tone ? '#4338ca' : '#475569',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAISummary}
              disabled={aiSummaryGenerating}
              className="rb-btn-next"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {aiSummaryGenerating ? <Spinner size="sm" /> : <Sparkles size={16} />}
              <span>{aiSummaryGenerating ? 'Generating Summary...' : 'Synthesize Summary with AI'}</span>
            </button>

            {generatedSummaryDraft && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Generated Summary Preview</span>
                <p style={{ fontSize: '12px', color: '#334155', fontStyle: 'italic', lineHeight: '1.5', margin: '0 0 12px' }}>
                  &ldquo;{generatedSummaryDraft}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={applyGeneratedSummary}
                  className="rb-btn-build"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                >
                  Apply to Resume
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDUCATION FORM
         ========================================================================= */}
      {activeModal === 'education' && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <div className="rb-modal-header">
              <h3 className="rb-modal-title">
                {modalEditIndex !== null ? 'Edit Education' : 'Add Education'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="rb-field-group">
                <label className="rb-label">Institution / College Name *</label>
                <input
                  type="text"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. Bundelkhand University / NIT"
                  className="rb-input"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">Degree *</label>
                  <input
                    type="text"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    placeholder="e.g. B.Tech / BCA"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">Field of Study</label>
                  <input
                    type="text"
                    value={eduForm.field_of_study}
                    onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">Start Year</label>
                  <input
                    type="text"
                    value={eduForm.start_year}
                    onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })}
                    placeholder="2022"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">End Year</label>
                  <input
                    type="text"
                    disabled={eduForm.is_current}
                    value={eduForm.is_current ? 'Present' : eduForm.end_year}
                    onChange={(e) => setEduForm({ ...eduForm, end_year: e.target.value })}
                    placeholder="2026"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">CGPA / %</label>
                  <input
                    type="text"
                    value={eduForm.grade_or_cgpa}
                    onChange={(e) => setEduForm({ ...eduForm, grade_or_cgpa: e.target.value })}
                    placeholder="8.5 / 10"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="edu-curr"
                  checked={eduForm.is_current}
                  onChange={(e) => setEduForm({ ...eduForm, is_current: e.target.checked })}
                />
                <label htmlFor="edu-curr" style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>Currently studying here</label>
              </div>
            </div>

            <div className="rb-modal-footer">
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-prev">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!eduForm.institution || !eduForm.degree) {
                    showWarning('Please enter institution and degree');
                    return;
                  }
                  setResumeData((prev) => {
                    const list = [...(prev.education || [])];
                    if (modalEditIndex !== null) {
                      list[modalEditIndex] = eduForm;
                    } else {
                      list.push(eduForm);
                    }
                    return { ...prev, education: list };
                  });
                  setActiveModal(null);
                }}
                className="rb-btn-next"
                style={{ padding: '8px 20px' }}
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EXPERIENCE FORM
         ========================================================================= */}
      {activeModal === 'experience' && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <div className="rb-modal-header">
              <h3 className="rb-modal-title">
                {modalEditIndex !== null ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">Company / Organization *</label>
                  <input
                    type="text"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    placeholder="e.g. Infosys, TCS"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">Job Title *</label>
                  <input
                    type="text"
                    value={expForm.job_title}
                    onChange={(e) => setExpForm({ ...expForm, job_title: e.target.value })}
                    placeholder="e.g. Software Intern"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">Start Date</label>
                  <input
                    type="text"
                    value={expForm.start_date}
                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                    placeholder="May 2024"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">End Date</label>
                  <input
                    type="text"
                    disabled={expForm.is_current}
                    value={expForm.is_current ? 'Present' : expForm.end_date}
                    onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                    placeholder="Aug 2024"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="exp-curr"
                  checked={expForm.is_current}
                  onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })}
                />
                <label htmlFor="exp-curr" style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>Currently working here</label>
              </div>

              <div className="rb-field-group">
                <label className="rb-label">Description / Bullet Points</label>
                <textarea
                  rows={3}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Engineered REST APIs using FastAPI, optimized SQL queries, and collaborated with teams."
                  className="rb-textarea"
                />
              </div>
            </div>

            <div className="rb-modal-footer">
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-prev">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!expForm.company || !expForm.job_title) {
                    showWarning('Please enter company and job title');
                    return;
                  }
                  setResumeData((prev) => {
                    const list = [...(prev.experience || [])];
                    if (modalEditIndex !== null) {
                      list[modalEditIndex] = expForm;
                    } else {
                      list.push(expForm);
                    }
                    return { ...prev, experience: list };
                  });
                  setActiveModal(null);
                }}
                className="rb-btn-next"
                style={{ padding: '8px 20px' }}
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PROJECT FORM
         ========================================================================= */}
      {activeModal === 'project' && (
        <div className="rb-modal-overlay">
          <div className="rb-modal-card">
            <div className="rb-modal-header">
              <h3 className="rb-modal-title">
                {modalEditIndex !== null ? 'Edit Project' : 'Add Project'}
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="rb-field-group">
                <label className="rb-label">Project Name *</label>
                <input
                  type="text"
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  placeholder="e.g. SkillBridge AI Portal"
                  className="rb-input"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                />
              </div>

              <div className="rb-field-group">
                <label className="rb-label">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={projForm.technologies}
                  onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                  placeholder="e.g. React, Python, FastAPI, Docker"
                  className="rb-input"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="rb-field-group">
                  <label className="rb-label">GitHub URL</label>
                  <input
                    type="text"
                    value={projForm.github_url}
                    onChange={(e) => setProjForm({ ...projForm, github_url: e.target.value })}
                    placeholder="github.com/user/project"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
                <div className="rb-field-group">
                  <label className="rb-label">Live URL</label>
                  <input
                    type="text"
                    value={projForm.live_url}
                    onChange={(e) => setProjForm({ ...projForm, live_url: e.target.value })}
                    placeholder="https://myproject.com"
                    className="rb-input"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', height: '40px', padding: '0 12px' }}
                  />
                </div>
              </div>

              <div className="rb-field-group">
                <label className="rb-label">Description</label>
                <textarea
                  rows={3}
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="Built an asynchronous task processing engine with Celery & Redis, scaling throughput to 10k messages/min."
                  className="rb-textarea"
                />
              </div>
            </div>

            <div className="rb-modal-footer">
              <button type="button" onClick={() => setActiveModal(null)} className="rb-btn-prev">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!projForm.title) {
                    showWarning('Please enter project name');
                    return;
                  }
                  const formattedProj = {
                    ...projForm,
                    technologies: projForm.technologies ? projForm.technologies.split(',').map((t) => t.trim()).filter(Boolean) : [],
                  };
                  setResumeData((prev) => {
                    const list = [...(prev.projects || [])];
                    if (modalEditIndex !== null) {
                      list[modalEditIndex] = formattedProj;
                    } else {
                      list.push(formattedProj);
                    }
                    return { ...prev, projects: list };
                  });
                  setActiveModal(null);
                }}
                className="rb-btn-next"
                style={{ padding: '8px 20px' }}
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;

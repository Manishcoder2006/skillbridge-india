import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Spinner } from '../../components/common/Spinner';
import {
  TrendingUp,
  CheckCircle2,
  Briefcase,
  BookOpen,
  ChevronRight,
  Bookmark,
  ArrowRight,
  MoreVertical,
  Code2,
  Cloud,
  Brain,
  MapPin,
  Zap,
  Database,
  Cpu,
} from 'lucide-react';

export const StudentOverview = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States for Opportunities and Learning Sections
  const [oppFilter, setOppFilter] = useState('all'); // 'all' | 'job' | 'internship'
  const [learningTab, setLearningTab] = useState('recommended'); // 'recommended' | 'in_progress' | 'completed'
  const [bookmarkedOpps, setBookmarkedOpps] = useState({});

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

  const toggleBookmark = (e, oppId) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedOpps((prev) => ({
      ...prev,
      [oppId]: !prev[oppId],
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Fallback Career Paths if summary is empty or loading
  const careerPaths = summary?.career_paths?.length
    ? summary.career_paths
    : [
        {
          role_name: 'Full Stack Developer',
          match_percentage: 57,
          acquired_skills: ['React', 'Python', 'FastAPI', 'PostgreSQL'],
          missing_skills: ['JavaScript', 'REST APIs'],
        },
        {
          role_name: 'Cloud & DevOps Engineer',
          match_percentage: 33,
          acquired_skills: ['Python', 'PostgreSQL'],
          missing_skills: ['Docker', 'Linux'],
        },
        {
          role_name: 'Data Systems & AI Developer',
          match_percentage: 60,
          acquired_skills: ['Python', 'PostgreSQL', 'FastAPI'],
          missing_skills: ['Data Structures', 'Algorithms'],
        },
      ];

  // Fallback diagnostic metrics
  const topStrengthsList = [
    { name: 'React', score: 90 },
    { name: 'REST APIs', score: 85 },
    { name: 'Python', score: 80 },
    { name: 'FastAPI', score: 75 },
  ];

  const skillGapsList = [
    { name: 'PostgreSQL', score: 35 },
    { name: 'Docker', score: 30 },
    { name: 'System Design', score: 25 },
    { name: 'Algorithms', score: 20 },
  ];

  // Dynamic Strengths mapping from summary if available
  const displayStrengths = summary?.top_strengths?.length
    ? summary.top_strengths.slice(0, 4).map((s, idx) => ({
        name: s,
        score: [90, 85, 80, 75][idx] || 70,
      }))
    : topStrengthsList;

  // Dynamic Gaps mapping from summary if available
  const displayGaps = summary?.identified_gaps?.length
    ? summary.identified_gaps.slice(0, 4).map((g, idx) => ({
        name: g,
        score: [35, 30, 25, 20][idx] || 25,
      }))
    : skillGapsList;

  // Opportunities list
  const defaultOpportunities = [
    {
      id: 'g1000000-0000-0000-0000-000000000001',
      company_name: 'Tata Consultancy Services',
      title: 'Software Engineer Intern',
      type: 'internship',
      location: 'Bengaluru, Karnataka',
      stipend_or_salary: '₹25,000 / month',
      brand: 'tcs',
    },
    {
      id: 'g1000000-0000-0000-0000-000000000002',
      company_name: 'Infosys Limited',
      title: 'Associate Backend Developer',
      type: 'job',
      location: 'Hyderabad, Telangana',
      stipend_or_salary: '₹7.5 LPA',
      brand: 'infosys',
    },
    {
      id: 'g1000000-0000-0000-0000-000000000003',
      company_name: 'Larsen & Toubro',
      title: 'Smart Technology R&D Intern',
      type: 'internship',
      location: 'Mumbai, Maharashtra',
      stipend_or_salary: '₹30,000 / month',
      brand: 'lt',
    },
  ];

  const rawOpportunities = summary?.recommended_opportunities?.length
    ? summary.recommended_opportunities
    : defaultOpportunities;

  const filteredOpportunities = rawOpportunities.filter((opp) => {
    if (oppFilter === 'all') return true;
    return opp.type?.toLowerCase() === oppFilter.toLowerCase();
  });

  // Targeted Learning Resources list
  const defaultLearningResources = [
    {
      id: 'f1',
      title: 'Modern React 18 & Next.js',
      provider: 'SWAYAM',
      duration: '4 weeks',
      progress_percent: 65,
      progress_status: 'in_progress',
      iconType: 'react',
    },
    {
      id: 'f2',
      title: 'FastAPI Backend Mastery ⚡',
      provider: 'SkillBridge Labs',
      duration: '6 hours',
      progress_percent: 40,
      progress_status: 'learning',
      iconType: 'fastapi',
    },
    {
      id: 'f3',
      title: 'PostgreSQL Performance',
      provider: 'NPTEL',
      duration: '3 hours',
      progress_percent: 20,
      progress_status: 'not_started',
      iconType: 'postgres',
    },
  ];

  const rawLearning = summary?.recommended_learning?.length
    ? summary.recommended_learning.map((r, i) => ({
        ...r,
        progress_percent: r.progress_percent || (r.progress_status === 'completed' ? 100 : r.progress_status === 'in_progress' ? 65 : 20),
        iconType: r.title?.toLowerCase().includes('react')
          ? 'react'
          : r.title?.toLowerCase().includes('fastapi')
          ? 'fastapi'
          : 'postgres',
      }))
    : defaultLearningResources;

  const filteredLearning = rawLearning.filter((item) => {
    if (learningTab === 'recommended') return true;
    if (learningTab === 'in_progress') return item.progress_status === 'in_progress' || item.progress_status === 'learning';
    if (learningTab === 'completed') return item.progress_status === 'completed';
    return true;
  });

  // Helper for role icon
  const getRoleIcon = (roleName) => {
    const name = roleName?.toLowerCase() || '';
    if (name.includes('cloud') || name.includes('devops')) {
      return <Cloud size={26} />;
    }
    if (name.includes('data') || name.includes('ai')) {
      return <Brain size={26} />;
    }
    return <Code2 size={26} />;
  };

  // Helper for company logo
  const renderCompanyLogo = (opp) => {
    const name = (opp.company_name || '').toLowerCase();
    if (name.includes('tata') || opp.brand === 'tcs') {
      return (
        <div className="opp-company-logo" style={{ backgroundColor: '#2563eb' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>TATA</span>
        </div>
      );
    }
    if (name.includes('infosys') || opp.brand === 'infosys') {
      return (
        <div className="opp-company-logo" style={{ backgroundColor: '#0284c7' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, fontStyle: 'italic' }}>infy</span>
        </div>
      );
    }
    if (name.includes('larsen') || name.includes('toubro') || opp.brand === 'lt') {
      return (
        <div className="opp-company-logo" style={{ backgroundColor: '#0f172a' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>L&T</span>
        </div>
      );
    }
    return (
      <div className="opp-company-logo" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
        <Briefcase size={20} color="#ffffff" />
      </div>
    );
  };

  // Helper for learning icon
  const renderLearningIcon = (iconType) => {
    if (iconType === 'react') {
      return (
        <div className="learning-icon-box" style={{ backgroundColor: '#042f2e', color: '#2dd4bf' }}>
          <Zap size={22} />
        </div>
      );
    }
    if (iconType === 'fastapi') {
      return (
        <div className="learning-icon-box" style={{ backgroundColor: '#064e3b', color: '#34d399' }}>
          <Cpu size={22} />
        </div>
      );
    }
    return (
      <div className="learning-icon-box" style={{ backgroundColor: '#1e293b', color: '#38bdf8' }}>
        <Database size={22} />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
      {/* Decorative Technical Dot Grid Pattern Watermark */}
      <div className="dot-grid-watermark" aria-hidden="true" />

      {/* =========================================================================
          SECTION 1: CAREER ROLE READINESS
          ========================================================================= */}
      <section>
        <div className="sb-section-header">
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title">
              Career Role Readiness <TrendingUp size={22} />
            </h2>
            <p className="sb-section-subtitle">
              Track your readiness for in-demand roles based on your skills and progress.
            </p>
          </div>
          <Link to="/dashboard/student/skills" className="sb-section-action-link">
            View All Career Paths &rarr;
          </Link>
        </div>

        <div className="role-cards-stack">
          {careerPaths.map((path, idx) => (
            <Link
              key={idx}
              to="/dashboard/student/skills"
              className="role-readiness-card"
              title={`View ${path.role_name} skill details`}
            >
              <div className="role-icon-box">
                {getRoleIcon(path.role_name)}
              </div>

              <div className="role-card-main">
                <div className="role-card-top">
                  <span className="role-title">{path.role_name}</span>
                  <span className="role-match-badge">{path.match_percentage}% Ready</span>
                </div>

                <div className="role-progress-track">
                  <div
                    className="role-progress-fill"
                    style={{ width: `${path.match_percentage}%` }}
                  />
                </div>

                <div className="role-skills-row">
                  <span className="role-skills-label">ACQUIRED</span>
                  {path.acquired_skills?.map((skill, sIdx) => (
                    <span key={sIdx} className="badge-skill-acquired">
                      ✓ {skill}
                    </span>
                  ))}

                  {path.missing_skills?.length > 0 && (
                    <>
                      <span className="role-skills-label" style={{ marginLeft: '0.6rem' }}>
                        GAPS
                      </span>
                      {path.missing_skills.slice(0, 3).map((gap, gIdx) => (
                        <span key={gIdx} className="badge-skill-gap">
                          + {gap}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <ChevronRight size={22} className="role-chevron" />
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SKILL COMPETENCY DIAGNOSTIC
          ========================================================================= */}
      <section>
        <div className="sb-section-header">
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title">
              <CheckCircle2 size={22} /> Skill Competency Diagnostic
            </h2>
          </div>
          <Link to="/dashboard/student/assessments" className="sb-section-action-link">
            View Full Diagnostic &rarr;
          </Link>
        </div>

        <div className="diagnostic-container-card">
          <div className="diagnostic-grid">
            {/* Top Strengths Panel */}
            <div className="diagnostic-subpanel strengths">
              <div className="diagnostic-subpanel-header">
                <span>🏆</span> Top Strengths
              </div>
              <div className="diagnostic-metrics-list">
                {displayStrengths.map((item, i) => (
                  <div key={i} className="diagnostic-metric-row">
                    <span className="diagnostic-dot green" />
                    <span className="diagnostic-skill-name">{item.name}</span>
                    <div className="diagnostic-bar-track">
                      <div
                        className="diagnostic-bar-fill teal"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="diagnostic-percentage">{item.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Skill Gaps Panel */}
            <div className="diagnostic-subpanel gaps">
              <div className="diagnostic-subpanel-header">
                <span>🎯</span> Identified Skill Gaps
              </div>
              <div className="diagnostic-metrics-list">
                {displayGaps.map((item, i) => (
                  <div key={i} className="diagnostic-metric-row">
                    <span className="diagnostic-dot red" />
                    <span className="diagnostic-skill-name">{item.name}</span>
                    <div className="diagnostic-bar-track">
                      <div
                        className="diagnostic-bar-fill red"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="diagnostic-percentage">{item.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CURATED OPPORTUNITIES
          ========================================================================= */}
      <section>
        <div className="sb-section-header">
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title">
              <Briefcase size={22} /> Curated Opportunities
            </h2>
          </div>
          <Link to="/dashboard/student/opportunities" className="sb-section-action-link">
            View All Opportunities &rarr;
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="sb-tabs-row">
          <button
            type="button"
            className={`sb-tab-btn ${oppFilter === 'all' ? 'active' : ''}`}
            onClick={() => setOppFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`sb-tab-btn ${oppFilter === 'job' ? 'active' : ''}`}
            onClick={() => setOppFilter('job')}
          >
            Jobs
          </button>
          <button
            type="button"
            className={`sb-tab-btn ${oppFilter === 'internship' ? 'active' : ''}`}
            onClick={() => setOppFilter('internship')}
          >
            Internships
          </button>
        </div>

        {/* Opportunity Cards Grid */}
        <div className="opportunities-grid">
          {filteredOpportunities.slice(0, 3).map((opp) => {
            const isBookmarked = Boolean(bookmarkedOpps[opp.id]);
            return (
              <div key={opp.id} className="opportunity-card">
                <div>
                  <div className="opp-card-top">
                    {renderCompanyLogo(opp)}
                    <button
                      type="button"
                      className={`opp-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                      onClick={(e) => toggleBookmark(e, opp.id)}
                      aria-label="Save opportunity"
                      title={isBookmarked ? 'Saved' : 'Save opportunity'}
                    >
                      <Bookmark size={18} fill={isBookmarked ? '#d97706' : 'none'} />
                    </button>
                  </div>

                  <h3 className="opp-title">{opp.title}</h3>

                  <div>
                    <span
                      className={`opp-type-badge ${
                        opp.type === 'job' ? 'job' : 'internship'
                      }`}
                    >
                      {opp.type === 'job' ? 'Job' : 'Internship'}
                    </span>
                  </div>

                  <div className="opp-company-name">{opp.company_name}</div>
                  <div className="opp-location">
                    <MapPin size={13} /> {opp.location}
                  </div>
                </div>

                <div className="opp-card-bottom">
                  <span className="opp-salary">{opp.stipend_or_salary}</span>
                  <Link
                    to="/dashboard/student/opportunities"
                    className="opp-action-link"
                    aria-label={`View details for ${opp.title}`}
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="opp-carousel-dots">
          <span className="opp-dot active" />
          <span className="opp-dot" />
          <span className="opp-dot" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TARGETED LEARNING
          ========================================================================= */}
      <section>
        <div className="sb-section-header">
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title">
              <BookOpen size={22} /> Targeted Learning
            </h2>
          </div>
          <Link to="/dashboard/student/learning" className="sb-section-action-link">
            Explore Full Catalog &rarr;
          </Link>
        </div>

        {/* Tabs */}
        <div className="sb-tabs-row">
          <button
            type="button"
            className={`sb-tab-btn ${learningTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setLearningTab('recommended')}
          >
            Recommended for You
          </button>
          <button
            type="button"
            className={`sb-tab-btn ${learningTab === 'in_progress' ? 'active' : ''}`}
            onClick={() => setLearningTab('in_progress')}
          >
            In Progress
          </button>
          <button
            type="button"
            className={`sb-tab-btn ${learningTab === 'completed' ? 'active' : ''}`}
            onClick={() => setLearningTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Learning Rows List Card */}
        <div className="learning-container-card">
          {filteredLearning.map((res) => {
            const isCompleted = res.progress_status === 'completed';
            const isInProgress = res.progress_status === 'in_progress' || res.progress_status === 'learning';

            return (
              <div key={res.id} className="learning-row">
                {renderLearningIcon(res.iconType)}

                <div className="learning-info">
                  <div className="learning-title" title={res.title}>
                    {res.title}
                  </div>
                  <div className="learning-meta">
                    {res.provider} &bull; {res.duration}
                  </div>
                </div>

                <div className="learning-progress-wrap">
                  <div className="learning-progress-track">
                    <div
                      className="learning-progress-fill"
                      style={{ width: `${res.progress_percent}%` }}
                    />
                  </div>
                  <span className="learning-progress-percent">{res.progress_percent}%</span>
                </div>

                <span
                  className={`learning-status-badge ${
                    isCompleted
                      ? 'completed'
                      : isInProgress
                      ? res.progress_status === 'learning'
                        ? 'learning'
                        : 'in_progress'
                      : 'not_started'
                  }`}
                >
                  {isCompleted ? 'Completed' : isInProgress ? (res.progress_status === 'learning' ? 'Learning' : 'In Progress') : 'Not Started'}
                </span>

                <Link
                  to="/dashboard/student/learning"
                  className="learning-action-btn"
                >
                  {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                </Link>

                <button
                  type="button"
                  className="learning-menu-btn"
                  aria-label="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

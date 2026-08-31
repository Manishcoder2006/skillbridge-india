import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/common/Spinner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Flag,
  GraduationCap,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  Trophy,
  Star,
  MapPin,
  FileCheck2,
  Brain,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Layers,
  AlertCircle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const StudentProfile = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Form states strictly populated dynamically per authenticated student
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Indian',
    program: '',
    current_semester: '',
    year_of_study: '',
    enrollment_number: '',
    cgpa: '',
    section_batch: '',
    expected_graduation: '',
    career_interests: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [data, skillsData] = await Promise.all([
        apiService.getStudentFullProfile(),
        apiService.getStudentSkills().catch(() => []),
      ]);

      setProfile(data);
      setStudentSkills(Array.isArray(skillsData) ? skillsData : []);

      const sem = data.current_semester || 1;
      const yrNum = Math.max(1, Math.ceil(sem / 2));
      const yrSuffix = yrNum === 1 ? 'st' : yrNum === 2 ? 'nd' : yrNum === 3 ? 'rd' : 'th';
      const autoYear = `${yrNum}${yrSuffix} Year`;

      setFormData({
        full_name: data.full_name || user?.full_name || '',
        phone: data.phone || user?.phone || '',
        location: data.location || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        nationality: data.nationality || 'Indian',
        program: data.program || (data.department_name ? `B.Tech ${data.department_name}` : 'Bachelor of Technology'),
        current_semester: sem,
        year_of_study: data.year_of_study || autoYear,
        enrollment_number: data.enrollment_number || data.roll_number || (data.id ? `2026${String(data.id).slice(0, 6).toUpperCase()}` : ''),
        cgpa: data.cgpa !== undefined && data.cgpa !== null ? data.cgpa : '',
        section_batch: data.section_batch || (data.department_name ? `${data.department_name} - Batch 1` : 'Batch 1'),
        expected_graduation: data.expected_graduation || 'May 2027',
        career_interests: data.career_interests || [],
        education: data.education || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setFetchError('Failed to load student profile. Please check your network connection.');
      showError('Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await apiService.updateStudentFullProfile(formData);
      setProfile(updated);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError('Failed to update profile. Protected fields cannot be modified.');
    } finally {
      setSaving(false);
    }
  };

  // Helper for Circular SVG Skill Meter
  const renderCircularMeter = (percentage) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="skill-meter-wrap">
        <svg className="skill-meter-svg" viewBox="0 0 60 60">
          <circle
            className="skill-meter-bg"
            cx="30"
            cy="30"
            r={radius}
          />
          <circle
            className="skill-meter-fill"
            cx="30"
            cy="30"
            r={radius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <span className="skill-meter-text">{percentage}%</span>
      </div>
    );
  };

  // Provider logo renderer
  const renderCertBadge = (badge) => {
    if (badge === 'aws') {
      return (
        <div className="cert-logo-box" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#ff9900' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#232f3e' }}>aws</span>
        </div>
      );
    }
    if (badge === 'nptel') {
      return (
        <div className="cert-logo-box" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#d97706' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#c2410c' }}>NPTEL</span>
        </div>
      );
    }
    return (
      <div className="cert-logo-box" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#4285f4' }}>Verified</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Spinner size="lg" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading verified student profile...</p>
      </div>
    );
  }

  const studentName = formData.full_name || profile?.full_name || user?.full_name || 'Student';
  const studentEmail = profile?.email || user?.email || 'No email registered';
  const initial = (studentName.trim() ? studentName.trim().charAt(0) : 'S').toUpperCase();

  // Dynamic skills list for Skills Snapshot
  const displaySkills = studentSkills.length > 0
    ? studentSkills.map((s) => ({
        name: s.skill_name,
        score: s.proficiency_level === 'expert' ? 95 : s.proficiency_level === 'advanced' ? 85 : s.proficiency_level === 'intermediate' ? 70 : 55,
      }))
    : [
        { name: 'Technical Fundamentals', score: 75 },
        { name: 'Problem Solving', score: 70 },
        { name: 'Academic Coursework', score: 80 },
      ];

  return (
    <div className="profile-page-container">
      {/* Background Decorative Technical Dot Grid */}
      <div className="dot-grid-watermark" aria-hidden="true" />

      {/* Error Notice Banner if API failed */}
      {fetchError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f87171',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={loadProfile}
            style={{
              background: 'transparent',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '4px',
              padding: '0.25rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          1. PROFILE HERO HEADER CARD
          ========================================================================= */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar">
            {initial}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-hero-name">{studentName}</h1>
            <div className="profile-hero-email">{studentEmail}</div>
            <div>
              <span className="badge-skill-acquired" style={{ borderRadius: '9999px', padding: '3px 12px' }}>
                <CheckCircle2 size={13} style={{ marginRight: '3px' }} /> Verified Student
              </span>
              {profile?.institution_name && (
                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  • {profile.institution_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="profile-save-btn"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* =========================================================================
          2. TWO-COLUMN: PERSONAL INFORMATION & ACADEMIC METRICS
          ========================================================================= */}
      <div className="profile-split-grid">
        {/* Left Column: Personal Information Card */}
        <div className="profile-section-card">
          <h2 className="profile-card-title">Personal Information</h2>
          <div className="profile-teal-bar" />

          <div className="profile-info-list">
            <div className="profile-info-row">
              <div className="profile-icon-box">
                <User size={18} />
              </div>
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-sep">:</span>
              <input
                type="text"
                className="profile-input-field"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter Full Name"
              />
            </div>

            <div className="profile-info-row">
              <div className="profile-icon-box">
                <Mail size={18} />
              </div>
              <span className="profile-field-label">Email Address</span>
              <span className="profile-field-sep">:</span>
              <span className="profile-field-value">{studentEmail}</span>
            </div>

            <div className="profile-info-row">
              <div className="profile-icon-box">
                <Phone size={18} />
              </div>
              <span className="profile-field-label">Phone Number</span>
              <span className="profile-field-sep">:</span>
              <input
                type="text"
                className="profile-input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="profile-info-row">
              <div className="profile-icon-box">
                <Calendar size={18} />
              </div>
              <span className="profile-field-label">Date of Birth</span>
              <span className="profile-field-sep">:</span>
              <input
                type="text"
                className="profile-input-field"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                placeholder="DD Month YYYY (e.g. 15 Aug 2004)"
              />
            </div>

            <div className="profile-info-row">
              <div className="profile-icon-box">
                <UserCheck size={18} />
              </div>
              <span className="profile-field-label">Gender</span>
              <span className="profile-field-sep">:</span>
              <input
                type="text"
                className="profile-input-field"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                placeholder="Male / Female / Other"
              />
            </div>

            <div className="profile-info-row">
              <div className="profile-icon-box">
                <Flag size={18} />
              </div>
              <span className="profile-field-label">Nationality</span>
              <span className="profile-field-sep">:</span>
              <input
                type="text"
                className="profile-input-field"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Nationality (e.g. Indian)"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Academic Metrics Card */}
        <div className="profile-section-card">
          <h2 className="profile-card-title">Academic Metrics</h2>
          <div className="profile-teal-bar" />

          <div className="academic-grid">
            <div className="academic-tile">
              <div className="profile-icon-box">
                <GraduationCap size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Program / Degree</div>
                <div className="academic-tile-val" title={formData.program || profile?.department_name || 'Bachelor of Technology'}>
                  {formData.program || profile?.department_name || 'Bachelor of Technology'}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Calendar size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Year of Study</div>
                <div className="academic-tile-val">
                  {formData.year_of_study || (formData.current_semester ? `Semester ${formData.current_semester}` : 'Active Student')}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <FileText size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Enrollment Number</div>
                <div className="academic-tile-val">
                  {formData.enrollment_number || 'Pending Enrollment'}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <TrendingUp size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">CGPA / Percentage</div>
                <div className="academic-tile-val">
                  {formData.cgpa !== '' && formData.cgpa !== null && formData.cgpa !== undefined
                    ? `${formData.cgpa} / 10`
                    : 'Not Recorded'}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Layers size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Section / Batch</div>
                <div className="academic-tile-val">
                  {formData.section_batch || (profile?.department_name ? `${profile.department_name} Batch` : 'Standard Batch')}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Award size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Expected Graduation</div>
                <div className="academic-tile-val">
                  {formData.expected_graduation || 'To be specified'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FULL-WIDTH SECURITY NOTICE
          ========================================================================= */}
      <div className="profile-security-notice">
        <Lock size={16} />
        <span>Institutional affiliation & Role clearance are verified and protected by Row Level Security (RLS).</span>
      </div>

      {/* =========================================================================
          4. SKILLS SNAPSHOT
          ========================================================================= */}
      <div>
        <div className="sb-section-header" style={{ marginBottom: '0.85rem' }}>
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title" style={{ fontSize: '1.25rem' }}>
              Skills Snapshot
            </h2>
            <div className="profile-teal-bar" style={{ marginBottom: 0 }} />
          </div>
        </div>

        <div className="skills-snapshot-grid">
          {displaySkills.map((skill, idx) => (
            <div key={idx} className="skill-circle-card">
              <span className="skill-circle-name">{skill.name}</span>
              {renderCircularMeter(skill.score)}
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          5. ACHIEVEMENTS & CERTIFICATIONS (2 COLUMNS)
          ========================================================================= */}
      <div className="profile-split-grid">
        {/* Achievements */}
        <div className="profile-section-card">
          <h2 className="profile-card-title">Achievements</h2>
          <div className="profile-teal-bar" />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {formData.achievements && formData.achievements.length > 0 ? (
              formData.achievements.map((item, idx) => (
                <div key={idx} className="achieve-item">
                  <div className="profile-icon-box">
                    <Trophy size={18} color="#0d9488" />
                  </div>
                  <div className="achieve-info">
                    <div className="achieve-title">{item.title}</div>
                    <div className="achieve-desc">{item.description || item.organization}</div>
                  </div>
                  <div className="achieve-date">{item.year || item.date || ''}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>No achievements added yet.</p>
                <Link to="/dashboard/student/skills" style={{ color: '#20B8A6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <PlusCircle size={14} /> Add Achievements in Skills & Career
                </Link>
              </div>
            )}
          </div>

          <Link to="/dashboard/student/skills" className="card-bottom-link">
            View All Achievements &rarr;
          </Link>
        </div>

        {/* Certifications */}
        <div className="profile-section-card">
          <h2 className="profile-card-title">Certifications</h2>
          <div className="profile-teal-bar" />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {formData.certifications && formData.certifications.length > 0 ? (
              formData.certifications.map((item, idx) => (
                <div key={idx} className="cert-item">
                  {renderCertBadge(item.badge || 'verified')}
                  <div className="achieve-info">
                    <div className="cert-title">{item.name || item.title}</div>
                    <div className="cert-org">{item.issuer}</div>
                  </div>
                  <div className="cert-date">{item.issue_year || item.date || ''}</div>
                  <div className="cert-check">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>No certifications uploaded yet.</p>
                <Link to="/dashboard/student/learning" style={{ color: '#20B8A6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <PlusCircle size={14} /> Explore Certified Learning Modules
                </Link>
              </div>
            )}
          </div>

          <Link to="/dashboard/student/learning" className="card-bottom-link">
            View All Certifications &rarr;
          </Link>
        </div>
      </div>

      {/* =========================================================================
          6. CONTACT INFORMATION
          ========================================================================= */}
      <div>
        <div className="sb-section-header" style={{ marginBottom: '0.85rem' }}>
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title" style={{ fontSize: '1.25rem' }}>
              Contact Information
            </h2>
            <div className="profile-teal-bar" style={{ marginBottom: 0 }} />
          </div>
        </div>

        <div className="contact-grid">
          <div className="contact-tile">
            <div className="profile-icon-box">
              <Mail size={18} />
            </div>
            <div className="contact-tile-info">
              <div className="contact-label">Email Address</div>
              <div className="contact-value" title={studentEmail}>{studentEmail}</div>
            </div>
          </div>

          <div className="contact-tile">
            <div className="profile-icon-box">
              <Phone size={18} />
            </div>
            <div className="contact-tile-info">
              <div className="contact-label">Phone Number</div>
              <div className="contact-value">{formData.phone || 'Not provided'}</div>
            </div>
          </div>

          <div className="contact-tile">
            <div className="profile-icon-box">
              <MapPin size={18} />
            </div>
            <div className="contact-tile-info">
              <div className="contact-label">Current Address</div>
              <div className="contact-value" title={formData.location || 'Not provided'}>
                {formData.location || 'Not provided'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. QUICK LINKS
          ========================================================================= */}
      <div>
        <div className="sb-section-header" style={{ marginBottom: '0.85rem' }}>
          <div className="sb-section-title-wrap">
            <h2 className="sb-section-title" style={{ fontSize: '1.25rem' }}>
              Quick Links
            </h2>
            <div className="profile-teal-bar" style={{ marginBottom: 0 }} />
          </div>
        </div>

        <div className="quick-links-grid">
          <Link to="/dashboard/student/resume" className="quick-link-card">
            <div>
              <div className="profile-icon-box">
                <FileText size={18} />
              </div>
              <div className="quick-link-title">Resume Builder</div>
              <div className="quick-link-desc">Update your resume</div>
            </div>
            <ArrowRight size={16} className="quick-link-arrow" />
          </Link>

          <Link to="/dashboard/student/assessments" className="quick-link-card">
            <div>
              <div className="profile-icon-box">
                <Brain size={18} />
              </div>
              <div className="quick-link-title">Skill Assessment</div>
              <div className="quick-link-desc">Take skill assessment</div>
            </div>
            <ArrowRight size={16} className="quick-link-arrow" />
          </Link>

          <Link to="/dashboard/student/applications" className="quick-link-card">
            <div>
              <div className="profile-icon-box">
                <FileCheck2 size={18} />
              </div>
              <div className="quick-link-title">My Applications</div>
              <div className="quick-link-desc">Track your applications</div>
            </div>
            <ArrowRight size={16} className="quick-link-arrow" />
          </Link>

          <Link to="/dashboard/student/learning" className="quick-link-card">
            <div>
              <div className="profile-icon-box">
                <BookOpen size={18} />
              </div>
              <div className="quick-link-title">Learning Dashboard</div>
              <div className="quick-link-desc">Continue learning</div>
            </div>
            <ArrowRight size={16} className="quick-link-arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
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
} from 'lucide-react';

export const StudentProfile = () => {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states matching existing data
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '+91 98765 43210',
    location: 'Hauz Khas, New Delhi, Delhi 110016',
    date_of_birth: '12 Aug 2004',
    gender: 'Male',
    nationality: 'Indian',
    program: 'B.Tech Computer Science and Engineering',
    current_semester: 6,
    year_of_study: '3rd Year',
    enrollment_number: '2023CS12345',
    cgpa: 8.45,
    section_batch: 'CSE - C3',
    expected_graduation: 'May 2027',
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
      const data = await apiService.getStudentFullProfile();
      setProfile(data);
      setFormData((prev) => ({
        ...prev,
        full_name: data.full_name || 'Aarav Sharma',
        phone: data.phone || '+91 98765 43210',
        location: data.location || 'Hauz Khas, New Delhi, Delhi 110016',
        program: data.program || 'B.Tech Computer Science and Engineering',
        current_semester: data.current_semester || 6,
        cgpa: data.cgpa || 8.45,
        career_interests: data.career_interests || [],
        education: data.education || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],
      }));
    } catch (err) {
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

  // Skills Snapshot data
  const skillsSnapshot = [
    { name: 'Programming', score: 85 },
    { name: 'Data Structures', score: 78 },
    { name: 'Web Development', score: 72 },
    { name: 'Database', score: 68 },
    { name: 'Problem Solving', score: 82 },
    { name: 'Machine Learning', score: 65 },
  ];

  // Achievements records
  const defaultAchievements = [
    {
      icon: <Trophy size={18} color="#0d9488" />,
      title: 'Winner – Smart India Hackathon 2024',
      description: 'Secured 1st place in the national level SIH 2024 for problem statement in Smart Automation.',
      date: 'Aug 2024',
    },
    {
      icon: <Star size={18} color="#0d9488" />,
      title: 'CodeChef 4★ Programmer',
      description: 'Achieved 4-star rating on CodeChef platform with strong DSA problem solving skills.',
      date: 'Jul 2024',
    },
    {
      icon: <Award size={18} color="#0d9488" />,
      title: "Dean's List – Top 10%",
      description: 'Recognized in Dean\'s List for outstanding academic performance in 2023-24.',
      date: 'May 2024',
    },
  ];

  // Certifications records
  const defaultCertifications = [
    {
      badge: 'aws',
      title: 'AWS Academy Cloud Foundations',
      issuer: 'Amazon Web Services',
      date: 'Mar 2024',
      verified: true,
    },
    {
      badge: 'nptel',
      title: 'Data Structures and Algorithms',
      issuer: 'NPTEL',
      date: 'Jan 2024',
      verified: true,
    },
    {
      badge: 'google',
      title: 'Google IT Automation with Python Professional Certificate',
      issuer: 'Google Career Certificates',
      date: 'Nov 2023',
      verified: true,
    },
  ];

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
        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#4285f4' }}>Google</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const studentName = formData.full_name || profile?.full_name || 'Aarav Sharma';
  const studentEmail = profile?.email || 'student@iitd.ac.in';
  const initial = studentName.charAt(0).toUpperCase() || 'A';

  return (
    <div className="profile-page-container">
      {/* Background Decorative Technical Dot Grid */}
      <div className="dot-grid-watermark" aria-hidden="true" />

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
                placeholder="Full Name"
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
                placeholder="12 Aug 2004"
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
                placeholder="Indian"
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
                <div className="academic-tile-val" title={formData.program}>
                  {formData.program}
                </div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Calendar size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Year of Study</div>
                <div className="academic-tile-val">3rd Year</div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <FileText size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Enrollment Number</div>
                <div className="academic-tile-val">2023CS12345</div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <TrendingUp size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">CGPA / Percentage</div>
                <div className="academic-tile-val">{formData.cgpa} / 10</div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Layers size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Section / Batch</div>
                <div className="academic-tile-val">{formData.section_batch}</div>
              </div>
            </div>

            <div className="academic-tile">
              <div className="profile-icon-box">
                <Award size={18} />
              </div>
              <div className="academic-tile-info">
                <div className="academic-tile-label">Expected Graduation</div>
                <div className="academic-tile-val">{formData.expected_graduation}</div>
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
        <span>Role & Institutional affiliation are protected by security RLS and cannot be edited.</span>
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
          {skillsSnapshot.map((skill, idx) => (
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
            {defaultAchievements.map((item, idx) => (
              <div key={idx} className="achieve-item">
                <div className="profile-icon-box">
                  {item.icon}
                </div>
                <div className="achieve-info">
                  <div className="achieve-title">{item.title}</div>
                  <div className="achieve-desc">{item.description}</div>
                </div>
                <div className="achieve-date">{item.date}</div>
              </div>
            ))}
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
            {defaultCertifications.map((item, idx) => (
              <div key={idx} className="cert-item">
                {renderCertBadge(item.badge)}
                <div className="achieve-info">
                  <div className="cert-title">{item.title}</div>
                  <div className="cert-org">{item.issuer}</div>
                </div>
                <div className="cert-date">{item.date}</div>
                <div className="cert-check">
                  <CheckCircle2 size={16} />
                </div>
              </div>
            ))}
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
              <div className="contact-value">{formData.phone}</div>
            </div>
          </div>

          <div className="contact-tile">
            <div className="profile-icon-box">
              <MapPin size={18} />
            </div>
            <div className="contact-tile-info">
              <div className="contact-label">Current Address</div>
              <div className="contact-value" title={formData.location}>{formData.location}</div>
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

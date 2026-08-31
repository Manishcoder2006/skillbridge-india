import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Briefcase,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  Layers,
  AlertCircle,
  School
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiService } from '../../services/api';
import { Logo } from '../../components/common/Logo';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student', // 'student' | 'academician' | 'industry_hr' | 'institution_admin'
    institution_id: '',
    department_id: '',
    company_name: '',
    phone: '',
    agree_terms: true,
  });

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load safe public institutions list on mount
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const data = await apiService.getPublicInstitutions();
        setInstitutions(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            institution_id: data[0].id,
          }));
        }
      } catch (err) {
        console.warn('Failed to load institutions list:', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    loadInstitutions();
  }, []);

  // Update departments whenever institution changes
  useEffect(() => {
    if (formData.institution_id && institutions.length > 0) {
      const selectedInst = institutions.find((i) => String(i.id) === String(formData.institution_id));
      if (selectedInst && selectedInst.departments) {
        setDepartments(selectedInst.departments);
        if (selectedInst.departments.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: selectedInst.departments[0].id }));
        } else {
          setFormData((prev) => ({ ...prev, department_id: '' }));
        }
      }
    }
  }, [formData.institution_id, institutions]);

  const handleChange = (field, value) => {
    setClientError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');

    if (!formData.full_name || !formData.email || !formData.password) {
      setClientError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return;
    }

    if (formData.confirm_password && formData.password !== formData.confirm_password) {
      setClientError('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.agree_terms) {
      setClientError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (['student', 'academician'].includes(formData.role) && !formData.institution_id) {
      setClientError('Please select your registered educational institution.');
      return;
    }

    if (formData.role === 'industry_hr' && !formData.company_name) {
      setClientError('Please specify your registered enterprise/company name.');
      return;
    }

    if (formData.role === 'institution_admin') {
      setClientError('Institution Admin accounts require verified administrative authorization. Please contact support.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        institution_id: ['student', 'academician'].includes(formData.role) ? formData.institution_id : undefined,
        department_id: ['student', 'academician'].includes(formData.role) ? formData.department_id : undefined,
        company_name: formData.role === 'industry_hr' ? formData.company_name : undefined,
        phone: formData.phone.trim() || undefined,
      };

      const user = await register(payload);
      showToast('Account registered successfully! Welcome to SkillBridge India.', 'success');
      navigate(`/dashboard/${formData.role === 'industry_hr' ? 'industry' : formData.role}`);
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      setClientError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'academician', label: 'Academician / Faculty', icon: School },
    { id: 'industry_hr', label: 'Industry / HR', icon: Briefcase },
    { id: 'institution_admin', label: 'Institution Admin', icon: Shield },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F8FA',
        color: '#07111F',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Responsive Two-Column Layout Container */}
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* ===================================================================
            LEFT SIDE: Sophisticated Brand / Hero Section (~42-45% width)
           =================================================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.75rem',
            padding: '1rem 0.5rem',
          }}
        >
          {/* Top Logo & Platform Identifier */}
          <div>
            <Logo size="md" theme="light" subtitle="SIH 2026 PS 26044" />

            {/* Headline Section */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8491A3', fontFamily: 'monospace' }}>
                  05
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#14B8A6',
                    textTransform: 'uppercase',
                  }}
                >
                  FUTURISTIC LEARNING
                </span>
              </div>

              <h1
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  lineHeight: '1.05',
                  letterSpacing: '-0.03em',
                  color: '#07111F',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                NEW DIGITAL
                <br />
                <span style={{ color: '#14B8A6', fontWeight: 800 }}>UNIVERSE</span>
              </h1>

              <p
                style={{
                  fontSize: '0.925rem',
                  color: '#526176',
                  marginTop: '1.25rem',
                  lineHeight: '1.6',
                  maxWidth: '420px',
                }}
              >
                Join thousands of learners, academicians and industry experts building the future together on SkillBridge India.
              </p>

              {/* Thin Teal Accent Line */}
              <div
                style={{
                  width: '45px',
                  height: '3px',
                  backgroundColor: '#14B8A6',
                  borderRadius: '2px',
                  marginTop: '1rem',
                }}
              />
            </div>
          </div>

          {/* Visual Graphic Area with White Curved Campus Architecture */}
          <div style={{ position: 'relative', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            {/* Dotted Grid Decoration in background */}
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-15px',
                zIndex: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 5px)',
                gridTemplateRows: 'repeat(6, 5px)',
                gap: '8px',
                opacity: 0.35,
              }}
            >
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: '#8491A3',
                  }}
                />
              ))}
            </div>

            {/* Connecting thin geometric line */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                right: '-30px',
                width: '120px',
                height: '2px',
                backgroundColor: 'rgba(20, 184, 166, 0.4)',
                transform: 'rotate(-20deg)',
                zIndex: 0,
              }}
            />

            {/* Main Campus Image Box */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                height: '270px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -15px rgba(7, 17, 31, 0.12)',
                backgroundColor: '#ffffff',
                border: '1px solid #E5E9EF',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <img
                src="/assets/white_curved_campus.jpg"
                alt="Futuristic Campus Architecture"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            </div>

            {/* Floating Trust / Statistics Card Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '-15px',
                left: '-10px',
                zIndex: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
                padding: '0.85rem 1.15rem',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E9EF',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                minWidth: '135px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    backgroundColor: '#ccfbf1',
                    color: '#14B8A6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={13} />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#526176', fontWeight: 600 }}>Trusted by</span>
              </div>

              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#07111F', lineHeight: 1 }}>
                20+
              </div>

              <div style={{ fontSize: '0.7rem', color: '#526176', fontWeight: 600 }}>
                Institutions
              </div>

              {/* Avatar stack */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.15rem' }}>
                {['IITD', 'NITK', 'CEG', 'PICT'].map((inst, i) => (
                  <div
                    key={i}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: ['#14B8A6', '#0284c7', '#4f46e5', '#d97706'][i],
                      color: '#ffffff',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                      marginLeft: i > 0 ? '-6px' : '0',
                    }}
                  >
                    {inst[0]}
                  </div>
                ))}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#e6fffa',
                    color: '#14B8A6',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                    marginLeft: '-6px',
                  }}
                >
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Bottom White Quote Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              border: '1px solid #E5E9EF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              maxWidth: '440px',
            }}
          >
            <div style={{ color: '#14B8A6', fontSize: '2rem', lineHeight: 0.8, fontWeight: 900, fontFamily: 'serif' }}>
              “
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#526176', lineHeight: '1.45', fontStyle: 'italic' }}>
                "Education is the most powerful weapon which you can use to change the world."
              </p>
              <div style={{ fontSize: '0.72rem', color: '#07111F', fontWeight: 700, marginTop: '0.3rem' }}>
                — Nelson Mandela
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT SIDE: Large Distinct WHITE Registration Panel (~55-58% width)
           =================================================================== */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E9EF',
            borderRadius: '22px',
            padding: '2.25rem 2.25rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#07111F',
                margin: '0 0 0.35rem 0',
              }}
            >
              Create <span style={{ color: '#14B8A6' }}>Your</span> Account
            </h2>
            <p style={{ color: '#526176', fontSize: '0.875rem', margin: 0, lineHeight: 1.45 }}>
              Join SkillBridge India and start your journey towards a smarter future.
            </p>
          </div>

          {/* Role Selection Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.25rem 0',
              color: '#8491A3',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E9EF' }} />
            <span>ROLE SELECTION</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E9EF' }} />
          </div>

          {/* Client Error Alert */}
          {clientError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{clientError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* 2x2 Role Selector Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                gap: '0.75rem',
              }}
            >
              {roles.map((r) => {
                const IconComponent = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleChange('role', r.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(20, 184, 166, 0.07)' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #14B8A6' : '1px solid #E5E9EF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(20, 184, 166, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          color: isSelected ? '#14B8A6' : '#526176',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <IconComponent size={18} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? '#07111F' : '#526176',
                        }}
                      >
                        {r.label}
                      </span>
                    </div>

                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#14B8A6',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Institution Admin Notice */}
            {formData.role === 'institution_admin' && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#92400e',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Shield size={14} style={{ flexShrink: 0 }} />
                <span>Institution Admin accounts require verified administrative invitation.</span>
              </div>
            )}

            {/* Form Fields 2-Column Responsive Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: '1rem',
              }}
            >
              {/* 1. Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8491A3',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '2px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 4. Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange('confirm_password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#8491A3',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '2px',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 5. Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Mobile Number <span style={{ color: '#8491A3', fontWeight: 500 }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 6. Registered Institution or Company Name */}
              {['student', 'academician', 'institution_admin'].includes(formData.role) ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                    Registered Institution <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Building size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                    <select
                      required
                      value={formData.institution_id}
                      onChange={(e) => handleChange('institution_id', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E9EF',
                        borderRadius: '8px',
                        color: '#07111F',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#14B8A6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E9EF';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {institutions.length === 0 ? (
                        <option value="" disabled>
                          Loading institutions...
                        </option>
                      ) : (
                        institutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name} ({inst.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              ) : (
                /* Industry HR Company Name */
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                    Company / Organization <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Briefcase size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Consultancy Services"
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E9EF',
                        borderRadius: '8px',
                        color: '#07111F',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#14B8A6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E9EF';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Department (for student / faculty when available) */}
            {['student', 'academician'].includes(formData.role) && departments.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#07111F', marginBottom: '0.35rem' }}>
                  Department / Discipline <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Layers size={16} style={{ position: 'absolute', left: '12px', color: '#8491A3', pointerEvents: 'none' }} />
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => handleChange('department_id', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E9EF',
                      borderRadius: '8px',
                      color: '#07111F',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#14B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E9EF';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Terms & Privacy Agreement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
              <input
                type="checkbox"
                id="agree_terms"
                checked={formData.agree_terms}
                onChange={(e) => handleChange('agree_terms', e.target.checked)}
                style={{
                  accentColor: '#14B8A6',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                }}
              />
              <label htmlFor="agree_terms" style={{ fontSize: '0.78rem', color: '#526176', cursor: 'pointer' }}>
                I agree to the{' '}
                <span style={{ color: '#14B8A6', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</span> and{' '}
                <span style={{ color: '#14B8A6', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</span>
              </label>
            </div>

            {/* Create Account Primary CTA Button */}
            <div style={{ marginTop: '0.35rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #20C7B5 0%, #14B8A6 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.35)',
                  opacity: isSubmitting ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#FFFFFF' }} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Create Account
                  </>
                )}
              </button>
            </div>

            {/* Sign In Link */}
            <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.82rem', color: '#526176' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#14B8A6', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </form>

          {/* Subtle 4-Item Feature Strip inside bottom of signup card */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #E5E9EF',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {/* Feature 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={16} color="#14B8A6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#07111F' }}>Secure & Private</div>
                <div style={{ fontSize: '0.65rem', color: '#8491A3' }}>Enterprise security</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={16} color="#14B8A6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#07111F' }}>AI Powered</div>
                <div style={{ fontSize: '0.65rem', color: '#8491A3' }}>Smart growth tools</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <TrendingUp size={16} color="#14B8A6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#07111F' }}>Track Progress</div>
                <div style={{ fontSize: '0.65rem', color: '#8491A3' }}>Skill milestones</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Users size={16} color="#14B8A6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#07111F' }}>Collaborate</div>
                <div style={{ fontSize: '0.65rem', color: '#8491A3' }}>Industry mentors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

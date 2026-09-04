import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building,
  Briefcase,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Logo } from '../../components/common/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, loginWithMockRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'student':
        return '/dashboard/student';
      case 'academician':
        return '/dashboard/academician';
      case 'industry_hr':
        return '/dashboard/industry';
      case 'institution_admin':
        return '/dashboard/institution';
      case 'super_admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.full_name || 'User'}!`);
      const target = location.state?.from?.pathname || getDashboardRoute(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      const errText = err.message || 'Invalid credentials. Please verify your email and password.';
      setErrorMessage(errText);
      showError(errText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevMockLogin = async (role) => {
    setIsSubmitting(true);
    try {
      const user = await loginWithMockRole(role);
      showSuccess(`[Demo Access] Logged in as ${user.full_name}`);
      const target = location.state?.from?.pathname || getDashboardRoute(role);
      navigate(target, { replace: true });
    } catch (err) {
      showError(err.message || 'Dev mock login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockUsers = [
    { role: 'student', name: 'Student (Aarav)', desc: 'B.Tech CSE, Year 3', icon: GraduationCap, color: '#20B8A6' },
    { role: 'academician', name: 'Faculty (Dr. Seshadri)', desc: 'HOD, CSE Dept', icon: Building, color: '#f59e0b' },
    { role: 'industry_hr', name: 'Industry (Sarah Jenkins)', desc: 'Lead Talent Partner', icon: Briefcase, color: '#10b981' },
    { role: 'institution_admin', name: 'Admin (Dr. Rao)', desc: 'Dean of Academics', icon: Shield, color: '#6366f1' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F6F4',
        color: '#071019',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Slim Dark Top Information Bar (Matching Landing Page) */}
      <div
        style={{
          backgroundColor: '#071019',
          color: '#cbd5e1',
          padding: '0.45rem clamp(1rem, 3vw, 2rem)',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.04em', flexWrap: 'wrap' }}>
          <span style={{ color: '#20B8A6', fontWeight: 800 }}>SKILLBRIDGE INDIA</span>
          <span style={{ opacity: 0.5, color: '#94a3b8' }}>•</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>CONNECTING TALENT WITH OPPORTUNITY</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em' }}>
          STUDENTS &nbsp;•&nbsp; ACADEMIA &nbsp;•&nbsp; INDUSTRY
        </div>
      </div>

      {/* 2. Clean White Navigation / Header with Official SB Logo */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.85rem clamp(1rem, 3.5vw, 2.5rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Logo size="md" theme="light" />
        <Link
          to="/register"
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#071019',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          Create Account
        </Link>
      </header>

      {/* 3. Centered Content Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Elevated Pure White Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2.5rem 2.25rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0d9488',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#20B8A6',
                    display: 'inline-block',
                  }}
                />
                PORTAL AUTHENTICATION
              </div>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#071019',
                  margin: '0 0 0.35rem 0',
                }}
              >
                Sign <span style={{ color: '#20B8A6' }}>In</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                Access your personalized stakeholder dashboard & AI career pathways.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Email Address Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#071019',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#20B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(32, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.4rem 0.75rem 2.4rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#071019',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#20B8A6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(32, 184, 166, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
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
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '2px',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: '#20B8A6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: '0.01em',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(32, 184, 166, 0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0d9488';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#20B8A6';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#ffffff' }} />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} /> Sign In
                    </>
                  )}
                </button>
              </div>

              {/* Register Link */}
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#0d9488', fontWeight: 700, textDecoration: 'none' }}>
                  Create Account
                </Link>
              </div>
            </form>

            {/* Quick Demo Role Switcher */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.72rem',
                  color: '#0d9488',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.75rem',
                }}
              >
                <Zap size={14} color="#20B8A6" /> One-Click Stakeholder Demo Access
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                {mockUsers.map((u) => {
                  const IconComponent = u.icon;
                  return (
                    <button
                      key={u.role}
                      type="button"
                      onClick={() => handleDevMockLogin(u.role)}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.7rem 0.8rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#071019',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#20B8A6';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(32, 184, 166, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          color: u.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#071019' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {u.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Minimal Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.75rem', color: '#64748b' }}>
            © 2026 SkillBridge India • SIH 2026 Problem Statement 26044
          </div>
        </div>
      </div>
    </div>
  );
};

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
        backgroundColor: '#071019',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Centered Brand & Form Container */}
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header with Unified SB Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo theme="dark" size="lg" />
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.4rem', letterSpacing: '0.04em' }}>
            SIH 2026 • Problem Statement 26044
          </div>
        </div>

        {/* Elevated Dark Card */}
        <div
          style={{
            backgroundColor: '#0c1722',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2.25rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                margin: '0 0 0.4rem 0',
              }}
            >
              Sign <span style={{ color: '#20B8A6' }}>In</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.45 }}>
              Access your personalized stakeholder dashboard & AI career pathways.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email Address Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Email Address <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                    backgroundColor: '#132233',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#20B8A6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Password <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 2.4rem 0.7rem 2.4rem',
                    backgroundColor: '#132233',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#20B8A6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '2px',
                  }}
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
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #20B8A6 50%, #0d9488 100%)',
                  color: '#071019',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(32, 184, 166, 0.35)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#071019' }} />
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
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#20B8A6', fontWeight: 700, textDecoration: 'none' }}>
                Create Account
              </Link>
            </div>
          </form>

          {/* Quick Demo Role Switcher */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.72rem',
                color: '#20B8A6',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}
            >
              <Zap size={14} /> One-Click Stakeholder Demo Access
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {mockUsers.map((u) => {
                const IconComponent = u.icon;
                return (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => handleDevMockLogin(u.role)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.65rem 0.75rem',
                      backgroundColor: '#132233',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = u.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    <div style={{ color: u.color, display: 'flex', alignItems: 'center' }}>
                      <IconComponent size={16} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.72rem', color: '#64748b' }}>
          © 2026 SkillBridge India. All rights reserved.
        </div>
      </div>
    </div>
  );
};

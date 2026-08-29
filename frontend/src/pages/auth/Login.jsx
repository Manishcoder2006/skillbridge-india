import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  Shield,
  GraduationCap,
  Building2,
  Briefcase,
  UserCheck,
  Zap,
  Info,
  Building,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithMockRole } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
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
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.full_name || 'User'}!`);
      const target = location.state?.from?.pathname || getDashboardRoute(user.role);
      navigate(target, { replace: true });
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevMockLogin = async (role) => {
    setIsSubmitting(true);
    try {
      const user = await loginWithMockRole(role);
      showSuccess(`[Dev Mode] Signed in as ${user.full_name} (${role.replace('_', ' ')})`);
      const target = location.state?.from?.pathname || getDashboardRoute(role);
      navigate(target, { replace: true });
    } catch (err) {
      showError(err.message || 'Dev mock login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-teal))',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              SB
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>SkillBridge India</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Portal for Academia–Industry Collaboration (SIH 2026 PS 26044)
          </p>
        </div>

        {/* Temporary Development-Only Mock Authentication Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap size={18} color="#14b8a6" />
            <strong style={{ color: '#14b8a6', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Development Mock Authentication
            </strong>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '1rem' }}>
            Select a verified role below to log in directly without requiring a live Supabase network connection:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <Button
              variant="primary"
              size="sm"
              icon={GraduationCap}
              onClick={() => handleDevMockLogin('student')}
              disabled={isSubmitting}
            >
              Student (Aarav)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Building2}
              onClick={() => handleDevMockLogin('academician')}
              disabled={isSubmitting}
            >
              Academician / Faculty
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Briefcase}
              onClick={() => handleDevMockLogin('industry_hr')}
              disabled={isSubmitting}
            >
              Industry / HR
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Building}
              onClick={() => handleDevMockLogin('institution_admin')}
              disabled={isSubmitting}
            >
              Institution Admin
            </Button>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              className="btn-block"
              icon={Shield}
              onClick={() => handleDevMockLogin('super_admin')}
              disabled={isSubmitting}
            >
              Platform Super Admin
            </Button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <Card title="Standard Authentication (Supabase / Credentials)">
          <form onSubmit={handleLogin}>
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. student@iitd.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn-block"
              isLoading={isSubmitting}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--accent-teal-dark)' }}>
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

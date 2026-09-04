import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Logo } from '../../components/common/Logo';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      showToast('Password recovery instructions dispatched!', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to dispatch reset request. Please verify email.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Slim Dark Top Bar */}
      <div
        style={{
          backgroundColor: '#071019',
          color: '#cbd5e1',
          padding: '0.45rem clamp(1rem, 3vw, 2rem)',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ color: '#20B8A6', fontWeight: 800 }}>SKILLBRIDGE INDIA</span>
          <span style={{ opacity: 0.5, color: '#94a3b8' }}>•</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>CONNECTING TALENT WITH OPPORTUNITY</span>
        </div>
      </div>

      {/* Header */}
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
          to="/login"
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#071019',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Back to Login
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Elevated White Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
              boxSizing: 'border-box',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ccfbf1',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#071019', marginBottom: '0.5rem' }}>
                  Recovery Link Dispatched
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                  If an account exists for <strong style={{ color: '#071019' }}>{email}</strong>, you will receive password reset instructions shortly.
                </p>
                <Link
                  to="/login"
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#071019',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft size={16} /> Return to Sign In
                </Link>
              </div>
            ) : (
              <div>
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
                  ACCOUNT RECOVERY
                </div>
                <h2
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#071019',
                    margin: '0 0 0.4rem 0',
                  }}
                >
                  Recover <span style={{ color: '#20B8A6' }}>Password</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                  Enter your registered email address to receive password reset instructions.
                </p>

                {errorMessage && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
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
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Email Address <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
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
                      marginTop: '0.25rem',
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
                        Dispatching Reset Link...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} /> Send Recovery Link
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Link
                      to="/login"
                      style={{
                        color: '#0d9488',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        textDecoration: 'none',
                      }}
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.75rem', color: '#64748b' }}>
            © 2026 SkillBridge India • SIH 2026 Problem Statement 26044
          </div>
        </div>
      </div>
    </div>
  );
};

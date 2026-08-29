import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const Unauthorized = () => {
  const { user, role } = useAuth();

  const getDashboardRoute = () => {
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
        return '/login';
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <Card>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
            403 - Access Forbidden
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            You do not have the required role permissions or institutional tenancy clearance to access this resource.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-muted)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Current Verified Role: <strong style={{ color: 'var(--primary-900)' }}>{role || 'Unauthenticated'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to={getDashboardRoute()}>
              <Button variant="primary" icon={LayoutDashboard}>
                Return to My Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

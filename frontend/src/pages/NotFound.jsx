import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const NotFound = () => {
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
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <Card>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-blue-light)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <HelpCircle size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>
            404 - Page Not Found
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            The page or route you are looking for does not exist on SkillBridge India.
          </p>

          <Link to="/">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

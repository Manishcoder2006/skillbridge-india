import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Top Government / SIH Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-950)',
          color: '#e2e8f0',
          padding: '0.5rem 1.5rem',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>SIH 2026</span> &bull; Problem Statement 26044
        </div>
        <div>
          Ministry of Education / AICTE Collaboration Initiative
        </div>
      </div>

      {/* Main Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-teal))',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
            }}
          >
            SB
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: 1 }}>SkillBridge India</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Academia–Industry Collaboration Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Register
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '4rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-page)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--accent-teal-light)',
              color: 'var(--accent-teal-dark)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Phase 1 Architecture Foundation Active</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-950)', marginBottom: '1.25rem' }}>
            Bridging Indian Higher Education with Modern Industry Needs
          </h2>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            A unified national platform enabling dynamic curriculum mapping, skill gap analysis,
            structured internships, and direct industry placements with strict multi-tenant institutional data isolation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Role Portals */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Dedicated Stakeholder Portals</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Isolated, role-based workflows for students, academicians, corporate HR, and institutions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Student */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--accent-blue)', marginBottom: '1rem' }}>
              <GraduationCap size={32} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Students</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
              Access skill mapping, verified institution profiles, curated internship tracks, and placement records.
            </p>
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
              &bull; Private Data Protection
            </div>
          </div>

          {/* Academician */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--accent-teal)', marginBottom: '1rem' }}>
              <Building2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Academicians & Faculty</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
              Department-scoped access for curriculum alignment, skill endorsement, and departmental mentorship.
            </p>
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--accent-teal-dark)', fontWeight: 600 }}>
              &bull; Department-Level Scoping
            </div>
          </div>

          {/* Industry HR */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--accent-amber)', marginBottom: '1rem' }}>
              <Briefcase size={32} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Industry & HR</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
              Corporate tenancy decoupled from academic institutions for requirement publishing and talent mapping.
            </p>
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--accent-amber-dark)', fontWeight: 600 }}>
              &bull; Corporate Tenancy
            </div>
          </div>

          {/* Institution Admin */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>
              <Layers size={32} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Institution Admins</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
              Manage departments, verify institutional faculty, monitor student rosters, and ensure data isolation.
            </p>
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 600 }}>
              &bull; Strict Multi-Tenant Isolation
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Highlights */}
      <section style={{ backgroundColor: 'var(--bg-page)', padding: '3.5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>
            Enterprise-Grade Security & Scalability
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 color="var(--success)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Supabase Row Level Security (RLS)</strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Multi-tenant isolation enforced directly at database level. Institution A cannot view Institution B records.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 color="var(--success)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Server-Side Token Verification</strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  FastAPI backend validates Supabase tokens and verifies role permissions on every request.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 color="var(--success)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Immutable Role & Tenant Fields</strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Users cannot self-assign Admin roles or modify their tenant assignments.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle2 color="var(--success)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>AI & Phase 2 Foundation Ready</strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Schema and endpoints structured for future Gemini / Grok skill mapping integrations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--primary-950)',
          color: '#94a3b8',
          padding: '2rem 1.5rem',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.5rem' }}>
          SkillBridge India &bull; Smart India Hackathon 2026 (Problem Statement 26044)
        </p>
        <p>Built with React, FastAPI & Supabase PostgreSQL</p>
      </footer>
    </div>
  );
};

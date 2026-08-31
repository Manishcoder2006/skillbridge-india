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
  Users,
  Lock,
  Sparkles,
  BookOpen,
  School,
  Database
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const LandingPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F5F6F4',
        color: '#071019',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Slim Dark Top Information Bar */}
      <div
        style={{
          backgroundColor: '#071019',
          color: '#cbd5e1',
          padding: '0.45rem 2rem',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#20B8A6', fontWeight: 800 }}>SIH 2026</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Problem Statement 26044</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
          Ministry of Education / AICTE Collaboration Initiative
        </div>
      </div>

      {/* 2. Clean White Navigation / Header with Official SB Logo */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.9rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Unified SB Logo Component */}
        <Logo size="md" theme="light" />

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/login"
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#071019',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#071019',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(7, 16, 25, 0.2)',
            }}
          >
            <ArrowRight size={15} /> Register
          </Link>
        </div>
      </header>

      {/* 3. Hero Section (Matching Reference Design) */}
      <section
        style={{
          padding: '3.5rem 2.5rem 4rem',
          backgroundColor: '#F5F6F4',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            alignItems: 'center',
            gap: '3rem',
          }}
        >
          {/* Left Text Column */}
          <div>
            {/* Eyebrow & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace' }}>
                01
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0d9488',
                  textTransform: 'uppercase',
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
                PHASE 1 ARCHITECTURE FOUNDATION ACTIVE
              </span>
            </div>

            {/* Main Editorial Headline */}
            <div style={{ position: 'relative' }}>
              {/* Subtle curved line flourish */}
              <svg
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '-25px',
                  width: '130px',
                  height: '40px',
                  pointerEvents: 'none',
                  opacity: 0.35,
                }}
                viewBox="0 0 100 40"
                fill="none"
                stroke="#20B8A6"
                strokeWidth="2"
              >
                <path d="M5,35 Q45,5 75,25 T100,10" />
              </svg>

              <h1
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  lineHeight: '1.05',
                  letterSpacing: '-0.035em',
                  color: '#071019',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                BUILD THE
                <br />
                <span style={{ color: '#20B8A6' }}>FUTURE</span> OF
                <br />
                INDIAN EDUCATION
              </h1>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: '1rem',
                color: '#475569',
                marginTop: '1.5rem',
                marginBottom: '2rem',
                lineHeight: '1.6',
                maxWidth: '480px',
              }}
            >
              A unified platform connecting academia and industry to enable future-ready learning, real-world skills, and meaningful careers.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  padding: '0.85rem 1.65rem',
                  backgroundColor: '#071019',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(7, 16, 25, 0.25)',
                }}
              >
                <ArrowRight size={16} /> Get Started
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '0.85rem 1.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#071019',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Portal Login
              </Link>
            </div>
          </div>

          {/* Right Visual Graphic Area with 2nd Reference Architectural Asset */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Dotted Grid Decoration in background */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '-25px',
                zIndex: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 6px)',
                gridTemplateRows: 'repeat(6, 6px)',
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
                    backgroundColor: '#94a3b8',
                  }}
                />
              ))}
            </div>

            {/* Background geometric connector line */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '-100px',
                width: '180px',
                height: '2px',
                backgroundColor: 'rgba(32, 184, 166, 0.4)',
                transform: 'rotate(-25deg)',
                zIndex: 0,
              }}
            />

            {/* Main White Curved Architecture Image Container */}
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                height: '360px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(7, 16, 25, 0.15)',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <img
                src="/assets/white_curved_campus.jpg"
                alt="Futuristic Educational Campus Architecture"
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
                bottom: '-20px',
                left: '10px',
                zIndex: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
                padding: '0.9rem 1.25rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                minWidth: '145px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Trusted by</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#071019', lineHeight: 1 }}>
                20+
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                Institutions
              </div>

              {/* Avatar stack */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.2rem' }}>
                {['IITD', 'NITK', 'CEG', 'PICT'].map((inst, i) => (
                  <div
                    key={i}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: ['#20B8A6', '#0284c7', '#4f46e5', '#d97706'][i],
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
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e6fffa',
                    color: '#20B8A6',
                    fontSize: '0.75rem',
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
        </div>
      </section>

      {/* 4. Portal Ecosystem Section (Matching Reference Design) */}
      <section
        style={{
          padding: '4.5rem 2.5rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#20B8A6',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              • PORTAL ECOSYSTEM •
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#071019', margin: '0 0 0.5rem 0' }}>
              Dedicated Stakeholder Portals
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
              Role-based access. Secure workflows. Purpose-built experiences.
            </p>
          </div>

          {/* 4 Stakeholder Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1: Students */}
            <div
              style={{
                padding: '1.75rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#ccfbf1',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#071019', margin: '0 0 0.35rem 0' }}>
                    Students
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Access skills, verified profiles, internships and placement opportunities.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700 }}>
                • Private Data Protection
              </div>
            </div>

            {/* Card 2: Academicians & Faculty */}
            <div
              style={{
                padding: '1.75rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <School size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#071019', margin: '0 0 0.35rem 0' }}>
                    Academicians & Faculty
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Align curriculum, endorse skills and mentor future professionals.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700 }}>
                • Department-Level Access
              </div>
            </div>

            {/* Card 3: Industry & HR */}
            <div
              style={{
                padding: '1.75rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#071019', margin: '0 0 0.35rem 0' }}>
                    Industry & HR
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Discover talent, post opportunities and collaborate with institutions.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
                • Corporate Tenancy
              </div>
            </div>

            {/* Card 4: Institution Admins */}
            <div
              style={{
                padding: '1.75rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#071019',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#071019', margin: '0 0 0.35rem 0' }}>
                    Institution Admins
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Manage faculty, verify data and ensure secure multi-tenant operations.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#071019', fontWeight: 700 }}>
                • Strict Multi-Tenant Isolation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Enterprise / Security Foundation Section (Dark Futuristic Section) */}
      <section
        style={{
          padding: '4.5rem 2.5rem',
          backgroundColor: '#071019',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#20B8A6',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              • ENTERPRISE FOUNDATION •
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Secure. Scalable. Future-Ready.
            </h2>
          </div>

          {/* 4 Feature Columns with subtle teal circuit styling */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#0c1722',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(32, 184, 166, 0.1)',
                  color: '#20B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                  Row Level Security (RLS)
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Multi-tenant isolation at database level with strict access control.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#0c1722',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(32, 184, 166, 0.1)',
                  color: '#20B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                  Server-Side Token Verification
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Backend validates tokens and verifies role permissions.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#0c1722',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(32, 184, 166, 0.1)',
                  color: '#20B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                  Immutable Roles & Tenants
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Users cannot modify roles or tenant assignments.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#0c1722',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(32, 184, 166, 0.1)',
                  color: '#20B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                  AI & Phase 2 Ready
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Structured schema and endpoints for adaptive AI and mock interview simulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dark Footer */}
      <footer
        style={{
          backgroundColor: '#050c13',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '3rem 2.5rem 2rem',
          color: '#94a3b8',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <Logo theme="dark" size="md" />

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Register
            </Link>
            <span style={{ color: '#64748b' }}>SIH 2026 Problem Statement 26044</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1280px',
            margin: '1.5rem auto 0',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#64748b',
          }}
        >
          © 2026 SkillBridge India. All rights reserved. &nbsp;|&nbsp; Ministry of Education / AICTE Collaboration Initiative
        </div>
      </footer>
    </div>
  );
};

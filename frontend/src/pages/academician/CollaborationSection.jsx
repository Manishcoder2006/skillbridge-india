import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  RolePageHeader,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';
import {
  Handshake,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Send,
  X,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export const CollaborationSection = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participatingInit, setParticipatingInit] = useState(null);
  const [interestNote, setInterestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCollaborationInitiatives();
      setInitiatives(data || []);
    } catch (err) {
      console.error('Failed to load collaboration initiatives:', err);
      setError('Unable to load industry collaboration initiatives. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenParticipate = (init) => {
    setParticipatingInit(init);
    setInterestNote(
      init.participation_status
        ? 'Interest already registered.'
        : `Interested in leading the faculty cohort for ${init.title} representing the Computer Science & Engineering department.`
    );
  };

  const handleSubmitParticipation = async (e) => {
    e.preventDefault();
    if (!participatingInit) return;

    setSubmitting(true);
    try {
      await apiService.participateInCollaboration(participatingInit.id, interestNote);
      setInitiatives((prev) =>
        prev.map((item) =>
          item.id === participatingInit.id
            ? { ...item, is_participating: true, participation_status: 'registered' }
            : item
        )
      );
      setSuccessToast(`Interest successfully registered for "${participatingInit.title}"!`);
      setParticipatingInit(null);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to submit participation:', err);
      alert('Failed to register interest.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'joint_research':
        return <Layers size={16} color="#7c3aed" />;
      case 'faculty_development':
        return <Award size={16} color="#2563eb" />;
      case 'mentorship':
        return <Users size={16} color="#059669" />;
      default:
        return <BookOpen size={16} color="#d97706" />;
    }
  };

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Academia–Industry Collaboration Hub"
        subtitle="Institutional Partnership Initiatives"
        badge={<Badge role="academician" />}
        description="Engage in sponsored Faculty Development Programs (FDPs), industry research partnerships, hackathons, and corporate mentorship cohorts."
      />

      {/* Success Notification */}
      {successToast && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '10px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} color="#059669" /> {successToast}
        </div>
      )}

      {/* 2. Initiatives Grid */}
      {loading ? (
        <LoadingState message="Fetching active academia-industry collaboration proposals..." />
      ) : error ? (
        <ErrorState title="Error Loading Initiatives" message={error} onRetry={fetchInitiatives} />
      ) : initiatives.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No Collaboration Initiatives Active"
          description="There are currently no open corporate research or faculty development proposals. New initiatives will appear as corporate partners publish them."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {initiatives.map((init) => (
            <div
              key={init.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: init.is_participating ? '4px solid #0d9488' : '4px solid #7c3aed',
                borderRadius: '12px',
                padding: '1.35rem',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getTypeIcon(init.initiative_type)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed', letterSpacing: '0.03em' }}>
                      {init.initiative_type?.replace('_', ' ') || 'Workshop'}
                    </span>
                  </div>
                  <Badge variant={init.is_participating ? 'success' : 'primary'}>
                    {init.is_participating ? 'Registered' : 'Open'}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.75rem 0 0.35rem' }}>
                  {init.title}
                </h3>

                <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Building2 size={14} /> {init.corporate_sponsor}
                </div>

                <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 0.75rem' }}>
                  {init.description}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    padding: '0.65rem 0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Timeline</span>
                    <strong style={{ color: '#0f172a' }}>{init.timeline}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Slots</span>
                    <strong style={{ color: '#0f172a' }}>{init.slots_available} available</strong>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className={init.is_participating ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                  onClick={() => handleOpenParticipate(init)}
                >
                  <Handshake size={15} />
                  {init.is_participating ? 'View Registration Details' : 'Register Faculty Interest'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Participation Modal */}
      {participatingInit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setParticipatingInit(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Handshake size={18} color="#0d9488" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Register Collaboration Interest
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setParticipatingInit(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitParticipation} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{participatingInit.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Partner: {participatingInit.corporate_sponsor} • Timeline: {participatingInit.timeline}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Faculty Proposal / Participation Note
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={interestNote}
                  onChange={(e) => setInterestNote(e.target.value)}
                  placeholder="Outline your department's interest, planned student cohort size, and faculty leads..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setParticipatingInit(null)}
                  style={{ minHeight: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minHeight: '42px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  {submitting ? <Spinner size="sm" /> : <Send size={15} />}
                  {submitting ? 'Submitting...' : 'Submit Interest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  Handshake,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Send,
  X,
  ExternalLink,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export const CollaborationSection = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await apiService.getCollaborationInitiatives();
      setInitiatives(data);
    } catch (err) {
      console.error('Failed to load collaboration initiatives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenParticipate = (init) => {
    setParticipatingInit(init);
    setInterestNote(
      init.participation_status
        ? 'Interest already submitted.'
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
        return <Layers size={18} color="#8b5cf6" />;
      case 'faculty_development':
        return <Award size={18} color="#3b82f6" />;
      case 'mentorship':
        return <Users size={18} color="#10b981" />;
      default:
        return <BookOpen size={18} color="#f59e0b" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            Academia–Industry Convergence
          </Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            PS 26044 Institutional Partnerships
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          Industry Collaboration & Faculty Development
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Engage in corporate sponsored research grants, faculty development programs (FDPs), industry mentorship, and curriculum co-design.
        </p>
      </div>

      {successToast && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {successToast}
        </div>
      )}

      {/* Initiatives Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
        </div>
      ) : initiatives.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Handshake size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>No Active Initiatives</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            New industry collaboration announcements will appear here.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {initiatives.map((init) => (
            <Card
              key={init.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                borderTop: init.is_participating ? '4px solid #10b981' : '4px solid #3b82f6',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getTypeIcon(init.type)}
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                      {init.type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant={init.is_participating ? 'success' : 'primary'} style={{ textTransform: 'capitalize' }}>
                    {init.is_participating ? 'Interest Registered' : 'Open for Faculty'}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.75rem 0 0.25rem' }}>
                  {init.title}
                </h3>

                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  <Building2 size={14} color="var(--color-primary)" /> {init.company_name}
                </span>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  {init.description}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.6rem',
                    background: 'var(--color-bg)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--color-text)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--color-text-muted)" /> {init.timeline}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} color="var(--color-text-muted)" /> Slots: {init.slots_available}
                  </div>
                  <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <strong>Focus Domain:</strong> {init.domain}
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  className={`btn ${init.is_participating ? 'btn-outline' : 'btn-primary'}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  onClick={() => handleOpenParticipate(init)}
                >
                  <Handshake size={16} /> {init.is_participating ? 'View Registration Details' : 'Express Faculty Interest'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      {participatingInit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              width: '100%',
              maxWidth: '580px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Handshake size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  Express Interest in Initiative
                </h3>
              </div>
              <button
                onClick={() => setParticipatingInit(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitParticipation} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Initiative Title & Partner</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {participatingInit.title} ({participatingInit.company_name})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Faculty Proposal & Department Capabilities Note
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  value={interestNote}
                  onChange={(e) => setInterestNote(e.target.value)}
                  placeholder="Outline how your department will collaborate or nominate students/faculty..."
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button type="button" className="btn btn-outline" onClick={() => setParticipatingInit(null)}>
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  {submitting ? <Spinner size="sm" /> : <Send size={16} />}
                  {submitting ? 'Submitting...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Handshake,
  PlusCircle,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Building2,
  RefreshCw,
  Mail,
} from 'lucide-react';
import {
  RolePageHeader,
  RoleStatCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const IndustryCollaboration = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    initiative_type: 'workshop',
    target_domain: 'Cloud Architecture & Microservices',
    description: '',
    target_audience: 'B.Tech CSE/IT Students and Faculty',
    slots_available: 50,
    timeline: 'Q4 2026',
    contact_email: '',
  });

  const fetchProposals = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);
      const data = await apiService.getIndustryCollaborationProposals();
      setProposals(data || []);
    } catch (err) {
      console.error('Failed to load collaboration proposals:', err);
      setErrorMsg('Unable to load collaboration proposals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      await apiService.createIndustryCollaborationProposal(formData);
      setSuccessMsg('Academic collaboration proposal published successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        initiative_type: 'workshop',
        target_domain: 'Cloud Architecture & Microservices',
        description: '',
        target_audience: 'B.Tech CSE/IT Students and Faculty',
        slots_available: 50,
        timeline: 'Q4 2026',
        contact_email: '',
      });
      await fetchProposals(true);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to publish proposal. Check required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && proposals.length === 0) {
    return <LoadingState message="Loading industry-academia collaboration initiatives..." />;
  }

  const initiativeTypes = [
    { value: 'workshop', label: 'Technical Workshop' },
    { value: 'fdp', label: 'Faculty Development Program (FDP)' },
    { value: 'joint_research', label: 'Joint Applied Research' },
    { value: 'mentorship', label: 'Student Mentorship Cohort' },
    { value: 'hackathon', label: 'Corporate Hackathon / Challenge' },
  ];

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Academia–Industry Collaboration"
        subtitle="Corporate Academic Partnerships"
        description="Host technical masterclasses, sponsor Faculty Development Programs (FDPs), partner with engineering universities, and propose student innovation challenges."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="portal-btn secondary"
              onClick={() => fetchProposals(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              className="portal-btn primary"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={16} />
              Propose Initiative
            </button>
          </div>
        }
      />

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#15803d',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Active Initiatives"
          value={proposals.length}
          subtext="Sponsored Programs"
          icon={Handshake}
          variant="teal"
        />
        <RoleStatCard
          title="Total Participant Capacity"
          value={proposals.reduce((acc, curr) => acc + (curr.slots_available || 0), 0)}
          subtext="Students & Faculty Seats"
          icon={Users}
          variant="blue"
        />
        <RoleStatCard
          title="Academic Reach"
          value={`${proposals.length > 0 ? 'Multiple' : '0'} Institutes`}
          subtext="Affiliated Campuses"
          icon={Building2}
          variant="purple"
        />
      </div>

      {/* 3. Proposals Grid */}
      {proposals.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No Active Collaboration Initiatives"
          description="Propose a workshop, faculty development program (FDP), or hackathon to connect directly with academic departments and build early recruitment pipelines."
          action={
            <button
              className="portal-btn primary"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={15} />
              Propose First Initiative
            </button>
          }
        />
      ) : (
        <div className="portal-postings-grid">
          {proposals.map((item) => (
            <div key={item.id} className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      background: '#f0fdf9',
                      color: '#0d9488',
                      border: '1px solid #ccfbf1',
                    }}
                  >
                    {item.initiative_type?.replace('_', ' ')}
                  </span>
                  <span className="portal-status-badge selected">
                    {item.status || 'Active'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                  {item.description}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Domain:</strong> {item.target_domain}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Audience:</strong> {item.target_audience}
                  </div>
                  <div>
                    <strong style={{ color: '#0f172a' }}>Timeline:</strong> {item.timeline}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#64748b',
                }}
              >
                <span>Capacity: <strong style={{ color: '#0f172a' }}>{item.slots_available} seats</strong></span>
                {item.contact_email && (
                  <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                    {item.contact_email}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Proposal Modal */}
      {isModalOpen && (
        <div className="portal-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">Propose Academic Collaboration</h3>
              <button
                className="portal-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => !saving && setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProposal}>
              <div className="portal-modal-body">
                {errorMsg && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="portal-form-group">
                  <label className="portal-form-label">Initiative Title *</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. Masterclass: Cloud Architecture & DevOps at Scale"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Initiative Type *</label>
                    <select
                      className="portal-form-input"
                      value={formData.initiative_type}
                      onChange={(e) => setFormData({ ...formData, initiative_type: e.target.value })}
                    >
                      {initiativeTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Target Domain *</label>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. Artificial Intelligence, VLSI Design"
                      value={formData.target_domain}
                      onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Target Audience</label>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. 3rd & 4th Year Engineering Students"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Participant Capacity</label>
                    <input
                      type="number"
                      min={10}
                      className="portal-form-input"
                      value={formData.slots_available}
                      onChange={(e) => setFormData({ ...formData, slots_available: parseInt(e.target.value, 10) || 50 })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Target Timeline *</label>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. October 2026 or Q4 2026"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Contact Email *</label>
                    <input
                      type="email"
                      className="portal-form-input"
                      placeholder="partner@company.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Initiative Description *</label>
                  <textarea
                    rows={3}
                    className="portal-form-input portal-form-textarea"
                    placeholder="Objectives, expected outcomes, hands-on modules, and instructor profile..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn primary"
                  disabled={saving}
                >
                  {saving ? 'Publishing...' : 'Publish Initiative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

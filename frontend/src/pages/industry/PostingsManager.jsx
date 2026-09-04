import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Search,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Plus,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  RolePageHeader,
  RoleStatCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const PostingsManager = () => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, job, internship
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, closed

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Deletion Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'job',
    description: '',
    required_skills: [],
    preferred_skills: [],
    eligibility: 'B.Tech / BE graduating students with CGPA >= 6.5',
    location: 'Bengaluru / Hybrid',
    work_mode: 'hybrid',
    stipend_or_salary: '₹8.0 - 12.0 LPA',
    openings_count: 5,
    application_deadline: '2026-12-31',
    duration: '',
    status: 'active',
  });
  const [skillInput, setSkillInput] = useState('');

  const fetchPostings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await apiService.getCompanyPostings();
      setPostings(data || []);
    } catch (err) {
      console.error('Failed to load postings:', err);
      setError('Unable to load recruitment postings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleOpenModal = (posting = null) => {
    setFormError(null);
    setFormSuccess(null);
    if (posting) {
      setEditingPosting(posting);
      setFormData({
        title: posting.title,
        type: posting.type || 'job',
        description: posting.description || '',
        required_skills: posting.required_skills || [],
        preferred_skills: posting.preferred_skills || [],
        eligibility: posting.eligibility || '',
        location: posting.location || 'Bengaluru',
        work_mode: posting.work_mode || 'hybrid',
        stipend_or_salary: posting.stipend_or_salary || '',
        openings_count: posting.openings_count || 5,
        application_deadline: posting.application_deadline ? posting.application_deadline.slice(0, 10) : '2026-12-31',
        duration: posting.duration || '',
        status: posting.status || 'active',
      });
    } else {
      setEditingPosting(null);
      setFormData({
        title: '',
        type: 'job',
        description: '',
        required_skills: ['React', 'Python'],
        preferred_skills: ['Docker'],
        eligibility: 'Open to B.Tech / BE graduating students with CGPA >= 6.5',
        location: 'Bengaluru / Hybrid',
        work_mode: 'hybrid',
        stipend_or_salary: '₹8.5 LPA',
        openings_count: 5,
        application_deadline: '2026-12-31',
        duration: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.title.trim() || formData.required_skills.length === 0) {
      setFormError('Posting title and at least one required skill are mandatory.');
      return;
    }

    try {
      setSaving(true);
      if (editingPosting) {
        await apiService.updatePosting(editingPosting.id, formData);
        setFormSuccess('Posting updated successfully!');
      } else {
        await apiService.createPosting(formData);
        setFormSuccess('New opportunity published successfully!');
      }

      await fetchPostings(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to save posting:', err);
      setFormError(err.response?.data?.detail || 'Failed to save posting. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePosting = async (postingId) => {
    try {
      await apiService.deletePosting(postingId);
      setDeletingId(null);
      await fetchPostings(true);
    } catch (err) {
      console.error('Failed to delete posting:', err);
      alert('Unable to delete posting. Please ensure there are no locked dependencies.');
    }
  };

  // Filtered list
  const filteredPostings = useMemo(() => {
    return postings.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || p.type?.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || p.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [postings, searchQuery, typeFilter, statusFilter]);

  if (loading) {
    return <LoadingState message="Loading corporate job and internship openings..." />;
  }

  if (error && postings.length === 0) {
    return (
      <div className="portal-page">
        <ErrorState
          title="Recruitment Postings Unavailable"
          message={error}
          onRetry={() => fetchPostings()}
        />
      </div>
    );
  }

  const activeCount = postings.filter((p) => p.status === 'active').length;
  const totalOpenings = postings.reduce((acc, curr) => acc + (curr.openings_count || 0), 0);
  const totalApplicants = postings.reduce((acc, curr) => acc + (curr.applications_count || 0), 0);

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Jobs & Internships"
        subtitle="Recruitment Opportunity Manager"
        description="Publish, manage, and track full-time engineering vacancies and student internships across accredited institutions."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="portal-btn secondary"
              onClick={() => fetchPostings(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              className="portal-btn primary"
              onClick={() => handleOpenModal()}
            >
              <PlusCircle size={16} />
              Create Opportunity
            </button>
          </div>
        }
      />

      {/* 2. Top Metric Cards */}
      <div className="portal-stat-grid">
        <RoleStatCard
          title="Published Postings"
          value={postings.length}
          subtext={`${activeCount} Active Openings`}
          icon={Briefcase}
          variant="teal"
        />
        <RoleStatCard
          title="Total Vacancy Seats"
          value={totalOpenings}
          subtext="Available Positions"
          icon={Users}
          variant="blue"
        />
        <RoleStatCard
          title="Applicant Volume"
          value={totalApplicants}
          subtext="Total Applications Submitted"
          icon={CheckCircle2}
          variant="purple"
        />
      </div>

      {/* 3. Filter Bar */}
      <div className="portal-filter-bar">
        <div className="portal-search-box">
          <Search size={16} className="portal-search-icon" />
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search by role title or required skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="portal-filter-controls">
          <select
            className="portal-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="job">Full-time Jobs</option>
            <option value="internship">Internships</option>
          </select>

          <select
            className="portal-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* 4. Postings Grid */}
      {filteredPostings.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={postings.length === 0 ? 'No Opportunities Created' : 'No Matching Postings'}
          description={
            postings.length === 0
              ? 'Publish your first job vacancy or internship to connect with qualified student candidates.'
              : 'Try clearing your search query or adjusting filter dropdowns.'
          }
          action={
            postings.length === 0 ? (
              <button
                className="portal-btn primary"
                onClick={() => handleOpenModal()}
              >
                <PlusCircle size={15} />
                Create First Posting
              </button>
            ) : (
              <button
                className="portal-btn secondary"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <div className="portal-postings-grid">
          {filteredPostings.map((p) => (
            <div key={p.id} className="portal-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      background: p.type === 'job' ? '#eff6ff' : '#f0fdf9',
                      color: p.type === 'job' ? '#1d4ed8' : '#0d9488',
                      border: `1px solid ${p.type === 'job' ? '#bfdbfe' : '#ccfbf1'}`,
                    }}
                  >
                    {p.type}
                  </span>
                  <span
                    className={`portal-status-badge ${p.status === 'active' ? 'selected' : 'rejected'}`}
                  >
                    {p.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
                  {p.title}
                </h3>

                <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} color="#94a3b8" />
                    <span>{p.location} ({p.work_mode})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="#94a3b8" />
                    <span>Compensation: <strong style={{ color: '#0f172a' }}>{p.stipend_or_salary}</strong></span>
                  </div>
                  {p.application_deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span>Deadline: {new Date(p.application_deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                <div className="portal-tag-group">
                  {(p.required_skills || []).slice(0, 4).map((skill) => (
                    <span key={skill} className="portal-tag">
                      {skill}
                    </span>
                  ))}
                  {(p.required_skills || []).length > 4 && (
                    <span className="portal-tag">+{p.required_skills.length - 4} more</span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <Link
                  to="/dashboard/industry/candidates"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0d9488',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Users size={14} />
                  <span>{p.applications_count ?? 0} Applicants</span>
                </Link>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="portal-btn secondary"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem' }}
                    onClick={() => handleOpenModal(p)}
                    title="Edit Posting"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="portal-btn secondary"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem', color: '#dc2626' }}
                    onClick={() => setDeletingId(p.id)}
                    title="Delete Posting"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deletingId && (
        <div className="portal-modal-backdrop" onClick={() => setDeletingId(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">Delete Opportunity</h3>
              <button className="portal-btn secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setDeletingId(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="portal-modal-body">
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to delete this recruitment posting? Existing applications will be preserved, but the opening will no longer accept new student submissions.
              </p>
            </div>
            <div className="portal-modal-footer">
              <button className="portal-btn secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button
                className="portal-btn primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={() => handleDeletePosting(deletingId)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Posting Modal */}
      {isModalOpen && (
        <div className="portal-modal-backdrop" onClick={() => !saving && setIsModalOpen(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">
                {editingPosting ? 'Edit Recruitment Posting' : 'Publish Opportunity'}
              </h3>
              <button
                className="portal-btn secondary"
                style={{ padding: '0.25rem 0.5rem' }}
                onClick={() => !saving && setIsModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="portal-modal-body">
                {formError && (
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
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="portal-form-group">
                  <label className="portal-form-label">Position Title *</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. Graduate Software Engineer, AI Systems Intern"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Opportunity Type *</label>
                    <select
                      className="portal-form-input"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="job">Full-time Job</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Work Mode</label>
                    <select
                      className="portal-form-input"
                      value={formData.work_mode}
                      onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="on_site">On-Site</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Location *</label>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. Bengaluru, Pune, Hyderabad"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Compensation / Stipend *</label>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="e.g. ₹9.0 - 14.0 LPA or ₹35,000/mo"
                      value={formData.stipend_or_salary}
                      onChange={(e) => setFormData({ ...formData, stipend_or_salary: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="portal-form-group">
                    <label className="portal-form-label">Open Vacancies</label>
                    <input
                      type="number"
                      min={1}
                      className="portal-form-input"
                      value={formData.openings_count}
                      onChange={(e) => setFormData({ ...formData, openings_count: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>

                  <div className="portal-form-group">
                    <label className="portal-form-label">Application Deadline *</label>
                    <input
                      type="date"
                      className="portal-form-input"
                      value={formData.application_deadline}
                      onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Required Skills Management */}
                <div className="portal-form-group">
                  <label className="portal-form-label">Required Skills *</label>
                  <div className="portal-tag-group" style={{ marginBottom: '0.5rem' }}>
                    {formData.required_skills.map((skill) => (
                      <span key={skill} className="portal-tag matched">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#15803d', display: 'flex' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="portal-form-input"
                      placeholder="Add required skill (e.g. React, Python, PostgreSQL)..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                    />
                    <button type="button" className="portal-btn secondary" onClick={handleAddSkill}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Job Description</label>
                  <textarea
                    rows={4}
                    className="portal-form-input portal-form-textarea"
                    placeholder="Role responsibilities, expected competencies, and team focus..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Candidate Eligibility Criteria</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. BE / B.Tech graduating 2026 with minimum 6.5 CGPA"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
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
                  {saving ? 'Publishing...' : editingPosting ? 'Update Posting' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronRight,
  X,
  Send,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';
import {
  RolePageHeader,
  ResponsiveTable,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const CandidatesAndApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Candidate Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  // Status Update Modal
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('under_review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await apiService.getCompanyApplications(statusFilter, searchQuery);
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to load candidate recruitment pipeline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleOpenCandidateProfile = async (studentId) => {
    try {
      setCandidateLoading(true);
      setSelectedCandidate(null);
      const profile = await apiService.getCandidateProfile(studentId);
      setSelectedCandidate(profile);
    } catch (err) {
      console.error('Failed to load candidate profile:', err);
      alert('Unable to load full candidate profile.');
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleOpenStatusModal = (app) => {
    setStatusModalApp(app);
    setNewStatus(app.status || 'under_review');
    setReviewNotes(app.notes || '');
    setInterviewDate('');
    setInterviewLink('');
    setUpdateError(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      setUpdating(true);
      setUpdateError(null);
      await apiService.updateApplicationStatus(statusModalApp.application_id, {
        status: newStatus,
        review_notes: reviewNotes || null,
        interview_scheduled_at: interviewDate || null,
        interview_link: interviewLink || null,
      });

      setFeedbackMsg(`Application status updated to '${newStatus.replace('_', ' ')}'!`);
      setStatusModalApp(null);
      await fetchApplications(true);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(err.response?.data?.detail || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const statuses = [
    { id: 'all', label: 'All Applications' },
    { id: 'applied', label: 'Applied' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview' },
    { id: 'selected', label: 'Selected' },
    { id: 'rejected', label: 'Rejected' },
  ];

  // Column definitions for ResponsiveTable
  const columns = [
    {
      key: 'candidate_name',
      header: 'Candidate',
      isPrimary: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.candidate_name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {row.candidate_institution} &bull; {row.candidate_department}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#0d9488', fontWeight: 600 }}>
            CGPA: {row.candidate_cgpa} &bull; Sem {row.candidate_semester}
          </div>
        </div>
      ),
    },
    {
      key: 'opportunity_title',
      header: 'Target Role',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{row.opportunity_title}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            {row.opportunity_type}
          </div>
        </div>
      ),
    },
    {
      key: 'applied_at',
      header: 'Applied Date',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {row.applied_at ? new Date(row.applied_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'verified_skills',
      header: 'Verified Skills',
      render: (row) => (
        <div className="portal-tag-group">
          {(row.verified_skills || []).slice(0, 3).map((s) => (
            <span key={s} className="portal-tag">
              {s}
            </span>
          ))}
          {(row.verified_skills || []).length > 3 && (
            <span className="portal-tag">+{row.verified_skills.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Recruitment Status',
      isBadge: true,
      render: (row) => (
        <span className={`portal-status-badge ${row.status}`}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="portal-btn secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
            onClick={() => handleOpenCandidateProfile(row.student_id)}
            title="Inspect Candidate Record"
          >
            <Eye size={13} />
            <span>Profile</span>
          </button>
          <button
            className="portal-btn primary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
            onClick={() => handleOpenStatusModal(row)}
            title="Update Pipeline Status"
          >
            Update
          </button>
        </div>
      ),
    },
  ];

  if (loading && applications.length === 0) {
    return <LoadingState message="Loading candidate application pipeline..." />;
  }

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Candidates & Applications"
        subtitle="Recruitment Pipeline Management"
        description="Review incoming student applications, inspect verified academic credentials, schedule interviews, and track hiring stages."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="portal-btn secondary"
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        }
      />

      {feedbackMsg && (
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
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Status Navigation Tabs */}
      <div className="portal-tab-bar">
        {statuses.map((tab) => (
          <button
            key={tab.id}
            className={`portal-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Search Bar */}
      <form onSubmit={handleSearchSubmit} className="portal-filter-bar">
        <div className="portal-search-box">
          <Search size={16} className="portal-search-icon" />
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search candidates by name, job role, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="portal-btn secondary">
          Filter
        </button>
      </form>

      {/* 4. Applications Table */}
      {applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title={statusFilter === 'all' ? 'No Applications Received' : `No Candidates in '${statusFilter.replace('_', ' ')}'`}
          description="Candidates will appear here as students apply to your open job roles and internships."
          action={
            statusFilter !== 'all' || searchQuery ? (
              <button
                className="portal-btn secondary"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          data={applications}
          title={`Active Pipeline (${applications.length} Candidates)`}
        />
      )}

      {/* 5. Candidate Profile Detail Modal */}
      {selectedCandidate && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedCandidate(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="portal-modal-header">
              <div>
                <h3 className="portal-modal-title">{selectedCandidate.full_name}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedCandidate.institution_name} &bull; {selectedCandidate.department_name}
                </div>
              </div>
              <button className="portal-btn secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setSelectedCandidate(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="portal-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Top Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Academic CGPA</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488', marginTop: '0.2rem' }}>
                    {selectedCandidate.cgpa}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current Semester</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    Sem {selectedCandidate.current_semester}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Degree Program</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {selectedCandidate.program || 'B.Tech'}
                  </div>
                </div>
              </div>

              {/* Verified Skills */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Verified Technical Skills
                </h4>
                <div className="portal-tag-group">
                  {(selectedCandidate.verified_skills || []).map((skillObj, idx) => (
                    <span key={idx} className="portal-tag matched">
                      <CheckCircle2 size={12} />
                      <span>{typeof skillObj === 'string' ? skillObj : skillObj.name || skillObj.skill}</span>
                      {skillObj.proficiency_level && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({skillObj.proficiency_level})</span>
                      )}
                    </span>
                  ))}
                  {(selectedCandidate.verified_skills || []).length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No verified skill badges recorded.</span>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Technical Projects
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(selectedCandidate.projects || []).map((proj, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{proj.title}</div>
                      {proj.description && (
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0.4rem 0', lineHeight: 1.4 }}>
                          {proj.description}
                        </p>
                      )}
                      {proj.tech_stack && (
                        <div className="portal-tag-group">
                          {proj.tech_stack.map((t) => (
                            <span key={t} className="portal-tag" style={{ fontSize: '0.7rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(selectedCandidate.projects || []).length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No project records listed.</span>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Certifications & Honors
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(selectedCandidate.certifications || []).map((cert, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={14} color="#0d9488" />
                      <span>{typeof cert === 'string' ? cert : cert.name || cert.title}</span>
                    </div>
                  ))}
                  {(selectedCandidate.certifications || []).length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No external certifications listed.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button className="portal-btn secondary" onClick={() => setSelectedCandidate(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Application Status Update Modal */}
      {statusModalApp && (
        <div className="portal-modal-backdrop" onClick={() => !updating && setStatusModalApp(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="portal-modal-header">
              <div>
                <h3 className="portal-modal-title">Update Application Status</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Candidate: {statusModalApp.candidate_name} &bull; Role: {statusModalApp.opportunity_title}
                </div>
              </div>
              <button className="portal-btn secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => !updating && setStatusModalApp(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="portal-modal-body">
                {updateError && (
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
                    <span>{updateError}</span>
                  </div>
                )}

                <div className="portal-form-group">
                  <label className="portal-form-label">Recruitment Pipeline Stage *</label>
                  <select
                    className="portal-form-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="applied">Applied (Initial Submission)</option>
                    <option value="under_review">Under Review (Recruiter Screening)</option>
                    <option value="shortlisted">Shortlisted (Selected for Technical Round)</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="selected">Selected / Offer Extended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {newStatus === 'interview' && (
                  <>
                    <div className="portal-form-group">
                      <label className="portal-form-label">Interview Date & Time</label>
                      <input
                        type="datetime-local"
                        className="portal-form-input"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                      />
                    </div>

                    <div className="portal-form-group">
                      <label className="portal-form-label">Interview Meeting Link</label>
                      <input
                        type="url"
                        className="portal-form-input"
                        placeholder="https://meet.google.com/xyz or Zoom link"
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="portal-form-group">
                  <label className="portal-form-label">Recruiter Review Notes</label>
                  <textarea
                    rows={3}
                    className="portal-form-input portal-form-textarea"
                    placeholder="Feedback from technical evaluation or reasons for status transition..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn secondary"
                  onClick={() => setStatusModalApp(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn primary"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Save Pipeline Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

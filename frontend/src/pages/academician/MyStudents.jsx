import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  RolePageHeader,
  ResponsiveTable,
  EmptyState,
  LoadingState,
} from '../../components/portal';
import {
  Users,
  Search,
  Filter,
  Eye,
  Brain,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  X,
  Briefcase,
  Layers,
  FileCheck2,
  Building2,
  Calendar,
} from 'lucide-react';

export const MyStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  // Detail Modal State
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('view') || null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('skills');

  useEffect(() => {
    fetchStudents();
  }, [semesterFilter, statusFilter]);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam) {
      setSelectedStudentId(viewParam);
      openStudentDetail(viewParam);
    }
  }, [searchParams]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (semesterFilter) params.semester = parseInt(semesterFilter, 10);
      if (statusFilter) params.status = statusFilter;
      const data = await apiService.getAuthorizedStudents(params);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetail = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailLoading(true);
    try {
      const data = await apiService.getAuthorizedStudentDetail(studentId);
      setStudentDetail(data);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStudentDetail = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('view');
    setSearchParams(newParams);
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.program?.toLowerCase().includes(q)
    );
  });

  // Columns definition for ResponsiveTable
  const tableColumns = [
    {
      key: 'full_name',
      header: 'Student Name',
      isPrimary: true,
      render: (st) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{st.full_name}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{st.email}</div>
          <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, marginTop: '0.15rem' }}>
            {st.program}
          </div>
        </div>
      ),
    },
    {
      key: 'current_semester',
      header: 'Semester',
      mobileLabel: 'Semester',
      render: (st) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>
          Sem {st.current_semester}
        </span>
      ),
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      mobileLabel: 'CGPA',
      render: (st) => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{st.cgpa}</span>
      ),
    },
    {
      key: 'skills_count',
      header: 'Verified Skills',
      mobileLabel: 'Skills',
      render: (st) => (
        <span style={{ fontWeight: 600, color: '#2563eb' }}>
          {st.skills_count} skills
        </span>
      ),
    },
    {
      key: 'latest_assessment_score',
      header: 'Assessment Score',
      mobileLabel: 'Assessment',
      render: (st) => {
        const isLow = st.latest_assessment_score < 70;
        return (
          <span style={{ fontWeight: 700, color: isLow ? '#e11d48' : '#059669' }}>
            {st.latest_assessment_score}%
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      isBadge: true,
      render: (st) => {
        const isAttention = st.latest_assessment_score < 70 || (st.skill_gaps && st.skill_gaps.length > 0);
        return (
          <Badge variant={isAttention ? 'warning' : 'success'}>
            {isAttention ? 'Needs Attention' : 'On Track'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (st) => (
        <button
          type="button"
          onClick={() => openStudentDetail(st.id)}
          className="btn btn-outline"
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            minHeight: '36px',
            whiteSpace: 'nowrap',
          }}
        >
          <Eye size={14} /> View Record
        </button>
      ),
    },
  ];

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Authorized Student Roster"
        subtitle={`${students.length} Students in Department`}
        badge={<Badge role="academician" />}
        description="Monitor student skill development, review academic readiness, and provide tailored mentorship interventions. Cross-institution student data is securely isolated."
      />

      {/* 2. Filter & Search Controls */}
      <div className="portal-filter-bar">
        <div className="portal-search-box">
          <Search size={16} className="portal-search-icon" />
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search student by name, email, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="portal-filter-controls">
          <select
            className="portal-filter-select"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="">All Semesters</option>
            <option value="2">Semester 2</option>
            <option value="4">Semester 4</option>
            <option value="6">Semester 6</option>
            <option value="8">Semester 8</option>
          </select>

          <select
            className="portal-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="completed">Assessment Completed</option>
          </select>

          {(searchQuery || semesterFilter || statusFilter) && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', minHeight: '40px' }}
              onClick={() => {
                setSearchQuery('');
                setSemesterFilter('');
                setStatusFilter('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Responsive Table & Mobile Cards */}
      {loading ? (
        <LoadingState message="Loading authorized student records from institutional database..." />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="No student records match your active search or filter criteria in your academic department."
          action={
            (searchQuery || semesterFilter || statusFilter) && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                  setSemesterFilter('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <ResponsiveTable
          columns={tableColumns}
          data={filteredStudents}
          title={`Enrolled Students (${filteredStudents.length})`}
          renderMobileCard={(st) => {
            const hasGaps = st.skill_gaps && st.skill_gaps.length > 0;
            const isAttention = st.latest_assessment_score < 70;
            return (
              <div key={st.id} className="portal-row-card">
                <div className="portal-row-card-top">
                  <div>
                    <div className="portal-row-card-primary">{st.full_name}</div>
                    <div className="portal-row-card-secondary">{st.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 600, marginTop: '0.15rem' }}>
                      {st.program}
                    </div>
                  </div>
                  <Badge variant={isAttention ? 'warning' : 'success'}>
                    Sem {st.current_semester}
                  </Badge>
                </div>

                <div className="portal-row-card-grid">
                  <div className="portal-row-card-item">
                    <span className="portal-row-card-item-label">CGPA</span>
                    <span className="portal-row-card-item-value">{st.cgpa}</span>
                  </div>
                  <div className="portal-row-card-item">
                    <span className="portal-row-card-item-label">Skills</span>
                    <span className="portal-row-card-item-value" style={{ color: '#2563eb' }}>
                      {st.skills_count} verified
                    </span>
                  </div>
                  <div className="portal-row-card-item">
                    <span className="portal-row-card-item-label">Assessment</span>
                    <span className="portal-row-card-item-value" style={{ color: isAttention ? '#e11d48' : '#059669' }}>
                      {st.latest_assessment_score}%
                    </span>
                  </div>
                  <div className="portal-row-card-item">
                    <span className="portal-row-card-item-label">Status</span>
                    <span className="portal-row-card-item-value" style={{ color: isAttention ? '#e11d48' : '#059669' }}>
                      {isAttention ? 'Attention' : 'On Track'}
                    </span>
                  </div>
                </div>

                {hasGaps && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                    {st.skill_gaps.map((gap, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          fontWeight: 600,
                        }}
                      >
                        Gap: {gap}
                      </span>
                    ))}
                  </div>
                )}

                <div className="portal-row-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    onClick={() => openStudentDetail(st.id)}
                  >
                    <Eye size={16} /> View Comprehensive Record
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}

      {/* 4. Detailed Student Record Modal (Preserved with Responsive Touch Polish) */}
      {selectedStudentId && (
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
            if (e.target === e.currentTarget) closeStudentDetail();
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={20} color="#0d9488" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {detailLoading ? 'Loading Student Record...' : studentDetail?.full_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeStudentDetail}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close record modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {detailLoading ? (
                <LoadingState message="Fetching academic history and skill assessments..." />
              ) : !studentDetail ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Record Not Available"
                  description="Student record could not be loaded or cross-institution access is forbidden."
                />
              ) : (
                <>
                  {/* Summary Banner */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Program & Semester</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem', fontSize: '0.9rem' }}>
                        {studentDetail.program} (Sem {studentDetail.current_semester})
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Academic Standing</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem', fontSize: '0.9rem' }}>
                        {studentDetail.cgpa} CGPA
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem', fontSize: '0.9rem' }}>
                        {studentDetail.department_name}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                      <div style={{ fontWeight: 600, color: '#0d9488', marginTop: '0.15rem', fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {studentDetail.email}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
                    {[
                      { id: 'skills', label: `Skills (${studentDetail.skills?.length || 0})`, icon: Award },
                      { id: 'assessments', label: `Assessments (${studentDetail.assessment_history?.length || 0})`, icon: Brain },
                      { id: 'learning', label: `Learning (${studentDetail.learning_progress?.length || 0})`, icon: BookOpen },
                      { id: 'projects', label: `Projects (${studentDetail.projects?.length || 0})`, icon: Layers },
                      { id: 'applications', label: `Applications (${studentDetail.applications?.length || 0})`, icon: Briefcase },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = activeDetailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveDetailTab(tab.id)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            background: active ? '#f0fdf9' : 'transparent',
                            color: active ? '#0d9488' : '#64748b',
                            border: active ? '1px solid #ccfbf1' : '1px solid transparent',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Icon size={14} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Skills & Verified Proficiencies */}
                  {activeDetailTab === 'skills' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Verified Skills & Proficiencies
                      </h4>
                      {(!studentDetail.skills || studentDetail.skills.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No skills recorded yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' }}>
                          {studentDetail.skills.map((sk, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.65rem 0.85rem',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{sk.name}</span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  background: '#f0fdf9',
                                  color: '#0d9488',
                                  fontWeight: 700,
                                }}
                              >
                                {sk.proficiency_level}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Assessments */}
                  {activeDetailTab === 'assessments' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Assessment History
                      </h4>
                      {(!studentDetail.assessment_history || studentDetail.assessment_history.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No assessments completed yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {studentDetail.assessment_history.map((ah, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{ah.title}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  Taken: {new Date(ah.taken_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: '1rem',
                                  color: ah.score >= 70 ? '#059669' : '#e11d48',
                                }}
                              >
                                {ah.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Learning */}
                  {activeDetailTab === 'learning' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Learning Milestones & Progress
                      </h4>
                      {(!studentDetail.learning_progress || studentDetail.learning_progress.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No learning courses in progress.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {studentDetail.learning_progress.map((lp, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{lp.resource_title}</span>
                              <Badge variant={lp.status === 'completed' ? 'success' : 'primary'}>
                                {lp.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Projects */}
                  {activeDetailTab === 'projects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Student Projects & Portfolios
                      </h4>
                      {(!studentDetail.projects || studentDetail.projects.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No projects registered yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {studentDetail.projects.map((proj, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{proj.title}</strong>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                                {proj.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 5: Applications */}
                  {activeDetailTab === 'applications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Internship & Job Applications
                      </h4>
                      {(!studentDetail.applications || studentDetail.applications.length === 0) ? (
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No external applications submitted yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {studentDetail.applications.map((app, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div>
                                <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{app.role_title}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.company_name}</div>
                              </div>
                              <Badge status={app.status}>{app.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

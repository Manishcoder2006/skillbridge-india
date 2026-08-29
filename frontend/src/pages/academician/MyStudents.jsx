import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
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
  Sparkles,
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
      setStudents(data);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            Authorized Student Roster
          </Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Institution & Department Scoped
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          My Authorized Students
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          View, monitor, and mentor students under your academic department. Cross-institution student data is securely isolated.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search student name, email, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--color-text-muted)" />
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.45rem 1rem' }}
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="">All Semesters</option>
                <option value="4">Semester 4</option>
                <option value="6">Semester 6</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="completed">Completed Assessment</option>
            </select>

            {(searchQuery || semesterFilter || statusFilter) && (
              <button
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
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
      </Card>

      {/* Student List / Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Users size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>No Authorized Students Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No student records matched your filter criteria in your department.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredStudents.map((st) => {
            const hasGaps = st.skill_gaps && st.skill_gaps.length > 0;
            const isAttention = st.latest_assessment_score < 70;

            return (
              <Card
                key={st.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderTop: isAttention ? '3px solid #ef4444' : '3px solid #10b981',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.2rem' }}>
                        {st.full_name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{st.email}</span>
                    </div>
                    <Badge variant={isAttention ? 'warning' : 'success'}>
                      Sem {st.current_semester}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', marginTop: '0.5rem', fontWeight: 500 }}>
                    {st.program}
                  </div>

                  {/* Stats Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: 'var(--color-bg)',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      marginTop: '0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>CGPA</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{st.cgpa}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Skills</span>
                      <strong style={{ fontSize: '0.95rem', color: '#3b82f6' }}>{st.skills_count}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Assessment</span>
                      <strong style={{ fontSize: '0.95rem', color: isAttention ? '#ef4444' : '#10b981' }}>
                        {st.latest_assessment_score}%
                      </strong>
                    </div>
                  </div>

                  {/* Skill Gaps or Strengths */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                      {hasGaps ? '⚠️ Identified Skill Gaps' : '✅ Status'}
                    </span>
                    {hasGaps ? (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {st.skill_gaps.map((gap, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            {gap}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={14} /> Skills verified & on track
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    onClick={() => openStudentDetail(st.id)}
                  >
                    <Eye size={15} /> View Comprehensive Record
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Student Record Modal */}
      {selectedStudentId && (
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
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-bg)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GraduationCap size={22} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  {detailLoading ? 'Loading Student Record...' : studentDetail?.full_name}
                </h3>
              </div>
              <button
                onClick={closeStudentDetail}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {detailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Spinner size="lg" />
                </div>
              ) : !studentDetail ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                  Student record could not be loaded or cross-institution access is forbidden.
                </div>
              ) : (
                <>
                  {/* Summary Banner */}
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: '10px',
                      background: 'rgba(37, 99, 235, 0.08)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Program & Semester</span>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                        {studentDetail.program} (Sem {studentDetail.current_semester})
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CGPA & Score</span>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                        {studentDetail.cgpa} CGPA
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Department</span>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem' }}>
                        {studentDetail.department_name}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Contact Email</span>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: '0.2rem', fontSize: '0.85rem' }}>
                        {studentDetail.email}
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
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
                          onClick={() => setActiveDetailTab(tab.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            background: active ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Icon size={14} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content: Skills */}
                  {activeDetailTab === 'skills' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetail.skills?.map((sk, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>{sk.skill_name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                              ({sk.category})
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge variant="primary" style={{ textTransform: 'capitalize' }}>
                              {sk.proficiency_level}
                            </Badge>
                            {sk.is_verified && <Badge variant="success">Verified</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab Content: Assessments */}
                  {activeDetailTab === 'assessments' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetail.assessment_history?.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                          No skill assessment attempts recorded yet.
                        </p>
                      ) : (
                        studentDetail.assessment_history?.map((att, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{att.assessment_title}</span>
                              <Badge variant={att.passed ? 'success' : 'danger'}>
                                {att.percentage}% ({att.passed ? 'PASSED' : 'RETEST RECOMMENDED'})
                              </Badge>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                              Completed: {att.completed_at ? new Date(att.completed_at).toLocaleDateString() : 'Recent'} • Score: {att.score}/{att.total_marks}
                            </div>
                            {att.skill_gaps && att.skill_gaps.length > 0 && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#ef4444' }}>
                                <strong>Skill Gaps:</strong> {att.skill_gaps.join(', ')}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab Content: Learning */}
                  {activeDetailTab === 'learning' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetail.learning_progress?.map((lp, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>{lp.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                              {lp.provider} • {lp.category}
                            </span>
                          </div>
                          <Badge variant={lp.status === 'completed' ? 'success' : 'warning'}>
                            {lp.progress_percent || 0}% ({lp.status || 'in progress'})
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab Content: Projects */}
                  {activeDetailTab === 'projects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetail.projects?.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                          No student projects uploaded.
                        </p>
                      ) : (
                        studentDetail.projects?.map((proj, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '1rem',
                              borderRadius: '8px',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{proj.title}</span>
                            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0.35rem 0' }}>
                              {proj.description}
                            </p>
                            {proj.technologies && (
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                {proj.technologies.map((t, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: '4px',
                                      background: 'rgba(99, 102, 241, 0.1)',
                                      color: '#6366f1',
                                    }}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab Content: Applications */}
                  {activeDetailTab === 'applications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetail.applications?.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                          No job or internship applications submitted yet.
                        </p>
                      ) : (
                        studentDetail.applications?.map((app, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{app.opportunity_title}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                                {app.company_name} • Applied: {new Date(app.applied_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge variant={app.status === 'shortlisted' ? 'success' : 'primary'} style={{ textTransform: 'capitalize' }}>
                              {app.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'var(--color-bg)',
              }}
            >
              <button className="btn btn-outline" onClick={closeStudentDetail}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  Briefcase,
  BarChart3,
  BrainCircuit,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import {
  RolePageHeader,
  RoleStatCard,
  ResponsiveTable,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const InstitutionDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Primary Data States
  const [institution, setInstitution] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [skillIntelligence, setSkillIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Navigation Tabs: 'overview' | 'students' | 'faculty' | 'departments' | 'skills' | 'industry' | 'analytics' | 'security'
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('departments')) return 'departments';
    if (path.includes('members')) return 'students';
    return 'overview';
  });

  // Department Creation Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [deptSubmitting, setDeptSubmitting] = useState(false);
  const [deptError, setDeptError] = useState(null);
  const [deptSuccess, setDeptSuccess] = useState(null);

  // Filter & Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('all');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('all');

  // Selected Member Details Modal
  const [selectedMember, setSelectedMember] = useState(null);

  // Sync tab with URL if pathname changes
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('departments')) setActiveTab('departments');
    else if (path.includes('members')) setActiveTab('students');
  }, [location.pathname]);

  // Load Verified Institution Data
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const instData = await apiService.getMyInstitution();
      setInstitution(instData);

      if (instData?.id) {
        const [deptList, memberList, skillIntel] = await Promise.all([
          apiService.getDepartments(instData.id).catch((e) => {
            console.warn('Failed to load departments:', e);
            return [];
          }),
          apiService.getInstitutionMembers().catch((e) => {
            console.warn('Failed to load members:', e);
            return [];
          }),
          apiService.getInstitutionSkillIntelligence().catch((e) => {
            console.warn('Failed to load skill intelligence:', e);
            return null;
          }),
        ]);
        setDepartments(deptList || []);
        setMembers(memberList || []);
        setSkillIntelligence(skillIntel || null);
      }
    } catch (err) {
      console.error('Failed to load institution data:', err);
      setError('Unable to load institutional details. Please ensure your administrator session is valid.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derived Rosters
  const students = useMemo(
    () => members.filter((m) => m.role?.toLowerCase() === 'student'),
    [members]
  );

  const faculty = useMemo(
    () => members.filter((m) => {
      const r = m.role?.toLowerCase();
      return r === 'academician' || r === 'faculty';
    }),
    [members]
  );

  // Department ID to Name Lookup Helper
  const getDeptName = (deptId) => {
    if (!deptId) return 'Unassigned';
    const found = departments.find(
      (d) => String(d.id) === String(deptId) || String(d.code) === String(deptId)
    );
    return found ? `${found.name} (${found.code})` : deptId;
  };

  // Department counts
  const departmentStats = useMemo(() => {
    return departments.map((d) => {
      const studentCount = students.filter(
        (s) => String(s.department_id) === String(d.id) || String(s.department_id) === String(d.code)
      ).length;
      const facultyCount = faculty.filter(
        (f) => String(f.department_id) === String(d.id) || String(f.department_id) === String(d.code)
      ).length;
      return {
        ...d,
        studentCount,
        facultyCount,
      };
    });
  }, [departments, students, faculty]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !studentSearch ||
        s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase());
      const matchesDept =
        studentDeptFilter === 'all' ||
        String(s.department_id) === String(studentDeptFilter);
      return matchesSearch && matchesDept;
    });
  }, [students, studentSearch, studentDeptFilter]);

  // Filtered Faculty
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        !facultySearch ||
        f.full_name?.toLowerCase().includes(facultySearch.toLowerCase()) ||
        f.email?.toLowerCase().includes(facultySearch.toLowerCase());
      const matchesDept =
        facultyDeptFilter === 'all' ||
        String(f.department_id) === String(facultyDeptFilter);
      return matchesSearch && matchesDept;
    });
  }, [faculty, facultySearch, facultyDeptFilter]);

  // Handle Add Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setDeptError(null);
    setDeptSuccess(null);

    if (!deptForm.name.trim() || !deptForm.code.trim()) {
      setDeptError('Department Name and Department Code are both required.');
      return;
    }

    try {
      setDeptSubmitting(true);
      const newDept = await apiService.createDepartment({
        name: deptForm.name.trim(),
        code: deptForm.code.trim().toUpperCase(),
        description: deptForm.description?.trim() || null,
      });

      setDeptSuccess(`Department "${newDept.name}" successfully created!`);
      setDeptForm({ name: '', code: '', description: '' });

      // Refresh department list
      if (institution?.id) {
        const updatedDepts = await apiService.getDepartments(institution.id);
        setDepartments(updatedDepts || []);
      }

      setTimeout(() => {
        setShowDeptModal(false);
        setDeptSuccess(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to create department:', err);
      setDeptError(err.response?.data?.detail || 'Failed to add department. Please verify code uniqueness.');
    } finally {
      setDeptSubmitting(false);
    }
  };

  // Student Table Column Definitions
  const studentColumns = [
    {
      key: 'full_name',
      header: 'Student Name',
      isPrimary: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.full_name || 'Enrolled Student'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {row.id?.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Institutional Email',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{row.email}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            background: '#f1f5f9',
            color: '#334155',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
        >
          {getDeptName(row.department_id)}
        </span>
      ),
    },
    {
      key: 'verification_status',
      header: 'Verification',
      isBadge: true,
      render: (row) => {
        const isVerified = row.verification_status === 'verified';
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              background: isVerified ? '#f0fdf4' : '#fef3c7',
              color: isVerified ? '#15803d' : '#b45309',
              border: `1px solid ${isVerified ? '#bbf7d0' : '#fde68a'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {isVerified && <CheckCircle2 size={12} />}
            {row.verification_status || 'Pending'}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: row.is_active !== false ? '#0d9488' : '#94a3b8',
          }}
        >
          {row.is_active !== false ? '● Active' : '○ Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          className="portal-btn secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
          onClick={() => setSelectedMember(row)}
        >
          View Profile
        </button>
      ),
    },
  ];

  // Faculty Table Column Definitions
  const facultyColumns = [
    {
      key: 'full_name',
      header: 'Faculty Member',
      isPrimary: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.full_name || 'Faculty Member'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Designation: Academician</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Institutional Email',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{row.email}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            background: '#f1f5f9',
            color: '#334155',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
        >
          {getDeptName(row.department_id)}
        </span>
      ),
    },
    {
      key: 'verification_status',
      header: 'Verification',
      isBadge: true,
      render: (row) => {
        const isVerified = row.verification_status === 'verified';
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              background: isVerified ? '#f0fdf4' : '#fef3c7',
              color: isVerified ? '#15803d' : '#b45309',
              border: `1px solid ${isVerified ? '#bbf7d0' : '#fde68a'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {isVerified && <CheckCircle2 size={12} />}
            {row.verification_status || 'Pending'}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: row.is_active !== false ? '#0d9488' : '#94a3b8',
          }}
        >
          {row.is_active !== false ? '● Active' : '○ Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          className="portal-btn secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
          onClick={() => setSelectedMember(row)}
        >
          View Record
        </button>
      ),
    },
  ];

  // Department Skill Comparison Column Definitions
  const deptComparisonColumns = [
    {
      key: 'department_name',
      header: 'Department / Branch',
      isPrimary: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.department_name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Branch Code: {row.department_code}</div>
        </div>
      ),
    },
    {
      key: 'student_count',
      header: 'Enrolled',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.student_count} Students</span>
      ),
    },
    {
      key: 'assessed_count',
      header: 'Assessed',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#0284c7' }}>{row.assessed_count} Completed</span>
      ),
    },
    {
      key: 'average_score',
      header: 'Benchmark Score',
      render: (row) => (
        <span style={{ fontWeight: 700, color: row.average_score >= 70 ? '#16a34a' : '#ea580c' }}>
          {row.average_score}%
        </span>
      ),
    },
    {
      key: 'top_skill',
      header: 'Leading Competency',
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            background: '#f1f5f9',
            color: '#334155',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
        >
          {row.top_skill}
        </span>
      ),
    },
    {
      key: 'readiness_rate',
      header: 'Industry Readiness',
      isBadge: true,
      render: (row) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.6rem',
            borderRadius: '9999px',
            background: row.readiness_rate >= 60 ? '#f0fdf4' : '#fff7ed',
            color: row.readiness_rate >= 60 ? '#15803d' : '#c2410c',
            border: `1px solid ${row.readiness_rate >= 60 ? '#bbf7d0' : '#ffedd5'}`,
          }}
        >
          {row.readiness_rate}% Ready
        </span>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Loading institutional telemetry and verified departments..." />;
  }

  if (error) {
    return (
      <div className="portal-page">
        <ErrorState
          title="Institutional Authentication Required"
          message={error}
          onRetry={() => loadData()}
        />
      </div>
    );
  }

  const verifiedCount = members.filter((m) => m.verification_status === 'verified').length;
  const verifiedRate = members.length > 0 ? Math.round((verifiedCount / members.length) * 100) : 100;

  return (
    <div className="portal-page">
      {/* 1. Header with Real Institution Metadata */}
      <RolePageHeader
        title={institution?.name || 'Academic Institution Administration'}
        subtitle={`${institution?.code || 'INST'} • ${institution?.city || 'Campus'}, ${institution?.state || 'India'}`}
        description="Enterprise governance portal for institutional curriculum, multi-department telemetry, faculty oversight, and secure data isolation."
        badge={
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: '#f0fdf9',
                color: '#0d9488',
                border: '1px solid #ccfbf1',
                textTransform: 'uppercase',
              }}
            >
              {institution?.type || 'INSTITUTION'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <CheckCircle2 size={12} />
              {institution?.verification_status || 'Verified'}
            </span>
          </div>
        }
        actions={
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="portal-btn secondary"
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh Institutional Telemetry"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              className="portal-btn primary"
              onClick={() => setShowDeptModal(true)}
            >
              <Plus size={16} />
              Add Department
            </button>
            {institution?.website && (
              <a
                href={institution.website.startsWith('http') ? institution.website : `https://${institution.website}`}
                target="_blank"
                rel="noreferrer"
                className="portal-btn secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Portal</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        }
      />

      {/* 2. Navigation Tab Bar */}
      <div className="portal-tab-bar">
        <button
          className={`portal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={16} />
          <span>Dashboard Overview</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <GraduationCap size={16} />
          <span>Student Management ({students.length})</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <Users size={16} />
          <span>Faculty Management ({faculty.length})</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={16} />
          <span>Departments ({departments.length})</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <BrainCircuit size={16} />
          <span>Skill Intelligence</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'industry' ? 'active' : ''}`}
          onClick={() => setActiveTab('industry')}
        >
          <Briefcase size={16} />
          <span>Industry & Placements</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Institutional Analytics</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheck size={16} />
          <span>Security & Tenancy</span>
        </button>
      </div>

      {/* 3. TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* Key KPI Metric Grid */}
          <div className="portal-stat-grid">
            <RoleStatCard
              title="Enrolled Students"
              value={students.length}
              subtext="Scoped to Institution Tenant"
              icon={GraduationCap}
              variant="teal"
            />
            <RoleStatCard
              title="Appointed Faculty"
              value={faculty.length}
              subtext="Academic Instructors"
              icon={Users}
              variant="blue"
            />
            <RoleStatCard
              title="Managed Departments"
              value={departments.length}
              subtext={`${departments.map((d) => d.code).slice(0, 3).join(', ')}${departments.length > 3 ? '...' : ''}`}
              icon={Building2}
              variant="purple"
            />
            <RoleStatCard
              title="Verified Roster"
              value={`${verifiedRate}%`}
              subtext={`${verifiedCount} of ${members.length} accounts`}
              subtextType="positive"
              icon={UserCheck}
              variant="emerald"
            />
            <RoleStatCard
              title="Tenancy Isolation"
              value="100%"
              subtext="Supabase RLS Enforced"
              subtextType="positive"
              icon={ShieldCheck}
              variant="emerald"
            />
          </div>

          {/* Department Breakdown & Quick Roster Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Department Summary Matrix */}
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={18} color="#0d9488" />
                  Department Breakdown
                </h3>
                <button
                  className="portal-btn secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setActiveTab('departments')}
                >
                  Manage All
                </button>
              </div>

              {departmentStats.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No active departments registered. Click "Add Department" above to configure.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {departmentStats.map((dept) => (
                    <div
                      key={dept.id}
                      style={{
                        padding: '0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          {dept.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Code: <strong style={{ color: '#0d9488' }}>{dept.code}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', textAlign: 'right' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                            {dept.studentCount}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Students</div>
                        </div>
                        <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '0.75rem' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                            {dept.facultyCount}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Faculty</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tenancy & Data Governance Overview */}
            <div className="portal-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Lock size={18} color="#15803d" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Institutional Security & Governance
                </h3>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem' }}>
                  <ShieldCheck size={16} />
                  Tenancy Isolation Rule 4 Active
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#15803d', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
                  Student profiles, curriculum modules, and academician records are cryptographically bound to this institution's identifier. Cross-tenant leakage is strictly blocked at the database engine.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Institution Identifier:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                    {institution?.id ? `${institution.id.slice(0, 12)}...` : 'Assigned'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Administrative Role:</span>
                  <span style={{ fontWeight: 600, color: '#0d9488' }}>INSTITUTION_ADMIN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Verification Status:</span>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>
                    {institution?.verification_status || 'Verified'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: '#64748b' }}>Official Contact:</span>
                  <span style={{ fontWeight: 500, color: '#475569' }}>
                    {institution?.contact_email || 'admin@institution.edu'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Roster Preview Table */}
          <div className="portal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Recent Institutional Roster Entries
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                  Students and faculty members registered under this institutional tenant.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="portal-btn secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('students')}
                >
                  All Students ({students.length})
                </button>
                <button
                  className="portal-btn secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('faculty')}
                >
                  All Faculty ({faculty.length})
                </button>
              </div>
            </div>

            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Members Registered Yet"
                description="When students and faculty register with your institutional code, they will automatically appear here."
              />
            ) : (
              <ResponsiveTable
                columns={[
                  {
                    key: 'full_name',
                    header: 'Member Name',
                    isPrimary: true,
                    render: (r) => (
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.full_name}</span>
                    ),
                  },
                  { key: 'email', header: 'Email' },
                  {
                    key: 'role',
                    header: 'Role',
                    render: (r) => (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: r.role === 'student' ? '#f0fdf9' : '#eff6ff',
                          color: r.role === 'student' ? '#0d9488' : '#2563eb',
                          border: `1px solid ${r.role === 'student' ? '#ccfbf1' : '#bfdbfe'}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {r.role}
                      </span>
                    ),
                  },
                  {
                    key: 'department',
                    header: 'Department',
                    render: (r) => getDeptName(r.department_id),
                  },
                  {
                    key: 'verification_status',
                    header: 'Status',
                    render: (r) => (
                      <span style={{ fontSize: '0.8rem', color: r.verification_status === 'verified' ? '#15803d' : '#b45309', fontWeight: 600 }}>
                        {r.verification_status || 'Pending'}
                      </span>
                    ),
                  },
                ]}
                data={members.slice(0, 5)}
              />
            )}
          </div>
        </>
      )}

      {/* 4. TAB 2: STUDENT MANAGEMENT */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter & Search Bar */}
          <div className="portal-filter-bar">
            <div className="portal-search-box">
              <Search size={16} className="portal-search-icon" />
              <input
                type="text"
                className="portal-search-input"
                placeholder="Search students by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div className="portal-filter-controls">
              <select
                className="portal-filter-select"
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
              >
                <option value="all">All Departments ({students.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={students.length === 0 ? 'No Students Enrolled' : 'No Students Match Filters'}
              description={
                students.length === 0
                  ? 'Students registered with your institutional affiliation will be populated under this tenant.'
                  : 'Try clearing the search query or selecting another department.'
              }
              action={
                studentSearch || studentDeptFilter !== 'all' ? (
                  <button
                    className="portal-btn secondary"
                    onClick={() => {
                      setStudentSearch('');
                      setStudentDeptFilter('all');
                    }}
                  >
                    Clear Filters
                  </button>
                ) : null
              }
            />
          ) : (
            <ResponsiveTable
              columns={studentColumns}
              data={filteredStudents}
              title={`Enrolled Students (${filteredStudents.length})`}
            />
          )}
        </div>
      )}

      {/* 5. TAB 3: FACULTY MANAGEMENT */}
      {activeTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter & Search Bar */}
          <div className="portal-filter-bar">
            <div className="portal-search-box">
              <Search size={16} className="portal-search-icon" />
              <input
                type="text"
                className="portal-search-input"
                placeholder="Search faculty by name or email..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
            </div>

            <div className="portal-filter-controls">
              <select
                className="portal-filter-select"
                value={facultyDeptFilter}
                onChange={(e) => setFacultyDeptFilter(e.target.value)}
              >
                <option value="all">All Departments ({faculty.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredFaculty.length === 0 ? (
            <EmptyState
              icon={Users}
              title={faculty.length === 0 ? 'No Faculty Appointed' : 'No Faculty Match Filters'}
              description={
                faculty.length === 0
                  ? 'Faculty instructors onboarded to your institution will appear here.'
                  : 'Try adjusting your search criteria.'
              }
              action={
                facultySearch || facultyDeptFilter !== 'all' ? (
                  <button
                    className="portal-btn secondary"
                    onClick={() => {
                      setFacultySearch('');
                      setFacultyDeptFilter('all');
                    }}
                  >
                    Clear Filters
                  </button>
                ) : null
              }
            />
          ) : (
            <ResponsiveTable
              columns={facultyColumns}
              data={filteredFaculty}
              title={`Appointed Faculty (${filteredFaculty.length})`}
            />
          )}
        </div>
      )}

      {/* 6. TAB 4: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Academic Departments ({departments.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                Manage departmental branches, degree programs, and curriculum divisions.
              </p>
            </div>
            <button
              className="portal-btn primary"
              onClick={() => setShowDeptModal(true)}
            >
              <Plus size={16} />
              Add Department
            </button>
          </div>

          {departments.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Departments Configured"
              description="Configure your institution's academic branches (e.g. Computer Science, Electrical Engineering) to organize students and faculty."
              action={
                <button
                  className="portal-btn primary"
                  onClick={() => setShowDeptModal(true)}
                >
                  <Plus size={16} />
                  Add First Department
                </button>
              }
            />
          ) : (
            <div className="portal-dept-grid">
              {departmentStats.map((dept) => (
                <div key={dept.id} className="portal-dept-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {dept.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          background: '#f0fdf9',
                          color: '#0d9488',
                          border: '1px solid #ccfbf1',
                          borderRadius: '6px',
                        }}
                      >
                        {dept.code}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                      ID: {dept.id}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Students
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        {dept.studentCount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                        Faculty
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        {dept.facultyCount}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="portal-btn secondary"
                      style={{ flex: 1, fontSize: '0.775rem', padding: '0.4rem 0.6rem' }}
                      onClick={() => {
                        setStudentDeptFilter(dept.id);
                        setActiveTab('students');
                      }}
                    >
                      View Students
                    </button>
                    <button
                      className="portal-btn secondary"
                      style={{ flex: 1, fontSize: '0.775rem', padding: '0.4rem 0.6rem' }}
                      onClick={() => {
                        setFacultyDeptFilter(dept.id);
                        setActiveTab('faculty');
                      }}
                    >
                      View Faculty
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 5: SKILL INTELLIGENCE */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Card */}
          <div className="portal-card" style={{ background: '#f8fafc', borderLeft: '4px solid #0d9488' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <BrainCircuit size={20} style={{ color: '#0d9488' }} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {institution?.name || 'Institutional'} Skill Intelligence & Cohort Benchmarks
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Real-time multi-department skill distribution, objective assessment telemetry, and curriculum gap diagnostics across enrolled cohorts.
                </p>
              </div>
              <button
                className="portal-btn secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                onClick={() => loadData(true)}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span>Sync Assessment Telemetry</span>
              </button>
            </div>
          </div>

          {!skillIntelligence ? (
            <EmptyState
              icon={BrainCircuit}
              title="Awaiting Institutional Assessment Telemetry"
              description="Student assessment scores and verified competency profiles are currently syncing across departments. Refresh to fetch the latest analytics."
              action={
                <button className="portal-btn primary" onClick={() => loadData(true)}>
                  <RefreshCw size={15} />
                  Fetch Skill Intelligence
                </button>
              }
            />
          ) : (
            <>
              {/* 1. Institutional KPI Grid */}
              <div className="portal-stat-grid">
                <RoleStatCard
                  title="Enrolled Students"
                  value={skillIntelligence.total_students}
                  icon={GraduationCap}
                  subtext="Across all branches"
                  variant="primary"
                />
                <RoleStatCard
                  title="Assessed Cohorts"
                  value={`${skillIntelligence.total_assessed_students} (${skillIntelligence.assessment_coverage_rate}%)`}
                  icon={CheckCircle2}
                  subtext="Assessment coverage rate"
                  variant="teal"
                />
                <RoleStatCard
                  title="Institutional Benchmark"
                  value={`${skillIntelligence.average_institutional_score}%`}
                  icon={Award}
                  subtext="Average assessment score"
                  variant="indigo"
                />
                <RoleStatCard
                  title="Verified Competencies"
                  value={skillIntelligence.total_verified_skills}
                  icon={Target}
                  subtext="Student skill records"
                  variant="emerald"
                />
              </div>

              {/* 2. Readiness & Competency Distribution Bar */}
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Placement & Industry Competency Readiness
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                      Tiered readiness breakdown based on objective assessment scores across enrolled cohorts.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      background: '#f0fdf4',
                      color: '#15803d',
                      borderRadius: '9999px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    Active Cohort Baseline
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', height: '12px', borderRadius: '9999px', overflow: 'hidden', background: '#e2e8f0', margin: '1rem 0' }}>
                  <div
                    style={{
                      width: `${skillIntelligence.competency_distribution?.industry_ready?.percentage || 0}%`,
                      background: '#10b981',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Industry Ready: ${skillIntelligence.competency_distribution?.industry_ready?.percentage || 0}%`}
                  />
                  <div
                    style={{
                      width: `${skillIntelligence.competency_distribution?.developing?.percentage || 0}%`,
                      background: '#f59e0b',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Developing: ${skillIntelligence.competency_distribution?.developing?.percentage || 0}%`}
                  />
                  <div
                    style={{
                      width: `${skillIntelligence.competency_distribution?.foundational?.percentage || 0}%`,
                      background: '#94a3b8',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Foundational: ${skillIntelligence.competency_distribution?.foundational?.percentage || 0}%`}
                  />
                </div>

                {/* Tier details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      Industry Ready (Score ≥ 75%)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                      {skillIntelligence.competency_distribution?.industry_ready?.count || 0}{' '}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>
                        ({skillIntelligence.competency_distribution?.industry_ready?.percentage || 0}%)
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                      Developing Competency (50–74%)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                      {skillIntelligence.competency_distribution?.developing?.count || 0}{' '}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309' }}>
                        ({skillIntelligence.competency_distribution?.developing?.percentage || 0}%)
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
                      Foundational / In Progress (&lt; 50%)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                      {skillIntelligence.competency_distribution?.foundational?.count || 0}{' '}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                        ({skillIntelligence.competency_distribution?.foundational?.percentage || 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Strongest Skills & Critical Skill Gaps Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {/* Strongest Skills */}
                <div className="portal-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <TrendingUp size={18} style={{ color: '#10b981' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Leading Institutional Competencies
                    </h3>
                  </div>

                  {(skillIntelligence.strongest_skills || []).length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                      No verified competency records available yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {skillIntelligence.strongest_skills.map((sk, idx) => (
                        <div
                          key={sk.skill_name || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.65rem 0.85rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                              {sk.skill_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {sk.student_count} student{sk.student_count !== 1 ? 's' : ''} verified
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.5rem',
                                background: '#f0fdf4',
                                color: '#15803d',
                                borderRadius: '6px',
                                border: '1px solid #bbf7d0',
                              }}
                            >
                              {sk.proficiency_rate}% Proficiency
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Critical Skill Gaps */}
                <div className="portal-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Identified Curriculum & Skill Gaps
                    </h3>
                  </div>

                  {(skillIntelligence.critical_skill_gaps || []).length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                      No critical curriculum skill deficits identified.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {skillIntelligence.critical_skill_gaps.map((gp, idx) => (
                        <div
                          key={gp.skill_name || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.65rem 0.85rem',
                            background: '#fff7ed',
                            borderRadius: '8px',
                            border: '1px solid #fed7aa',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.9rem' }}>
                              {gp.skill_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>
                              {gp.recommended_action}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.5rem',
                                background: '#ffedd5',
                                color: '#9a3412',
                                borderRadius: '6px',
                                border: '1px solid #fdba74',
                              }}
                            >
                              {gp.affected_students_count} Student{gp.affected_students_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Department Comparison Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Department-Wise Skill & Readiness Comparison
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                    Curriculum benchmarks, student participation, and placement readiness across institutional branches.
                  </p>
                </div>

                <ResponsiveTable
                  columns={deptComparisonColumns}
                  data={skillIntelligence.department_comparison || []}
                  title="Departmental Benchmarks"
                />
              </div>

              {/* 5. Longitudinal Trend Telemetry Callout */}
              <div className="portal-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BarChart3 size={18} style={{ color: '#64748b' }} />
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                    Multi-Semester Longitudinal Trends
                  </div>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>
                  {skillIntelligence.trend_status_message}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* 8. TAB 6: INDUSTRY & OPPORTUNITIES */}
      {activeTab === 'industry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="portal-card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Corporate Partnerships & Campus Recruitment
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Institutional perspective on industry MoUs, enterprise recruitment pipelines, and corporate mentorship initiatives.
            </p>
          </div>

          <EmptyState
            icon={Briefcase}
            title="Industry Engagement Telemetry Pending Partner MoUs"
            description="Direct industry engagement data, campus placement drives, and verified recruiter partnerships will appear here once formal enterprise tie-ups are established."
          />
        </div>
      )}

      {/* 9. TAB 7: INSTITUTIONAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="portal-stat-grid">
            <RoleStatCard
              title="Student-to-Faculty Ratio"
              value={faculty.length > 0 ? `${Math.round(students.length / faculty.length)}:1` : `${students.length}:0`}
              subtext="Institutional Average"
              icon={Users}
              variant="teal"
            />
            <RoleStatCard
              title="Department Coverage"
              value={`${departments.length} Depts`}
              subtext="Active Academic Programs"
              icon={Building2}
              variant="blue"
            />
            <RoleStatCard
              title="Verification Rate"
              value={`${verifiedRate}%`}
              subtext="Identity Verified Accounts"
              subtextType="positive"
              icon={ShieldCheck}
              variant="emerald"
            />
          </div>

          <EmptyState
            icon={BarChart3}
            title="Advanced Longitudinal Telemetry in Progress"
            description="Predictive placement analytics and cross-year graduation benchmarks require continuous cohort assessment history. Verified operational telemetry is summarized in the KPI metrics above."
          />
        </div>
      )}

      {/* 10. TAB 8: SECURITY & COMPLIANCE */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="portal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  background: '#f0fdf4',
                  color: '#15803d',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <Lock size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Multi-Tenant Institutional Security & Compliance
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                  Architecture adherence and institutional compliance report.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Tenancy Isolation Rule
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  Rule 4 Compliant
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
                  All queries filter strictly on <code>institution_id = '{institution?.id}'</code>. Cross-tenant reads are prevented at database engine.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Authentication Protocol
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d9488', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={16} />
                  Supabase JWT Signature Verified
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
                  HMAC SHA-256 tokens decoded with administrative role claim <code>institution_admin</code>.
                </p>
              </div>

              <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Database Engine
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={16} />
                  PostgreSQL + Row-Level Security
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
                  Tenant boundaries enforced natively across profiles, departments, and academic assessments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="portal-modal-backdrop" onClick={() => !deptSubmitting && setShowDeptModal(false)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">Add Academic Department</h3>
              <button
                className="portal-btn secondary"
                style={{ padding: '0.25rem 0.5rem', minHeight: 'auto' }}
                onClick={() => !deptSubmitting && setShowDeptModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDepartment}>
              <div className="portal-modal-body">
                {deptError && (
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
                    <span>{deptError}</span>
                  </div>
                )}

                {deptSuccess && (
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
                    <span>{deptSuccess}</span>
                  </div>
                )}

                <div className="portal-form-group">
                  <label className="portal-form-label">Department Name *</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. Computer Science and Engineering"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    required
                    disabled={deptSubmitting}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Department Code *</label>
                  <input
                    type="text"
                    className="portal-form-input"
                    placeholder="e.g. CSE"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    required
                    maxLength={10}
                    disabled={deptSubmitting}
                  />
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Short unique abbreviation (e.g. CSE, ECE, MECH, CIVIL)
                  </span>
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Description (Optional)</label>
                  <textarea
                    className="portal-form-input portal-form-textarea"
                    placeholder="Brief description of department scope or curriculum focus..."
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    disabled={deptSubmitting}
                  />
                </div>
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="portal-btn secondary"
                  onClick={() => setShowDeptModal(false)}
                  disabled={deptSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-btn primary"
                  disabled={deptSubmitting}
                >
                  {deptSubmitting ? 'Creating Department...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="portal-modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="portal-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3 className="portal-modal-title">Institutional Record</h3>
              <button
                className="portal-btn secondary"
                style={{ padding: '0.25rem 0.5rem', minHeight: 'auto' }}
                onClick={() => setSelectedMember(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="portal-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: '#f0fdf9',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {selectedMember.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedMember.full_name || 'Member Record'}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedMember.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Role
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>
                    {selectedMember.role}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Department
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {getDeptName(selectedMember.department_id)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Verification Status
                  </span>
                  <div style={{ fontWeight: 600, color: selectedMember.verification_status === 'verified' ? '#15803d' : '#b45309' }}>
                    {selectedMember.verification_status || 'Pending'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Account Status
                  </span>
                  <div style={{ fontWeight: 600, color: selectedMember.is_active !== false ? '#0d9488' : '#94a3b8' }}>
                    {selectedMember.is_active !== false ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Tenancy Scope
                  </span>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.775rem', color: '#475569', marginTop: '0.15rem' }}>
                    Tenant ID: {institution?.id || 'Multi-tenant scoped'}
                  </div>
                </div>
              </div>
            </div>

            <div className="portal-modal-footer">
              <button
                type="button"
                className="portal-btn secondary"
                onClick={() => setSelectedMember(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

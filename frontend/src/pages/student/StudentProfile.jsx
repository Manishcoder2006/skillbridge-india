import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  User,
  GraduationCap,
  Building2,
  Lock,
  Save,
  Plus,
  Trash2,
  Award,
  FolderGit2,
  CheckCircle2,
  FileBadge,
} from 'lucide-react';

export const StudentProfile = () => {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    program: '',
    current_semester: 6,
    cgpa: 8.5,
    career_interests: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
  });

  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', github_or_demo_url: '' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issue_year: 2025, credential_url: '' });
  const [newAchieve, setNewAchieve] = useState({ title: '', organization: '', year: 2026, description: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudentFullProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        location: data.location || '',
        program: data.program || 'B.Tech Computer Science & Engineering',
        current_semester: data.current_semester || 6,
        cgpa: data.cgpa || 8.5,
        career_interests: data.career_interests || [],
        education: data.education || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],
      });
    } catch (err) {
      showError('Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await apiService.updateStudentFullProfile(formData);
      setProfile(updated);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError('Failed to update profile. Protected fields cannot be modified.');
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    if (!newProject.title) return;
    const techs = newProject.technologies ? newProject.technologies.split(',').map((t) => t.trim()) : [];
    const updated = [...formData.projects, { ...newProject, technologies: techs }];
    setFormData({ ...formData, projects: updated });
    setNewProject({ title: '', description: '', technologies: '', github_or_demo_url: '' });
  };

  const removeProject = (idx) => {
    const updated = formData.projects.filter((_, i) => i !== idx);
    setFormData({ ...formData, projects: updated });
  };

  const addCertification = () => {
    if (!newCert.name) return;
    const updated = [...formData.certifications, { ...newCert, issue_year: parseInt(newCert.issue_year) || 2025 }];
    setFormData({ ...formData, certifications: updated });
    setNewCert({ name: '', issuer: '', issue_year: 2025, credential_url: '' });
  };

  const removeCertification = (idx) => {
    const updated = formData.certifications.filter((_, i) => i !== idx);
    setFormData({ ...formData, certifications: updated });
  };

  const addAchievement = () => {
    if (!newAchieve.title) return;
    const updated = [...formData.achievements, { ...newAchieve, year: parseInt(newAchieve.year) || 2026 }];
    setFormData({ ...formData, achievements: updated });
    setNewAchieve({ title: '', organization: '', year: 2026, description: '' });
  };

  const removeAchievement = (idx) => {
    const updated = formData.achievements.filter((_, i) => i !== idx);
    setFormData({ ...formData, achievements: updated });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{profile?.full_name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{profile?.email}</span>
              <Badge variant="success">
                <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Verified Student
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} variant="primary">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </Button>
      </div>

      {/* Main Profile Form */}
      <div className="grid-responsive grid-cols-3">
        {/* Left Column: Academic & Protected Credentials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Institutional Affiliation" subtitle="Institutional and tenancy records">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} /> Institution
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {profile?.institution_name || 'IIT Delhi'}
                </div>
              </div>

              <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={14} /> Department
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {profile?.department_name || 'Computer Science & Engineering'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: '#fffbeb',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fde68a',
                  fontSize: '0.75rem',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Lock size={16} />
                <span>Role & Institutional affiliation are protected by security RLS and cannot be edited.</span>
              </div>
            </div>
          </Card>

          <Card title="Academic Metrics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Program / Degree"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
              <div className="grid-responsive grid-cols-2" style={{ gap: '0.75rem' }}>
                <Input
                  label="Current Semester"
                  type="number"
                  value={formData.current_semester}
                  onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) || 1 })}
                />
                <Input
                  label="Cumulative CGPA"
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Center & Right Column: Personal Info, Projects, Certifications */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Personal Information">
            <div className="grid-responsive grid-cols-2" style={{ gap: '1rem' }}>
              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Current Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                label="Registered Email (Immutable)"
                value={profile?.email || ''}
                disabled
              />
            </div>
          </Card>

          {/* Projects Section */}
          <Card title="Projects & Engineering Portfolios" subtitle="Showcase verified work for recruiter evaluation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.projects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{proj.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{proj.description}</div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {proj.technologies?.map((tech, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeProject(idx)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Add Project inline form */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', marginBottom: '0.75rem' }}>Add New Project</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Input placeholder="Project Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                  <Input placeholder="Description & Impact" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                  <Input placeholder="Technologies (comma-separated e.g. React, Python, RLS)" value={newProject.technologies} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })} />
                  <Button type="button" variant="secondary" size="sm" onClick={addProject}>
                    <Plus size={14} /> Add Project
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Certifications & Achievements */}
          <div className="grid-responsive grid-cols-2" style={{ gap: '1.5rem' }}>
            <Card title="Certifications">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {formData.certifications.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.issuer} ({c.issue_year})</div>
                    </div>
                    <button onClick={() => removeCertification(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Certificate Name"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    style={{ flex: 1, padding: '0.4rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Issuer"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    style={{ width: '90px', padding: '0.4rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addCertification}>
                    <Plus size={12} />
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Achievements & Honors">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {formData.achievements.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.organization} ({a.year})</div>
                    </div>
                    <button onClick={() => removeAchievement(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Achievement Title"
                    value={newAchieve.title}
                    onChange={(e) => setNewAchieve({ ...newAchieve, title: e.target.value })}
                    style={{ flex: 1, padding: '0.4rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Org"
                    value={newAchieve.organization}
                    onChange={(e) => setNewAchieve({ ...newAchieve, organization: e.target.value })}
                    style={{ width: '90px', padding: '0.4rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addAchievement}>
                    <Plus size={12} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

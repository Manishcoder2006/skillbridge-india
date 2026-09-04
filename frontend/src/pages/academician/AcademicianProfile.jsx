import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  RolePageHeader,
  LoadingState,
  ErrorState,
} from '../../components/portal';
import {
  ShieldCheck,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Award,
  Phone,
  User,
} from 'lucide-react';

export const AcademicianProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    designation: '',
    specialization: '',
    qualifications: '',
    experience_years: 0,
    research_interests: [],
    research_interests_input: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await apiService.getAcademicianProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        designation: data.designation || '',
        specialization: data.specialization || '',
        qualifications: data.qualifications || '',
        experience_years: data.experience_years || 0,
        research_interests: data.research_interests || [],
        research_interests_input: (data.research_interests || []).join(', '),
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setErrorMessage('Failed to load academician profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const interestsArray = formData.research_interests_input
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        designation: formData.designation,
        specialization: formData.specialization,
        qualifications: formData.qualifications,
        experience_years: parseInt(formData.experience_years, 10) || 0,
        research_interests: interestsArray,
      };

      const updated = await apiService.updateAcademicianProfile(payload);
      setProfile(updated);
      setSuccessMessage('Faculty credentials updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage('Failed to save profile changes. Please verify all inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading faculty credentials and institutional affiliations..." />;
  }

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Faculty Profile & Credentials"
        subtitle="Institutional Academic Roster"
        badge={<Badge role="academician" />}
        description="Maintain your institutional academic credentials, research specializations, and departmental contact points."
      />

      {/* Success / Error Alerts */}
      {successMessage && (
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
          <CheckCircle2 size={18} color="#059669" /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <ErrorState
          title="Update Failed"
          message={errorMessage}
          onRetry={fetchProfile}
        />
      )}

      {/* 2. Institutional Tenancy Badge Card (Read-only Scoped Context) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="#0d9488" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Verified Institutional Affiliation (Multi-Tenant Scoped)
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.875rem',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block' }}>
              Institution
            </span>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
              <Building2 size={15} color="#0d9488" /> {profile?.institution_name || 'Academic Institution'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block' }}>
              Department
            </span>
            <strong style={{ fontSize: '0.875rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
              <Layers size={15} color="#2563eb" /> {profile?.department_name || 'Computer Science & Engineering'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block' }}>
              Platform Role
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <Badge role="academician" />
              <Lock size={12} color="#94a3b8" title="Secured system attribute" />
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block' }}>
              Identity Verification
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <Badge status={profile?.verification_status || 'verified'} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Profile Information Form */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
            Academic & Contact Details
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                style={{ minHeight: '42px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                style={{ minHeight: '42px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Designation / Title
              </label>
              <input
                type="text"
                name="designation"
                className="form-control"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g. Professor & Faculty Advisor"
                style={{ minHeight: '42px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Specialization Domain
              </label>
              <input
                type="text"
                name="specialization"
                className="form-control"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g. Distributed Systems & Cloud Architecture"
                style={{ minHeight: '42px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Highest Academic Qualification
              </label>
              <input
                type="text"
                name="qualifications"
                className="form-control"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g. Ph.D. in Computer Science"
                style={{ minHeight: '42px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience_years"
                className="form-control"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                max="60"
                style={{ minHeight: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Research Interests & Mentorship Areas <span style={{ fontWeight: 400, color: '#64748b' }}>(comma-separated)</span>
            </label>
            <input
              type="text"
              name="research_interests_input"
              className="form-control"
              value={formData.research_interests_input}
              onChange={handleInputChange}
              placeholder="e.g. Cloud Security, Micro-learning, Distributed Databases, AI Orchestration"
              style={{ minHeight: '42px' }}
            />
          </div>

          {/* Tag preview */}
          {formData.research_interests_input && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {formData.research_interests_input
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      background: '#f0fdf9',
                      color: '#0d9488',
                      border: '1px solid #ccfbf1',
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '44px',
                padding: '0 1.5rem',
                fontWeight: 700,
              }}
            >
              {saving ? <Spinner size="sm" /> : <Save size={16} />}
              {saving ? 'Saving Credentials...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

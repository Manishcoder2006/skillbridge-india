import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Save,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Edit2,
  UserCheck,
} from 'lucide-react';
import {
  RolePageHeader,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [newTech, setNewTech] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCompanyProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        industry_type: data.industry_type || '',
        description: data.description || '',
        website: data.website || '',
        company_size: data.company_size || '1000-5000',
        founded_year: data.founded_year || 2000,
        headquarters_city: data.headquarters_city || '',
        headquarters_state: data.headquarters_state || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        tech_stack: data.tech_stack || [],
      });
    } catch (err) {
      console.error('Failed to load company profile:', err);
      setError('Unable to retrieve company profile. Please verify your recruiter credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()],
      }));
      setNewTech('');
    }
  };

  const handleRemoveTech = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await apiService.updateCompanyProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Corporate profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update company profile:', err);
      setError(err.response?.data?.detail || 'Failed to update company profile. Please check required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading corporate credentials and profile..." />;
  }

  if (error && !profile) {
    return (
      <div className="portal-page">
        <ErrorState
          title="Profile Load Failure"
          message={error}
          onRetry={() => fetchProfile()}
        />
      </div>
    );
  }

  const isVerified = profile?.verification_status === 'verified';

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title={profile?.name || 'Company Profile'}
        subtitle={`Corporate Code: ${profile?.code || 'CORP'} • ${profile?.industry_type || 'Technology'}`}
        description="Official corporate registration details, recruiter contact credentials, and verified technology stack."
        badge={
          profile?.code ? (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                background: '#f0fdfa',
                color: '#0d9488',
                border: '1px solid #ccfbf1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              <Building2 size={12} />
              {profile.code} &bull; {profile.company_type || 'Corporate Partner'}
            </span>
          ) : null
        }
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {!isEditing ? (
              <button
                className="portal-btn primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={15} />
                Edit Profile
              </button>
            ) : (
              <button
                className="portal-btn secondary"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                disabled={saving}
              >
                Cancel
              </button>
            )}
            {profile?.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="portal-btn secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Website</span>
                <ExternalLink size={14} />
              </a>
            )}
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

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main Profile Content / Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Corporate Identity & Overview */}
          <div className="portal-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#0d9488" />
              Corporate Identity & Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="portal-form-group">
                <label className="portal-form-label">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  className="portal-form-input"
                  value={isEditing ? formData.name : profile?.name || ''}
                  onChange={handleChange}
                  required
                  disabled={!isEditing || saving}
                />
              </div>

              <div className="portal-form-group">
                <label className="portal-form-label">Industry / Sector *</label>
                <input
                  type="text"
                  name="industry_type"
                  className="portal-form-input"
                  value={isEditing ? formData.industry_type : profile?.industry_type || ''}
                  onChange={handleChange}
                  required
                  disabled={!isEditing || saving}
                />
              </div>

              <div className="portal-form-group">
                <label className="portal-form-label">Company Size</label>
                <select
                  name="company_size"
                  className="portal-form-input"
                  value={isEditing ? formData.company_size : profile?.company_size || ''}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                >
                  <option value="1-50">1-50 employees (Seed)</option>
                  <option value="51-200">51-200 employees (Startup)</option>
                  <option value="201-1000">201-1000 employees (Mid-Market)</option>
                  <option value="1000-5000">1000-5000 employees (Enterprise)</option>
                  <option value="5000+">5000+ employees (Global Enterprise)</option>
                </select>
              </div>

              <div className="portal-form-group">
                <label className="portal-form-label">Founded Year</label>
                <input
                  type="number"
                  name="founded_year"
                  className="portal-form-input"
                  value={isEditing ? formData.founded_year : profile?.founded_year || ''}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                />
              </div>

              <div className="portal-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="portal-form-label">Company Description</label>
                <textarea
                  name="description"
                  className="portal-form-input portal-form-textarea"
                  rows={3}
                  value={isEditing ? formData.description : profile?.description || ''}
                  onChange={handleChange}
                  placeholder="Overview of business domain, technology focus, and hiring philosophy..."
                  disabled={!isEditing || saving}
                />
              </div>
            </div>
          </div>

          {/* Headquarters & Talent Acquisition Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Location & Web Presence */}
            <div className="portal-card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#0d9488" />
                Headquarters & Web Presence
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="portal-form-group">
                  <label className="portal-form-label">Headquarters City *</label>
                  <input
                    type="text"
                    name="headquarters_city"
                    className="portal-form-input"
                    value={isEditing ? formData.headquarters_city : profile?.headquarters_city || ''}
                    onChange={handleChange}
                    required
                    disabled={!isEditing || saving}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Headquarters State *</label>
                  <input
                    type="text"
                    name="headquarters_state"
                    className="portal-form-input"
                    value={isEditing ? formData.headquarters_state : profile?.headquarters_state || ''}
                    onChange={handleChange}
                    required
                    disabled={!isEditing || saving}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Official Website</label>
                  <input
                    type="url"
                    name="website"
                    className="portal-form-input"
                    value={isEditing ? formData.website : profile?.website || ''}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    disabled={!isEditing || saving}
                  />
                </div>
              </div>
            </div>

            {/* Talent Acquisition Contact Credentials */}
            <div className="portal-card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="#0d9488" />
                Talent Acquisition Contact
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="portal-form-group">
                  <label className="portal-form-label">Contact Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    className="portal-form-input"
                    value={isEditing ? formData.contact_email : profile?.contact_email || ''}
                    onChange={handleChange}
                    required
                    disabled={!isEditing || saving}
                  />
                </div>

                <div className="portal-form-group">
                  <label className="portal-form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    className="portal-form-input"
                    value={isEditing ? formData.contact_phone : profile?.contact_phone || ''}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    disabled={!isEditing || saving}
                  />
                </div>

                {profile?.hr_representative && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      Designated Recruiter: {profile.hr_representative.full_name}
                    </div>
                    <div style={{ color: '#64748b' }}>
                      Designation: {profile.hr_representative.designation || 'HR Representative'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technology Stack Tags */}
          <div className="portal-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#0d9488" />
              Core Technology Stack
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Key technologies, programming languages, and platforms utilized across engineering teams.
            </p>

            <div className="portal-tag-group" style={{ marginBottom: isEditing ? '1rem' : 0 }}>
              {(isEditing ? formData.tech_stack : profile?.tech_stack || []).map((tech) => (
                <span key={tech} className="portal-tag preferred">
                  <span>{tech}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        color: '#64748b',
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
              {(isEditing ? formData.tech_stack : profile?.tech_stack || []).length === 0 && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No technology stack tags specified.</span>
              )}
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 400 }}>
                <input
                  type="text"
                  className="portal-form-input"
                  placeholder="Add skill or technology (e.g. Kubernetes, React)..."
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="portal-btn secondary"
                  onClick={handleAddTech}
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Form Action Footer */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="portal-btn secondary"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="portal-btn primary"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

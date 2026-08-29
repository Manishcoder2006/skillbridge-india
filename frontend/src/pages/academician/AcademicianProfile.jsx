import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  User,
  ShieldCheck,
  Building2,
  BookOpen,
  Award,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
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
      setErrorMessage('Failed to load academician profile.');
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
      setSuccessMessage('Faculty profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            Faculty Identity & Credentials
          </Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            PS 26044 Multi-Tenant Verified
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          Faculty Profile & Academic Credentials
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Maintain your institutional academic information, research domains, and contact credentials.
        </p>
      </div>

      {successMessage && (
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
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} /> {errorMessage}
        </div>
      )}

      {/* Institutional Security Badge Card (Protected Fields) */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(99, 102, 241, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
            Verified Institutional Tenancy & Role Security
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Assigned Institution</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Building2 size={14} color="#3b82f6" /> {profile?.institution_name || 'IIT Delhi'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Department Scoping</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Layers size={14} color="#8b5cf6" /> {profile?.department_name || 'Computer Science & Engineering'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Platform Role</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Badge variant="success" style={{ textTransform: 'capitalize' }}>
                {profile?.role || 'Academician'}
              </Badge>
              <Lock size={12} color="var(--color-text-muted)" title="Protected field" />
            </div>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Institutional Verification</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Badge variant="primary">Verified Faculty</Badge>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0.85rem 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Lock size={13} /> Institution ID, Department ID, and Verification Status are strictly secured by backend RLS triggers.
        </p>
      </Card>

      {/* Profile Edit Form */}
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Designation</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="e.g. Professor & Head of Department"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Specialization Domain</label>
              <input
                type="text"
                name="specialization"
                className="form-control"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g. Distributed Systems & Cloud Architecture"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Qualifications</label>
              <input
                type="text"
                name="qualifications"
                className="form-control"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g. Ph.D. in Computer Science (IIT Delhi)"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Teaching / Research Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                className="form-control"
                value={formData.experience_years}
                onChange={handleInputChange}
                min="0"
                max="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Research Interests & Focus Areas <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(comma-separated)</span>
            </label>
            <input
              type="text"
              name="research_interests_input"
              className="form-control"
              value={formData.research_interests_input}
              onChange={handleInputChange}
              placeholder="e.g. Multi-Tenant Cloud Security, Distributed Systems, Verifiable AI Workflows"
            />
          </div>

          {/* Research Tag Preview */}
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
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#6366f1',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      fontWeight: 500,
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', fontWeight: 600 }}
            >
              {saving ? <Spinner size="sm" /> : <Save size={16} />}
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Building, Briefcase, GraduationCap, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiService } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    institution_id: '',
    department_id: '',
    company_name: '',
    phone: '',
  });

  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load safe public institutions list on mount
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const data = await apiService.getPublicInstitutions();
        setInstitutions(data);
        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            institution_id: data[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    loadInstitutions();
  }, []);

  // Update departments whenever institution changes
  useEffect(() => {
    if (formData.institution_id && institutions.length > 0) {
      const selectedInst = institutions.find((i) => String(i.id) === String(formData.institution_id));
      if (selectedInst && selectedInst.departments) {
        setDepartments(selectedInst.departments);
        if (selectedInst.departments.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: selectedInst.departments[0].id }));
        } else {
          setFormData((prev) => ({ ...prev, department_id: '' }));
        }
      }
    }
  }, [formData.institution_id, institutions]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email || !formData.password) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    if (['student', 'academician'].includes(formData.role) && !formData.institution_id) {
      showToast('Please select your institution.', 'error');
      return;
    }

    if (formData.role === 'industry_hr' && !formData.company_name) {
      showToast('Please specify your company name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register(formData);
      showToast('Account registered successfully! Welcome to SkillBridge India.', 'success');
      navigate(`/dashboard/${formData.role === 'industry_hr' ? 'industry' : formData.role}`);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-teal))',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              SB
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>SkillBridge India</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create your stakeholder account (Phase 1 Onboarding)
          </p>
        </div>

        <Card title="Stakeholder Registration">
          <form onSubmit={handleSubmit}>
            {/* Role Selection Tabs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Select Your Role <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'student')}
                  className={`btn btn-sm ${formData.role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '0.25rem' }}
                >
                  <GraduationCap size={18} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('role', 'academician')}
                  className={`btn btn-sm ${formData.role === 'academician' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '0.25rem' }}
                >
                  <Building size={18} />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('role', 'industry_hr')}
                  className={`btn btn-sm ${formData.role === 'industry_hr' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0.5rem', gap: '0.25rem' }}
                >
                  <Briefcase size={18} />
                  <span>Industry HR</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                <ShieldAlert size={12} color="var(--accent-amber)" />
                <span>Institution Admin & Super Admin accounts require verified administrative invitation.</span>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Rohan Gupta"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              required
            />

            <Input
              label="Official / Academic Email"
              type="email"
              placeholder={formData.role === 'industry_hr' ? 'name@company.com' : 'student@institute.ac.in'}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />

            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />

            {/* Academic Tenancy Fields */}
            {['student', 'academician'].includes(formData.role) && (
              <>
                <Select
                  label="Registered Institution"
                  value={formData.institution_id}
                  onChange={(e) => handleChange('institution_id', e.target.value)}
                  options={institutions.map((inst) => ({
                    value: inst.id,
                    label: `${inst.name} (${inst.code})`,
                  }))}
                  required
                />

                {departments.length > 0 && (
                  <Select
                    label="Department"
                    value={formData.department_id}
                    onChange={(e) => handleChange('department_id', e.target.value)}
                    options={departments.map((dept) => ({
                      value: dept.id,
                      label: `${dept.name} (${dept.code})`,
                    }))}
                    required
                  />
                )}
              </>
            )}

            {/* Industry Tenancy Field */}
            {formData.role === 'industry_hr' && (
              <Input
                label="Company / Corporate Organization Name"
                type="text"
                placeholder="e.g. Tata Consultancy Services"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              className="btn-block"
              isLoading={isSubmitting}
              icon={UserPlus}
              style={{ marginTop: '1rem' }}
            >
              Complete Registration
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent-teal-dark)' }}>
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

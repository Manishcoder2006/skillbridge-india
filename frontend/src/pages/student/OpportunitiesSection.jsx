import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Spinner } from '../../components/common/Spinner';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Send,
  Search,
  Filter,
  X,
  FileText,
} from 'lucide-react';

export const OpportunitiesSection = () => {
  const { showSuccess, showError } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [workModeFilter, setWorkModeFilter] = useState('all');

  // Detail / Application Modal
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOpportunities();
      setOpportunities(data);
    } catch (err) {
      showError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      setApplying(true);
      await apiService.applyForOpportunity(selectedOpp.id, applyNotes);
      showSuccess(`Application submitted to ${selectedOpp.company_name}!`);
      // Update local state to show applied
      setOpportunities(
        opportunities.map((o) => (o.id === selectedOpp.id ? { ...o, is_applied: true } : o))
      );
      setSelectedOpp({ ...selectedOpp, is_applied: true });
      setApplyNotes('');
    } catch (err) {
      showError('Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.required_skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || opp.type === typeFilter;
    const matchesMode = workModeFilter === 'all' || opp.work_mode === workModeFilter;
    return matchesSearch && matchesType && matchesMode;
  });

  if (loading && opportunities.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Internships & Job Opportunities</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Discover verified engineering internships and graduate placement openings directly mapped to your validated skill sets.
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '240px' }}>
            <Input
              placeholder="Search by title, company, or required skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types (Job & Intern)' },
                { value: 'internship', label: 'Internships Only' },
                { value: 'job', label: 'Full-Time Jobs' },
              ]}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Work Modes' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'on_site', label: 'On-Site' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Opportunity Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matching opportunities found with the selected criteria.
          </div>
        ) : (
          filtered.map((opp) => (
            <Card key={opp.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Badge variant={opp.type === 'internship' ? 'primary' : 'success'}>
                      {opp.type.toUpperCase()}
                    </Badge>
                    <Badge variant="neutral" style={{ textTransform: 'capitalize' }}>
                      {opp.work_mode}
                    </Badge>
                    <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700 }}>
                      {opp.stipend_or_salary}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{opp.title}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#0f766e' }}>
                      <Building2 size={14} color="#0d9488" /> {opp.company_name}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} color="#64748b" /> {opp.location}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#b91c1c', fontWeight: 600 }}>
                      <Calendar size={14} /> Deadline: {opp.application_deadline}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Required Skills:</span>
                    {opp.required_skills?.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, border: '1px solid #e2e8f0' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  {opp.is_applied ? (
                    <Badge variant="success">
                      <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Applied
                    </Badge>
                  ) : (
                    <Button onClick={() => setSelectedOpp(opp)} variant="primary">
                      View & Apply
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Opportunity Detail & Application Modal */}
      {selectedOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Badge variant={selectedOpp.type === 'internship' ? 'primary' : 'success'}>
                  {selectedOpp.type.toUpperCase()}
                </Badge>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {selectedOpp.title}
                </h2>
                <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.95rem' }}>
                  {selectedOpp.company_name}
                </div>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Eligibility & Criteria</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {selectedOpp.eligibility}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Role Description & Scope
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedOpp.description}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Required Verified Skills
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {selectedOpp.required_skills?.map((s, i) => (
                  <Badge key={i} variant="primary">{s}</Badge>
                ))}
              </div>
            </div>

            {selectedOpp.is_applied ? (
              <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#166534', fontWeight: 700 }}>
                ✓ You have already applied for this opening. Track status in Applications.
              </div>
            ) : (
              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <Input
                  label="Application Cover Note (Optional)"
                  placeholder="Mention your key project highlights or relevant coursework..."
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <Button type="button" variant="secondary" onClick={() => setSelectedOpp(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={applying} variant="success">
                    <Send size={16} /> {applying ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

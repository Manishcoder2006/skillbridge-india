import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  Briefcase,
  Share2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  CheckCircle2,
  Sparkles,
  X,
  Send,
  Info,
} from 'lucide-react';

export const AcademicianOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendingOpp, setRecommendingOpp] = useState(null);
  const [recommendMessage, setRecommendMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFacultyOpportunities();
      setOpportunities(data);
    } catch (err) {
      console.error('Failed to load faculty opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecommend = (opp) => {
    setRecommendingOpp(opp);
    setRecommendMessage(
      opp.recommendation_message ||
        `Strongly recommended for 3rd & 4th year CSE students specializing in ${opp.required_skills?.slice(0, 2).join(', ')}.`
    );
  };

  const handleSendRecommendation = async (e) => {
    e.preventDefault();
    if (!recommendingOpp) return;

    setSubmitting(true);
    try {
      await apiService.recommendOpportunity(recommendingOpp.id, recommendMessage);
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === recommendingOpp.id
            ? { ...o, is_recommended: true, recommendation_message: recommendMessage }
            : o
        )
      );
      setSuccessToast(`Successfully recommended "${recommendingOpp.title}" to your student cohort!`);
      setRecommendingOpp(null);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to recommend opportunity:', err);
      alert('Failed to send recommendation.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOpps = opportunities.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.title?.toLowerCase().includes(q) ||
      o.company_name?.toLowerCase().includes(q) ||
      o.required_skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            Industry Placement Mapping
          </Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Faculty Recommendation Portal
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          Industry Job & Internship Opportunities
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Discover verified opportunities from corporate partners and share tailored recommendations with your student cohort.
        </p>
      </div>

      {/* Role Notice Alert */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(37, 99, 235, 0.06)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <Info size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          <strong>Academic Mentorship Notice:</strong> Faculty members guide and recommend verified industry opportunities. Recruiting and selection are managed directly between industry partners and student applicants.
        </span>
      </div>

      {successToast && (
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
          <CheckCircle2 size={18} /> {successToast}
        </div>
      )}

      {/* Search Filter */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by role title, hiring company, or required skill tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Opportunities Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
        </div>
      ) : filteredOpps.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Briefcase size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>No Opportunities Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No corporate opportunities matched your search.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {filteredOpps.map((opp) => (
            <Card
              key={opp.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: opp.is_recommended ? '4px solid #10b981' : '4px solid #3b82f6',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={13} color="var(--color-primary)" /> {opp.company_name}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.3rem 0 0' }}>
                      {opp.title}
                    </h3>
                  </div>
                  <Badge variant={opp.type === 'internship' ? 'primary' : 'success'} style={{ textTransform: 'capitalize' }}>
                    {opp.type}
                  </Badge>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: '0.75rem 0' }}>
                  {opp.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--color-text-muted)" /> {opp.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} color="var(--color-text-muted)" /> {opp.stipend_or_salary}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--color-text-muted)" /> Deadline: {opp.application_deadline}
                  </div>
                </div>

                {/* Skills */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {opp.required_skills?.map((sk, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#6366f1',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Endorsement badge if already recommended */}
                {opp.is_recommended && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.78rem',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={14} /> Recommended to Department Cohort
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  className={`btn ${opp.is_recommended ? 'btn-outline' : 'btn-primary'}`}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  onClick={() => handleOpenRecommend(opp)}
                >
                  <Share2 size={15} /> {opp.is_recommended ? 'Edit Recommendation Note' : 'Recommend to Student Cohort'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendation Note Modal */}
      {recommendingOpp && (
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
              maxWidth: '560px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  Recommend Opportunity
                </h3>
              </div>
              <button
                onClick={() => setRecommendingOpp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendRecommendation} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Target Opportunity</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>
                  {recommendingOpp.title} ({recommendingOpp.company_name})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Faculty Endorsement / Guidance Note for Students
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  required
                  value={recommendMessage}
                  onChange={(e) => setRecommendMessage(e.target.value)}
                  placeholder="e.g. Excellent opportunity for students with strong Python & React foundation..."
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button type="button" className="btn btn-outline" onClick={() => setRecommendingOpp(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  {submitting ? <Spinner size="sm" /> : <Send size={16} />}
                  {submitting ? 'Broadcasting...' : 'Broadcast Recommendation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

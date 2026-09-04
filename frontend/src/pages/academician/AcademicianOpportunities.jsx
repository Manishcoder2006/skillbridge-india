import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  RolePageHeader,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';
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
  const [error, setError] = useState(null);
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
      setError(null);
      const data = await apiService.getFacultyOpportunities();
      setOpportunities(data || []);
    } catch (err) {
      console.error('Failed to load faculty opportunities:', err);
      setError('Unable to load industry vacancies. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecommend = (opp) => {
    setRecommendingOpp(opp);
    setRecommendMessage(
      opp.recommendation_message ||
        `Strongly recommended for department students with coursework in ${opp.required_skills?.slice(0, 2).join(', ') || 'software engineering'}.`
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
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Industry Placement & Internship Mapping"
        subtitle="Cohort Opportunity Discovery"
        badge={<Badge role="academician" />}
        description="Discover active corporate vacancies matching your department's curriculum, and endorse opportunities directly to your student cohort with tailored faculty notes."
      />

      {/* Success Notification */}
      {successToast && (
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
          <CheckCircle2 size={18} color="#059669" /> {successToast}
        </div>
      )}

      {/* 2. Search Bar */}
      <div className="portal-filter-bar">
        <div className="portal-search-box">
          <Search size={16} className="portal-search-icon" />
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search by job title, hiring partner, or required skill tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', minHeight: '40px' }}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* 3. Opportunity Cards */}
      {loading ? (
        <LoadingState message="Fetching active corporate hiring opportunities..." />
      ) : error ? (
        <ErrorState title="Error Loading Opportunities" message={error} onRetry={fetchOpportunities} />
      ) : filteredOpps.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Opportunities Found"
          description={
            opportunities.length === 0
              ? 'No corporate openings are currently posted for your department. Check back soon or liaise via Industry Collaboration.'
              : 'No opportunities matched your search criteria.'
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: opp.is_recommended ? '4px solid #0d9488' : '4px solid #3b82f6',
                borderRadius: '12px',
                padding: '1.35rem',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={14} /> {opp.company_name}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0.3rem 0 0' }}>
                      {opp.title}
                    </h3>
                  </div>
                  <Badge variant={opp.type === 'internship' ? 'primary' : 'success'}>
                    {opp.type === 'internship' ? 'Internship' : 'Full-time'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={13} color="#94a3b8" /> {opp.location} ({opp.work_mode || 'hybrid'})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#0f172a' }}>
                    <DollarSign size={13} color="#059669" /> {opp.stipend_or_salary}
                  </span>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.45, margin: '0.75rem 0' }}>
                  {opp.description}
                </p>

                {/* Skill Chips */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {opp.required_skills?.map((sk, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                        fontWeight: 600,
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Recommendation Status Banner */}
                {opp.is_recommended && (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: '#f0fdf9',
                      border: '1px solid #ccfbf1',
                      fontSize: '0.78rem',
                      color: '#0f766e',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={15} color="#0d9488" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <div>
                      <strong>Endorsed by Faculty</strong>
                      <div style={{ fontSize: '0.74rem', color: '#0d9488', marginTop: '0.1rem' }}>
                        "{opp.recommendation_message || 'Recommended for department cohort'}"
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className={opp.is_recommended ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                  onClick={() => handleOpenRecommend(opp)}
                >
                  <Share2 size={15} />
                  {opp.is_recommended ? 'Edit Endorsement' : 'Endorse to Cohort'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Recommendation Modal */}
      {recommendingOpp && (
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
            if (e.target === e.currentTarget) setRecommendingOpp(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.15rem 1.35rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={18} color="#0d9488" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Endorse Opportunity to Cohort
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRecommendingOpp(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendRecommendation} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{recommendingOpp.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{recommendingOpp.company_name} • {recommendingOpp.location}</div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Faculty Endorsement & Guidance Note
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={recommendMessage}
                  onChange={(e) => setRecommendMessage(e.target.value)}
                  placeholder="Explain why this opportunity is aligned with your department's curriculum and target semesters..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRecommendingOpp(null)}
                  style={{ minHeight: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minHeight: '42px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  {submitting ? <Spinner size="sm" /> : <Send size={15} />}
                  {submitting ? 'Broadcasting...' : 'Broadcast Endorsement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

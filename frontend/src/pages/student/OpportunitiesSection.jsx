import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/common/Spinner';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Send,
  Search,
  Filter,
  X,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const OpportunitiesSection = () => {
  const { showSuccess, showError } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [workModeFilter, setWorkModeFilter] = useState('all');

  // Bookmarks State
  const [bookmarkedOpps, setBookmarkedOpps] = useState({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail / Application Modal State
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

  const toggleBookmark = (e, oppId) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedOpps((prev) => ({
      ...prev,
      [oppId]: !prev[oppId],
    }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      setApplying(true);
      await apiService.applyForOpportunity(selectedOpp.id, applyNotes);
      showSuccess(`Application submitted to ${selectedOpp.company_name}!`);
      // Update local state to reflect applied status
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

  // Calculate Paginated slice
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOpps = filtered.slice(startIndex, startIndex + pageSize);

  // Helper for company logo rendering
  const renderCompanyLogo = (opp) => {
    const name = (opp.company_name || '').toLowerCase();
    if (name.includes('tata') || opp.brand === 'tcs') {
      return (
        <div className="opp-logo-container" style={{ backgroundColor: '#1d4ed8' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>
            TATA
          </span>
        </div>
      );
    }
    if (name.includes('infosys') || opp.brand === 'infosys') {
      return (
        <div className="opp-logo-container" style={{ backgroundColor: '#0284c7' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', fontStyle: 'italic' }}>
            Infosys
          </span>
        </div>
      );
    }
    if (name.includes('larsen') || name.includes('toubro') || opp.brand === 'lt') {
      return (
        <div className="opp-logo-container" style={{ backgroundColor: '#0f172a' }}>
          <div style={{ textAlign: 'center', lineHeight: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffffff', display: 'block' }}>L&T</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>GLOBAL</span>
          </div>
        </div>
      );
    }
    return (
      <div className="opp-logo-container" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
        <Briefcase size={24} color="#ffffff" />
      </div>
    );
  };

  if (loading && opportunities.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="opp-page-container">
      {/* Background Decorative Technical Dot Grid */}
      <div className="dot-grid-watermark" aria-hidden="true" />

      {/* Page Header */}
      <div className="opp-page-header">
        <span className="opp-eyebrow">OPPORTUNITIES</span>
        <h1 className="opp-page-title">Internships & Job Opportunities</h1>
        <p className="opp-page-subtitle">
          Discover verified engineering internships and graduate placement openings directly mapped to your validated skill sets.
        </p>
        <div className="opp-teal-line" />
      </div>

      {/* Horizontal Search & Filter Control Toolbar */}
      <div className="opp-filter-toolbar">
        <div className="opp-search-box">
          <Search size={16} className="opp-search-icon" />
          <input
            type="text"
            className="opp-search-input"
            placeholder="Search by title, company, or required skill..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="opp-select-box">
          <select
            className="opp-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types (Job & Intern)</option>
            <option value="internship">Internships Only</option>
            <option value="job">Full-Time Jobs</option>
          </select>
        </div>

        <div className="opp-select-box">
          <select
            className="opp-select"
            value={workModeFilter}
            onChange={(e) => {
              setWorkModeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on_site">On-Site</option>
          </select>
        </div>

        <button type="button" className="opp-filter-toggle-btn">
          <SlidersHorizontal size={15} />
          <span>Filters</span>
        </button>
      </div>

      {/* Opportunities Listing Cards */}
      <div className="opp-cards-list">
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e8edf5',
              color: '#64748b',
            }}
          >
            <p style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a' }}>No matching opportunities found.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Try adjusting your search criteria or resetting filters to view all openings.
            </p>
          </div>
        ) : (
          paginatedOpps.map((opp) => {
            const isBookmarked = Boolean(bookmarkedOpps[opp.id]);
            const isIntern = opp.type === 'internship';

            return (
              <div key={opp.id} className="opp-listing-card">
                {/* Company Logo Monogram */}
                {renderCompanyLogo(opp)}

                {/* Main Content Area */}
                <div className="opp-main-content">
                  {/* Top Metadata Row */}
                  <div className="opp-top-meta-row">
                    <div className="opp-badges-group">
                      <span className={`opp-badge-type ${isIntern ? 'internship' : 'job'}`}>
                        {opp.type}
                      </span>
                      <span className="opp-badge-mode">{opp.work_mode || 'Hybrid'}</span>
                      <span className="opp-salary-tag">{opp.stipend_or_salary}</span>
                    </div>

                    <div className="opp-right-actions">
                      {opp.is_applied ? (
                        <span className="opp-applied-pill">
                          <CheckCircle2 size={15} /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="opp-apply-btn"
                          onClick={() => setSelectedOpp(opp)}
                        >
                          View & Apply
                        </button>
                      )}

                      <button
                        type="button"
                        className={`opp-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={(e) => toggleBookmark(e, opp.id)}
                        aria-label="Bookmark opportunity"
                        title={isBookmarked ? 'Saved' : 'Bookmark opportunity'}
                      >
                        <Bookmark size={18} fill={isBookmarked ? '#d97706' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Role Title */}
                  <h2 className="opp-job-title">{opp.title}</h2>

                  {/* Company, Location & Deadline */}
                  <div className="opp-metadata-line">
                    <span className="opp-company-label">
                      <Building2 size={15} color="#0d9488" /> {opp.company_name}
                    </span>
                    <span>&bull;</span>
                    <span className="opp-location-label">
                      <MapPin size={15} /> {opp.location}
                    </span>
                    <span>&bull;</span>
                    <span className="opp-deadline-label">
                      <Calendar size={15} /> Deadline: {opp.application_deadline || '2026-10-31'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="opp-description">{opp.description}</p>

                  {/* Required Skills Badges */}
                  <div className="opp-skills-row">
                    <span className="opp-skills-label">Required Skills:</span>
                    {opp.required_skills?.map((skill, sIdx) => (
                      <span key={sIdx} className="opp-skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {filtered.length > 0 && (
        <div className="opp-pagination-bar">
          <div>
            Showing {Math.min(startIndex + 1, totalItems)} to{' '}
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems} opportunities
          </div>

          <div className="opp-pagination-numbers">
            <button
              type="button"
              className="opp-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {[1, 2, 3, 4, 5].slice(0, totalPages).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`opp-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            {totalPages > 5 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}

            <button
              type="button"
              className="opp-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div>
            <select
              className="opp-page-size-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Opportunity Detail & Application Modal */}
      {selectedOpp && (
        <div className="opp-modal-overlay">
          <div className="opp-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  className={`opp-badge-type ${
                    selectedOpp.type === 'internship' ? 'internship' : 'job'
                  }`}
                >
                  {selectedOpp.type}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  {selectedOpp.title}
                </h2>
                <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {selectedOpp.company_name} &bull; {selectedOpp.location}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                aria-label="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Eligibility & Criteria
              </div>
              <div style={{ color: '#0f172a', fontSize: '0.875rem', marginTop: '0.35rem', lineHeight: 1.45 }}>
                {selectedOpp.eligibility || 'Open to all verified enrolled students with prerequisite skills.'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Role Description & Scope
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedOpp.description}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Required Verified Skills
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selectedOpp.required_skills?.map((s, i) => (
                  <span key={i} className="opp-skill-pill">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {selectedOpp.is_applied ? (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  textAlign: 'center',
                  color: '#166534',
                  fontWeight: 700,
                }}
              >
                ✓ You have already applied for this opening. Track your application status in the Applications Tracker.
              </div>
            ) : (
              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label
                    htmlFor="apply-notes-input"
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Application Cover Note (Optional)
                  </label>
                  <textarea
                    id="apply-notes-input"
                    rows={3}
                    placeholder="Highlight your relevant verified skills, portfolio projects, or academic achievements..."
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedOpp(null)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    style={{
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      cursor: applying ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Send size={16} /> {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

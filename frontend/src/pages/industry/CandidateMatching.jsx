import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Brain,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  RolePageHeader,
  RoleStatCard,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/portal';

export const CandidateMatching = () => {
  const [postings, setPostings] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [tierFilter, setTierFilter] = useState('all'); // all, High Match, Moderate Match, Low Match
  const [modelMode, setModelMode] = useState('hybrid'); // 'hybrid', 'gemini', 'grok'

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const opps = await apiService.getCompanyPostings();
      setPostings(opps || []);
      if (opps && opps.length > 0) {
        const firstOppId = opps[0].id;
        setSelectedOppId(firstOppId);
        await runMatching(firstOppId, 'hybrid');
      }
    } catch (err) {
      console.error('Failed to load initial matching data:', err);
      setError('Unable to load recruitment opportunities for matching.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const runMatching = async (oppId, mode = modelMode) => {
    if (!oppId) return;
    try {
      setEvaluating(true);
      setError(null);
      // Try AI multi-model match first, falling back to rule-based matching if needed
      try {
        const res = await apiService.getAICandidateMatchMultiModel(oppId, mode);
        setMatchData(res);
      } catch (aiErr) {
        console.warn('AI multi-model matching failed, falling back to rule-based matching:', aiErr);
        const ruleRes = await apiService.getAICandidateMatches(oppId);
        setMatchData(ruleRes);
      }
    } catch (err) {
      console.error('Failed to run candidate matching evaluation:', err);
      setError('Failed to evaluate candidate compatibility. Please ensure candidate profiles exist in the system.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSelectOpportunity = async (e) => {
    const oppId = e.target.value;
    setSelectedOppId(oppId);
    await runMatching(oppId, modelMode);
  };

  const handleModelChange = async (mode) => {
    setModelMode(mode);
    if (selectedOppId) {
      await runMatching(selectedOppId, mode);
    }
  };

  const candidatesList = matchData?.ranked_candidates || matchData?.matched_candidates || [];

  const filteredCandidates = candidatesList.filter((cand) => {
    if (tierFilter === 'all') return true;
    return cand.compatibility_tier?.toLowerCase() === tierFilter.toLowerCase();
  });

  if (loading) {
    return <LoadingState message="Connecting to AI Candidate Matching Engine..." />;
  }

  const selectedPosting = postings.find((p) => String(p.id) === String(selectedOppId));

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="AI Candidate Matching"
        subtitle="Recruitment Intelligence Engine"
        description="Multi-model algorithmic scoring and skill deficit analysis evaluating student candidates against published job and internship criteria."
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="portal-btn secondary"
              onClick={() => runMatching(selectedOppId, modelMode)}
              disabled={evaluating || !selectedOppId}
            >
              <RefreshCw size={15} className={evaluating ? 'animate-spin' : ''} />
              {evaluating ? 'Evaluating...' : 'Re-run Evaluation'}
            </button>
            <Link to="/dashboard/industry/postings" className="portal-btn secondary" style={{ textDecoration: 'none' }}>
              View Postings
            </Link>
          </div>
        }
      />

      {/* 2. AI Transparency Disclaimer */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: '#475569',
        }}
      >
        <Info size={18} color="#0d9488" style={{ flexShrink: 0 }} />
        <span>
          <strong>AI Matching Notice:</strong> Synthesizes verified student assessment scores, academic transcripts, and technical projects against opportunity criteria. Results support recruiter review and do not replace hiring decisions.
        </span>
      </div>

      {/* 3. Control Panel: Opportunity Selector + AI Engine Mode */}
      <div className="portal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="portal-form-group">
            <label className="portal-form-label">Target Recruitment Opening *</label>
            <select
              className="portal-form-input"
              value={selectedOppId}
              onChange={handleSelectOpportunity}
              disabled={evaluating || postings.length === 0}
            >
              {postings.length === 0 ? (
                <option value="">No active opportunities published</option>
              ) : (
                postings.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.type?.toUpperCase()}) &bull; {opp.location}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="portal-form-group">
            <label className="portal-form-label">Evaluation Engine Model</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'hybrid', label: 'Hybrid AI (Gemini + Grok)' },
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'grok', label: 'xAI Grok' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`portal-btn ${modelMode === m.id ? 'primary' : 'secondary'}`}
                  style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => handleModelChange(m.id)}
                  disabled={evaluating}
                >
                  <Sparkles size={12} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Opportunity Context */}
        {selectedPosting && (
          <div
            style={{
              padding: '0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Required Skills Benchmark:</div>
              <div className="portal-tag-group" style={{ marginTop: '0.35rem' }}>
                {(selectedPosting.required_skills || []).map((skill) => (
                  <span key={skill} className="portal-tag matched">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evaluated Pool:</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {matchData?.total_evaluated_candidates ?? candidatesList.length} Students
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Tier Filter Bar */}
      <div className="portal-filter-bar">
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
          Ranked Candidates ({filteredCandidates.length})
        </div>

        <div className="portal-filter-controls">
          <select
            className="portal-filter-select"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all">All Compatibility Tiers</option>
            <option value="High Match">High Match (&ge; 80%)</option>
            <option value="Moderate Match">Moderate Match (60-79%)</option>
            <option value="Low Match">Low Match (&lt; 60%)</option>
          </select>
        </div>
      </div>

      {/* 5. Candidates Grid */}
      {evaluating ? (
        <LoadingState message="Synthesizing candidate profiles, assessment benchmarks, and skill compatibility..." />
      ) : error ? (
        <ErrorState title="Matching Evaluation Notice" message={error} onRetry={() => runMatching(selectedOppId, modelMode)} />
      ) : filteredCandidates.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={postings.length === 0 ? 'No Opportunities Available' : 'No Candidates Matched'}
          description={
            postings.length === 0
              ? 'Publish a job or internship posting first to match student candidates.'
              : 'No students currently meet the selected compatibility tier for this opening.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCandidates.map((cand, idx) => {
            const score = cand.match_score ?? cand.skill_match_percent ?? 75;
            const tier = cand.compatibility_tier || (score >= 80 ? 'High Match' : score >= 60 ? 'Moderate Match' : 'Low Match');
            const tierClass = tier === 'High Match' ? 'high' : tier === 'Moderate Match' ? 'moderate' : 'low';

            return (
              <div key={cand.student_id ?? idx} className="portal-candidate-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#f0fdf9',
                        color: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {cand.candidate_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                        {cand.candidate_name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {cand.institution || cand.candidate_institution} &bull; {cand.department || cand.candidate_department}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, marginTop: '0.15rem' }}>
                        CGPA: {cand.cgpa ?? cand.candidate_cgpa ?? '8.2'} &bull; {cand.candidate_email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`portal-score-badge ${tierClass}`}>
                        {score}% Match
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 600 }}>
                        {tier}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Compatibility Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Matched Skills ({(cand.matched_skills || []).length})
                    </div>
                    <div className="portal-tag-group">
                      {(cand.matched_skills || []).map((s) => (
                        <span key={s} className="portal-tag matched">
                          <CheckCircle2 size={11} /> {s}
                        </span>
                      ))}
                      {(cand.matched_skills || []).length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None verified yet</span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Skill Gap / Deficits ({(cand.missing_skills || []).length})
                    </div>
                    <div className="portal-tag-group">
                      {(cand.missing_skills || []).map((s) => (
                        <span key={s} className="portal-tag missing">
                          <AlertTriangle size={11} /> {s}
                        </span>
                      ))}
                      {(cand.missing_skills || []).length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Full skill alignment</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Recruiter Reasoning */}
                {(cand.recommended_action || cand.rationale) && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                    <strong>AI Recruiter Note:</strong> {cand.recommended_action || cand.rationale}
                  </div>
                )}

                {/* Card Action */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link
                    to="/dashboard/industry/candidates"
                    className="portal-btn primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', textDecoration: 'none' }}
                  >
                    <span>View in Pipeline</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const CandidateMatching = () => {
  const [postings, setPostings] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [tierFilter, setTierFilter] = useState('all'); // all, High Match, Moderate Match

  const [modelMode, setModelMode] = useState('hybrid'); // 'hybrid', 'gemini', 'grok'

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const opps = await apiService.getCompanyPostings();
      setPostings(opps);
      if (opps.length > 0) {
        const firstOppId = opps[0].id;
        setSelectedOppId(firstOppId);
        await runMatching(firstOppId, 'hybrid');
      }
    } catch (err) {
      console.error('Failed to load initial matching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async (oppId, mode = modelMode) => {
    try {
      setEvaluating(true);
      const res = await apiService.getAICandidateMatchMultiModel(oppId, mode);
      setMatchData(res);
    } catch (err) {
      console.error('Failed to run AI matching evaluation:', err);
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
    return cand.compatibility_tier === tierFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Multi-Model AI Engine Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-primary-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs px-3 py-0.5 rounded-full font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Multi-Model AI Active (Phase 5)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Candidate Compatibility & Matching</h1>
            <p className="text-primary-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Synthesizing Google Gemini reasoning and xAI Grok industry analysis for deep candidate compatibility ranking.
            </p>
          </div>

          <div className="p-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md text-xs text-primary-100 max-w-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <Brain className="w-4 h-4 text-emerald-300" /> Active AI Orchestrator
            </div>
            <div>Model: <strong className="text-white">{matchData?.ai_meta?.model_used || 'Gemini 1.5 + Grok'}</strong></div>
            <div>Latency: <strong className="text-white">{matchData?.ai_meta?.latency_ms || 180}ms</strong> • Confidence: <strong className="text-emerald-300">97%</strong></div>
          </div>
        </div>
      </div>

      {/* 2. Opportunity Selector & Model Switcher */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Target Opportunity:
          </label>
          <select
            value={selectedOppId}
            onChange={handleSelectOpportunity}
            className="flex-1 md:w-72 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            {postings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.type})
              </option>
            ))}
          </select>
        </div>

        {/* Model Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
          <button
            onClick={() => handleModelChange('hybrid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              modelMode === 'hybrid'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            ✨ Hybrid Synthesis
          </button>
          <button
            onClick={() => handleModelChange('gemini')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              modelMode === 'gemini'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Gemini 1.5
          </button>
          <button
            onClick={() => handleModelChange('groq')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              modelMode === 'groq'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Groq (Llama 3.3)
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400">Filter Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Match Tiers</option>
            <option value="High Match">High Match (75% and above)</option>
            <option value="Moderate Match">Moderate Match (40% to 74%)</option>
          </select>
        </div>
      </div>

      {/* Required Skills Badge Row */}
      {matchData && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Required Skills Target:</span>
          <div className="flex flex-wrap gap-1.5">
            {matchData.required_skills?.map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md text-xs font-medium"
              >
                {sk}
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-auto">
            Evaluated Pool: <strong className="text-slate-700 dark:text-slate-300">{matchData.total_evaluated_candidates} Candidates</strong>
          </span>
        </div>
      )}

      {/* 3. Candidate Rankings Cards */}
      {evaluating ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="space-y-3">
          {filteredCandidates.map((cand, idx) => (
            <div
              key={cand.student_id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Candidate Info & Institution */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center flex-shrink-0">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cand.candidate_name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cand.compatibility_tier === 'High Match'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : cand.compatibility_tier === 'Moderate Match'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                    >
                      {cand.compatibility_tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {cand.institution} • {cand.department} • CGPA <strong>{cand.cgpa}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cand.candidate_email}</p>
                </div>
              </div>

              {/* Middle Column: Skills Matched vs Gaps */}
              <div className="flex-1 max-w-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Skill Compatibility Score</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{cand.match_score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cand.match_score >= 75
                        ? 'bg-emerald-500'
                        : cand.match_score >= 40
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${cand.match_score}%` }}
                  ></div>
                </div>

                <div className="flex flex-wrap items-center gap-1 text-[11px] pt-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Matched:</span>
                  {cand.matched_skills.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded font-medium text-[10px]"
                    >
                      ✓ {s}
                    </span>
                  ))}

                  {cand.missing_skills.length > 0 && (
                    <>
                      <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">Missing Gap:</span>
                      {cand.missing_skills.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded font-medium text-[10px]"
                        >
                          ✕ {s}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Suggested Action */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Action</span>
                  <div className="text-xs font-bold text-primary-600 dark:text-primary-400">{cand.recommended_action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Candidates Evaluated</h3>
          <p className="text-xs text-slate-400 mt-1">Select an opportunity posting above to run skill compatibility diagnostics.</p>
        </div>
      )}
    </div>
  );
};

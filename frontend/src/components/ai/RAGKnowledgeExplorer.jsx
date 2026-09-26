import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Spinner } from '../common/Spinner';
import {
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  Database,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
  Award,
  FileText,
  ExternalLink,
} from 'lucide-react';

const PRESET_QUERIES = [
  'Give me Java interview questions',
  'Explain BFS vs DFS',
  'Prepare me for a frontend interview',
  'What skills are required for an AI/ML engineer?',
  'Academic-to-Industry DBMS mapping',
  'How to prepare for coding assessments?',
];

export const RAGKnowledgeExplorer = ({ defaultRole = null }) => {
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(defaultRole || 'all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [groundedResult, setGroundedResult] = useState(null);
  const [rawChunks, setRawChunks] = useState([]);
  const [ragStatus, setRagStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('grounded'); // 'grounded' | 'chunks'
  const [expandedSources, setExpandedSources] = useState({});
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getRAGStatus();
      setRagStatus(data);
    } catch (err) {
      console.warn('Could not load RAG status:', err);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery || !searchQuery.trim()) {
      addToast({ type: 'warning', message: 'Please enter a question or topic to search.' });
      return;
    }

    setLoading(true);
    setGroundedResult(null);
    setRawChunks([]);

    const filters = {};
    if (roleFilter !== 'all') filters.role = roleFilter;
    if (contentTypeFilter !== 'all') filters.content_type = contentTypeFilter;

    try {
      // Run both grounded query and raw retrieval concurrently
      const [groundedRes, chunksRes] = await Promise.allSettled([
        apiService.queryRAGGrounded(searchQuery.trim(), filters),
        apiService.retrieveRAGChunks(searchQuery.trim(), filters, 6),
      ]);

      if (groundedRes.status === 'fulfilled') {
        setGroundedResult(groundedRes.value);
      }
      if (chunksRes.status === 'fulfilled') {
        setRawChunks(chunksRes.value.results || []);
      }
    } catch (err) {
      addToast({
        type: 'error',
        message: 'Failed to retrieve knowledge base information: ' + (err.message || 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    setQuery(preset);
    handleSearch(preset);
  };

  const toggleSourceExpand = (id) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerIngest = async () => {
    setIngesting(true);
    try {
      const res = await apiService.ingestRAGKnowledgeBase(null, true);
      addToast({
        type: 'success',
        message: `Successfully ingested ${res.total_upserted_points} knowledge base chunks into Qdrant!`,
      });
      fetchStatus();
    } catch (err) {
      addToast({
        type: 'error',
        message: 'Ingestion failed: ' + (err.response?.data?.detail || err.message),
      });
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Base Header & Status Banner */}
      <Card className="p-6 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                National Academia–Industry Knowledge Base
              </h2>
              <Badge variant="primary" className="text-xs">
                RAG v1.0
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Authoritative repository of verified interview questions, solutions, career profiles,
              academic-to-industry skill maps, and placement guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {ragStatus && (
              <div className="text-xs text-slate-400 border border-slate-700/60 rounded-lg px-3 py-2 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ragStatus.status === 'ready' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-300">
                    {ragStatus.points_count} Vectors Indexed
                  </span>
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  Cluster: {ragStatus.is_remote ? 'Remote Cloud' : 'In-Memory'} • {ragStatus.embedding_provider} ({ragStatus.embedding_dimension}d)
                </div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={triggerIngest}
              disabled={ingesting}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${ingesting ? 'animate-spin' : ''}`} />
              {ingesting ? 'Ingesting...' : 'Re-index'}
            </Button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask anything (e.g. 'Explain BFS vs DFS', 'Java interview questions', 'AI/ML skills')..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Retrieving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Retrieve & Answer
                </>
              )}
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>

            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="general">General / HR</option>
              <option value="software_engineer">Software Engineer</option>
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="ai_ml">AI/ML Engineer</option>
              <option value="data_analyst">Data Analyst</option>
            </select>

            {/* Content Type Filter */}
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Content Types</option>
              <option value="interview_qa">Interview Q&A</option>
              <option value="mock_interview_question">Mock Interview Questions</option>
              <option value="career_role_profile">Career Profiles</option>
              <option value="skill_mapping">Academic Skill Mapping</option>
              <option value="learning_roadmap">Learning Roadmaps</option>
              <option value="placement_faq">Placement FAQs</option>
              <option value="resume_guidance">Resume Guidance</option>
            </select>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-slate-500 text-xs">Suggestions:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-blue-900/30 border border-slate-700/60 hover:border-blue-500/40 text-slate-300 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center border-slate-800 bg-slate-900/40">
          <Spinner size="lg" className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-base font-medium text-slate-200">
            Searching Knowledge Base & Synthesizing Evidence...
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Executing dense vector similarity with hybrid technical reranking on Qdrant.
          </p>
        </Card>
      )}

      {/* Results View */}
      {!loading && (groundedResult || rawChunks.length > 0) && (
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('grounded')}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === 'grounded'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Grounded AI Answer
                </span>
              </button>

              <button
                onClick={() => setActiveTab('chunks')}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === 'chunks'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Retrieved Knowledge Chunks ({rawChunks.length})
                </span>
              </button>
            </div>

            {groundedResult?.confidence_score !== undefined && (
              <Badge
                variant={groundedResult.confidence_score > 0.8 ? 'success' : 'default'}
                className="text-xs"
              >
                Confidence: {Math.round(groundedResult.confidence_score * 100)}%
              </Badge>
            )}
          </div>

          {/* TAB 1: Grounded AI Answer */}
          {activeTab === 'grounded' && groundedResult && (
            <div className="space-y-4">
              <Card className="p-6 border-slate-700/80 bg-slate-900/60">
                {/* Sample Answer Advisory Notice */}
                {groundedResult.is_sample_answer && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <strong className="font-semibold text-amber-300">Candidate Guidance:</strong>{' '}
                      This is a sample framework answer from the official knowledge base. When interviewing,
                      personalize this structure (e.g. STAR) with your genuine projects and individual learnings.
                    </div>
                  </div>
                )}

                {/* Answer Content */}
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {groundedResult.answer}
                </div>

                {/* Key Takeaways */}
                {groundedResult.key_takeaways?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-400" /> Key Takeaways
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {groundedResult.key_takeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow Up Suggestions */}
                {groundedResult.follow_up_suggestions?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">Next Steps:</span>
                    {groundedResult.follow_up_suggestions.map((sugg, i) => (
                      <button
                        key={i}
                        onClick={() => handlePresetClick(sugg)}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                )}

                {/* Verified Citations List */}
                {groundedResult.sources?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Verified Knowledge Base Sources ({groundedResult.sources.length})
                    </h4>
                    <div className="space-y-2">
                      {groundedResult.sources.map((src, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              {src.question || src.topic || `Source #${i + 1}`}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {src.section} • Match: {Math.round((src.score || 0) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 2: Raw Knowledge Chunks */}
          {activeTab === 'chunks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rawChunks.map((chunk) => {
                const isExpanded = expandedSources[chunk.chunk_id];
                return (
                  <Card
                    key={chunk.chunk_id}
                    className="p-4 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {chunk.section}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Score: {Math.round((chunk.score || 0) * 100)}%
                        </Badge>
                      </div>

                      <h4 className="font-semibold text-slate-100 text-sm mb-1">
                        {chunk.question || chunk.subsection || chunk.topic}
                      </h4>

                      <div className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-950/60 p-3 rounded border border-slate-800/80">
                        {isExpanded ? (
                          <div className="whitespace-pre-line">{chunk.answer || chunk.chunk_text}</div>
                        ) : (
                          <div>
                            {(chunk.answer || chunk.chunk_text || '').slice(0, 180)}
                            {(chunk.answer || chunk.chunk_text || '').length > 180 && '...'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Role: <strong className="text-slate-300">{chunk.role || 'General'}</strong>
                      </span>
                      <button
                        onClick={() => toggleSourceExpand(chunk.chunk_id)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Less <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Full Answer <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !groundedResult && rawChunks.length === 0 && (
        <Card className="p-10 text-center border-slate-800 bg-slate-900/20">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Explore SkillBridge India Knowledge Base
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            Search for technical interview questions, DSA patterns, career competencies, or academic-to-industry mappings to view verified answers.
          </p>
        </Card>
      )}
    </div>
  );
};

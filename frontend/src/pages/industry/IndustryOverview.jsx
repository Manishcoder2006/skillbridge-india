import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  PlusCircle,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Search,
} from 'lucide-react';

export const IndustryOverview = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIndustryDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load industry dashboard summary:', err);
      setError('Unable to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <AlertCircle className="w-5 h-5" />
          Dashboard Notice
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchSummary}
          className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const company = summary?.company || {};

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 p-2 flex items-center justify-center border border-white/20 shadow-inner">
              <Building2 className="w-9 h-9 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{company.name || 'Tata Consultancy Services'}</h1>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Enterprise
                </span>
              </div>
              <p className="text-primary-200 text-sm mt-1">
                {company.industry_type || 'Information Technology & Cloud Services'} • {company.headquarters_city || 'Mumbai'}, {company.headquarters_state || 'Maharashtra'}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-primary-300">
                <span>Recruiter: <strong className="text-white font-medium">{company.hr_representative?.full_name || 'Priya Nair'}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-white font-medium">{company.hr_representative?.designation || 'Talent Acquisition'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/industry/postings"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Post New Role
            </Link>
            <Link
              to="/dashboard/industry/matching"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
            >
              <Brain className="w-4 h-4 text-indigo-300" /> AI Match
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Recruitment Funnel KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.active_jobs || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Published open roles</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Internships</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.active_internships || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Academic internships</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.total_applications || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total received</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary?.awaiting_review || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Needs review</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary?.shortlisted_candidates || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ready for rounds</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews</span>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{summary?.interviews_scheduled || 0}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Scheduled calls</p>
        </div>
      </div>

      {/* 3. Main Grid: Recent Applications & Recent Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Applications Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Applications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Candidates applying across engineering institutions</p>
            </div>
            <Link
              to="/dashboard/industry/candidates"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Candidate</th>
                  <th className="px-3 py-2.5">Applied Role</th>
                  <th className="px-3 py-2.5">Skill Match</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {summary?.recent_applications?.length > 0 ? (
                  summary.recent_applications.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{app.candidate_name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{app.candidate_institution} • CGPA {app.candidate_cgpa}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{app.opportunity_title}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{app.opportunity_type}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                app.skill_match_percent >= 75
                                  ? 'bg-emerald-500'
                                  : app.skill_match_percent >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${app.skill_match_percent}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{app.skill_match_percent}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            app.status === 'shortlisted'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : app.status === 'interview'
                              ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                              : app.status === 'selected'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/dashboard/industry/candidates`}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 hover:text-primary-600 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px] transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-6 text-center text-slate-400">
                      No candidate applications received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Active Postings & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Postings</h2>
              <Link
                to="/dashboard/industry/postings"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Manage All
              </Link>
            </div>

            <div className="space-y-3">
              {summary?.recent_postings?.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200/60 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-xs text-slate-900 dark:text-white">{post.title}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {post.location} • {post.stipend_or_salary}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-0.5 rounded">
                      {post.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{post.applications_count || 0} applicants</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Recruitment Activity</h2>
            <div className="space-y-3">
              {summary?.recruitment_activity?.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">{act.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

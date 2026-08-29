import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const IndustryAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIndustryAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load recruitment analytics:', err);
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

  const funnel = analytics?.recruitment_funnel || {};
  const statusDist = analytics?.status_breakdown || {};
  const totalApps = analytics?.total_applications_received || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Corporate Recruitment Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Hiring pipeline funnel metrics, applicant conversion rates, and skill requirement distributions for {analytics?.company_name}.
        </p>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalApps}</div>
          <p className="text-xs text-slate-500 mt-1">Across all posted openings</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Job Roles Posted</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.total_job_postings || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Full-time opportunities</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Internship Roles</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.total_internship_postings || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Student internships</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Candidate Conversion</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {totalApps > 0 ? Math.round(((funnel.shortlisted || 0) / totalApps) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Shortlist rate</p>
        </div>
      </div>

      {/* 3. Middle Grid: Funnel & Skills Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Pipeline Funnel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" /> Hiring Pipeline Funnel
            </h2>
            <span className="text-xs text-slate-400">Live Status</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Total Received (Applied)', count: funnel.total_applied || 0, color: 'bg-blue-500' },
              { label: 'Under Review', count: funnel.under_review || 0, color: 'bg-amber-500' },
              { label: 'Shortlisted', count: funnel.shortlisted || 0, color: 'bg-emerald-500' },
              { label: 'Interview Scheduled', count: funnel.interviewed || 0, color: 'bg-cyan-500' },
              { label: 'Selected / Offers', count: funnel.offered_or_selected || 0, color: 'bg-purple-500' },
            ].map((stage) => {
              const pct = totalApps > 0 ? Math.round((stage.count / totalApps) * 100) : 0;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {stage.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full ${stage.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top In-Demand Skills */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Top Hiring Skill Requirements
            </h2>
            <span className="text-xs text-slate-400">Requirements Count</span>
          </div>

          <div className="space-y-3">
            {analytics?.top_in_demand_skills?.map((item) => (
              <div
                key={item.skill}
                className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200/60 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.skill}</span>
                </div>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                  {item.postings_requiring} Openings
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Posting Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Posting Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Opportunity Role</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Openings</th>
                <th className="px-4 py-3">Total Applicants</th>
                <th className="px-4 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {analytics?.posting_performance?.map((post, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{post.title}</td>
                  <td className="px-4 py-3 uppercase font-bold text-primary-600">{post.type}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{post.openings}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{post.applications_count}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full font-semibold text-[10px] capitalize">
                      {post.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronRight,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';

export const CandidatesAndApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Candidate Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(false);

  // Status Update Modal
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('under_review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanyApplications(statusFilter, searchQuery);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleOpenCandidateProfile = async (studentId) => {
    try {
      setCandidateLoading(true);
      setSelectedCandidate(null);
      const profile = await apiService.getCandidateProfile(studentId);
      setSelectedCandidate(profile);
    } catch (err) {
      console.error('Failed to load candidate profile:', err);
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleOpenStatusModal = (app) => {
    setStatusModalApp(app);
    setNewStatus(app.status || 'under_review');
    setReviewNotes('');
    setInterviewDate('');
    setInterviewLink('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    try {
      setUpdating(true);
      await apiService.updateApplicationStatus(statusModalApp.application_id, {
        status: newStatus,
        review_notes: reviewNotes,
        interview_scheduled_at: interviewDate || null,
        interview_link: interviewLink || null,
      });

      setFeedbackMsg(`Application status updated to '${newStatus.replace('_', ' ')}'!`);
      setStatusModalApp(null);
      fetchApplications();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update application status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Candidates & Applications Pipeline</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review candidate qualifications, verified competencies, and manage recruitment stage progression.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-700 text-xs">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'applied', label: 'Applied' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview', label: 'Interview Scheduled' },
            { id: 'selected', label: 'Selected' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, institution, or verified skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. Applications Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Applied Position</th>
                  <th className="px-4 py-3">Skill Match</th>
                  <th className="px-4 py-3">Verified Skills</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{app.candidate_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {app.candidate_institution} • Sem {app.candidate_semester} (CGPA {app.candidate_cgpa})
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{app.candidate_email}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{app.opportunity_title}</div>
                      <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                        {app.opportunity_type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
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
                        <span className="font-bold text-slate-700 dark:text-slate-300">{app.skill_match_percent}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {app.verified_skills?.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                        {app.verified_skills?.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{app.verified_skills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          app.status === 'shortlisted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : app.status === 'interview'
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : app.status === 'selected'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenCandidateProfile(app.student_id)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 hover:text-primary-600 text-slate-700 dark:text-slate-300 rounded font-semibold text-[11px] transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded font-semibold text-[11px] shadow-sm transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Applications Match Filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try selecting a different status tab or adjusting your search query.</p>
        </div>
      )}

      {/* 3. Candidate Recruiter Profile Drawer Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCandidate.full_name}</h2>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCandidate.institution_name} • {selectedCandidate.department_name}
                </p>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedCandidate.email} • CGPA: <strong className="text-slate-700 dark:text-slate-300">{selectedCandidate.cgpa}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verified Skills Matrix */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Verified Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.verified_skills?.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {sk.skill_name || sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Projects */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Key Engineering Projects
              </h4>
              <div className="space-y-2">
                {selectedCandidate.projects?.length > 0 ? (
                  selectedCandidate.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200/60 dark:border-slate-700 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">{proj.title}</div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{proj.description}</p>
                      {proj.tech_stack && (
                        <div className="text-[10px] text-primary-600 dark:text-primary-400 mt-1 font-mono">
                          Tech: {proj.tech_stack.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No public projects attached.</p>
                )}
              </div>
            </div>

            {/* Resume Summary */}
            {selectedCandidate.resume_summary && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">ATS Profile & Career Objective</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedCandidate.resume_summary.career_objective || 'Aspiring Software Engineer focused on high-performance cloud and distributed platforms.'}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Status Update Modal */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Update Status: {statusModalApp.candidate_name}
              </h3>
              <button
                onClick={() => setStatusModalApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recruitment Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="applied">Applied (Initial)</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="selected">Selected / Offer Made</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {newStatus === 'interview' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Date & Time</label>
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      placeholder="https://meet.skillbridge.in/..."
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recruiter Review Notes</label>
                <textarea
                  rows="3"
                  placeholder="Feedback notes visible to candidate & hiring team..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {updating ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

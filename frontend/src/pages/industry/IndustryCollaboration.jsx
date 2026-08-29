import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Handshake,
  PlusCircle,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Building2,
} from 'lucide-react';

export const IndustryCollaboration = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    initiative_type: 'workshop',
    target_domain: 'Cloud Architecture & Microservices',
    description: '',
    target_audience: 'B.Tech CSE/IT Students and Faculty',
    slots_available: 50,
    timeline: 'Q4 2026',
    contact_email: 'collaborations@tcs.com',
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIndustryCollaborationProposals();
      setProposals(data);
    } catch (err) {
      console.error('Failed to load collaboration proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      await apiService.createIndustryCollaborationProposal(formData);
      setSuccessMsg('Academic collaboration proposal published successfully!');
      setIsModalOpen(false);
      fetchProposals();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setErrorMsg('Failed to publish proposal. Check required fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academia–Industry Collaboration</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Host technical masterclasses, sponsor Faculty Development Programs (FDPs), and launch student hackathons.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Propose New Initiative
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* 2. Collaboration Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : proposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {prop.initiative_type}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Published
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{prop.title}</h3>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">{prop.target_domain}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{prop.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prop.slots_available} Slots Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Timeline: {prop.timeline}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target: <strong className="text-slate-700 dark:text-slate-300 font-medium">{prop.target_audience}</strong></span>
                <span className="font-mono text-[11px] text-slate-500">{prop.contact_email}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
          <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Collaboration Initiatives Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Propose a technical workshop or FDP to partner with engineering institutions.</p>
        </div>
      )}

      {/* 3. Propose Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Propose Collaboration Initiative</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Day FastAPI Enterprise Microservices Masterclass"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.initiative_type}
                    onChange={(e) => setFormData({ ...formData, initiative_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="workshop">Technical Workshop</option>
                    <option value="fdp">Faculty Development (FDP)</option>
                    <option value="joint_research">Joint R&D Project</option>
                    <option value="mentorship">Executive Mentorship</option>
                    <option value="hackathon">National Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Domain</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems, AI/ML"
                    value={formData.target_domain}
                    onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Syllabus Overview</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Outline key topics, hands-on labs, and certification deliverables..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Available Participant Slots</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.slots_available}
                    onChange={(e) => setFormData({ ...formData, slots_available: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Timeline / Dates</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2026 or 2 Weeks"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Coordinator Contact Email</label>
                <input
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

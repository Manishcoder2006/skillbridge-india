import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Plus,
  Eye,
} from 'lucide-react';

export const PostingsManager = () => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, job, internship
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, closed

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'job',
    description: '',
    required_skills: [],
    preferred_skills: [],
    eligibility: 'B.Tech / BE CSE & IT students with CGPA >= 6.5',
    location: 'Bengaluru / Hybrid',
    work_mode: 'hybrid',
    stipend_or_salary: '₹8.0 - 12.0 LPA',
    openings_count: 5,
    application_deadline: '2026-12-31',
    duration: '',
    status: 'active',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanyPostings();
      setPostings(data);
    } catch (err) {
      console.error('Failed to load postings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (posting = null) => {
    if (posting) {
      setEditingPosting(posting);
      setFormData({
        title: posting.title,
        type: posting.type || 'job',
        description: posting.description || '',
        required_skills: posting.required_skills || [],
        preferred_skills: posting.preferred_skills || [],
        eligibility: posting.eligibility || '',
        location: posting.location || 'Bengaluru',
        work_mode: posting.work_mode || 'hybrid',
        stipend_or_salary: posting.stipend_or_salary || '',
        openings_count: posting.openings_count || 5,
        application_deadline: posting.application_deadline || '2026-12-31',
        duration: posting.duration || '',
        status: posting.status || 'active',
      });
    } else {
      setEditingPosting(null);
      setFormData({
        title: '',
        type: 'job',
        description: '',
        required_skills: ['React', 'Python'],
        preferred_skills: ['Docker'],
        eligibility: 'Open to B.Tech / BE graduating students with CGPA >= 6.5',
        location: 'Bengaluru / Pune',
        work_mode: 'hybrid',
        stipend_or_salary: '₹8.5 LPA',
        openings_count: 5,
        application_deadline: '2026-12-31',
        duration: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }));
  };

  const handleSavePosting = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      if (editingPosting) {
        await apiService.updatePosting(editingPosting.id, formData);
        setSuccessMsg('Posting updated successfully!');
      } else {
        await apiService.createPosting(formData);
        setSuccessMsg('New opportunity published successfully!');
      }
      setIsModalOpen(false);
      fetchPostings();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save posting:', err);
      setErrorMsg('Failed to save posting. Please ensure all required fields are filled.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePosting = async (postingId) => {
    if (!window.confirm('Are you sure you want to remove this posting?')) return;
    try {
      await apiService.deletePosting(postingId);
      setSuccessMsg('Posting deleted successfully.');
      fetchPostings();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete posting:', err);
    }
  };

  // Filtered List
  const filteredPostings = postings.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.status !== 'closed' && p.is_active) ||
      (statusFilter === 'closed' && (p.status === 'closed' || !p.is_active));

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs & Internships Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage verified recruitment and internship opportunities for higher education students.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Post New Opportunity
        </button>
      </div>

      {/* Feedback Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* 2. Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role, skills, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Posting Types</option>
            <option value="job">Jobs Only</option>
            <option value="internship">Internships Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Postings</option>
            <option value="closed">Closed / Inactive</option>
          </select>
        </div>
      </div>

      {/* 3. Postings Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredPostings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPostings.map((posting) => (
            <div
              key={posting.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          posting.type === 'internship'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}
                      >
                        {posting.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          posting.status === 'active' || posting.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {posting.status || 'Active'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">{posting.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(posting)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Posting"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePosting(posting.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{posting.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{posting.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{posting.stipend_or_salary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{posting.openings_count || 5} Openings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Closes {posting.application_deadline}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                  {posting.required_skills?.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {posting.applications_count || 0} Total Applicants
                </span>
                <button
                  onClick={() => handleOpenModal(posting)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Manage Role &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Postings Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or post a new job / internship opportunity.</p>
        </div>
      )}

      {/* 4. Post / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPosting ? 'Edit Opportunity Posting' : 'Post New Job or Internship'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePosting} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud DevOps Engineer or Full Stack Intern"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="job">Full-Time Job</option>
                    <option value="internship">Student Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={formData.work_mode}
                    onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">On-Site</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Compensation / Stipend</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹9.0 LPA or ₹25,000 / month"
                    value={formData.stipend_or_salary}
                    onChange={(e) => setFormData({ ...formData, stipend_or_salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Openings Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.openings_count}
                    onChange={(e) => setFormData({ ...formData, openings_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Pune, Hyderabad"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Eligibility Criteria</label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd & 4th Year B.Tech CSE/IT with CGPA >= 7.0"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Description & Responsibilities</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe the opportunity, projects, and learning scope..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Required Skills Input */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Candidate Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-md font-medium flex items-center gap-1"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, Docker, React"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-primary-50 hover:text-primary-600"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : editingPosting ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

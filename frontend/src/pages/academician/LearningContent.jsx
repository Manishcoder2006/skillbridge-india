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
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Video,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Save,
  Search,
} from 'lucide-react';

export const LearningContent = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const initialForm = {
    title: '',
    category: 'Backend Engineering',
    skill_tag: 'FastAPI',
    resource_type: 'tutorial',
    duration: '4 hours',
    url: 'https://fastapi.tiangolo.com',
    description: '',
    level: 'intermediate',
    visibility: 'department',
    is_published: true,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFacultyContent();
      setContentList(data || []);
    } catch (err) {
      console.error('Failed to load learning content:', err);
      setError('Unable to fetch curriculum resources. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingContent(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      category: item.category,
      skill_tag: item.skill_tag,
      resource_type: item.resource_type,
      duration: item.duration || '2 hours',
      url: item.url,
      description: item.description || '',
      level: item.level || 'intermediate',
      visibility: item.visibility || 'department',
      is_published: item.is_published !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this learning resource?')) return;
    try {
      await apiService.deleteFacultyContent(id);
      setContentList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete content:', err);
      alert('Failed to delete content.');
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const updated = await apiService.updateFacultyContent(item.id, {
        is_published: !item.is_published,
      });
      setContentList((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_published: updated.is_published } : c))
      );
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContent) {
        const updated = await apiService.updateFacultyContent(editingContent.id, formData);
        setContentList((prev) => prev.map((c) => (c.id === editingContent.id ? updated : c)));
      } else {
        const created = await apiService.createFacultyContent(formData);
        setContentList((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save content:', err);
      alert('Failed to save learning resource.');
    } finally {
      setSaving(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={16} color="#e11d48" />;
      case 'pdf':
        return <FileText size={16} color="#d97706" />;
      case 'workshop':
        return <Layers size={16} color="#7c3aed" />;
      default:
        return <BookOpen size={16} color="#2563eb" />;
    }
  };

  const filteredContent = contentList.filter((item) => {
    const matchesQuery =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skill_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const categories = Array.from(new Set(contentList.map((c) => c.category).filter(Boolean)));

  return (
    <div className="portal-page">
      {/* 1. Header */}
      <RolePageHeader
        title="Curriculum & Learning Content"
        subtitle="Faculty Resource Repository"
        badge={<Badge role="academician" />}
        description="Publish and curate masterclasses, lecture series, industry tutorials, and reading materials for your authorized students."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '42px',
              padding: '0 1.25rem',
              fontWeight: 700,
            }}
          >
            <Plus size={16} /> Add Learning Resource
          </button>
        }
      />

      {/* 2. Search & Category Filters */}
      <div className="portal-filter-bar">
        <div className="portal-search-box">
          <Search size={16} className="portal-search-icon" />
          <input
            type="text"
            className="portal-search-input"
            placeholder="Search resources by title, skill tag, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="portal-filter-controls">
          <select
            className="portal-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(searchQuery || categoryFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', minHeight: '40px' }}
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Resource Cards Grid */}
      {loading ? (
        <LoadingState message="Loading faculty learning resources and tutorials..." />
      ) : error ? (
        <ErrorState title="Error Loading Content" message={error} onRetry={fetchContent} />
      ) : filteredContent.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Learning Resources Found"
          description={
            contentList.length === 0
              ? 'You have not authored any learning modules yet. Click "Add Learning Resource" to publish tutorials or workshop materials.'
              : 'No resources match your active search or category filter.'
          }
          action={
            contentList.length === 0 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAdd}
                style={{ minHeight: '40px', padding: '0 1rem' }}
              >
                <Plus size={15} /> Create First Resource
              </button>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '1.25rem',
            width: '100%',
          }}
        >
          {filteredContent.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: item.is_published ? '4px solid #0d9488' : '4px solid #94a3b8',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: item.is_published ? 1 : 0.75,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getResourceIcon(item.resource_type)}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.03em' }}>
                      {item.resource_type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background:
                          item.visibility === 'department'
                            ? '#eff6ff'
                            : item.visibility === 'institution'
                            ? '#fdf4ff'
                            : '#f0fdf4',
                        color:
                          item.visibility === 'department'
                            ? '#1d4ed8'
                            : item.visibility === 'institution'
                            ? '#86198f'
                            : '#15803d',
                        border: `1px solid ${
                          item.visibility === 'department'
                            ? '#bfdbfe'
                            : item.visibility === 'institution'
                            ? '#f5d0fe'
                            : '#bbf7d0'
                        }`,
                      }}
                    >
                      {item.visibility === 'department'
                        ? 'My Department Only'
                        : item.visibility === 'institution'
                        ? 'My Institution'
                        : 'All Students'}
                    </span>
                    <Badge variant={item.is_published ? 'success' : 'warning'}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0.75rem 0 0.35rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 0.75rem' }}>
                  {item.description || 'Comprehensive learning module curated by faculty for student skill enhancement.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: '#f0fdf9',
                      color: '#0d9488',
                      fontWeight: 700,
                      border: '1px solid #ccfbf1',
                    }}
                  >
                    #{item.skill_tag}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Level: {item.level}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    ⏱️ {item.duration}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid #f1f5f9',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                    title={item.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {item.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#0d9488',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#2563eb',
                      cursor: 'pointer',
                    }}
                    title="Edit Resource"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      cursor: 'pointer',
                    }}
                    title="Delete Resource"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Add/Edit Content Modal */}
      {isModalOpen && (
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
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {editingContent ? 'Edit Learning Resource' : 'Publish New Learning Resource'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Resource Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass in High-Performance FastAPI & AsyncIO"
                  required
                  style={{ minHeight: '42px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Domain Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ minHeight: '42px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Primary Skill Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.skill_tag}
                    onChange={(e) => setFormData({ ...formData, skill_tag: e.target.value })}
                    placeholder="e.g. Python, SQL, Cloud"
                    required
                    style={{ minHeight: '42px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Resource Type</label>
                  <select
                    className="form-control"
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    style={{ minHeight: '42px' }}
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="video">Video Lecture</option>
                    <option value="pdf">Reading / Paper</option>
                    <option value="workshop">Interactive Workshop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Proficiency Level</label>
                  <select
                    className="form-control"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    style={{ minHeight: '42px' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Estimated Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 hours"
                    style={{ minHeight: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Resource URL / Material Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  required
                  style={{ minHeight: '42px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Who can access this content? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  required
                  style={{ minHeight: '42px', fontWeight: 500 }}
                >
                  <option value="department">
                    My Department Only — only students belonging to the faculty's institution and department.
                  </option>
                  <option value="institution">
                    My Institution — all students belonging to the faculty's institution, regardless of department.
                  </option>
                  <option value="global">
                    All Students — students across the platform.
                  </option>
                </select>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  {formData.visibility === 'department' && "🔒 Only students belonging to your institution and department will see this content."}
                  {formData.visibility === 'institution' && "🏛️ All students enrolled in your institution (any department) will see this content."}
                  {formData.visibility === 'global' && "🌐 Open to all students across the platform."}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Curator Note / Overview</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instructions for students regarding prerequisites and expected learning outcomes..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  style={{ minHeight: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ minHeight: '42px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  {saving ? <Spinner size="sm" /> : <Save size={16} />}
                  {saving ? 'Saving...' : editingContent ? 'Update Resource' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

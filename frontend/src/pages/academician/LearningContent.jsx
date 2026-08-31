import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Video,
  FileText,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Save,
} from 'lucide-react';

export const LearningContent = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await apiService.getFacultyContent();
      setContentList(data);
    } catch (err) {
      console.error('Failed to load learning content:', err);
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
    if (!window.confirm('Are you sure you want to delete this learning resource?')) return;
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
        return <Video size={18} color="#ef4444" />;
      case 'pdf':
        return <FileText size={18} color="#f59e0b" />;
      case 'workshop':
        return <Layers size={18} color="#8b5cf6" />;
      default:
        return <BookOpen size={18} color="#3b82f6" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              Curriculum & Skill Enhancement
            </Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Faculty Resource Management
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Curate Learning Resources & Tutorials
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Publish workshops, lecture series, industry tutorials, and reading materials for your authorized students.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Learning Resource
        </button>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
        </div>
      ) : contentList.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>No Resources Published Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Click "Add Learning Resource" to publish tutorials or workshop links for your students.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {contentList.map((item) => (
            <Card
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: item.is_published ? 1 : 0.7,
                borderLeft: item.is_published ? '4px solid #3b82f6' : '4px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getResourceIcon(item.resource_type)}
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                      {item.resource_type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Badge variant={item.is_published ? 'success' : 'warning'}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="primary" style={{ textTransform: 'capitalize' }}>
                      {item.visibility}
                    </Badge>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0.75rem 0 0.35rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                  {item.description || 'Comprehensive learning module curated by faculty for skill mapping and industry readiness.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#6366f1',
                      fontWeight: 600,
                    }}
                  >
                    #{item.skill_tag}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    Level: {item.level}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    ⏱️ {item.duration}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  <ExternalLink size={14} /> Open Resource
                </a>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="btn btn-outline"
                    title={item.is_published ? 'Unpublish Resource' : 'Publish Resource'}
                    style={{ padding: '0.35rem 0.6rem' }}
                  >
                    {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="btn btn-outline"
                    title="Edit Resource"
                    style={{ padding: '0.35rem 0.6rem' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-outline"
                    title="Delete Resource"
                    style={{ padding: '0.35rem 0.6rem', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-bg)',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                {editingContent ? 'Edit Learning Resource' : 'Add New Learning Resource'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Resource Title</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus & Cloud Storage Systems"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Backend Engineering">Backend Engineering</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Databases">Databases</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Skill Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.skill_tag}
                    onChange={(e) => setFormData({ ...formData, skill_tag: e.target.value })}
                    placeholder="e.g. FastAPI, Docker, React"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Resource Type</label>
                  <select
                    className="form-control"
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="course">Course</option>
                    <option value="workshop">Workshop</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Level</label>
                  <select
                    className="form-control"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 4 hours"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Resource URL</label>
                <input
                  type="url"
                  className="form-control"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Description & Learning Objectives</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain why this resource will help bridge student skill gaps..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', alignItems: 'center' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Visibility Scope</label>
                  <select
                    className="form-control"
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  >
                    <option value="department">Department Only (CSE)</option>
                    <option value="institution">Whole Institution (IIT Delhi)</option>
                    <option value="public">Public / All Students</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.2rem' }}>
                  <input
                    type="checkbox"
                    id="is_published_chk"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="is_published_chk" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                    Publish immediately to students
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  {saving ? <Spinner size="sm" /> : <Save size={16} />}
                  {saving ? 'Saving...' : editingContent ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

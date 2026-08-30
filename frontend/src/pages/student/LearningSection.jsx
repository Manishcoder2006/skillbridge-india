import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  Search,
  Filter,
  Layers,
  GraduationCap,
  PlayCircle,
  FileText,
} from 'lucide-react';

export const LearningSection = () => {
  const { showSuccess, showError } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLearningResources();
      setResources(data);
    } catch (err) {
      showError('Failed to load learning resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (resourceId, newStatus) => {
    try {
      await apiService.updateLearningProgress(resourceId, newStatus, newStatus === 'completed' ? 100 : 50);
      setResources(
        resources.map((r) => (r.id === resourceId ? { ...r, progress_status: newStatus } : r))
      );
      showSuccess(newStatus === 'completed' ? 'Resource marked as Completed!' : 'Resource added to active learning!');
    } catch (err) {
      showError('Failed to update progress.');
    }
  };

  const categories = ['all', ...new Set(resources.map((r) => r.category))];

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.skill_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={16} />;
      case 'pdf': return <FileText size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Curated Learning Resources</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Discover official government learning resources (SWAYAM, NPTEL, AICTE NEAT) and industry tutorials to bridge your skill gaps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: '260px', maxWidth: '450px' }}>
          <Input
            placeholder="Search by skill, topic, or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#0d9488' : '#e2e8f0',
                background: selectedCategory === cat ? '#ccfbf1' : '#ffffff',
                color: selectedCategory === cat ? '#0f766e' : '#475569',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid-responsive grid-cols-3">
        {filteredResources.map((res) => (
          <Card key={res.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <Badge variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {getResourceIcon(res.resource_type)}
                <span style={{ textTransform: 'capitalize' }}>{res.resource_type}</span>
              </Badge>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontSize: '0.8rem', fontWeight: 700 }}>
                <Star size={13} fill="#d97706" /> {res.rating}
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', minHeight: '44px', lineHeight: 1.4 }}>
              {res.title}
            </h3>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Provider: <strong style={{ color: 'var(--text-primary)' }}>{res.provider}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {res.duration}
              </span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize' }}>{res.level}</span>
              <span>•</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Free Access</span>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
              >
                Open Resource <ExternalLink size={12} />
              </a>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {res.progress_status === 'completed' ? (
                  <Badge variant="success">
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Completed
                  </Badge>
                ) : res.progress_status === 'in_progress' ? (
                  <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(res.id, 'completed')}>
                    Mark Done
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(res.id, 'in_progress')}>
                    Start
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

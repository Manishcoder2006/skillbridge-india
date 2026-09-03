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

import { AILearningTutor } from './learning/AILearningTutor';
import { Sparkles } from 'lucide-react';

const DEFAULT_CURATED_RESOURCES = [
  {
    id: 'f1',
    title: 'Modern React 18 & Frontend State Architecture',
    category: 'Web Development',
    skill_tag: 'React / Frontend',
    resource_type: 'course',
    provider: 'SWAYAM / NPTEL',
    duration: '4 weeks',
    url: 'https://swayam.gov.in',
    level: 'intermediate',
    is_free: true,
    rating: 4.9,
    progress_status: 'completed',
  },
  {
    id: 'f2',
    title: 'FastAPI High-Performance Backend Engineering',
    category: 'Backend Engineering',
    skill_tag: 'FastAPI / Python',
    resource_type: 'tutorial',
    provider: 'SkillBridge Labs',
    duration: '6 hours',
    url: 'https://fastapi.tiangolo.com',
    level: 'intermediate',
    is_free: true,
    rating: 4.8,
    progress_status: 'in_progress',
  },
  {
    id: 'f3',
    title: 'Database Modeling & PostgreSQL Row Level Security',
    category: 'Databases',
    skill_tag: 'PostgreSQL / SQL',
    resource_type: 'workshop',
    provider: 'IIT Delhi Open Courseware',
    duration: '3 hours',
    url: 'https://www.postgresql.org/docs/',
    level: 'advanced',
    is_free: true,
    rating: 4.9,
    progress_status: 'not_started',
  },
  {
    id: 'f4',
    title: 'Python for Algorithmic Problem Solving',
    category: 'Software Engineering',
    skill_tag: 'Python / DSA',
    resource_type: 'course',
    provider: 'AICTE / NEAT Portal',
    duration: '8 weeks',
    url: 'https://neat.aicte-india.org',
    level: 'intermediate',
    is_free: true,
    rating: 4.7,
    progress_status: 'not_started',
  },
  {
    id: 'f5',
    title: 'Cloud Infrastructure & Docker Containerization',
    category: 'DevOps',
    skill_tag: 'Docker / DevOps',
    resource_type: 'video',
    provider: 'NPTEL Cloud Series',
    duration: '5 hours',
    url: 'https://nptel.ac.in',
    level: 'intermediate',
    is_free: true,
    rating: 4.8,
    progress_status: 'not_started',
  },
  {
    id: 'f6',
    title: 'Executive Technical Writing & Professional Communication',
    category: 'Soft Skills',
    skill_tag: 'Communication / Placement',
    resource_type: 'pdf',
    provider: 'National Skill Development Corp',
    duration: '2 hours',
    url: 'https://nsdcindia.org',
    level: 'beginner',
    is_free: true,
    rating: 4.6,
    progress_status: 'not_started',
  },
];

export const LearningSection = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('ai_tutor'); // 'ai_tutor' | 'curated'
  const [resources, setResources] = useState(DEFAULT_CURATED_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadResources();
  }, [activeTab]);

  const loadResources = async () => {
    try {
      const data = await apiService.getLearningResources();
      if (Array.isArray(data) && data.length > 0) {
        setResources(data);
      }
    } catch (err) {
      console.warn('Could not fetch latest learning resources from API, using cached curated resources:', err);
      // Keep DEFAULT_CURATED_RESOURCES intact so cards are always available
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
      // Optimistically update locally even if offline/mock
      setResources(
        resources.map((r) => (r.id === resourceId ? { ...r, progress_status: newStatus } : r))
      );
      showSuccess(newStatus === 'completed' ? 'Resource marked as Completed!' : 'Resource added to active learning!');
    }
  };

  const categories = ['all', ...new Set(resources.map((r) => r.category).filter(Boolean))];

  const filteredResources = resources.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

    if (!term) {
      return matchesCategory;
    }

    const title = (r.title || '').toLowerCase();
    const skillTag = (r.skill_tag || '').toLowerCase();
    const category = (r.category || '').toLowerCase();
    const provider = (r.provider || '').toLowerCase();

    // Natural search matching across title, skill, category, provider, and common aliases
    const matchesSearch =
      title.includes(term) ||
      skillTag.includes(term) ||
      category.includes(term) ||
      provider.includes(term) ||
      (term === 'frontend' && (category.includes('web') || skillTag.includes('react'))) ||
      (term === 'backend' && (category.includes('backend') || skillTag.includes('fastapi') || skillTag.includes('python')));

    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={16} />;
      case 'pdf': return <FileText size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Section Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('ai_tutor')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'ai_tutor' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#f1f5f9',
            color: activeTab === 'ai_tutor' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'ai_tutor' ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={16} color={activeTab === 'ai_tutor' ? '#fde047' : '#0d9488'} />
          AI Micro-Learning Tutor
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('curated')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'curated' ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#f1f5f9',
            color: activeTab === 'curated' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'curated' ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={16} />
          Curated Resources (NPTEL / SWAYAM)
        </button>
      </div>

      {/* TAB 1: AI MICRO-LEARNING TUTOR */}
      {activeTab === 'ai_tutor' && <AILearningTutor />}

      {/* TAB 2: CURATED LEARNING RESOURCES (PRESERVED) */}
      {activeTab === 'curated' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Curated Learning Resources</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
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
      {filteredResources.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              No resources match your search
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              We could not find any curated resources matching "{searchTerm}". Try another skill tag or clear your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              style={{
                marginTop: '1.25rem',
                padding: '0.5rem 1.25rem',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        </Card>
      ) : (
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
      )}
            </>
          )}
        </div>
      )}
    </div>
  );
};


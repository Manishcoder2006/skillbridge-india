import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  ArrowRight,
} from 'lucide-react';

export const ApplicationsTracker = () => {
  const { showError } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudentApplications();
      setApplications(data);
    } catch (err) {
      showError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'selected':
        return 'success';
      case 'shortlisted':
      case 'interview':
        return 'primary';
      case 'under_review':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Application Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Monitor real-time status, recruitment stages, and recruiter feedback on your active applications.
          </p>
        </div>
        <Link to="/dashboard/student/opportunities" className="btn btn-primary btn-sm">
          <Briefcase size={16} /> Discover More Opportunities
        </Link>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#64748b',
              }}
            >
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Applications Submitted Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
              Explore verified internship and graduate engineering roles matching your validated skill matrix.
            </p>
            <Link to="/dashboard/student/opportunities" className="btn btn-primary btn-sm">
              Browse Open Positions <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Position / Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Applied On</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Current Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {app.title}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={14} color="#0d9488" /> {app.company_name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge variant={app.type === 'internship' ? 'primary' : 'success'}>
                        {app.type}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {app.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              maxWidth: '550px',
              width: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Badge variant={getStatusBadgeVariant(selectedApp.status)}>
                  STATUS: {selectedApp.status?.replace('_', ' ').toUpperCase()}
                </Badge>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  {selectedApp.title}
                </h2>
                <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.9rem' }}>
                  {selectedApp.company_name}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Application Metadata</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <strong>Applied On:</strong> {new Date(selectedApp.applied_at).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <strong>Location:</strong> {selectedApp.location}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Submission Notes & Cover Summary
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '4px' }}>
                {selectedApp.notes || 'Standard verified profile submission.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

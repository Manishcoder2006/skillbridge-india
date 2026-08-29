import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Handshake,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFacultyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'student_update':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'collaboration':
        return <Handshake size={18} color="#8b5cf6" />;
      case 'opportunity':
        return <Briefcase size={18} color="#3b82f6" />;
      default:
        return <Bell size={18} color="var(--color-primary)" />;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.is_read;
    if (filterTab === 'student_update') return n.category === 'student_update';
    if (filterTab === 'collaboration') return n.category === 'collaboration';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <Badge variant="primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              Communication & Updates
            </Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {unreadCount} Unread Notifications
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Faculty Notifications & Broadcasts
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Stay informed on student assessment completions, industry announcements, and collaborative opportunities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-outline"
            onClick={handleMarkAllRead}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'student_update', label: 'Student Alerts' },
          { id: 'collaboration', label: 'Industry Collab' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: filterTab === tab.id ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              color: filterTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              border: filterTab === tab.id ? '1px solid var(--color-primary)' : '1px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner size="lg" />
        </div>
      ) : filteredNotifs.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)' }}>All Caught Up!</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No notifications in this category.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredNotifs.map((n) => (
            <Card
              key={n.id}
              style={{
                padding: '1.25rem',
                background: n.is_read ? 'var(--color-surface)' : 'rgba(37, 99, 235, 0.05)',
                border: n.is_read ? '1px solid var(--color-border)' : '1px solid rgba(37, 99, 235, 0.3)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--color-border)',
                }}
              >
                {getCategoryIcon(n.category)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {n.title}
                    </h3>
                    {!n.is_read && <Badge variant="primary" style={{ fontSize: '0.7rem' }}>New</Badge>}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0.5rem 0 0.85rem' }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {n.action_link ? (
                    <Link
                      to={n.action_link}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Take Action <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <div />
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

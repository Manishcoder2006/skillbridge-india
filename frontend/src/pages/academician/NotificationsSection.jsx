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
  Bell,
  CheckCircle2,
  AlertTriangle,
  Handshake,
  Briefcase,
  CheckCheck,
} from 'lucide-react';

export const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFacultyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to load department notifications. Please verify backend status.');
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
        return <AlertTriangle size={16} color="#d97706" />;
      case 'collaboration':
        return <Handshake size={16} color="#7c3aed" />;
      case 'opportunity':
        return <Briefcase size={16} color="#2563eb" />;
      default:
        return <Bell size={16} color="#0d9488" />;
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
    <div className="portal-page" style={{ maxWidth: '960px' }}>
      {/* 1. Header */}
      <RolePageHeader
        title="Faculty Notifications & Broadcasts"
        subtitle={`${unreadCount} Unread Notifications`}
        badge={<Badge role="academician" />}
        description="Stay updated with student assessment milestone completions, institutional circulars, and industry collaboration invitations."
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleMarkAllRead}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                minHeight: '42px',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )
        }
      />

      {/* 2. Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'student_update', label: 'Student Cohort' },
          { id: 'collaboration', label: 'Industry Collab' },
        ].map((tab) => {
          const active = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: active ? '#f0fdf9' : 'transparent',
                color: active ? '#0d9488' : '#64748b',
                border: active ? '1px solid #ccfbf1' : '1px solid transparent',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '40px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Notification List */}
      {loading ? (
        <LoadingState message="Loading department notifications and updates..." />
      ) : error ? (
        <ErrorState title="Error Loading Notifications" message={error} onRetry={fetchNotifications} />
      ) : filteredNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Found"
          description={
            filterTab === 'unread'
              ? 'You have caught up with all department notifications!'
              : 'No notifications in this category.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                background: notif.is_read ? '#ffffff' : '#f0fdf9',
                border: notif.is_read ? '1px solid #e2e8f0' : '1px solid #ccfbf1',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                gap: '0.875rem',
                alignItems: 'flex-start',
                transition: 'background 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: notif.is_read ? '#f8fafc' : '#ffffff',
                  border: notif.is_read ? '1px solid #e2e8f0' : '1px solid #ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              >
                {getCategoryIcon(notif.category)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a' }}>
                    {notif.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                    {!notif.is_read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#0d9488',
                          display: 'inline-block',
                        }}
                        title="Unread notification"
                      />
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                {!notif.is_read && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0d9488',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={13} /> Mark as read
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

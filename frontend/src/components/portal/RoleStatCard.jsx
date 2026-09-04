import React from 'react';

/**
 * RoleStatCard - Standardized KPI metric card for non-student dashboards.
 *
 * @param {string} title - Label for metric (e.g. "Authorized Students", "Active Postings")
 * @param {string|number} value - Metric value (e.g. "42", "94%")
 * @param {string} [subtext] - Contextual detail (e.g. "Department Cohort", "+12% this week")
 * @param {string} [subtextType] - Styling for subtext: 'positive' | 'attention' | 'neutral'
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string} [variant='teal'] - Accent palette: 'teal' | 'blue' | 'amber' | 'purple' | 'emerald' | 'rose'
 */
export const RoleStatCard = ({
  title,
  value,
  subtext,
  subtextType = 'neutral',
  icon: Icon,
  variant = 'teal',
}) => {
  const subtextClass =
    subtextType === 'positive'
      ? 'portal-stat-subtext positive'
      : subtextType === 'attention'
      ? 'portal-stat-subtext attention'
      : 'portal-stat-subtext';

  return (
    <div className="portal-stat-card">
      {Icon && (
        <div className={`portal-stat-icon-wrap ${variant}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="portal-stat-body">
        <div className="portal-stat-title" title={title}>
          {title}
        </div>
        <div className="portal-stat-value">{value ?? 0}</div>
        {subtext && <div className={subtextClass}>{subtext}</div>}
      </div>
    </div>
  );
};

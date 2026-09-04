import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState - Polished, role-appropriate empty indicator when no backend records exist.
 *
 * @param {React.ElementType} [icon=Inbox] - Lucide icon
 * @param {string} title - Main empty state title (e.g. "No Applications Yet")
 * @param {string} description - Helpful explanation
 * @param {React.ReactNode} [action] - Optional primary action button (e.g. "Post Opening")
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active records to display at this time.',
  action,
}) => {
  return (
    <div className="portal-empty-state">
      <div className="portal-empty-icon">
        <Icon size={26} />
      </div>
      <h3 className="portal-empty-title">{title}</h3>
      <p className="portal-empty-desc">{description}</p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};

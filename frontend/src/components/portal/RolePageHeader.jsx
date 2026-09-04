import React from 'react';

/**
 * RolePageHeader - Unified responsive header for Academician, Institution Admin, and Industry/HR roles.
 *
 * @param {string} title - Page primary title
 * @param {string} [subtitle] - Optional category or breadcrumb label
 * @param {string} [description] - Subtext explaining the page's purpose
 * @param {React.ReactNode} [badge] - Optional status badge or verification pill
 * @param {React.ReactNode} [actions] - Action buttons / controls (stacked on mobile, inline on desktop)
 */
export const RolePageHeader = ({
  title,
  subtitle,
  description,
  badge,
  actions,
}) => {
  return (
    <div className="portal-header">
      <div className="portal-header-content">
        {(subtitle || badge) && (
          <div className="portal-header-meta">
            {badge}
            {subtitle && <span className="portal-header-subtext">{subtitle}</span>}
          </div>
        )}
        <h1 className="portal-header-title">{title}</h1>
        {description && <p className="portal-header-desc">{description}</p>}
      </div>

      {actions && <div className="portal-header-actions">{actions}</div>}
    </div>
  );
};

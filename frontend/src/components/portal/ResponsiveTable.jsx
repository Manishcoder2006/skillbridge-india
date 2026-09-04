import React from 'react';

/**
 * ResponsiveTable - Transforms rigid data tables into mobile cards on small screens (<= 768px).
 *
 * @param {Array<{ key: string, header: string, render?: (row: any) => React.ReactNode, mobileLabel?: string, isPrimary?: boolean, isBadge?: boolean }>} columns
 * @param {Array<any>} data - Array of row objects
 * @param {string} [title] - Title for table section
 * @param {React.ReactNode} [headerActions] - Filter / export controls in the table header
 * @param {(row: any, index: number) => React.ReactNode} [renderMobileCard] - Custom mobile card renderer
 * @param {React.ReactNode} [emptyState] - Component shown when data is empty
 * @param {string} [keyField='id'] - Unique key property
 */
export const ResponsiveTable = ({
  columns = [],
  data = [],
  title,
  headerActions,
  renderMobileCard,
  emptyState,
  keyField = 'id',
}) => {
  if (!data || data.length === 0) {
    if (emptyState) return emptyState;
    return (
      <div className="portal-table-container">
        {title && (
          <div className="portal-table-header-bar">
            <h3 className="portal-table-title">{title}</h3>
            {headerActions}
          </div>
        )}
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          No records available.
        </div>
      </div>
    );
  }

  // Find primary and action columns for auto mobile card fallback
  const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
  const secondaryCol = columns.length > 1 ? columns[1] : null;
  const badgeCol = columns.find((c) => c.isBadge);
  const actionCol = columns.find((c) => c.key === 'actions' || c.header.toLowerCase().includes('action'));
  const detailCols = columns.filter(
    (c) => c !== primaryCol && c !== secondaryCol && c !== badgeCol && c !== actionCol
  );

  return (
    <div className="portal-table-container">
      {/* Table Header Bar */}
      {(title || headerActions) && (
        <div className="portal-table-header-bar">
          {title && <h3 className="portal-table-title">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="portal-desktop-table-view">
        <table className="portal-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row[keyField] ?? idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="portal-mobile-cards-view">
        {data.map((row, idx) => {
          if (renderMobileCard) {
            return (
              <React.Fragment key={row[keyField] ?? idx}>
                {renderMobileCard(row, idx)}
              </React.Fragment>
            );
          }

          // Default smart mobile card transformation
          return (
            <div key={row[keyField] ?? idx} className="portal-row-card">
              <div className="portal-row-card-top">
                <div>
                  <div className="portal-row-card-primary">
                    {primaryCol?.render ? primaryCol.render(row) : row[primaryCol?.key]}
                  </div>
                  {secondaryCol && (
                    <div className="portal-row-card-secondary">
                      {secondaryCol.render ? secondaryCol.render(row) : row[secondaryCol.key]}
                    </div>
                  )}
                </div>
                {badgeCol && (
                  <div>{badgeCol.render ? badgeCol.render(row) : row[badgeCol.key]}</div>
                )}
              </div>

              {detailCols.length > 0 && (
                <div className="portal-row-card-grid">
                  {detailCols.map((col) => (
                    <div key={col.key} className="portal-row-card-item">
                      <span className="portal-row-card-item-label">
                        {col.mobileLabel || col.header}
                      </span>
                      <div className="portal-row-card-item-value">
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {actionCol && (
                <div className="portal-row-card-actions">
                  {actionCol.render ? actionCol.render(row) : row[actionCol.key]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

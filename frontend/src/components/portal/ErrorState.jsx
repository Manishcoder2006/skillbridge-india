import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorState - Standardized, actionable error notification banner.
 *
 * @param {string} [title='Failed to load data'] - Error title
 * @param {string} message - Technical or user-friendly explanation
 * @param {() => void} [onRetry] - Optional retry handler
 * @param {string} [retryLabel='Try Again'] - Label for retry button
 */
export const ErrorState = ({
  title = 'Service Unavailable',
  message = 'Unable to fetch records. Please verify network connectivity and backend status.',
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <div className="portal-error-state" role="alert">
      <AlertTriangle className="portal-error-icon" size={24} />
      <div className="portal-error-body">
        <h4 className="portal-error-title">{title}</h4>
        <p className="portal-error-desc">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="portal-error-retry-btn"
          >
            <RefreshCw size={14} />
            <span>{retryLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

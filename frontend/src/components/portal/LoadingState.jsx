import React from 'react';
import { Spinner } from '../common/Spinner';

/**
 * LoadingState - Non-disruptive loading state that prevents UI jumping.
 *
 * @param {string} [message='Loading intelligence data...'] - Accessible status text
 * @param {string|number} [minHeight='260px'] - Minimum height to reserve space
 */
export const LoadingState = ({
  message = 'Loading platform data...',
  minHeight = '260px',
}) => {
  return (
    <div
      className="portal-loading-state"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <span className="portal-loading-text">{message}</span>
    </div>
  );
};

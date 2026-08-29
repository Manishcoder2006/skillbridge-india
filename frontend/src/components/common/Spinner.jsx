import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, className = '', text = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
      }}
      className={className}
    >
      <Loader2
        size={size}
        color="var(--accent-teal)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {text && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{text}</span>}
    </div>
  );
};

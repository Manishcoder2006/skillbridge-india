import React from 'react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div>
        <strong>SkillBridge India</strong> &mdash; SIH 2026 Problem Statement 26044 (Phase 1 Foundation)
      </div>
      <div>
        <span>Portal for Academia–Industry Collaboration &bull; Secure Multi-Tenant Architecture</span>
      </div>
    </footer>
  );
};

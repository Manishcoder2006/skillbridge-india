import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Official SkillBridge India "SB" Unified Vector Logo
 * Matches the reference design with geometric S/B curves and vibrant teal pixel accents.
 */
export const Logo = ({
  variant = 'full', // 'full' | 'compact' | 'icon-only'
  theme = 'light',  // 'light' (dark text for light background) | 'dark' (light text for dark background)
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  subtitle = 'Academia–Industry Collaboration Portal',
  to = '/',
  clickable = true,
  style = {},
  className = '',
}) => {
  const sizeMap = {
    sm: { iconSize: 28, titleSize: '0.95rem', subSize: '0.65rem', gap: '0.5rem' },
    md: { iconSize: 36, titleSize: '1.15rem', subSize: '0.72rem', gap: '0.65rem' },
    lg: { iconSize: 44, titleSize: '1.4rem', subSize: '0.8rem', gap: '0.85rem' },
    xl: { iconSize: 56, titleSize: '1.75rem', subSize: '0.9rem', gap: '1rem' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  const textColor = isDark ? '#ffffff' : '#071019';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const iconBg = isDark ? '#0c1722' : '#071019';
  const iconBorder = isDark ? '1px solid rgba(255, 255, 255, 0.12)' : 'none';

  const logoContent = (
    <div
      className={`skillbridge-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Official Geometric SB Vector Icon */}
      <div
        style={{
          width: `${currentSize.iconSize}px`,
          height: `${currentSize.iconSize}px`,
          borderRadius: '8px',
          backgroundColor: iconBg,
          border: iconBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(7,16,25,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="76%"
          height="76%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Teal Digital Accent Blocks (Top-Left & Mid-Right) */}
          <rect x="8" y="10" width="16" height="16" rx="3" fill="#20B8A6" />
          <rect x="8" y="32" width="16" height="16" rx="3" fill="#2dd4bf" opacity="0.85" />
          <rect x="28" y="10" width="16" height="16" rx="3" fill="#14b8a6" />
          <rect x="8" y="74" width="16" height="16" rx="3" fill="#20B8A6" />

          {/* Connected Monogram Paths for S and B */}
          {/* S curve in crisp white / light gradient */}
          <path
            d="M52 14 H76 C84 14 90 20 90 28 C90 36 84 42 74 42 H54 C46 42 40 48 40 56 C40 64 46 70 54 70 H84"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* B right-loop backbone connecting to S */}
          <path
            d="M50 42 H76 C84 42 90 48 90 56 C90 64 84 70 76 70"
            stroke="#20B8A6"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M50 70 H78 C86 70 92 76 92 84 C92 91 86 96 78 96 H44 C34 96 26 88 26 78 V34"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text Content */}
      {variant !== 'icon-only' && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: currentSize.titleSize,
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>SkillBridge</span>
            <span style={{ color: '#20B8A6' }}>India</span>
          </div>
          {variant === 'full' && subtitle && (
            <div
              style={{
                fontSize: currentSize.subSize,
                color: subTextColor,
                fontWeight: 500,
                marginTop: '2px',
                letterSpacing: '0.01em',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

import React from 'react';

const roleLabels = {
  student: 'Student',
  academician: 'Faculty / Academician',
  industry_hr: 'Industry / HR',
  institution_admin: 'Institution Admin',
  super_admin: 'Super Admin',
};

export const Badge = ({
  children,
  variant = 'default',
  role,
  status,
  className = '',
  ...props
}) => {
  let badgeClass = 'badge';

  if (role) {
    badgeClass += ` badge-${role}`;
  } else if (status) {
    badgeClass += ` badge-${status}`;
  } else {
    badgeClass += ` badge-${variant}`;
  }

  const content = children || (role ? roleLabels[role] || role : status);

  return (
    <span className={`${badgeClass} ${className}`} {...props}>
      {content}
    </span>
  );
};

import React from 'react';

export const Card = ({
  children,
  title,
  action,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

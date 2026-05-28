import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-border rounded-xl shadow-card hover:shadow-cardHover transition-all ${className}`}>
    {children}
  </div>
);

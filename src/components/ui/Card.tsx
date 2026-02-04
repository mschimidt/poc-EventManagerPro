import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
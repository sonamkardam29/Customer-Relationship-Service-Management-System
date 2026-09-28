import React from 'react';

const badgeVariants = {
  // Ticket Status
  'Open': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pending Customer': 'bg-purple-50 text-purple-700 border-purple-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-300',
  
  // Ticket Priority
  'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  'Medium': 'bg-blue-50 text-blue-600 border-blue-200',
  'High': 'bg-amber-50 text-amber-700 border-amber-300',
  'Critical': 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse',
  
  // Lead Status
  'New': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Contacted': 'bg-sky-50 text-sky-700 border-sky-200',
  'Qualified': 'bg-teal-50 text-teal-700 border-teal-200',
  'Proposal': 'bg-purple-50 text-purple-700 border-purple-200',
  'Converted': 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
  'Lost': 'bg-rose-50 text-rose-600 border-rose-200',
  
  // Customer & User Status
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-100 text-slate-500 border-slate-200',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-rose-50 text-rose-600 border-rose-200',
  
  // Roles
  'admin': 'bg-purple-100 text-purple-800 border-purple-300 font-medium',
  'sales_executive': 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
  'support_agent': 'bg-teal-100 text-teal-800 border-teal-300 font-medium',
};

export const Badge = ({ value, label, className = '' }) => {
  const displayValue = label || value || 'N/A';
  const variantClass = badgeVariants[value] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variantClass} ${className}`}>
      {displayValue}
    </span>
  );
};

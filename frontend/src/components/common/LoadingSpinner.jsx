import React from 'react';

export const LoadingSpinner = ({ label = 'Loading application data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};

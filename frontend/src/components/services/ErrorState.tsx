import React from 'react';

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex">
        <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Failed to load services
          </h3>
          <p className="mt-1 text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </p>
        </div>
      </div>
    </div>
  );
};

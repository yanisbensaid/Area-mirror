import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading services..." }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
        {message}
      </span>
    </div>
  );
};

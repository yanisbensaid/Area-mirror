import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-32 w-32'
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-gray-900 mx-auto ${sizeClasses[size]}`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  className = '',
  onRetry
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

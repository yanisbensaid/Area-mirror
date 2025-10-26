import React from 'react';

interface NoResultsStateProps {
  onClearFilters: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({ onClearFilters }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3
        className="text-xl font-medium text-gray-900 mb-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        No services found
      </h3>
      <p
        className="text-gray-600 mb-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Try adjusting your search criteria or clearing the filters.
      </p>
      <button
        onClick={onClearFilters}
        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Clear filters
      </button>
    </div>
  );
};

import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    
    // Show first page if we're not near the beginning
    if (currentPage > 3) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="w-10 h-10 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          1
        </button>
      );
      
      if (currentPage > 4) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    for (let i = 0; i < Math.min(5, totalPages); i++) {
      let pageNum;
      if (totalPages <= 5) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }

      if (pageNum < 1 || pageNum > totalPages) continue;
      
      // Skip if already rendered as first page
      if (pageNum === 1 && currentPage > 3) continue;
      
      // Skip if will be rendered as last page
      if (pageNum === totalPages && currentPage < totalPages - 2) continue;

      pages.push(
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200 ${
            currentPage === pageNum
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {pageNum}
        </button>
      );
    }

    // Show last page if we're not near the end
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="w-10 h-10 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-gray-200">
      {/* Previous/Next buttons */}
      <div className="flex items-center gap-2 mb-4 sm:mb-0">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      {/* Items per page info */}
      <div className="text-sm text-gray-500 mt-4 sm:mt-0" style={{ fontFamily: 'Inter, sans-serif' }}>
        {itemsPerPage} per page
      </div>
    </div>
  );
};

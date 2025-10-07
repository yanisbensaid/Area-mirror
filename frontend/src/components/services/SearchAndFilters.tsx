import React from 'react';

interface SearchAndFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  showPopularOnly: boolean;
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onPopularToggle: (show: boolean) => void;
  onClearFilters: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  selectedCategory,
  showPopularOnly,
  categories,
  onSearchChange,
  onCategoryChange,
  onPopularToggle,
  onClearFilters,
}) => {
  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || showPopularOnly;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6 md:mb-8">
      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Search services
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 md:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            placeholder="Search by name, description, or tags..."
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <label
          className="block text-sm font-medium text-gray-700 mb-3"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Filter by category
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Popular Services Toggle */}
        <div className="flex items-center">
          <input
            id="popular-toggle"
            type="checkbox"
            checked={showPopularOnly}
            onChange={(e) => onPopularToggle(e.target.checked)}
            className="h-4 w-4 text-gray-900 focus:ring-gray-500 border-gray-300 rounded"
          />
          <label
            htmlFor="popular-toggle"
            className="ml-2 text-sm text-gray-700"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Show popular services only
          </label>
        </div>
      </div>

      {/* Active Filters and Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <span
              className="text-sm text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Active filters:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {selectedCategory}
              </span>
            )}
            {showPopularOnly && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Popular only
              </span>
            )}
          </div>
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react'

interface DatabaseService {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
  status: string;
  auth_type: string;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  trigger_service: DatabaseService;
  action_service: DatabaseService;
  action: {
    id: number;
    name: string;
    description: string;
  };
  reaction: {
    id: number;
    name: string;
    description: string;
  };
  is_active: boolean;
  category: string;
  tags: string[] | string; // Can be JSON string or array
  popularity: number;
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Fetch automations from backend
  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/api/automations')

        if (response.ok) {
          const data = await response.json()
          setAutomations(data)
          setError(null)
        } else {
          throw new Error('Failed to fetch automations')
        }
      } catch (err) {
        console.error('Error fetching automations:', err)
        setError('Failed to load automations')
      } finally {
        setLoading(false)
      }
    }

    fetchAutomations()
  }, [])

  // Get unique categories from automations
  const categories = ['All', ...Array.from(new Set(automations.map(automation => automation.category)))]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when changing category
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  // Helper function to parse tags
  const parseTags = (tags: string[] | string): string[] => {
    try {
      return typeof tags === 'string' ? JSON.parse(tags) : tags
    } catch {
      return []
    }
  }

  // Filter automations
  const filteredAutomations = automations.filter(automation => {
    const matchesCategory = selectedCategory === 'All' || automation.category === selectedCategory
    const parsedTags = parseTags(automation.tags)
    const matchesSearch = !searchQuery ||
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parsedTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredAutomations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAutomations = filteredAutomations.slice(startIndex, endIndex)

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading automations...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-3 md:mb-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
          >
            Explore Automations
          </h1>
          <p
            className="text-lg sm:text-xl md:text-xl text-gray-600 max-w-2xl mx-auto px-2"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Discover, filter, and find the perfect automation for your workflow
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6 md:mb-8">
          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Search automations
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
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 md:py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                placeholder="Search by title, description, or tags..."
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
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
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
          </div>

          {/* Active Filters and Clear */}
          {(searchQuery || selectedCategory !== 'All') && (
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
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count & Pagination Info */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAutomations.length)} of {filteredAutomations.length} automations
            {filteredAutomations.length !== automations.length && (
              <span className="text-gray-500"> (filtered from {automations.length} total)</span>
            )}
          </p>
          {totalPages > 1 && (
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Automations Grid */}
        <h2 className="sr-only">Available Automations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAutomations.map((automation) => (
            <div
              key={automation.id}
              className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
            >
              {/* Category and popularity badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {automation.category || 'Automation'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span
                    className="text-sm text-gray-600 font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {automation.popularity}% use this
                  </span>
                </div>
              </div>

              {/* Services flow */}
              <div className="flex items-center justify-between mb-6">
                {/* Trigger service */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                    <img
                      src={automation.trigger_service.icon_url || '/app_logo/default.png'}
                      alt={automation.trigger_service.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/app_logo/default.png'
                      }}
                    />
                  </div>
                  <span
                    className="text-xs text-gray-600 font-medium text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {automation.trigger_service.name}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex-1 flex items-center justify-center px-3">
                  <div className="w-full h-px bg-gray-300 relative">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rotate-45 translate-x-1/2"></div>
                  </div>
                </div>

                {/* Action service */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                    <img
                      src={automation.action_service.icon_url || '/app_logo/default.png'}
                      alt={automation.action_service.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/app_logo/default.png'
                      }}
                    />
                  </div>
                  <span
                    className="text-xs text-gray-600 font-medium text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {automation.action_service.name}
                  </span>
                </div>
              </div>

              {/* Automation details */}
              <div>
                <h3
                  className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {automation.name}
                </h3>
                <p
                  className="text-gray-600 text-sm leading-relaxed mb-4"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                >
                  {automation.description || `${automation.action.name} → ${automation.reaction.name}`}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(() => {
                    try {
                      const parsedTags = typeof automation.tags === 'string'
                        ? JSON.parse(automation.tags)
                        : automation.tags;
                      return Array.isArray(parsedTags) && parsedTags.length > 0
                        ? parsedTags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {tag}
                            </span>
                          ))
                        : (
                          <>
                            <span
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              automation
                            </span>
                            <span
                              className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {automation.trigger_service.name.toLowerCase()}
                            </span>
                            <span
                              className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {automation.action_service.name.toLowerCase()}
                            </span>
                          </>
                        );
                    } catch (error) {
                      return (
                        <>
                          <span
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            automation
                          </span>
                          <span
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {automation.trigger_service.name.toLowerCase()}
                          </span>
                          <span
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {automation.action_service.name.toLowerCase()}
                          </span>
                        </>
                      );
                    }
                  })()}
                </div>

                {/* Action and reaction flow */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-gray-500 font-medium"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      When:
                    </span>
                    <span
                      className="text-gray-700 font-medium"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {automation.action.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-gray-500 font-medium"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Then:
                    </span>
                    <span
                      className="text-gray-700 font-medium"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {automation.reaction.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && filteredAutomations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200">
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
              {/* Show first page if we're not near the beginning */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-10 h-10 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
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
              })}

              {/* Show last page if we're not near the end */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Items per page info */}
            <div className="text-sm text-gray-500 mt-4 sm:mt-0" style={{ fontFamily: 'Inter, sans-serif' }}>
              {itemsPerPage} per page
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredAutomations.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No automations found
            </h3>
            <p
              className="text-gray-600 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

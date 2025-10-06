import { useState, useEffect } from 'react'
import ServiceCard from '../../components/services/ServiceCard'

interface DatabaseService {
  id: number
  name: string
  description: string | null
  status: 'active' | 'inactive'
  auth_type: string
  icon_url: string | null
  actions: Array<{
    id: number
    name: string
    description: string | null
    service_id: number
  }>
  reactions: Array<{
    id: number
    name: string
    description: string | null
    service_id: number
  }>
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  name: string
  logo: string
  description: string
  category: string
  color: string
  automationCount: number
  isPopular: boolean
  tags: string[]
  status: 'active' | 'inactive'
  auth_type: string
}

interface AREATemplate {
  id: string
  name: string
  description: string
  action_service: string
  reaction_service: string
  services_connected: {
    [key: string]: boolean
  }
  can_activate: boolean
}

// Helper function to transform database service to frontend service
const transformDatabaseService = (dbService: DatabaseService): Service => {
  const totalAutomations = dbService.actions.length + dbService.reactions.length;

  return {
    id: dbService.id.toString(),
    name: dbService.name,
    logo: dbService.icon_url || `/app_logo/${dbService.name.toLowerCase().replace(/\s+/g, '')}.png`,
    description: dbService.description || `${dbService.name} service integration`,
    category: getCategoryFromAuthType(dbService.auth_type),
    color: getColorFromName(dbService.name),
    automationCount: totalAutomations,
    isPopular: totalAutomations > 2,
    tags: [dbService.auth_type.toLowerCase(), dbService.name.toLowerCase()],
    status: dbService.status,
    auth_type: dbService.auth_type
  };
};

// Helper function to determine category based on auth type or name
const getCategoryFromAuthType = (authType: string): string => {
  const authTypeMap: { [key: string]: string } = {
    'OAuth2': 'Social',
    'API Key': 'Development',
    'Token': 'Communication',
    'Basic Auth': 'Productivity',
    'None': 'Utility'
  };
  return authTypeMap[authType] || 'General';
};

// Helper function to generate colors based on service name
const getColorFromName = (name: string): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600'
  ];

  // Use name hash to consistently assign colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [areaTemplates, setAreaTemplates] = useState<AREATemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // Fetch services and AREA templates from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch regular services
        const servicesResponse = await fetch('http://localhost:8000/api/services');
        if (!servicesResponse.ok) {
          throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
        }
        const servicesData = await servicesResponse.json();
        const dbServices: DatabaseService[] = servicesData.server.services;
        const transformedServices = dbServices.map(transformDatabaseService);
        setServices(transformedServices);

        // Fetch AREA templates (only if logged in)
        if (isLoggedIn) {
          const templatesResponse = await fetch('http://localhost:8000/api/areas/templates', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          if (templatesResponse.ok) {
            const templatesData = await templatesResponse.json();
            if (templatesData.success) {
              setAreaTemplates(templatesData.data);
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(services.map(service => service.category)))]

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
    setShowPopularOnly(false)
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  // Filter services and AREA templates based on criteria
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesSearch = !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPopular = !showPopularOnly || service.isPopular

    return matchesCategory && matchesSearch && matchesPopular
  })

  const filteredAreas = areaTemplates.filter(area => {
    const matchesSearch = !searchQuery ||
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.action_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.reaction_service.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Combine services and areas for display
  const allItems = [...filteredServices, ...filteredAreas.map(area => ({
    ...area,
    type: 'area' as const
  }))]

  // Pagination calculations
  const totalPages = Math.ceil(allItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = allItems.slice(startIndex, endIndex)

  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  // Pagination functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
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
            All Services
          </h1>
          <p
            className="text-lg sm:text-xl md:text-xl text-gray-600 max-w-2xl mx-auto px-2"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Discover all available services and apps you can connect with AREA to create powerful automations
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading services...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
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
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                  {services.length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Total Services</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                  {services.filter(s => s.isPopular).length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Popular Services</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                  {categories.length - 1}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
                <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                  {services.reduce((sum, service) => sum + service.automationCount, 0)}
                </div>
                <div className="text-xs md:text-sm text-gray-600">Automations</div>
              </div>
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
                onChange={handleSearchChange}
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

            {/* Popular Services Toggle */}
            <div className="flex items-center">
              <input
                id="popular-toggle"
                type="checkbox"
                checked={showPopularOnly}
                onChange={(e) => setShowPopularOnly(e.target.checked)}
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
          {(searchQuery || selectedCategory !== 'All' || showPopularOnly) && (
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
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Services and AREAs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {currentItems.map((item) => {
            if ('type' in item && item.type === 'area') {
              // Render AREA card
              const area = item as AREATemplate & { type: 'area' }
              return (
                <ServiceCard
                  key={area.id}
                  type="area"
                  id={area.id}
                  name={area.name}
                  description={area.description}
                  icons={[area.action_service.toLowerCase(), area.reaction_service.toLowerCase()]}
                  connectionStatus={area.services_connected}
                  isActive={area.can_activate}
                  href={`/area/${area.id}`}
                />
              )
            } else {
              // Render regular service card
              const service = item as Service
              return (
                <ServiceCard
                  key={service.id}
                  type="service"
                  id={service.id}
                  name={service.name}
                  description={service.description}
                  icon={service.logo}
                  color={service.color}
                  category={service.category}
                  automationCount={service.automationCount}
                  isPopular={service.isPopular}
                  href={`/services/${service.id}`}
                />
              )
            }
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && allItems.length > 0 && (
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

        {/* No results */}
        {allItems.length === 0 && !error && (
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
              onClick={clearFilters}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Clear filters
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </main>
  )
}

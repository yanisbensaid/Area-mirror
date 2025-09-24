import { useState } from 'react'
import { Link } from 'react-router-dom'

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
}

const services: Service[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '/app_logo/spotify.png',
    description: 'Connect your music experience with automation for playlists, liked songs, new releases, and music recommendations.',
    category: 'Entertainment',
    color: 'from-green-500 to-green-600',
    automationCount: 4,
    isPopular: true,
    tags: ['music', 'streaming', 'playlists', 'entertainment']
  },
  {
    id: 'steam',
    name: 'Steam',
    logo: '/app_logo/steam.png',
    description: 'Automate your gaming experience with notifications for game updates, friend activities, and achievement unlocks.',
    category: 'Gaming',
    color: 'from-gray-600 to-gray-700',
    automationCount: 3,
    isPopular: false,
    tags: ['gaming', 'notifications', 'friends', 'achievements']
  },
  {
    id: 'telegram',
    name: 'Telegram',
    logo: '/app_logo/telegram.png',
    description: 'Set up automated messaging, channel notifications, and bot interactions for seamless communication.',
    category: 'Communication',
    color: 'from-blue-400 to-blue-500',
    automationCount: 3,
    isPopular: true,
    tags: ['messaging', 'notifications', 'communication', 'bots']
  },
  {
    id: 'twitch',
    name: 'Twitch',
    logo: '/app_logo/twitch.png',
    description: 'Automate your streaming workflow with notifications for new followers, stream alerts, and chat moderation.',
    category: 'Entertainment',
    color: 'from-purple-500 to-purple-600',
    automationCount: 2,
    isPopular: false,
    tags: ['streaming', 'gaming', 'notifications', 'entertainment']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    logo: '/app_logo/youtube.png',
    description: 'Connect your YouTube channel with automation for new uploads, subscriber milestones, and comment management.',
    category: 'Entertainment',
    color: 'from-red-500 to-red-600',
    automationCount: 4,
    isPopular: true,
    tags: ['video', 'content', 'streaming', 'entertainment']
  },
  {
    id: 'mail',
    name: 'Mail',
    logo: '/app_logo/mail.png',
    description: 'Automate your email workflows with triggers and actions for incoming emails, sending notifications, and managing your inbox.',
    category: 'Productivity',
    color: 'from-blue-500 to-blue-600',
    automationCount: 3,
    isPopular: true,
    tags: ['email', 'notifications', 'productivity', 'inbox']
  }
]

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(services.map(service => service.category)))]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setShowPopularOnly(false)
  }

  // Filter services based on criteria
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesPopular = !showPopularOnly || service.isPopular
    
    return matchesCategory && matchesSearch && matchesPopular
  })

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

        {/* Results Count */}
        <div className="mb-6">
          <p 
            className="text-sm text-gray-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="group bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Header with logo and popular badge */}
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                  <img 
                    src={service.logo} 
                    alt={`${service.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                {service.isPopular && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Popular
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="mb-3 md:mb-4">
                <h3 
                  className="text-lg md:text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {service.name}
                </h3>
                <p 
                  className="text-gray-600 text-sm md:text-base leading-relaxed mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                >
                  {service.description}
                </p>

                {/* Category and automation count */}
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {service.category}
                  </span>
                  <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {service.automationCount} automations
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                {service.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action button */}
              <div className="pt-3 md:pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                  <span 
                    className="text-sm font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View automations
                  </span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No results */}
        {filteredServices.length === 0 && (
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
      </div>
    </main>
  )
}
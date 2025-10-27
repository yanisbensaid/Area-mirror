import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { API_CONFIG } from '../../config/api'
const API_URL = API_CONFIG.BASE_URL

interface AREATemplate {
  id: string
  name: string
  description: string
  action_service: string
  action_type: string
  reaction_service: string
  reaction_type: string
  requires_services: string[]
  services_connected: {
    [key: string]: boolean
  }
  can_activate: boolean
}

const getServiceLogo = (serviceName: string) => {
  return `/logo/${serviceName}.png?v=3`
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('All')
  const [templates, setTemplates] = useState<AREATemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch AREA templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {
          'Accept': 'application/json'
        }

        // Only add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_URL}/api/areas/templates`, {
          headers
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTemplates(data.data)
          }
          setError(null)
        } else {
          throw new Error('Failed to fetch templates')
        }
      } catch (err) {
        console.error('Error fetching templates:', err)
        setError('Failed to load AREA templates')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Get unique services from templates
  const services = ['All', ...Array.from(new Set(
    templates.flatMap(t => [t.action_service, t.reaction_service])
  ))]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleServiceChange = (service: string) => {
    setSelectedService(service)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedService('All')
  }

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesService = selectedService === 'All' ||
      template.action_service === selectedService ||
      template.reaction_service === selectedService

    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.action_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.reaction_service.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesService && matchesSearch
  })

  // Get route for template
  const getTemplateRoute = (templateId: string) => {
    return `/area/${templateId}`
  }

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading AREA templates...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-16 md:pt-20 px-4 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 md:pt-20 px-4 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-3 md:mb-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
          >
            Explore Predefined AREAs
          </h1>
          <p
            className="text-lg sm:text-xl md:text-xl text-slate-300 max-w-2xl mx-auto px-2"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Discover ready-to-use automations. Connect services and activate in one click.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700 mb-6 md:mb-8">
          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-slate-300 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Search AREAs
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 md:h-5 md:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 md:py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
                placeholder="Search by name, description, or service..."
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* Service Filters */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-slate-300 mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Filter by service
            </label>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceChange(service)}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                    selectedService === service
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters and Clear */}
          {(searchQuery || selectedService !== 'All') && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-4">
                <span
                  className="text-sm text-slate-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Active filters:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedService !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Service: {selectedService}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-white font-medium transition-colors duration-200"
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
            className="text-sm text-slate-400"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Showing {filteredTemplates.length} of {templates.length} AREA templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              to={getTemplateRoute(template.id)}
              state={{ fromExplore: true }}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
            >
              {/* Status badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1 rounded-full">
                  Predefined
                </span>
                {template.can_activate && (
                  <span className="inline-block bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1 rounded-full">
                    ✓ Ready
                  </span>
                )}
              </div>

              {/* Services flow */}
              <div className="flex items-center justify-between mb-6">
                {/* Action service */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-2 p-2">
                    <img
                      src={getServiceLogo(template.action_service)}
                      alt={template.action_service}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <span
                    className="text-xs text-slate-400 font-medium text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {template.action_service}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex-1 flex items-center justify-center px-3">
                  <div className="w-full h-px bg-slate-600 relative">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rotate-45 translate-x-1/2"></div>
                  </div>
                </div>

                {/* Reaction service */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center mb-2 p-2">
                    <img
                      src={getServiceLogo(template.reaction_service)}
                      alt={template.reaction_service}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <span
                    className="text-xs text-slate-400 font-medium text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {template.reaction_service}
                  </span>
                </div>
              </div>

              {/* Template details */}
              <div>
                <h3
                  className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {template.name}
                </h3>
                <p
                  className="text-slate-300 text-sm leading-relaxed mb-4"
                  style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                >
                  {template.description}
                </p>

                {/* Connection status */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.requires_services.map((service) => (
                    <span
                      key={service}
                      className={`text-xs px-2 py-1 rounded-md ${
                        template.services_connected[service]
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {template.services_connected[service] ? '✓' : '○'} {service}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <div className="mt-4">
                  <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 inline-flex items-center">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-purple-400 text-6xl mb-4">🔍</div>
            <h3
              className="text-xl font-semibold text-white mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              No templates found
            </h3>
            <p
              className="text-slate-300 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors duration-200"
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

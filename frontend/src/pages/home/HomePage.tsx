import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

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
  tags: string[] | string;
  popularity: number;
}

export default function HomePage() {
  const [services, setServices] = useState<DatabaseService[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Check scroll position to update arrow visibility
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch services
        const servicesResponse = await fetch('http://localhost:8000/api/services')
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json()
          setServices(servicesData.server.services || [])
        }

        // Fetch automations
        const automationsResponse = await fetch('http://localhost:8000/api/automations')
        if (automationsResponse.ok) {
          const automationsData = await automationsResponse.json()
          setAutomations(automationsData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check scroll position when services load
  useEffect(() => {
    if (!loading && services.length > 0) {
      setTimeout(checkScrollPosition, 100)
    }
  }, [loading, services])  // Get top automations (sorted by popularity)
  const topAutomations = automations
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3)

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto px-4">
          <div className="space-y-4 md:space-y-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
            >
              Welcome to{' '}
              <span className="text-gray-600">
                AREA
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Connect your apps and automate your workflows with powerful automation tools
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Automate
              </h3>
              <p
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Create powerful automations between your favorite apps and services
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Connect
              </h3>
              <p
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Seamlessly integrate hundreds of apps and services
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3
                className="text-lg md:text-xl font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Optimize
              </h3>
              <p
                className="text-gray-600 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                Monitor and optimize your workflows for maximum efficiency
              </p>
            </div>
          </div>

          {/* Services Logos Section */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-gray-200">
            <h3
              className="text-xl md:text-2xl font-medium text-gray-900 text-center mb-6 md:mb-8"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Available Services
            </h3>
            <div className="relative">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors duration-200"
                  style={{ marginLeft: '-16px' }}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors duration-200"
                  style={{ marginRight: '-16px' }}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
                onScroll={checkScrollPosition}
              >
                <div className="flex gap-4 md:gap-6 min-w-max px-2">
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="flex flex-col items-center p-3 md:p-4 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[100px] md:min-w-[120px]">
                        <div className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))
                  ) : (
                    services.map((service) => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        className="group flex flex-col items-center p-3 md:p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer min-w-[100px] md:min-w-[120px] flex-shrink-0"
                      >
                        <div className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 transition-transform duration-200 group-hover:scale-110">
                          <img
                            src={service.icon_url || '/app_logo/default.png'}
                            alt={`${service.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/app_logo/default.png'
                            }}
                          />
                        </div>
                        <span
                          className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 text-center"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {service.name}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Scroll hint for mobile */}
              {!loading && services.length > 3 && !canScrollLeft && !canScrollRight && (
                <div className="flex justify-center mt-4 md:hidden">
                  <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>Swipe to see more</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Scroll Indicator Arrow */}
        <div className="flex justify-center mt-8 md:mt-12">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7"
              />
            </svg>
          </div>
        </div>
        </div>
      </div>

      {/* Automation Examples Section */}
      <div id="automation-examples" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 md:mb-4"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
            >
              Popular Automations
            </h2>
            <p
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              Get inspired by these popular automation workflows
            </p>
          </div>

          {loading ? (
            // Loading skeleton for automations
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-px bg-gray-200"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topAutomations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topAutomations.map((automation) => (
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
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          const parsedTags = typeof automation.tags === 'string'
                            ? JSON.parse(automation.tags)
                            : automation.tags;
                          return Array.isArray(parsedTags) && parsedTags.length > 0
                            ? parsedTags.slice(0, 2).map((tag, index) => (
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
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔧</div>
              <h3
                className="text-xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                No automations available yet
              </h3>
              <p
                className="text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Check back later for popular automation examples
              </p>
            </div>
          )}

          {/* Call to action */}
          <div className="text-center mt-8 md:mt-12">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore All Automations
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { automationExamples } from '../components/AutomationExamples'

interface DatabaseService {
  id: number
  name: string
  description: string | null
  status: 'active' | 'inactive'
  auth_type: string
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

interface ServiceInfo {
  name: string
  logo: string
  description: string
  color: string
  status: 'active' | 'inactive'
  auth_type: string
  actions: Array<{
    id: number
    name: string
    description: string | null
  }>
  reactions: Array<{
    id: number
    name: string
    description: string | null
  }>
}

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

// Transform database service to ServiceInfo
const transformDatabaseService = (dbService: DatabaseService): ServiceInfo => {
  return {
    name: dbService.name,
    logo: `/app_logo/${dbService.name.toLowerCase().replace(/\s+/g, '')}.png`,
    description: dbService.description || `${dbService.name} service integration`,
    color: getColorFromName(dbService.name),
    status: dbService.status,
    auth_type: dbService.auth_type,
    actions: dbService.actions,
    reactions: dbService.reactions
  };
};

// Fallback service data for compatibility with old hardcoded services
const fallbackServiceData: Record<string, ServiceInfo> = {
  google: {
    name: 'Google',
    logo: '/app_logo/google.png',
    description: 'Integrate with Google services like Gmail, Drive, Calendar, and more to create powerful automation workflows.',
    color: 'from-blue-500 to-red-500',
    status: 'active',
    auth_type: 'OAuth2',
    actions: [],
    reactions: []
  },
  github: {
    name: 'GitHub',
    logo: '/app_logo/github.png',
    description: 'Automate your development workflow with GitHub triggers for commits, pull requests, issues, and repository events.',
    color: 'from-gray-800 to-gray-900',
    status: 'active',
    auth_type: 'OAuth2',
    actions: [],
    reactions: []
  },
  mail: {
    name: 'Mail',
    logo: '/app_logo/mail.png',
    description: 'Automate your email workflows with triggers and actions for incoming emails, sending notifications, and managing your inbox.',
    color: 'from-blue-500 to-blue-600',
    status: 'active',
    auth_type: 'OAuth2',
    actions: [],
    reactions: []
  },
  spotify: {
    name: 'Spotify',
    logo: '/app_logo/spotify.png',
    description: 'Connect your music experience with automation for playlists, liked songs, new releases, and music recommendations.',
    color: 'from-green-500 to-green-600',
    status: 'active',
    auth_type: 'OAuth2',
    actions: [],
    reactions: []
  },
  telegram: {
    name: 'Telegram',
    logo: '/app_logo/telegram.png',
    description: 'Set up automated messaging, channel notifications, and bot interactions for seamless communication.',
    color: 'from-blue-400 to-blue-500',
    status: 'active',
    auth_type: 'OAuth2',
    actions: [],
    reactions: []
  }
};

export default function ServicePage() {
  const { serviceName } = useParams<{ serviceName: string }>()
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceName) {
        setError('No service specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if serviceName is a number (database ID) or a string (legacy name)
        const isNumericId = /^\d+$/.test(serviceName);
        
        if (isNumericId) {
          // Fetch from database API using ID
          const response = await fetch(`http://localhost:8000/api/services/${serviceName}`);
          
          if (!response.ok) {
            throw new Error(`Service not found: ${response.status}`);
          }
          
          const data = await response.json();
          const dbService: DatabaseService = data.server.service;
          const transformedService = transformDatabaseService(dbService);
          setService(transformedService);
        } else {
          // Use fallback data for legacy service names
          const fallbackService = fallbackServiceData[serviceName.toLowerCase()];
          if (fallbackService) {
            setService(fallbackService);
          } else {
            throw new Error('Service not found in fallback data');
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceName]);

  if (loading) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading service...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested service could not be found.'}</p>
          <Link 
            to="/services" 
            className="text-blue-600 hover:text-blue-800 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to Services
          </Link>
        </div>
      </main>
    );
  }
  
  // Filter automations that involve this service (as trigger OR action)
  const serviceAutomations = automationExamples.filter(automation => 
    automation.services.trigger.name.toLowerCase() === service.name.toLowerCase() ||
    automation.services.action.name.toLowerCase() === service.name.toLowerCase()
  )

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-16 flex-shrink-0">
              <img 
                src={service.logo} 
                alt={`${service.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 
                className="text-4xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
              >
                {service.name} Automations
              </h1>
              <p 
                className="text-xl text-gray-600 max-w-3xl"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                {service.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {serviceAutomations.length}
              </div>
              <div className="text-sm text-gray-600">Available Automations</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {serviceAutomations.filter(a => a.services.trigger.name.toLowerCase() === service.name.toLowerCase()).length}
              </div>
              <div className="text-sm text-gray-600">As Trigger</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {serviceAutomations.filter(a => a.services.action.name.toLowerCase() === service.name.toLowerCase()).length}
              </div>
              <div className="text-sm text-gray-600">As Action</div>
            </div>
          </div>
        </div>

        {/* Service Automations */}
        {serviceAutomations.length > 0 ? (
          <div>
            <div className="mb-8">
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Automations with {service.name}
              </h2>
              <p 
                className="text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Discover all the ways you can automate your {service.name} workflows
              </p>
            </div>
            
            {/* Custom automation grid for this service */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceAutomations.map((example) => (
                <div
                  key={example.id}
                  className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                >
                  {/* Category and popularity badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                      {example.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span 
                        className="text-sm text-gray-600 font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {example.popularity}% use this
                      </span>
                    </div>
                  </div>

                  {/* Services flow */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Trigger service */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm ${
                        example.services.trigger.name.toLowerCase() === service.name.toLowerCase() ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}>
                        <img 
                          src={example.services.trigger.icon} 
                          alt={example.services.trigger.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <span 
                        className="text-sm text-gray-600 text-center"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {example.services.trigger.name}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    {/* Action service */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm ${
                        example.services.action.name.toLowerCase() === service.name.toLowerCase() ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}>
                        <img 
                          src={example.services.action.icon} 
                          alt={example.services.action.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <span 
                        className="text-sm text-gray-600 text-center"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {example.services.action.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 
                      className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {example.title}
                    </h3>
                    <p 
                      className="text-gray-600 text-sm leading-relaxed mb-4"
                      style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                    >
                      {example.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {example.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Use this automation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* No automations available yet */
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 
              className="text-2xl font-medium text-gray-900 mb-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Automations Coming Soon
            </h2>
            <p 
              className="text-gray-600 mb-6 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
            >
              We're working hard to bring you powerful automation tools for {service.name}. 
              Stay tuned for triggers, actions, and integrations that will supercharge your workflow.
            </p>
            
            <div className="mt-8">
              <Link
                to="/explore"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-block"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explore Other Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
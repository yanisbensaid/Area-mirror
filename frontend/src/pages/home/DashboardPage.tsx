
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

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

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  // Get current user information
  const { user } = useCurrentUser()

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await fetch('http://localhost:8000/api/services');

        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status}`);
        }

        const data = await response.json();
        const dbServices: DatabaseService[] = data.server.services;
        const transformedServices = dbServices.map(transformDatabaseService);

        setServices(transformedServices);
        setServicesError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setServicesError(err instanceof Error ? err.message : 'Failed to load services');
        setServices([]); // Show empty list on error
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Show all services (no limit)
  const featuredServices = services;

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-3 md:mb-4"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
          >
            Welcome back {user?.name || 'User'} 👋 !
          </h1>
          <p
            className="text-lg sm:text-xl md:text-xl text-gray-600 max-w-2xl mx-auto px-2"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Admin Dashboard - Manage services, users, and system configuration
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              3
            </div>
            <div className="text-xs md:text-sm text-gray-600">Active Automations</div>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              5
            </div>
            <div className="text-xs md:text-sm text-gray-600">Connected Services</div>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              127
            </div>
            <div className="text-xs md:text-sm text-gray-600">This Month</div>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
              {featuredServices.length}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Available Services</div>
          </div>
        </div>

        {/* User Information Section */}
        {user && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8 md:mb-12">
            <h2
              className="text-2xl font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              👑 Administrator Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                  👑 Admin
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
                <p className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Featured Services Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Available Services
              </h2>
              <p
                className="text-gray-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Connect your favorite apps and services
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/createService"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Plus /> Create Service
              </Link>
              <Link
                to="/services"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                View All
              </Link>
            </div>
          </div>

          {/* Services Grid - 4 Visible Services with Horizontal Scroll */}
          {servicesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : servicesError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading services</p>
              <p className="text-gray-500 text-sm">{servicesError}</p>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No services available yet</p>
              <Link
                to="/createService"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Create Your First Service
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Fixed width container to show only 4 services - Centered with Animated Arrows */}
              <div className="flex items-center justify-center gap-4">
                {/* Left Arrow - Only show if there are more than 4 services */}
                {featuredServices.length > 4 && (
                  <div className="flex items-center">
                    <ChevronLeft 
                      className="w-6 h-6 text-purple-600 animate-pulse cursor-pointer hover:text-purple-700 transition-colors"
                      style={{
                        animation: 'bounceLeft 2s ease-in-out infinite'
                      }}
                    />
                  </div>
                )}

                <div
                  className="overflow-x-auto scrollbar-hide"
                  style={{ width: '475px', maxWidth: '100%' }} // Fixed width for exactly 4 services
                >
                  <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                    {featuredServices.map((service, index) => (
                      <Link
                        key={service.id}
                        to={`/services/${service.id}`}
                        className="group flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex-shrink-0 w-24"
                      >
                        <div className="w-12 h-12 mb-3 transition-transform duration-200 group-hover:scale-110">
                          <img
                            src={service.logo}
                            alt={`${service.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span
                          className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 text-center"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {service.name}
                        </span>
                        {index < 4 && (
                          <div className="mt-1 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right Arrow - Only show if there are more than 4 services */}
                {featuredServices.length > 4 && (
                  <div className="flex items-center">
                    <ChevronRight 
                      className="w-6 h-6 text-purple-600 animate-pulse cursor-pointer hover:text-purple-700 transition-colors"
                      style={{
                        animation: 'bounceRight 2s ease-in-out infinite'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Scroll indicator */}
              {featuredServices.length > 4 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(4, featuredServices.length) }, (_, i) => (
                        <div key={i} className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      ))}
                      {featuredServices.length > 4 && (
                        <>
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-xs text-gray-500">+{featuredServices.length - 4} more</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    ← Scroll to see all {featuredServices.length} services
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

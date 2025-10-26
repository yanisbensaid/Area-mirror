import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SERVICES = [
  { name: 'YouTube', color: 'from-red-500 to-red-600' },
  { name: 'Discord', color: 'from-indigo-500 to-indigo-600' },
  { name: 'Telegram', color: 'from-blue-500 to-blue-600' },
  { name: 'Gmail', color: 'from-red-400 to-pink-500' },
  { name: 'Steam', color: 'from-slate-600 to-slate-700' },
  { name: 'Twitch', color: 'from-purple-500 to-purple-600' },
]

interface ServiceStats {
  service_name: string
  total_areas: number
  active_areas: number
  total_triggers: number
  connected: boolean
}

const getServiceLogo = (serviceName: string) => {
  return `/logo/${serviceName}.png?v=3`
}

export default function ServicesPage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([])
  const [totalAreas, setTotalAreas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceStats = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        // Fetch all user AREAs
        const areasResponse = await fetch(`${API_URL}/api/areas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (!areasResponse.ok) throw new Error('Failed to fetch areas')

        const areasData = await areasResponse.json()
        const areas = areasData.data || []
        const totalUniqueAreas = areas.length // Store total unique areas count

        // Fetch connected services
        const servicesResponse = await fetch(`${API_URL}/api/services/connected`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        const servicesData = await servicesResponse.json()
        const connectedServices = servicesData.data?.connected_services || []
        const connectedServiceNames = connectedServices.map((s: any) => s.service)

        // Calculate stats for each service
        const stats: ServiceStats[] = SERVICES.map(service => {
          const serviceAreas = areas.filter((area: any) =>
            area.action_service === service.name || area.reaction_service === service.name
          )

          return {
            service_name: service.name,
            total_areas: serviceAreas.length,
            active_areas: serviceAreas.filter((a: any) => a.active).length,
            total_triggers: serviceAreas.reduce((sum: number, a: any) => sum + (a.trigger_count || 0), 0),
            connected: connectedServiceNames.includes(service.name)
          }
        })

        setServiceStats(stats)
        setTotalAreas(totalUniqueAreas)
        setError(null)
      } catch (err) {
        console.error('Error fetching service stats:', err)
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceStats()
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Please Login</h1>
            <p className="text-slate-300 mb-8">You need to be logged in to view your services</p>
            <Link to="/login" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Services</h1>
          <p className="text-slate-300 text-lg">Manage your connected services and automations</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total AREAs</div>
            <div className="text-3xl font-bold">{totalAreas}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Triggers</div>
            <div className="text-3xl font-bold">{serviceStats.reduce((sum, s) => sum + s.total_triggers, 0)}</div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const stats = serviceStats.find(s => s.service_name === service.name)
            const serviceColor = service.color

            return (
              <div
                key={service.name}
                onClick={() => navigate(`/services/${service.name}`)}
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all cursor-pointer hover:transform hover:scale-105"
              >

                {/* Service Logo */}
                <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow p-4">
                  <img
                    src={getServiceLogo(service.name)}
                    alt={service.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* Service Name */}
                <h3 className="text-xl font-bold mb-4">{service.name}</h3>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">AREAs</span>
                    <span className="font-semibold">{stats?.total_areas || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Active</span>
                    <span className="font-semibold text-green-400">{stats?.active_areas || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Triggers</span>
                    <span className="font-semibold text-purple-400">{stats?.total_triggers || 0}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">View AREAs</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create New AREA CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-8 border border-purple-500/30 text-center">
          <h2 className="text-2xl font-bold mb-2">Create New Automation</h2>
          <p className="text-slate-300 mb-6">Connect any service to any other and automate your workflows</p>
          <Link
            to="/createAutomation"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create AREA
          </Link>
        </div>
      </div>
    </div>
  )
}

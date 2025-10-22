import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Area {
  id: number
  name: string
  description: string
  action_service: string
  action_type: string
  reaction_service: string
  reaction_type: string
  active: boolean
  trigger_count: number
  last_triggered_at: string | null
  can_execute: boolean
  created_at: string
}

const getServiceLogo = (serviceName: string) => {
  return `/logo/${serviceName}.png?v=3`
}

export default function ServiceDetailPage() {
  const { serviceName } = useParams<{ serviceName: string }>()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const fetchServiceAreas = async () => {
      if (!isLoggedIn || !serviceName) {
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
        const allAreas = areasData.data || []

        // Filter AREAs related to this service
        const serviceAreas = allAreas.filter((area: Area) =>
          area.action_service === serviceName || area.reaction_service === serviceName
        )

        setAreas(serviceAreas)

        // Check if service is connected
        const checkResponse = await fetch(`${API_URL}/api/services/${serviceName}/check`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          setIsConnected(checkData.connected || false)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching service areas:', err)
        setError('Failed to load AREAs')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceAreas()
  }, [isLoggedIn, serviceName])

  const handleDeleteArea = async (areaId: number) => {
    if (!window.confirm('Are you sure you want to delete this AREA?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/areas/${areaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setAreas(areas.filter(a => a.id !== areaId))
      } else {
        alert('Failed to delete AREA')
      }
    } catch (err) {
      console.error('Error deleting AREA:', err)
      alert('Failed to delete AREA')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Please Login</h1>
            <p className="text-slate-300 mb-8">You need to be logged in to view this page</p>
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
          <p className="text-slate-300">Loading {serviceName} AREAs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/services" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Services
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-3">
              <img
                src={getServiceLogo(serviceName!)}
                alt={serviceName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{serviceName} AREAs</h1>
              <p className="text-slate-300">
                {isConnected ? (
                  <span className="text-green-400">✓ Connected</span>
                ) : (
                  <span className="text-slate-400">Not connected</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total AREAs</div>
            <div className="text-3xl font-bold">{areas.length}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Active AREAs</div>
            <div className="text-3xl font-bold text-green-400">{areas.filter(a => a.active).length}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Triggers</div>
            <div className="text-3xl font-bold text-purple-400">
              {areas.reduce((sum, a) => sum + (a.trigger_count || 0), 0)}
            </div>
          </div>
        </div>

        {/* AREAs List */}
        {areas.length > 0 ? (
          <div className="space-y-4">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Action Service Logo */}
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-2">
                        <img
                          src={getServiceLogo(area.action_service)}
                          alt={area.action_service}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>

                      {/* Reaction Service Logo */}
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-2">
                        <img
                          src={getServiceLogo(area.reaction_service)}
                          alt={area.reaction_service}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>

                      {/* Status Badge */}
                      <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                        area.active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}>
                        {area.active ? '✓ Active' : 'Inactive'}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{area.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{area.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div>
                        <span className="font-medium text-white">{area.trigger_count || 0}</span> triggers
                      </div>
                      {area.last_triggered_at && (
                        <div>
                          Last: {new Date(area.last_triggered_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/area/custom/${area.id}`)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium border border-red-500/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-12 border border-slate-700 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">No AREAs Yet</h3>
            <p className="text-slate-400 mb-6">
              You don't have any AREAs using {serviceName} yet. Create one to get started!
            </p>
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
        )}
      </div>
    </div>
  )
}

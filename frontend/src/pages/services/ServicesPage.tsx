import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  return `/logo/${serviceName}.png`
}

// Create a unique page for each custom AREA
const getAreaDetailRoute = (areaId: number) => {
  return `/area/custom/${areaId}`
}

export default function ServicesPage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Fetch user's custom AREAs
  useEffect(() => {
    const fetchAreas = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/areas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setAreas(data.data)
          }
          setError(null)
        } else {
          throw new Error('Failed to fetch areas')
        }
      } catch (err) {
        console.error('Error fetching areas:', err)
        setError('Failed to load your AREAs')
      } finally {
        setLoading(false)
      }
    }

    fetchAreas()
  }, [isLoggedIn])

  // Delete AREA handler
  const handleDelete = async (areaId: number) => {
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
        // Remove from local state
        setAreas(areas.filter(a => a.id !== areaId))
        setDeleteConfirm(null)
      } else {
        throw new Error('Failed to delete AREA')
      }
    } catch (err) {
      console.error('Error deleting AREA:', err)
      alert('Failed to delete AREA')
    }
  }

  // Filter areas
  const filteredAreas = areas.filter(area => {
    const matchesSearch = !searchQuery ||
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.action_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.reaction_service.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && area.active) ||
      (statusFilter === 'inactive' && !area.active)

    return matchesSearch && matchesStatus
  })

  if (!isLoggedIn) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to view your services</p>
            <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-6 md:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your AREAs...</p>
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
            My Services
          </h1>
          <p
            className="text-lg sm:text-xl md:text-xl text-gray-600 max-w-2xl mx-auto px-2"
            style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
          >
            Manage your custom automations created with AREA
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Total AREAs</h3>
            <p className="text-3xl font-bold text-gray-900">{areas.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">{areas.filter(a => a.active).length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm text-gray-600 font-medium mb-2">Total Triggers</h3>
            <p className="text-3xl font-bold text-blue-600">{areas.reduce((sum, a) => sum + a.trigger_count, 0)}</p>
          </div>
        </div>

        {/* Create New AREA Button */}
        <div className="mb-8">
          <Link
            to="/createAutomation"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New AREA
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name, service..."
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredAreas.length} of {areas.length} AREAs
          </p>
        </div>

        {/* AREAs Grid (Cards like ExplorePage) */}
        {filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area) => (
              <div
                key={area.id}
                className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(area.id)
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 z-10"
                  title="Delete AREA"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Clickable area card */}
                <div
                  onClick={() => navigate(getAreaDetailRoute(area.id))}
                  className="cursor-pointer"
                >
                  {/* Status badge */}
                  <div className="flex justify-between items-start mb-4 pr-8">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                      Custom
                    </span>
                    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                      area.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {area.active ? '✓ Active' : '○ Inactive'}
                    </span>
                  </div>

                {/* Services flow */}
                <div className="flex items-center justify-between mb-6">
                  {/* Action service */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm p-2">
                      <img
                        src={getServiceLogo(area.action_service)}
                        alt={area.action_service}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <span
                      className="text-xs text-gray-600 font-medium text-center"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {area.action_service}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex-1 flex items-center justify-center px-3">
                    <div className="w-full h-px bg-gray-300 relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rotate-45 translate-x-1/2"></div>
                    </div>
                  </div>

                  {/* Reaction service */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm p-2">
                      <img
                        src={getServiceLogo(area.reaction_service)}
                        alt={area.reaction_service}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <span
                      className="text-xs text-gray-600 font-medium text-center"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {area.reaction_service}
                    </span>
                  </div>
                </div>

                {/* AREA details */}
                <div>
                  <h3
                    className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {area.name}
                  </h3>
                  <p
                    className="text-gray-600 text-sm leading-relaxed mb-4"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                  >
                    {area.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                      {area.trigger_count} triggers
                    </span>
                    {area.last_triggered_at && (
                      <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                        Last: {new Date(area.last_triggered_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="mt-4">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 inline-flex items-center">
                      View details →
                    </span>
                  </div>
                </div>
              </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No AREAs found' : 'No custom AREAs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first custom automation to get started'}
            </p>
            <Link
              to="/createAutomation"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First AREA
            </Link>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Delete AREA?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this AREA? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

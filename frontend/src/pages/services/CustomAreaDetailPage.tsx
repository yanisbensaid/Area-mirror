import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
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

export default function CustomAreaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  // Detect if coming from Explore page
  const fromExplore = location.state?.fromExplore || document.referrer.includes('/explore')

  const [area, setArea] = useState<Area | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  // Service connection states
  const [servicesConnected, setServicesConnected] = useState<{[key: string]: boolean}>({})
  const [showConnectionModal, setShowConnectionModal] = useState<string | null>(null)

  // Generic service credentials
  const [credentials, setCredentials] = useState<{[key: string]: string}>({})
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Fetch AREA details
  useEffect(() => {
    const fetchArea = async () => {
      if (!isLoggedIn || !id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/areas/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setArea(data.data)

            // Check which services are connected
            const actionConnected = await checkServiceConnection(data.data.action_service, token!)
            const reactionConnected = await checkServiceConnection(data.data.reaction_service, token!)

            setServicesConnected({
              [data.data.action_service]: actionConnected,
              [data.data.reaction_service]: reactionConnected
            })
          }
          setError(null)
        } else {
          throw new Error('Failed to fetch AREA')
        }
      } catch (err) {
        console.error('Error fetching AREA:', err)
        setError('Failed to load AREA details')
      } finally {
        setLoading(false)
      }
    }

    fetchArea()
  }, [isLoggedIn, id])

  const checkServiceConnection = async (serviceName: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/services/${serviceName}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      return data.connected || false
    } catch {
      return false
    }
  }

  const handleDisconnectService = async (serviceName: string) => {
    if (!window.confirm(`Disconnect ${serviceName}?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/services/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ service: serviceName })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setServicesConnected(prev => ({ ...prev, [serviceName]: false }))
      }
    } catch (err) {
      console.error('Error disconnecting service:', err)
    }
  }

  const handleToggleArea = async () => {
    if (!area) return

    setToggling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/areas/${area.id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setArea(prev => prev ? { ...prev, active: !prev.active } : null)
      } else {
        alert(data.message || 'Failed to toggle AREA')
      }
    } catch (err) {
      console.error('Error toggling AREA:', err)
      alert('Failed to toggle AREA')
    } finally {
      setToggling(false)
    }
  }

  const handleConnectService = async (serviceName: string) => {
    setConnecting(true)
    setConnectionError(null)

    // For OAuth services (YouTube, Gmail, Twitch, Discord), open popup
    if (serviceName === 'YouTube' || serviceName === 'Gmail' || serviceName === 'Twitch' || serviceName === 'Discord') {
      const token = localStorage.getItem('token')
      const popup = window.open(
        `${API_URL}/api/oauth/${serviceName.toLowerCase()}/redirect?token=${token}`,
        `${serviceName} Connection`,
        'width=600,height=700'
      )

      // Poll to check if popup was closed
      const pollTimer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(pollTimer)
          setConnecting(false)
          // Refresh to check connection status
          window.location.reload()
        }
      }, 500)

      return
    }

    // For other services (Telegram, Discord, Steam), open modal
    setShowConnectionModal(serviceName)
    setConnecting(false)
  }

  const handleSubmitConnection = async () => {
    if (!showConnectionModal) return

    setConnecting(true)
    setConnectionError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/services/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          service: showConnectionModal,
          credentials: credentials
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setServicesConnected(prev => ({ ...prev, [showConnectionModal]: true }))
        setShowConnectionModal(null)
        setCredentials({})
        setConnectionError(null)
        // Refresh to update connection status
        window.location.reload()
      } else {
        setConnectionError(data.message || 'Failed to connect service')
      }
    } catch (err) {
      setConnectionError('Network error occurred')
    } finally {
      setConnecting(false)
    }
  }

  const getServiceConnectionFields = (serviceName: string) => {
    switch (serviceName) {
      case 'Telegram':
        // Show Telegram guide and fields
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold mb-3 text-purple-400">How to get Bot Token and Chat ID:</h4>

              <div className="mb-4">
                <h5 className="font-semibold text-slate-200 mb-2">🤖 Get Bot Token:</h5>
                <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside ml-2">
                  <li>Open Telegram and search for <strong>@BotFather</strong></li>
                  <li>Send <code className="bg-slate-800 px-1 rounded">/newbot</code> and follow instructions</li>
                  <li>Copy the bot token (format: <code className="bg-slate-800 px-1 rounded">123456:ABC...</code>)</li>
                </ol>
              </div>

              <div>
                <h5 className="font-semibold text-slate-200 mb-2">💬 Get Chat ID:</h5>
                <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside ml-2">
                  <li>Search for <strong>@userinfobot</strong> on Telegram</li>
                  <li>Send <code className="bg-slate-800 px-1 rounded">/start</code> to the bot</li>
                  <li>The bot will reply with your Chat ID</li>
                  <li>Copy your Chat ID (number like <code className="bg-slate-800 px-1 rounded">123456789</code>)</li>
                </ol>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bot Token <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={credentials.bot_token || ''}
                onChange={(e) => setCredentials({ ...credentials, bot_token: e.target.value })}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chat ID <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={credentials.chat_id || ''}
                onChange={(e) => setCredentials({ ...credentials, chat_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="123456789"
              />
            </div>
          </div>
        )

      case 'Discord':
        // Discord uses OAuth2 - no manual fields needed
        return null

      case 'Steam':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="text"
                value={credentials.api_key || ''}
                onChange={(e) => setCredentials({ ...credentials, api_key: e.target.value })}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Your Steam API key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Steam ID</label>
              <input
                type="text"
                value={credentials.steam_id || ''}
                onChange={(e) => setCredentials({ ...credentials, steam_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-600 bg-slate-900 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Your Steam ID (17 digits)"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please Login</h1>
            <p className="text-slate-300 mb-8">You need to be logged in to view this AREA</p>
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
      <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading AREA details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !area) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ {error || 'AREA not found'}</div>
            <Link
              to={fromExplore ? "/explore" : "/services"}
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500"
            >
              {fromExplore ? "Back to Explore" : "Back to My Services"}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const bothServicesConnected = servicesConnected[area.action_service] && servicesConnected[area.reaction_service]

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto py-12">
        {/* Back button */}
        <Link to={fromExplore ? "/explore" : "/services"} className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {fromExplore ? "Back to Explore" : "Back to My Services"}
        </Link>

        {/* AREA Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block bg-purple-600/30 text-purple-400 text-sm font-medium px-3 py-1 rounded-full">
              Custom AREA
            </span>
            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
              area.active
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-700/50 text-slate-300'
            }`}>
              {area.active ? '✓ Active' : '○ Inactive'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{area.name}</h1>
          <p className="text-slate-300 text-lg mb-6">{area.description}</p>

          {/* Services Flow */}
          <div className="flex items-center justify-center gap-8 mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            {/* Action Service */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-white border border-slate-700 flex items-center justify-center mb-3 shadow-sm p-3">
                <img
                  src={getServiceLogo(area.action_service)}
                  alt={area.action_service}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <span className="text-sm font-medium text-white">{area.action_service}</span>
              <span className="text-xs text-slate-400 mt-1">{area.action_type}</span>
            </div>

            {/* Arrow */}
            <div className="text-4xl text-slate-400">→</div>

            {/* Reaction Service */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-white border border-slate-700 flex items-center justify-center mb-3 shadow-sm p-3">
                <img
                  src={getServiceLogo(area.reaction_service)}
                  alt={area.reaction_service}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <span className="text-sm font-medium text-white">{area.reaction_service}</span>
              <span className="text-xs text-slate-400 mt-1">{area.reaction_type}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300">Triggers</p>
              <p className="text-2xl font-bold text-white">{area.trigger_count}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300">Last Triggered</p>
              <p className="text-lg font-semibold text-white">
                {area.last_triggered_at
                  ? new Date(area.last_triggered_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Service Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Action Service */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-700 flex items-center justify-center mr-3 p-2">
                <img
                  src={getServiceLogo(area.action_service)}
                  alt={area.action_service}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{area.action_service}</h3>
                <p className="text-sm text-slate-300">Action Service</p>
              </div>
            </div>

            {servicesConnected[area.action_service] ? (
              <>
                <div className="flex items-center text-green-600 mb-3">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connected
                </div>
                <button
                  onClick={() => handleDisconnectService(area.action_service)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors border border-red-200"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center text-slate-400 mb-3">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Not connected
                </div>
                <button
                  onClick={() => handleConnectService(area.action_service)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Connect
                </button>
              </>
            )}
          </div>

          {/* Reaction Service */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-700 flex items-center justify-center mr-3 p-2">
                <img
                  src={getServiceLogo(area.reaction_service)}
                  alt={area.reaction_service}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{area.reaction_service}</h3>
                <p className="text-sm text-slate-300">Reaction Service</p>
              </div>
            </div>

            {servicesConnected[area.reaction_service] ? (
              <>
                <div className="flex items-center text-green-600 mb-3">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connected
                </div>
                <button
                  onClick={() => handleDisconnectService(area.reaction_service)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors border border-red-200"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center text-slate-400 mb-3">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Not connected
                </div>
                <button
                  onClick={() => handleConnectService(area.reaction_service)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Connect
                </button>
              </>
            )}
          </div>
        </div>

        {/* Activate/Deactivate Button */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          {!bothServicesConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Connect both services to activate this AREA
              </p>
            </div>
          )}

          <button
            onClick={handleToggleArea}
            disabled={!bothServicesConnected || toggling}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              area.active
                ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-700 disabled:opacity-50'
                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-700 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            {toggling ? 'Processing...' : (area.active ? 'Deactivate AREA' : 'Activate AREA')}
          </button>
        </div>

        {/* Connection Modal */}
        {showConnectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Connect {showConnectionModal}</h3>

              {getServiceConnectionFields(showConnectionModal)}

              {connectionError && (
                <div className="mt-4 bg-red-500/10 border border-red-500 text-red-200 text-red-700 px-4 py-3 rounded">
                  {connectionError}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowConnectionModal(null)
                    setCredentials({})
                    setConnectionError(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitConnection}
                  disabled={connecting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:bg-slate-700 disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

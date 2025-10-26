import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiUrl } from '../../config/api'  // Keep for login redirect

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

interface UserArea {
  id: number
  name: string
  active: boolean
  trigger_count: number
  last_triggered_at: string | null
  can_execute: boolean
}

export default function AREATemplatesPage() {
  const [templates, setTemplates] = useState<AREATemplate[]>([])
  const [userAreas, setUserAreas] = useState<UserArea[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Telegram connection modal state
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [telegramError, setTelegramError] = useState<string | null>(null)

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // Fetch templates and user's AREAs
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch templates
        const templatesRes = await fetch(getApiUrl('areas/templates'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const templatesData = await templatesRes.json()

        // Fetch user's AREAs
        const areasRes = await fetch(getApiUrl('areas'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const areasData = await areasRes.json()

        if (templatesData.success) {
          setTemplates(templatesData.data)
        }

        if (areasData.success) {
          setUserAreas(areasData.data)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching AREA data:', err)
        setError('Failed to load AREA templates')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoggedIn, token])

  const handleConnectYouTube = async () => {
    try {
      setConnecting('YouTube')

      const response = await fetch('http://localhost:8000/api/oauth/youtube', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.auth_url) {
        // Open OAuth popup
        const popup = window.open(
          data.auth_url,
          'YouTube OAuth',
          'width=600,height=700,left=200,top=100'
        )

        // Poll for connection status
        const checkInterval = setInterval(async () => {
          try {
            const templatesRes = await fetch('http://localhost:8000/api/areas/templates', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
            const templatesData = await templatesRes.json()

            if (templatesData.success && templatesData.data.length > 0) {
              const template = templatesData.data[0]
              if (template.services_connected?.YouTube) {
                clearInterval(checkInterval)
                popup?.close()
                setConnecting(null)
                // Refresh templates
                setTemplates(templatesData.data)
              }
            }
          } catch (error) {
            console.error('Error checking connection:', error)
          }
        }, 2000)

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval)
          setConnecting(null)
        }, 300000)
      }
    } catch (error) {
      console.error('YouTube connection failed:', error)
      setConnecting(null)
    }
  }

  const handleCreateArea = async (templateId: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/areas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          template_id: templateId,
          name: 'YouTube to Telegram'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh user areas
        const areasRes = await fetch('http://localhost:8000/api/areas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const areasData = await areasRes.json()
        if (areasData.success) {
          setUserAreas(areasData.data)
        }
      }
    } catch (error) {
      console.error('Failed to create AREA:', error)
    }
  }

  const handleToggleArea = async (areaId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/areas/${areaId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setUserAreas(prev => prev.map(area =>
          area.id === areaId ? { ...area, active: !area.active } : area
        ))
      }
    } catch (error) {
      console.error('Failed to toggle AREA:', error)
    }
  }

  const handleConnectTelegram = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTelegramError('Please enter both Bot Token and Chat ID')
      return
    }

    try {
      setConnecting('Telegram')
      setTelegramError(null)

      const response = await fetch('http://localhost:8000/api/services/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          service: 'Telegram',
          credentials: {
            bot_token: botToken,
            chat_id: chatId
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Success - refresh templates to update connection status
        const templatesRes = await fetch('http://localhost:8000/api/areas/templates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const templatesData = await templatesRes.json()
        if (templatesData.success) {
          setTemplates(templatesData.data)
        }

        // Close modal and reset form
        setShowTelegramModal(false)
        setBotToken('')
        setChatId('')
      } else {
        setTelegramError(data.message || 'Failed to connect Telegram')
      }
    } catch (error) {
      console.error('Telegram connection failed:', error)
      setTelegramError('Connection failed. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AREA Automations</h1>
          <p className="text-gray-600 mb-6">Please log in to view and create automations</p>
          <Link to="/auth/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Log In
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            AREA Automations
          </h1>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Connect services and create powerful automated workflows
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading automations...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && templates.map(template => {
          const existingArea = userAreas.find(area => area.name.includes(template.name))
          const actionServiceConnected = template.services_connected[template.action_service]
          const reactionServiceConnected = template.services_connected[template.reaction_service]

          // Service logo mapping
          const serviceLogo: { [key: string]: { src: string, fallback: string } } = {
            'YouTube': {
              src: '/logo/youtube.png',
              fallback: 'https://www.youtube.com/s/desktop/7a7c6e5b/img/favicon_144x144.png'
            },
            'Twitch': {
              src: '/logo/twitch.png',
              fallback: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png'
            },
            'Telegram': {
              src: '/logo/telegram.png',
              fallback: 'https://telegram.org/img/t_logo.png'
            }
          }

          return (
            <div key={template.id} className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {/* Service Icons */}
              <div className="flex items-center justify-center mb-6 space-x-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={serviceLogo[template.action_service]?.src || '/logo/default.png'}
                    alt={template.action_service}
                    className="w-12 h-12 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = serviceLogo[template.action_service]?.fallback || ''
                    }}
                  />
                  <span className="text-2xl">→</span>
                  <img
                    src={serviceLogo[template.reaction_service]?.src || '/logo/default.png'}
                    alt={template.reaction_service}
                    className="w-12 h-12 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = serviceLogo[template.reaction_service]?.fallback || ''
                    }}
                  />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{template.name}</h2>
              <p className="text-gray-600 text-center mb-6">{template.description}</p>

              {/* View Details Link */}
              <div className="text-center mb-6">
                <Link
                  to={`/area/${template.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                >
                  <span>View Full Details</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Connection Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${actionServiceConnected ? '🟢' : '🔴'}`}>
                    {actionServiceConnected ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{template.action_service}</p>
                    <p className="text-sm text-gray-600">
                      {actionServiceConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${reactionServiceConnected ? '🟢' : '🔴'}`}>
                    {reactionServiceConnected ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{template.reaction_service}</p>
                    <p className="text-sm text-gray-600">
                      {reactionServiceConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats if AREA exists */}
              {existingArea && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-bold ${existingArea.active ? 'text-green-600' : 'text-gray-400'}`}>
                          {existingArea.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Triggers</p>
                        <p className="font-bold text-gray-900">{existingArea.trigger_count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Triggered</p>
                        <p className="font-bold text-gray-900 text-xs">
                          {existingArea.last_triggered_at
                            ? new Date(existingArea.last_triggered_at).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Telegram Connection Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Connect Telegram Bot</h2>
              <button
                onClick={() => {
                  setShowTelegramModal(false)
                  setTelegramError(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">📋 Setup Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                <li>Send <code className="bg-blue-100 px-1 rounded">/newbot</code> and follow instructions</li>
                <li>Copy your bot token</li>
                <li>Get your Chat ID from <strong>@userinfobot</strong></li>
                <li>Paste both below</li>
              </ol>
            </div>

            {/* Error Message */}
            {telegramError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{telegramError}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Token
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chat ID
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="1744435104"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleConnectTelegram}
                disabled={connecting === 'Telegram'}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {connecting === 'Telegram' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect Bot</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

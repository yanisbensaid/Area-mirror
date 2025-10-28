import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

export default function YouTubeGmailAreaPage() {
  const { isLoggedIn } = useAuth()

  const getToken = () => localStorage.getItem('token')

  const [template, setTemplate] = useState<AREATemplate | null>(null)
  const [userArea, setUserArea] = useState<UserArea | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const token = localStorage.getItem('token')
        if (!token) return

        const templatesRes = await fetch(`${API_URL}/api/areas/templates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const templatesData = await templatesRes.json()

        const areasRes = await fetch(`${API_URL}/api/areas`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        const areasData = await areasRes.json()

        if (templatesData.success && templatesData.data.length > 0) {
          const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_gmail')
          setTemplate(foundTemplate || null)

          if (areasData.success && foundTemplate) {
            const matchingArea = areasData.data.find((area: UserArea) =>
              area.name.includes(foundTemplate.name)
            )
            setUserArea(matchingArea || null)
          }
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching AREA data:', err)
        setError('Failed to load AREA details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for OAuth success messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === 'OAUTH_SUCCESS') {
        // Refresh data when OAuth succeeds
        fetchData()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isLoggedIn])

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const templatesRes = await fetch(`${API_URL}/api/areas/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const templatesData = await templatesRes.json()
      if (templatesData.success && templatesData.data.length > 0) {
        const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_gmail')
        setTemplate(foundTemplate || null)
      }

      const areasRes = await fetch(`${API_URL}/api/areas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const areasData = await areasRes.json()
      if (areasData.success) {
        const matchingArea = areasData.data.find((area: UserArea) =>
          area.name.includes('YouTube to Gmail')
        )
        setUserArea(matchingArea || null)
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  const handleConnectYouTube = async () => {
    try {
      setConnecting('YouTube')
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found')
        setConnecting(null)
        return
      }

      const response = await fetch(`${API_URL}/api/oauth/youtube`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Failed to generate OAuth URL')
        setConnecting(null)
        return
      }

      if (data.success && data.auth_url) {
        const popup = window.open(
          data.auth_url,
          'YouTube OAuth',
          'width=600,height=700,left=200,top=100'
        )

        if (!popup) {
          setError('Popup blocked. Please allow popups for this site.')
          setConnecting(null)
          return
        }

        const checkInterval = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(checkInterval)
              setConnecting(null)
              return
            }

            const templatesRes = await fetch(`${API_URL}/api/areas/templates`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
            const templatesData = await templatesRes.json()

            if (templatesData.success && templatesData.data.length > 0) {
              const updatedTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_gmail')
              if (updatedTemplate?.services_connected?.YouTube) {
                clearInterval(checkInterval)
                popup?.close()
                setConnecting(null)
                setTemplate(updatedTemplate)
              }
            }
          } catch (error) {
            console.error('Error checking connection:', error)
          }
        }, 2000)

        setTimeout(() => {
          clearInterval(checkInterval)
          setConnecting(null)
          if (!popup.closed) {
            setError('Connection timeout. Please try again.')
          }
        }, 300000)
      }
    } catch (error) {
      console.error('YouTube connection failed:', error)
      setError('Failed to connect YouTube. Please check console for details.')
      setConnecting(null)
    }
  }

  const handleDisconnectYouTube = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services/YouTube/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        await refreshData()
      }
    } catch (error) {
      console.error('Failed to disconnect YouTube:', error)
    }
  }

  const handleConnectGmail = async () => {
    try {
      setConnecting('Gmail')
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found')
        setConnecting(null)
        return
      }

      const response = await fetch(`${API_URL}/api/oauth/gmail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Failed to generate OAuth URL')
        setConnecting(null)
        return
      }

      if (data.success && data.auth_url) {
        const popup = window.open(
          data.auth_url,
          'Gmail OAuth',
          'width=600,height=700,left=200,top=100'
        )

        if (!popup) {
          setError('Popup blocked. Please allow popups for this site.')
          setConnecting(null)
          return
        }

        const checkInterval = setInterval(async () => {
          try {
            if (popup.closed) {
              clearInterval(checkInterval)
              setConnecting(null)
              return
            }

            const templatesRes = await fetch(`${API_URL}/api/areas/templates`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
            const templatesData = await templatesRes.json()

            if (templatesData.success && templatesData.data.length > 0) {
              const updatedTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_gmail')
              if (updatedTemplate?.services_connected?.Gmail) {
                clearInterval(checkInterval)
                popup?.close()
                setConnecting(null)
                setTemplate(updatedTemplate)
              }
            }
          } catch (error) {
            console.error('Error checking connection:', error)
          }
        }, 2000)

        setTimeout(() => {
          clearInterval(checkInterval)
          setConnecting(null)
          if (!popup.closed) {
            setError('Connection timeout. Please try again.')
          }
        }, 300000)
      }
    } catch (error) {
      console.error('Gmail connection failed:', error)
      setError('Failed to connect Gmail. Please check console for details.')
      setConnecting(null)
    }
  }

  const handleDisconnectGmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services/Gmail/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        await refreshData()
      }
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error)
    }
  }

  const handleCreateArea = async () => {
    if (!template) return

    try {
      setCreating(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/areas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          template_id: template.id,
          name: 'YouTube to Gmail'
        })
      })

      const data = await response.json()

      if (data.success) {
        await refreshData()
        setError(null)
      } else {
        setError(data.error || 'Failed to create automation')
      }
    } catch (error) {
      console.error('Failed to create AREA:', error)
      setError('Failed to create automation. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleArea = async () => {
    if (!userArea || toggling) return

    const previousState = userArea.active

    try {
      setToggling(true)
      setError(null)

      setUserArea(prev => prev ? { ...prev, active: !prev.active } : null)

      const response = await fetch(`${API_URL}/api/areas/${userArea.id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (!data.success) {
        setUserArea(prev => prev ? { ...prev, active: previousState } : null)
        setError(data.error || 'Failed to toggle automation')
      } else {
        // Refresh to get latest state
        await refreshData()
      }
    } catch (error) {
      console.error('Failed to toggle AREA:', error)
      setUserArea(prev => prev ? { ...prev, active: previousState } : null)
      setError('Failed to toggle automation. Please try again.')
    } finally {
      setToggling(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">YouTube to Gmail</h1>
          <p className="text-slate-300 mb-6">Please log in to configure this automation</p>
          <Link to="/login" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors">
            Log In
          </Link>
        </div>
      </main>
    )
  }

  const isYouTubeConnected = template?.services_connected.YouTube || false
  const isGmailConnected = template?.services_connected.Gmail || false

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto py-6 md:py-12">
        <nav className="mb-6">
          <Link to="/services" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Services
          </Link>
        </nav>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-slate-300">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && template && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-center mb-6 space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo/YouTube.png?v=3"
                  alt="YouTube"
                  className="w-12 h-12 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://www.youtube.com/s/desktop/7a7c6e5b/img/favicon_144x144.png'
                  }}
                />
                <span className="text-2xl">→</span>
                <img
                  src="/logo/Gmail.png?v=3"
                  alt="Gmail"
                  className="w-12 h-12 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
                  }}
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">{template.name}</h1>
            <p className="text-slate-300 text-center mb-8">{template.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${isYouTubeConnected ? '🟢' : '🔴'}`}>
                    {isYouTubeConnected ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-medium text-white">YouTube</p>
                    <p className="text-sm text-slate-300">
                      {isYouTubeConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                {isYouTubeConnected && (
                  <button
                    onClick={handleDisconnectYouTube}
                    className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${isGmailConnected ? '🟢' : '🔴'}`}>
                    {isGmailConnected ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-medium text-white">Gmail</p>
                    <p className="text-sm text-slate-300">
                      {isGmailConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                {isGmailConnected && (
                  <button
                    onClick={handleDisconnectGmail}
                    className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {(!isYouTubeConnected || !isGmailConnected) && (
              <div className="border-t border-slate-700 pt-6 mb-6">
                <h3 className="font-semibold text-white mb-4">Connect Services</h3>
                <div className="space-y-3">
                  {!isYouTubeConnected && (
                    <button
                      onClick={handleConnectYouTube}
                      disabled={connecting === 'YouTube'}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {connecting === 'YouTube' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>🔗</span>
                          <span>Connect YouTube</span>
                        </>
                      )}
                    </button>
                  )}

                  {!isGmailConnected && (
                    <button
                      onClick={handleConnectGmail}
                      disabled={connecting === 'Gmail'}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {connecting === 'Gmail' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>🔗</span>
                          <span>Connect Gmail</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {template.can_activate && (
              <div className="border-t border-slate-700 pt-6">
                {!userArea ? (
                  <button
                    onClick={handleCreateArea}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Create Automation</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-slate-300">Status</p>
                          <p className={`font-bold ${userArea.active ? 'text-green-600' : 'text-slate-400'}`}>
                            {userArea.active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-300">Triggers</p>
                          <p className="font-bold text-white">{userArea.trigger_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-300">Last Triggered</p>
                          <p className="font-bold text-white">
                            {userArea.last_triggered_at
                              ? new Date(userArea.last_triggered_at).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleArea}
                      disabled={toggling}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                        userArea.active
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {toggling ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>{userArea.active ? 'Deactivating...' : 'Activating...'}</span>
                        </>
                      ) : (
                        <span>{userArea.active ? '⏸️ Deactivate' : '▶️ Activate'}</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

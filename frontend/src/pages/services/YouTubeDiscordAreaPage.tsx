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

export default function YouTubeDiscordAreaPage() {
  const { isLoggedIn } = useAuth()

  const getToken = () => localStorage.getItem('token')

  const [template, setTemplate] = useState<AREATemplate | null>(null)
  const [userArea, setUserArea] = useState<UserArea | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Discord webhook configuration for reactions
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookError, setWebhookError] = useState<string | null>(null)

  // Fetch template and user's AREA
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
          const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_discord')
          setTemplate(foundTemplate || null)

          if (areasData.success && foundTemplate) {
            const matchingArea = areasData.data.find((area: UserArea) =>
              area.name.includes('YouTube to Discord')
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
    const token = getToken()
    if (!token) return

    try {
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

      if (templatesData.success) {
        const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'youtube_to_discord')
        setTemplate(foundTemplate || null)

        if (areasData.success && foundTemplate) {
          const matchingArea = areasData.data.find((area: UserArea) =>
            area.name.includes('YouTube to Discord')
          )
          setUserArea(matchingArea || null)
        }
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  const handleConnectYouTube = () => {
    const token = getToken()
    window.location.href = `${API_URL}/api/oauth/youtube/redirect?token=${token}`
  }

  const handleDisconnectYouTube = async () => {
    if (!confirm('Are you sure you want to disconnect YouTube? This will deactivate any active AREAs using this service.')) {
      return
    }

    setConnecting('YouTube')
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/YouTube/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        await refreshData()
      } else {
        setError(data.message || 'Failed to disconnect YouTube')
      }
    } catch (err) {
      console.error('Error disconnecting YouTube:', err)
      setError('Failed to disconnect YouTube')
    } finally {
      setConnecting(null)
    }
  }

  const handleConnectDiscord = () => {
    const token = getToken()
    const popup = window.open(
      `${API_URL}/api/oauth/discord/redirect?token=${token}`,
      'Discord OAuth',
      'width=600,height=700,left=200,top=100'
    )

    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.')
      return
    }

    // Poll to check if popup was closed
    const pollTimer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(pollTimer)
        await refreshData()
      }
    }, 500)
  }

  const handleDisconnectDiscord = async () => {
    if (!confirm('Are you sure you want to disconnect Discord? This will deactivate any active AREAs using this service.')) {
      return
    }

    setConnecting('Discord')
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/Discord/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        await refreshData()
      } else {
        setError(data.message || 'Failed to disconnect Discord')
      }
    } catch (err) {
      console.error('Error disconnecting Discord:', err)
      setError('Failed to disconnect Discord')
    } finally {
      setConnecting(null)
    }
  }

  const handleCreateAreaClick = () => {
    // Show modal to configure webhook before creating AREA
    setShowWebhookModal(true)
    setWebhookError(null)
  }

  const handleCreateArea = async () => {
    if (!template) return

    // Validate webhook URL
    if (!webhookUrl.trim()) {
      setWebhookError('Webhook URL is required')
      return
    }

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setWebhookError('Invalid Discord webhook URL')
      return
    }

    setCreating(true)
    setWebhookError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/areas/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          action_service: 'YouTube',
          action_type: 'video_liked',
          action_config: {},
          reaction_service: 'Discord',
          reaction_type: 'send_message',
          reaction_config: {
            webhook_url: webhookUrl,
            content: '🎥 New video liked!\n{title}\n{url}'
          },
          active: false
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowWebhookModal(false)
        await refreshData()
      } else {
        setWebhookError(data.error || 'Failed to create AREA')
      }
    } catch (err) {
      console.error('Error creating AREA:', err)
      setWebhookError('Failed to create AREA')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleArea = async () => {
    if (!userArea) return

    setToggling(true)
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/areas/${userArea.id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        await refreshData()
      } else {
        setError(data.error || 'Failed to toggle AREA')
      }
    } catch (err) {
      console.error('Error toggling AREA:', err)
      setError('Failed to toggle AREA')
    } finally {
      setToggling(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-slate-300 mb-8">You need to be logged in to access this page</p>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">AREA Not Found</h1>
          <p className="text-slate-300 mb-8">The YouTube to Discord AREA template could not be found</p>
          <Link to="/services" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition">
            Back to Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/services" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Services
          </Link>
          <h1 className="text-4xl font-bold mb-2">{template.name}</h1>
          <p className="text-slate-300 text-lg">{template.description}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Service Connection Status */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-4">Required Services</h2>

          <div className="space-y-4">
            {/* YouTube Connection */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${template.services_connected.YouTube ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold">YouTube</h3>
                  <p className="text-sm text-slate-400">Video platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!template.services_connected.YouTube && (
                  <button
                    onClick={handleConnectYouTube}
                    disabled={connecting === 'YouTube'}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {connecting === 'YouTube' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                {template.services_connected.YouTube && (
                  <>
                    <span className="text-green-500 font-semibold flex items-center">✓ Connected</span>
                    <button
                      onClick={handleDisconnectYouTube}
                      disabled={connecting === 'YouTube'}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {connecting === 'YouTube' ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Discord Connection */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${template.services_connected.Discord ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold">Discord</h3>
                  <p className="text-sm text-slate-400">Chat platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!template.services_connected.Discord && (
                  <button
                    onClick={handleConnectDiscord}
                    disabled={connecting === 'Discord'}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {connecting === 'Discord' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                {template.services_connected.Discord && (
                  <>
                    <span className="text-green-500 font-semibold flex items-center">✓ Connected</span>
                    <button
                      onClick={handleDisconnectDiscord}
                      disabled={connecting === 'Discord'}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {connecting === 'Discord' ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AREA Status */}
        {userArea && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4">AREA Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <p className={`text-lg font-semibold ${userArea.active ? 'text-green-500' : 'text-red-500'}`}>
                  {userArea.active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Trigger Count</p>
                <p className="text-lg font-semibold">{userArea.trigger_count}</p>
              </div>
            </div>
            {userArea.last_triggered_at && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm">Last Triggered</p>
                <p className="text-lg">{new Date(userArea.last_triggered_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!userArea && template.can_activate && (
            <button
              onClick={handleCreateAreaClick}
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create AREA'}
            </button>
          )}

          {userArea && (
            <button
              onClick={handleToggleArea}
              disabled={toggling || !userArea.can_execute}
              className={`flex-1 px-8 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 ${
                userArea.active
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {toggling ? 'Processing...' : userArea.active ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>

        {!template.can_activate && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500 text-yellow-200 px-6 py-4 rounded-lg">
            Please connect both YouTube and Discord services to create this AREA
          </div>
        )}
      </div>

      {/* Webhook Configuration Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Configure Discord Webhook</h3>
            <p className="text-slate-300 mb-6">
              When you like a video on YouTube, a message with the video link will be automatically sent to your Discord channel.
            </p>

            {/* Guide to get webhook */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
              <h4 className="font-semibold mb-3 text-purple-400">How to get a Discord Webhook URL:</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">1.</span>
                  <span>Open your Discord server and go to <strong>Server Settings</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">2.</span>
                  <span>Navigate to <strong>Integrations</strong> → <strong>Webhooks</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">3.</span>
                  <span>Click <strong>New Webhook</strong> or select an existing one</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">4.</span>
                  <span>Choose the channel where messages will be sent and click <strong>Copy Webhook URL</strong></span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Discord Webhook URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>

            {webhookError && (
              <div className="mt-4 bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded">
                {webhookError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWebhookModal(false)}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArea}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create AREA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

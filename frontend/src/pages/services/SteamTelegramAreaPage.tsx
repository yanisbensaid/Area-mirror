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

export default function SteamTelegramAreaPage() {
  const { isLoggedIn } = useAuth()

  const getToken = () => localStorage.getItem('token')

  const [template, setTemplate] = useState<AREATemplate | null>(null)
  const [userArea, setUserArea] = useState<UserArea | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [toggling, setToggling] = useState(false)

  // Steam connection modal state
  const [showSteamModal, setShowSteamModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [steamId, setSteamId] = useState('')
  const [steamError, setSteamError] = useState<string | null>(null)

  // Telegram connection modal state
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [botToken, setBotToken] = useState('')
  const [telegramError, setTelegramError] = useState<string | null>(null)

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
          const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'steam_to_telegram')
          setTemplate(foundTemplate || null)

          if (areasData.success && foundTemplate) {
            const matchingArea = areasData.data.find((area: UserArea) =>
              area.name.includes('Steam to Telegram')
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
        const foundTemplate = templatesData.data.find((t: AREATemplate) => t.id === 'steam_to_telegram')
        setTemplate(foundTemplate || null)

        if (areasData.success && foundTemplate) {
          const matchingArea = areasData.data.find((area: UserArea) =>
            area.name.includes('Steam to Telegram')
          )
          setUserArea(matchingArea || null)
        }
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  const handleConnectSteam = async () => {
    setSteamError(null)
    setConnecting('Steam')

    if (!apiKey.trim() || !steamId.trim()) {
      setSteamError('Please provide both API Key and Steam ID')
      setConnecting(null)
      return
    }

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          service: 'Steam',
          credentials: {
            api_key: apiKey,
            user_id: steamId
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowSteamModal(false)
        setApiKey('')
        setSteamId('')
        await refreshData()
      } else {
        setSteamError(data.message || 'Failed to connect Steam')
      }
    } catch (err) {
      console.error('Error connecting Steam:', err)
      setSteamError('Failed to connect to Steam')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnectSteam = async () => {
    if (!confirm('Are you sure you want to disconnect Steam? This will deactivate any active AREAs using this service.')) {
      return
    }

    setConnecting('Steam')
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/Steam/disconnect`, {
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
        setError(data.message || 'Failed to disconnect Steam')
      }
    } catch (err) {
      console.error('Error disconnecting Steam:', err)
      setError('Failed to disconnect Steam')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnectTelegram = async () => {
    if (!confirm('Are you sure you want to disconnect Telegram? This will deactivate any active AREAs using this service.')) {
      return
    }

    setConnecting('Telegram')
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/Telegram/disconnect`, {
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
        setError(data.message || 'Failed to disconnect Telegram')
      }
    } catch (err) {
      console.error('Error disconnecting Telegram:', err)
      setError('Failed to disconnect Telegram')
    } finally {
      setConnecting(null)
    }
  }

  const handleConnectTelegram = async () => {
    setTelegramError(null)
    setConnecting('Telegram')

    if (!botToken.trim()) {
      setTelegramError('Please enter a bot token')
      setConnecting(null)
      return
    }

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/services/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          service: 'Telegram',
          credentials: {
            bot_token: botToken
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowTelegramModal(false)
        setBotToken('')
        await refreshData()
      } else {
        setTelegramError(data.message || 'Failed to connect Telegram')
      }
    } catch (err) {
      console.error('Error connecting Telegram:', err)
      setTelegramError('Failed to connect to Telegram')
    } finally {
      setConnecting(null)
    }
  }

  const handleCreateArea = async () => {
    if (!template) return

    setCreating(true)
    setError(null)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/areas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          template_id: template.id,
          name: template.name
        })
      })

      const data = await response.json()

      if (data.success) {
        await refreshData()
      } else {
        setError(data.error || 'Failed to create AREA')
      }
    } catch (err) {
      console.error('Error creating AREA:', err)
      setError('Failed to create AREA')
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
          <p className="text-slate-300 mb-8">The Steam to Telegram AREA template could not be found</p>
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
            {/* Steam Connection */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${template.services_connected.Steam ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold">Steam</h3>
                  <p className="text-sm text-slate-400">Gaming platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!template.services_connected.Steam && (
                  <button
                    onClick={() => setShowSteamModal(true)}
                    disabled={connecting === 'Steam'}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {connecting === 'Steam' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                {template.services_connected.Steam && (
                  <>
                    <span className="text-green-500 font-semibold flex items-center">✓ Connected</span>
                    <button
                      onClick={handleDisconnectSteam}
                      disabled={connecting === 'Steam'}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {connecting === 'Steam' ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Telegram Connection */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${template.services_connected.Telegram ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold">Telegram</h3>
                  <p className="text-sm text-slate-400">Messaging platform</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!template.services_connected.Telegram && (
                  <button
                    onClick={() => setShowTelegramModal(true)}
                    disabled={connecting === 'Telegram'}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {connecting === 'Telegram' ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                {template.services_connected.Telegram && (
                  <>
                    <span className="text-green-500 font-semibold flex items-center">✓ Connected</span>
                    <button
                      onClick={handleDisconnectTelegram}
                      disabled={connecting === 'Telegram'}
                      className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {connecting === 'Telegram' ? 'Disconnecting...' : 'Disconnect'}
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
              onClick={handleCreateArea}
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
            Please connect both Steam and Telegram services to create this AREA
          </div>
        )}
      </div>

      {/* Steam Connection Modal */}
      {showSteamModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Connect Steam</h3>
            <p className="text-slate-300 mb-4 text-sm">
              Enter your Steam Web API Key and Steam ID (steamID64) to connect your Steam account.
            </p>

            {steamError && (
              <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 text-sm">
                {steamError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Steam API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Get your API key from <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Steam Web API Key page</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Steam ID (steamID64)</label>
                <input
                  type="text"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="76561198012345678"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Find your Steam ID on <a href="https://steamid.io/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">SteamID.io</a>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSteamModal(false)
                  setSteamError(null)
                  setApiKey('')
                  setSteamId('')
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectSteam}
                disabled={connecting === 'Steam'}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {connecting === 'Steam' ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Connection Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Connect Telegram</h3>
            <p className="text-slate-300 mb-4 text-sm">
              Enter your Telegram Bot Token to receive notifications.
            </p>

            {telegramError && (
              <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 text-sm">
                {telegramError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTelegramModal(false)
                  setTelegramError(null)
                  setBotToken('')
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectTelegram}
                disabled={connecting === 'Telegram'}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {connecting === 'Telegram' ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

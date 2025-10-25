import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SERVICES = ['YouTube', 'Telegram', 'Twitch', 'Gmail', 'Steam', 'Discord']

const getServiceLogo = (serviceName: string) => {
  return `/logo/${serviceName}.png?v=3`
}

interface Action {
  id: number
  service_name: string
  action_key: string
  name: string
  description: string
  parameters?: any
  active: boolean
}

interface Reaction {
  id: number
  service_name: string
  reaction_key: string
  name: string
  description: string
  parameters?: any
  active: boolean
}

export default function CreateAutomation() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const getToken = () => localStorage.getItem('token')

  // Step management
  const [currentStep, setCurrentStep] = useState<'action' | 'reaction' | 'summary'>('action')

  // Action step state
  const [selectedActionService, setSelectedActionService] = useState<string>('')
  const [availableActions, setAvailableActions] = useState<Action[]>([])
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [actionParams, setActionParams] = useState<Record<string, any>>({})

  // Reaction step state
  const [selectedReactionService, setSelectedReactionService] = useState<string>('')
  const [availableReactions, setAvailableReactions] = useState<Reaction[]>([])
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null)
  const [reactionParams, setReactionParams] = useState<Record<string, any>>({})

  // UI state
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Service connection state
  const [servicesConnected, setServicesConnected] = useState<{[key: string]: boolean}>({})
  const [missingServices, setMissingServices] = useState<{[key: string]: boolean}>({})

  // Telegram connection modal
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramConnecting, setTelegramConnecting] = useState(false)
  const [telegramError, setTelegramError] = useState<string | null>(null)

  // Fetch actions when action service changes
  useEffect(() => {
    if (selectedActionService) {
      setLoading(true)
      const token = getToken()
      fetch(`${API_URL}/api/actions?service=${selectedActionService}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailableActions(data.data)
          }
        })
        .catch(err => console.error('Error fetching actions:', err))
        .finally(() => setLoading(false))
    } else {
      setAvailableActions([])
      setSelectedAction(null)
    }
  }, [selectedActionService])

  // Fetch reactions when reaction service changes
  useEffect(() => {
    if (selectedReactionService) {
      setLoading(true)
      const token = getToken()
      fetch(`${API_URL}/api/reactions?service=${selectedReactionService}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailableReactions(data.data)
          }
        })
        .catch(err => console.error('Error fetching reactions:', err))
        .finally(() => setLoading(false))
    } else {
      setAvailableReactions([])
      setSelectedReaction(null)
    }
  }, [selectedReactionService])

  // Check if a service is connected
  const checkServiceConnection = async (serviceName: string) => {
    const token = getToken()
    try {
      const response = await fetch(`${API_URL}/api/services/${serviceName}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      return data.connected || false
    } catch (err) {
      console.error(`Error checking ${serviceName} connection:`, err)
      return false
    }
  }

  // Handle service connection
  const handleConnectService = (serviceName: string) => {
    const token = getToken()

    // For Telegram, show modal
    if (serviceName === 'Telegram') {
      setShowTelegramModal(true)
      setTelegramError(null)
      return
    }

    // For OAuth services, open popup
    if (['YouTube', 'Gmail', 'Twitch', 'Discord'].includes(serviceName)) {
      const popup = window.open(
        `${API_URL}/api/oauth/${serviceName.toLowerCase()}/redirect?token=${token}`,
        `${serviceName} OAuth`,
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
          // Refresh connection status
          const connected = await checkServiceConnection(serviceName)
          setServicesConnected(prev => ({ ...prev, [serviceName]: connected }))
          if (connected) {
            setMissingServices(prev => ({ ...prev, [serviceName]: false }))
            setError(null)
          }
        }
      }, 500)
    }
  }

  // Handle Telegram connection
  const handleConnectTelegram = async () => {
    if (!telegramBotToken.trim()) {
      setTelegramError('Bot Token is required')
      return
    }

    if (!telegramChatId.trim()) {
      setTelegramError('Chat ID is required')
      return
    }

    setTelegramConnecting(true)
    setTelegramError(null)

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
            bot_token: telegramBotToken,
            chat_id: telegramChatId
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowTelegramModal(false)
        setTelegramBotToken('')
        setTelegramChatId('')
        // Refresh connection status
        const connected = await checkServiceConnection('Telegram')
        setServicesConnected(prev => ({ ...prev, 'Telegram': connected }))
        setMissingServices(prev => ({ ...prev, 'Telegram': false }))
      } else {
        setTelegramError(data.message || 'Failed to connect Telegram')
      }
    } catch (err) {
      console.error('Error connecting Telegram:', err)
      setTelegramError('Failed to connect Telegram')
    } finally {
      setTelegramConnecting(false)
    }
  }

  const handleActionSelect = (actionId: string) => {
    const action = availableActions.find(a => a.id.toString() === actionId)
    setSelectedAction(action || null)
    setActionParams({})
  }

  const handleReactionSelect = (reactionId: string) => {
    const reaction = availableReactions.find(r => r.id.toString() === reactionId)
    setSelectedReaction(reaction || null)
    setReactionParams({})
  }

  const handleNextStep = () => {
    if (currentStep === 'action' && selectedAction) {
      setCurrentStep('reaction')
      setError(null)
    }
  }

  const handleBackStep = () => {
    if (currentStep === 'reaction') {
      setCurrentStep('action')
      setError(null)
    }
  }

  const handleCreateArea = async () => {
    if (!selectedAction || !selectedReaction) return

    setCreating(true)
    setError(null)

    try {
      const token = getToken()

      // Prepare reaction config
      let finalReactionConfig = { ...reactionParams }

      // Auto-fill content for Discord reactions based on action service
      if (selectedReactionService === 'Discord' && selectedReaction.reaction_key === 'send_message') {
        if (selectedActionService === 'YouTube') {
          finalReactionConfig.content = '🎥 New video liked!\n{title}\n{url}'
        } else if (selectedActionService === 'Twitch') {
          finalReactionConfig.content = '🎮 Twitch event!\n{title}\n{url}'
        } else if (selectedActionService === 'Gmail') {
          finalReactionConfig.content = '📧 New email!\n{subject}\nFrom: {from}'
        } else {
          // Default message for other services
          finalReactionConfig.content = '🔔 New event from {service}'
        }
      }

      // Auto-fill text and chat_id for Telegram reactions based on action service
      if (selectedReactionService === 'Telegram' && selectedReaction.reaction_key === 'send_message') {
        // Get chat_id from connected Telegram service token (will be set by backend)
        if (selectedActionService === 'YouTube') {
          finalReactionConfig.text = '🎥 New video liked!\n\n📺 Title: {title}\n🔗 Link: {url}\n📅 Detected: {detected_at}'
        } else if (selectedActionService === 'Gmail') {
          finalReactionConfig.text = '📧 New email received!\n\n📨 From: {from}\n📝 Subject: {subject}\n📅 Date: {date}'
        } else if (selectedActionService === 'Twitch') {
          finalReactionConfig.text = '🎮 Twitch event!\n\n📺 {title}\n🔗 {url}'
        } else {
          // Default message for other services
          finalReactionConfig.text = '🔔 New event detected!'
        }
        // chat_id will be automatically filled from the user's Telegram connection
        finalReactionConfig.chat_id = '{auto}'
      }

      // Prepare AREA data
      const areaData = {
        name: `${selectedActionService} to ${selectedReactionService}`,
        description: `${selectedAction.name} → ${selectedReaction.name}`,
        action_service: selectedActionService,
        action_type: selectedAction.action_key,
        action_config: actionParams,
        reaction_service: selectedReactionService,
        reaction_type: selectedReaction.reaction_key,
        reaction_config: finalReactionConfig,
        active: false
      }

      const response = await fetch(`${API_URL}/api/areas/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(areaData)
      })

      const data = await response.json()

      if (data.success) {
        // Show success message
        setShowSummary(false)
        // Redirect after short delay
        setTimeout(() => {
          navigate('/services')
        }, 1500)
      } else {
        setError(data.error || 'Failed to create AREA')
        // If the error is about missing services, store them
        if (data.missing_services) {
          setMissingServices(data.missing_services)
        }
      }
    } catch (err) {
      console.error('Error creating AREA:', err)
      setError('Failed to create AREA')
    } finally {
      setCreating(false)
    }
  }

  const canProceedToReaction = selectedAction !== null
  const canCreateArea = selectedReaction !== null

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-slate-300 mb-8">You need to be logged in to create custom AREAs</p>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition">
            Go to Login
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
          <h1 className="text-4xl font-bold mb-2">Create Custom AREA</h1>
          <p className="text-slate-300 text-lg">Build your own automation by connecting any action to any reaction</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep === 'action' ? 'text-purple-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'action' ? 'border-purple-400 bg-purple-400/20' : 'border-slate-500'}`}>
              1
            </div>
            <span className="font-semibold">Choose Action</span>
          </div>
          <div className="w-16 h-0.5 bg-slate-600"></div>
          <div className={`flex items-center space-x-2 ${currentStep === 'reaction' ? 'text-purple-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'reaction' ? 'border-purple-400 bg-purple-400/20' : 'border-slate-500'}`}>
              2
            </div>
            <span className="font-semibold">Choose Reaction</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Action Selection */}
        {currentStep === 'action' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6">Step 1: Choose Action (Trigger)</h2>

            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Trigger Service</label>
                <select
                  value={selectedActionService}
                  onChange={(e) => setSelectedActionService(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                >
                  <option value="">-- Select a service --</option>
                  {SERVICES.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Selection */}
              {selectedActionService && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Action</label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : availableActions.length > 0 ? (
                    <select
                      value={selectedAction?.id || ''}
                      onChange={(e) => handleActionSelect(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    >
                      <option value="">-- Select an action --</option>
                      {availableActions.map(action => (
                        <option key={action.id} value={action.id}>
                          {action.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-400 py-4">No actions available for this service</p>
                  )}
                </div>
              )}

              {/* Action Description */}
              {selectedAction && (
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedAction.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedAction.description}</p>
                </div>
              )}

              {/* Action Parameters */}
              {selectedAction && selectedAction.parameters && Object.keys(selectedAction.parameters).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configure Action</h3>
                  {Object.entries(selectedAction.parameters).map(([paramKey, paramDef]: [string, any]) => (
                    <div key={paramKey}>
                      <label className="block text-sm font-medium mb-2">
                        {paramDef.description || paramKey}
                        {paramDef.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {paramDef.type === 'text' ? (
                        <textarea
                          value={actionParams[paramKey] || ''}
                          onChange={(e) => setActionParams({ ...actionParams, [paramKey]: e.target.value })}
                          placeholder={paramDef.placeholder || paramDef.example || ''}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          rows={3}
                          required={paramDef.required}
                        />
                      ) : paramDef.type === 'boolean' ? (
                        <select
                          value={actionParams[paramKey] !== undefined ? String(actionParams[paramKey]) : ''}
                          onChange={(e) => setActionParams({ ...actionParams, [paramKey]: e.target.value === 'true' })}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                        >
                          <option value="">-- Select --</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          type={paramDef.type === 'number' || paramDef.type === 'integer' ? 'number' : 'text'}
                          value={actionParams[paramKey] || ''}
                          onChange={(e) => setActionParams({ ...actionParams, [paramKey]: e.target.value })}
                          placeholder={paramDef.placeholder || paramDef.example || ''}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                          required={paramDef.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="mt-8">
              <button
                onClick={handleNextStep}
                disabled={!canProceedToReaction}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Choose Reaction →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Reaction Selection */}
        {currentStep === 'reaction' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6">Step 2: Choose Reaction (Action)</h2>

            <div className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Reaction Service</label>
                <select
                  value={selectedReactionService}
                  onChange={(e) => setSelectedReactionService(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                >
                  <option value="">-- Select a service --</option>
                  {SERVICES.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reaction Selection */}
              {selectedReactionService && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Reaction</label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : availableReactions.length > 0 ? (
                    <select
                      value={selectedReaction?.id || ''}
                      onChange={(e) => handleReactionSelect(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                    >
                      <option value="">-- Select a reaction --</option>
                      {availableReactions.map(reaction => (
                        <option key={reaction.id} value={reaction.id}>
                          {reaction.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-400 py-4">No reactions available for this service</p>
                  )}
                </div>
              )}

              {/* Reaction Description */}
              {selectedReaction && (
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedReaction.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedReaction.description}</p>
                </div>
              )}

              {/* Reaction Parameters */}
              {selectedReaction && selectedReaction.parameters && Object.keys(selectedReaction.parameters).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Configure Reaction</h3>

                  {/* Discord webhook guide */}
                  {selectedReactionService === 'Discord' && selectedReaction.parameters.webhook_url && (
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
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
                  )}

                  {Object.entries(selectedReaction.parameters).map(([paramKey, paramDef]: [string, any]) => {
                    // Skip 'content' parameter for Discord - it will be auto-filled
                    if (selectedReactionService === 'Discord' && paramKey === 'content') {
                      return null;
                    }

                    // Skip Telegram message fields - they will be auto-filled
                    if (selectedReactionService === 'Telegram' && (paramKey === 'chat_id' || paramKey === 'text' || paramKey === 'parse_mode' || paramKey === 'disable_notification')) {
                      return null;
                    }

                    return (
                      <div key={paramKey}>
                        <label className="block text-sm font-medium mb-2">
                          {paramDef.description || paramKey}
                          {paramDef.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {paramDef.type === 'text' ? (
                          <textarea
                            value={reactionParams[paramKey] || ''}
                            onChange={(e) => setReactionParams({ ...reactionParams, [paramKey]: e.target.value })}
                            placeholder={paramDef.placeholder || ''}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                            rows={3}
                            required={paramDef.required}
                          />
                        ) : (
                          <input
                            type={paramDef.type === 'number' ? 'number' : 'text'}
                            value={reactionParams[paramKey] || ''}
                            onChange={(e) => setReactionParams({ ...reactionParams, [paramKey]: e.target.value })}
                            placeholder={paramDef.placeholder || ''}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                            required={paramDef.required}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleBackStep}
                className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-lg transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setShowSummary(true)}
                disabled={!canCreateArea}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review & Create
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {showSummary && selectedAction && selectedReaction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-6">Review Your AREA</h3>

            {/* Action Summary */}
            <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mr-3 shadow-sm p-1.5">
                  <img
                    src={getServiceLogo(selectedActionService)}
                    alt={selectedActionService}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-400">When this happens...</p>
                  <h4 className="font-semibold text-lg">{selectedActionService}: {selectedAction.name}</h4>
                </div>
              </div>
              <p className="text-slate-400 text-sm ml-13">{selectedAction.description}</p>
            </div>

            {/* Arrow */}
            <div className="text-center text-3xl my-4">↓</div>

            {/* Reaction Summary */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mr-3 shadow-sm p-1.5">
                  <img
                    src={getServiceLogo(selectedReactionService)}
                    alt={selectedReactionService}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Do this...</p>
                  <h4 className="font-semibold text-lg">{selectedReactionService}: {selectedReaction.name}</h4>
                </div>
              </div>
              <p className="text-slate-400 text-sm ml-13">{selectedReaction.description}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Missing Services - Show connection buttons */}
            {Object.keys(missingServices).some(key => missingServices[key]) && (
              <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-200 px-4 py-3 rounded mb-4">
                <p className="font-semibold mb-3">Please connect the following services:</p>
                <div className="space-y-2">
                  {Object.entries(missingServices).map(([service, isMissing]) =>
                    isMissing && (
                      <div key={service} className="flex items-center justify-between bg-slate-900/50 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <img src={getServiceLogo(service)} alt={service} className="w-8 h-8" />
                          <span className="font-medium">{service}</span>
                        </div>
                        <button
                          onClick={() => handleConnectService(service)}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Connect {service}
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(false)}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArea}
                disabled={creating}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : '✓ Create AREA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Connection Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Connect Telegram Bot</h3>

            {/* Guide */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
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

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bot Token <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chat ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>

            {telegramError && (
              <div className="mt-4 bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded">
                {telegramError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTelegramModal(false)}
                disabled={telegramConnecting}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectTelegram}
                disabled={telegramConnecting}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {telegramConnecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

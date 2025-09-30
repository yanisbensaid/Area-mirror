import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { apiService } from '../../services/api';

interface DatabaseService {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  auth_type: string;
  icon_url: string | null;
  actions: Array<{
    id: number;
    name: string;
    description: string | null;
    service_id: number;
  }>;
  reactions: Array<{
    id: number;
    name: string;
    description: string | null;
    service_id: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  trigger_service: DatabaseService;
  action_service: DatabaseService;
  action: {
    id: number;
    name: string;
    description: string;
  };
  reaction: {
    id: number;
    name: string;
    description: string;
  };
  is_active: boolean;
  category: string;
  tags: string[];
  popularity: number;
}

export default function ServicePage() {
  const { serviceName } = useParams<{ serviceName: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const [service, setService] = useState<DatabaseService | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Telegram message state
  const [chatId, setChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageResult, setMessageResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchServiceAndAutomations = async () => {
      if (!serviceName) {
        setError('No service specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch service by ID from database
        const serviceResponse = await fetch(`http://localhost:8000/api/services/${serviceName}`);

        if (!serviceResponse.ok) {
          throw new Error(`Service not found: ${serviceResponse.status}`);
        }

        const serviceData = await serviceResponse.json();
        setService(serviceData.server.service);

        // Fetch automations for this service
        const automationsResponse = await fetch(`http://localhost:8000/api/services/${serviceName}/automations`);

        if (automationsResponse.ok) {
          const automationsData = await automationsResponse.json();
          setAutomations(automationsData);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching service and automations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAndAutomations();
  }, [serviceName]);

  const handleSendTelegramMessage = async () => {
    if (!chatId || !messageText || !authToken) {
      setMessageResult({
        success: false,
        message: 'Please fill in all fields (Chat ID, Message, and Auth Token)',
      });
      return;
    }

    setSendingMessage(true);
    setMessageResult(null);

    try {
      const response = await apiService.telegram.sendMessage(
        { chat_id: chatId, text: messageText },
        authToken
      );

      setMessageResult({
        success: true,
        message: 'Message sent successfully!',
      });

      // Clear form after successful send
      setMessageText('');
    } catch (error: any) {
      setMessageResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading service...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested service could not be found.'}</p>
          <Link
            to="/services"
            className="text-blue-600 hover:text-blue-800 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/services"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Services
          </Link>

          <div className="flex items-center space-x-6 mb-8">
            <div className="w-16 h-16 flex-shrink-0">
              <img
                src={service.icon_url || '/app_logo/default.png'}
                alt={`${service.name} logo`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1
                className="text-4xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
              >
                {service.name}
              </h1>
              <p
                className="text-xl text-gray-600 max-w-3xl"
                style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
              >
                {service.description || `${service.name} service integration`}
              </p>
            </div>
          </div>

          {/* Service Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {service.status === 'active' ? '🟢' : '🔴'}
              </div>
              <div className="text-sm text-gray-600">Status: {service.status}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                🔐
              </div>
              <div className="text-sm text-gray-600">Auth: {service.auth_type}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {service.actions.length}
              </div>
              <div className="text-sm text-gray-600">Actions Available</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {service.reactions.length}
              </div>
              <div className="text-sm text-gray-600">Reactions Available</div>
            </div>
          </div>
        </div>

        {/* Service Management (Admin only) */}
        {isAdmin && (
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              🛠️ Service Management
            </h2>

          {/* Management Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Edit Service */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">Edit Service</h3>
                  <p className="text-sm text-gray-600">Modify service details</p>
                </div>
                <Link
                  to={`/editService/${service.id}`}
                  className="mt-auto bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200 text-center"
                >
                  Edit
                </Link>
              </div>
            </div>

            {/* Add Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <h3 className="font-semibold text-blue-900 mb-1">Actions ({service.actions.length})</h3>
                  <p className="text-sm text-blue-700">Things this service can trigger</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => navigate(`/addActions/${service.id}`)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => navigate(`/editActions/${service.id}`)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Add Reactions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <h3 className="font-semibold text-purple-900 mb-1">Reactions ({service.reactions.length})</h3>
                  <p className="text-sm text-purple-700">Things this service can do</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => navigate(`/addReactions/${service.id}`)}
                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => navigate(`/editReactions/${service.id}`)}
                    className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Automations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <h3 className="font-semibold text-green-900 mb-1">Automations ({automations.length})</h3>
                  <p className="text-sm text-green-700">Manage service automations</p>
                </div>
                <button
                  onClick={() => navigate(`/createAutomation/${service.id}`)}
                  className="mt-auto bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Edit Automations
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Telegram Message Sender - Only show for Telegram service */}
        {service && service.name.toLowerCase() === 'telegram' && (
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2
              className="text-2xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              📱 Send Telegram Message
            </h2>

            <div className="space-y-4">
              {/* Chat ID Input */}
              <div>
                <label
                  htmlFor="chatId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Chat ID
                </label>
                <input
                  type="text"
                  id="chatId"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g., 1744435104"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Message Input */}
              <div>
                <label
                  htmlFor="messageText"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Message
                </label>
                <textarea
                  id="messageText"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Auth Token Input */}
              <div>
                <label
                  htmlFor="authToken"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Bearer Token
                </label>
                <input
                  type="text"
                  id="authToken"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="e.g., 1|kZKuB2MrIN8audDeFkfOURofUkc3Pwp3edBVgThV79d50be6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendTelegramMessage}
                disabled={sendingMessage}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                  sendingMessage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>

              {/* Result Message */}
              {messageResult && (
                <div
                  className={`p-4 rounded-lg ${
                    messageResult.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      messageResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {messageResult.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Automations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-semibold text-gray-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              🔄 Available Automations ({automations.length})
            </h2>
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => navigate(`/createAutomation/${service.id}`)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  + Create Automation
                </button>
              )}
            </div>
          </div>

          {automations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                >
                  {/* Category and popularity badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                      {automation.category || 'Automation'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span
                        className="text-sm text-gray-600 font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {automation.popularity}% use this
                      </span>
                    </div>
                  </div>

                  {/* Services flow */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Trigger service */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                        <img
                          src={automation.trigger_service.icon_url || '/app_logo/default.png'}
                          alt={automation.trigger_service.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/app_logo/default.png';
                          }}
                        />
                      </div>
                      <span
                        className="text-sm text-gray-600 text-center"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {automation.trigger_service.name}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    {/* Action service */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                        <img
                          src={automation.action_service.icon_url || '/app_logo/default.png'}
                          alt={automation.action_service.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/app_logo/default.png';
                          }}
                        />
                      </div>
                      <span
                        className="text-sm text-gray-600 text-center"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {automation.action_service.name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3
                      className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {automation.name}
                    </h3>
                    <p
                      className="text-gray-600 text-sm leading-relaxed mb-4"
                      style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
                    >
                      {automation.description || `${automation.action.name} → ${automation.reaction.name}`}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {automation.tags?.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {tag}
                        </span>
                      )) || (
                        <>
                          <span
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            automation
                          </span>
                          <span
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {automation.trigger_service.name.toLowerCase()}
                          </span>
                          <span
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {automation.action_service.name.toLowerCase()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Configure Automation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Automations Yet</h3>
              <p className="text-gray-600 mb-6">Create your first actions and reactions to start building automations</p>
              {isAdmin && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate(`/createAutomation/${service.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    🔄 Create Automation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
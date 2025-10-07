import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { useService } from '../../contexts/ServiceContext';
import { useTelegram } from '../../hooks/useTelegram';

// Components
import { ServiceHeader } from '../../components/service/ServiceHeader';
import { ServiceStats } from '../../components/service/ServiceStats';
import { AutomationCard } from '../../components/service/AutomationCard';
import { TelegramBotConnector } from '../../components/service/TelegramBotConnector';

// Loading Component
const LoadingSpinner: React.FC = () => (
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

// Error Component
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <main className="pt-20 px-4 bg-gray-50 min-h-screen">
    <div className="max-w-4xl mx-auto py-12 text-center">
      <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
      <p className="text-gray-600 mb-6">{error}</p>
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

// Telegram Message Sender Component
const TelegramMessageSender: React.FC<{ telegramStatus: any; isLoggedIn: boolean }> = ({
  telegramStatus,
  isLoggedIn
}) => {
  const {
    chatId,
    setChatId,
    messageText,
    setMessageText,
    authToken,
    setAuthToken,
    sendingMessage,
    messageResult,
    sendMessage,
  } = useTelegram();

  return (
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
            Chat ID {isLoggedIn && telegramStatus?.chat_id_detected && (
              <span className="text-xs text-green-600 ml-2">(Optional - using auto-detected)</span>
            )}
          </label>
          <input
            type="text"
            id="chatId"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder={isLoggedIn && telegramStatus?.chat_id_detected ? "Using your auto-detected chat ID" : "e.g., 1744435104"}
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

        {/* Auth Token Input - Optional if logged in */}
        {!isLoggedIn && (
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
        )}

        {/* Send Button */}
        <button
          onClick={sendMessage}
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
  );
};

export default function ServicePage() {
  const { serviceName } = useParams<{ serviceName: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { isLoggedIn } = useAuth();

  // Service context
  const {
    currentService: service,
    automations,
    loading,
    error,
    telegramStatus,
    loadingTelegramStatus,
    fetchService,
    fetchAutomations,
    fetchTelegramStatus,
    clearService,
  } = useService();

  // Fetch service data on mount
  useEffect(() => {
    if (!serviceName) return;

    const loadServiceData = async () => {
      await fetchService(serviceName);
      await fetchAutomations(serviceName);
    };

    loadServiceData();

    // Cleanup on unmount
    return () => {
      clearService();
    };
  }, [serviceName, fetchService, fetchAutomations, clearService]);

  // Fetch Telegram status for Telegram service
  useEffect(() => {
    if (service?.name.toLowerCase() === 'telegram' && isLoggedIn) {
      const token = localStorage.getItem('token');
      fetchTelegramStatus(token || undefined);
    }
  }, [service, isLoggedIn, fetchTelegramStatus]);

  const handleTelegramConnectionSuccess = () => {
    // Refresh Telegram status after successful connection
    setTimeout(() => {
      const token = localStorage.getItem('token');
      fetchTelegramStatus(token || undefined);
    }, 1000);
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error || !service) {
    return <ErrorDisplay error={error || 'Service not found'} />;
  }

  const isTelegramService = service.name.toLowerCase() === 'telegram';

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-12">
        {/* Back Navigation */}
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

          {/* Service Header */}
          <ServiceHeader service={service} />

          {/* Service Stats */}
          <ServiceStats service={service} />
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

        {/* Telegram-specific components */}
        {isTelegramService && (
          <>
            {/* Connection Status */}
            {isLoggedIn && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <h2
                  className="text-2xl font-semibold text-gray-900 mb-4"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  🤖 Bot Connection Status
                </h2>

                {loadingTelegramStatus ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : telegramStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {telegramStatus.connected ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {telegramStatus.connected ? 'Bot Connected' : 'Bot Not Connected'}
                        </p>
                        <p className="text-sm text-gray-600">{telegramStatus.instructions}</p>
                      </div>
                    </div>

                    {telegramStatus.chat_id_detected && (
                      <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          ✨ Chat ID Auto-Detected!
                        </p>
                        <p className="text-xs text-gray-600">
                          Chat ID: <code className="bg-gray-100 px-2 py-1 rounded">{telegramStatus.chat_id}</code>
                        </p>
                        {telegramStatus.user_info?.username && (
                          <p className="text-xs text-gray-600 mt-1">
                            Username: @{telegramStatus.user_info.username}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Bot Connection Form */}
            {isLoggedIn && (!telegramStatus || !telegramStatus.connected) && (
              <TelegramBotConnector onConnectionSuccess={handleTelegramConnectionSuccess} />
            )}

            {/* Message Sender */}
            <TelegramMessageSender telegramStatus={telegramStatus} isLoggedIn={isLoggedIn} />
          </>
        )}

        {/* Automations Section */}
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
                <AutomationCard key={automation.id} automation={automation} />
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

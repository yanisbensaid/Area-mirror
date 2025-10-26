import React, { useState } from 'react';
import { ServiceService } from '../../services/serviceService';

interface TelegramBotConnectorProps {
  onConnectionSuccess: () => void;
}

export const TelegramBotConnector: React.FC<TelegramBotConnectorProps> = ({ onConnectionSuccess }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConnect = async () => {
    if (!botToken) {
      setResult({
        success: false,
        message: 'Please enter your bot token',
      });
      return;
    }

    if (!chatId) {
      setResult({
        success: false,
        message: 'Please enter your chat ID',
      });
      return;
    }

    setConnecting(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await ServiceService.connectTelegramBot(botToken, chatId, token || undefined);

      setResult({
        success: true,
        message: response.data.message + ' ' + (response.data.instructions || ''),
      });

      setBotToken('');
      setChatId('');
      onConnectionSuccess();
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to connect bot',
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h2
        className="text-2xl font-semibold text-gray-900 mb-6"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        🔗 Connect Your Telegram Bot
      </h2>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">📋 How to get Bot Token and Chat ID:</h3>

          <div className="mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">🤖 Get Bot Token:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
              <li>Open Telegram and search for <strong>@BotFather</strong></li>
              <li>Send <code className="bg-blue-100 px-1 rounded">/newbot</code> and follow instructions</li>
              <li>Copy the bot token (format: <code className="bg-blue-100 px-1 rounded">123456:ABC...</code>)</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">💬 Get Chat ID:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
              <li>Search for <strong>@userinfobot</strong> on Telegram</li>
              <li>Send <code className="bg-blue-100 px-1 rounded">/start</code> to the bot</li>
              <li>The bot will reply with your user info including your <strong>Chat ID</strong></li>
              <li>Copy your Chat ID (it's a number like <code className="bg-blue-100 px-1 rounded">123456789</code>)</li>
            </ol>
          </div>
        </div>

        <div>
          <label
            htmlFor="botToken"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Bot Token <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="botToken"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <div>
          <label
            htmlFor="chatId"
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Chat ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="chatId"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
            connecting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {connecting ? 'Connecting...' : 'Connect Bot'}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

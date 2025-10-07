import { useState, useCallback } from 'react';
import { ServiceService } from '../services/serviceService';

interface UseTelegramResult {
  // Message sending
  chatId: string;
  setChatId: (chatId: string) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  authToken: string;
  setAuthToken: (token: string) => void;
  sendingMessage: boolean;
  messageResult: { success: boolean; message: string } | null;
  sendMessage: () => Promise<void>;
}

export const useTelegram = (): UseTelegramResult => {
  const [chatId, setChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageResult, setMessageResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendMessage = useCallback(async () => {
    if (!messageText) {
      setMessageResult({
        success: false,
        message: 'Please enter a message',
      });
      return;
    }

    const token = authToken || localStorage.getItem('token');
    if (!token) {
      setMessageResult({
        success: false,
        message: 'Please login or provide an auth token',
      });
      return;
    }

    setSendingMessage(true);
    setMessageResult(null);

    try {
      const response = await ServiceService.sendTelegramMessage(
        {
          chat_id: chatId || undefined,
          text: messageText
        },
        token
      );

      setMessageResult({
        success: true,
        message: response.data.message || 'Message sent successfully!',
      });

      // Clear form after successful send
      setMessageText('');

      // Show if used stored chat_id
      if (response.data.data?.used_stored_chat_id) {
        setTimeout(() => {
          setMessageResult({
            success: true,
            message: `Message sent to your auto-detected chat! (Chat ID: ${response.data.data.chat_id})`,
          });
        }, 2000);
      }
    } catch (error: any) {
      setMessageResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      });
    } finally {
      setSendingMessage(false);
    }
  }, [chatId, messageText, authToken]);

  return {
    chatId,
    setChatId,
    messageText,
    setMessageText,
    authToken,
    setAuthToken,
    sendingMessage,
    messageResult,
    sendMessage,
  };
};

import { apiService } from './api';

export interface DatabaseService {
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

export interface Automation {
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
  tags: string[] | string;
  popularity: number;
}

export class ServiceService {
  private static readonly BASE_URL = 'http://localhost:8000/api';

  static async getServiceById(serviceId: string): Promise<DatabaseService> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}`);

      if (!response.ok) {
        throw new Error(`Service not found: ${response.status}`);
      }

      const data = await response.json();
      return data.server.service;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch service');
    }
  }

  static async getServiceAutomations(serviceId: string): Promise<Automation[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}/automations`);

      if (!response.ok) {
        return []; // Return empty array if automations not found
      }

      const data = await response.json();
      return data.server.automations || [];
    } catch (error) {
      console.error('Failed to fetch automations:', error);
      return [];
    }
  }

  static async getTelegramStatus(token?: string): Promise<any> {
    return apiService.telegram.getStatus(token);
  }

  static async connectTelegramBot(botToken: string, chatId: string, authToken?: string): Promise<any> {
    return apiService.telegram.connectBot(botToken, chatId, authToken);
  }

  static async sendTelegramMessage(
    messageData: { chat_id?: string; text: string },
    authToken?: string
  ): Promise<any> {
    return apiService.telegram.sendMessage(messageData, authToken);
  }
}

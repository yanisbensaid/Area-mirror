import type { DatabaseService } from './serviceService';
import { API_CONFIG } from '../config/api';

export interface Service {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  color: string;
  automationCount: number;
  isPopular: boolean;
  tags: string[];
  status: 'active' | 'inactive';
  auth_type: string;
}

export interface AREATemplate {
  id: string;
  name: string;
  description: string;
  action_service: string;
  reaction_service: string;
  services_connected: {
    [key: string]: boolean;
  };
  can_activate: boolean;
}

export class ServicesPageService {
  private static readonly BASE_URL = API_CONFIG.API_URL;

  static async getAllServices(): Promise<Service[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/services`);

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();
      const dbServices: DatabaseService[] = data.server.services;
      return dbServices.map((dbService) => ServicesPageService.transformDatabaseService(dbService));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load services');
    }
  }

  static async getAREATemplates(token?: string): Promise<AREATemplate[]> {
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(`${this.BASE_URL}/areas/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Failed to fetch AREA templates:', error);
      return [];
    }
  }

  private static transformDatabaseService(dbService: DatabaseService): Service {
    const totalAutomations = dbService.actions.length + dbService.reactions.length;

    return {
      id: dbService.id.toString(),
      name: dbService.name,
      logo: dbService.icon_url || `/app_logo/${dbService.name.toLowerCase().replace(/\s+/g, '')}.png`,
      description: dbService.description || `${dbService.name} service integration`,
      category: ServicesPageService.getCategoryFromAuthType(dbService.auth_type),
      color: ServicesPageService.getColorFromName(dbService.name),
      automationCount: totalAutomations,
      isPopular: totalAutomations > 2,
      tags: [dbService.auth_type.toLowerCase(), dbService.name.toLowerCase()],
      status: dbService.status,
      auth_type: dbService.auth_type
    };
  }

  private static getCategoryFromAuthType(authType: string): string {
    const authTypeMap: { [key: string]: string } = {
      'OAuth2': 'Social',
      'API Key': 'Development',
      'Token': 'Communication',
      'Basic Auth': 'Productivity',
      'None': 'Utility'
    };
    return authTypeMap[authType] || 'General';
  }

  private static getColorFromName(name: string): string {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ];

    // Use name hash to consistently assign colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}

import type { DatabaseService } from './serviceService';

export interface ServiceFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  auth_type: string;
  icon_url: string;
}

export class EditServiceService {
  private static readonly BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

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

  static async updateService(serviceId: string, formData: ServiceFormData, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 422) {
          const errors = data.errors;
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to update service');
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update service');
    }
  }

  static async deleteService(serviceId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete service' }));
        throw new Error(data.message || 'Failed to delete service');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete service');
    }
  }

  static transformToFormData(service: DatabaseService): ServiceFormData {
    return {
      name: service.name,
      description: service.description || '',
      status: service.status,
      auth_type: service.auth_type,
      icon_url: service.icon_url || ''
    };
  }
}

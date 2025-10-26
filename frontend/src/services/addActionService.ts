export interface AddActionFormData {
  name: string;
  description: string;
  trigger_type: string;
}

export interface ServiceDetails {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export interface CreateActionResponse {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  service_id: number;
}

export class AddActionService {
  private static readonly BASE_URL = 'http://localhost:8000/api';

  /**
   * Fetch service details by ID
   */
  static async getServiceById(serviceId: string): Promise<ServiceDetails> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch service: ${response.status}`);
      }

      const data = await response.json();
      return data.server.service;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch service');
    }
  }

  /**
   * Create a new action for a service
   */
  static async createAction(
    serviceId: string,
    formData: AddActionFormData,
    token: string
  ): Promise<CreateActionResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}/actions`, {
        method: 'POST',
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
          if (errors) {
            const errorMessages = Object.values(errors).flat().join(', ');
            throw new Error(`Validation errors: ${errorMessages}`);
          }
        }
        throw new Error(data.message || `Failed to create action: ${response.status}`);
      }

      // Handle different response structures from the backend
      // Some endpoints wrap in 'server', others don't
      if (data.server && data.server.action) {
        return data.server.action;
      } else if (data.action) {
        return data.action;
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create action');
    }
  }

  /**
   * Get default form data for creating a new action
   */
  static getDefaultFormData(): AddActionFormData {
    return {
      name: '',
      description: '',
      trigger_type: '',
    };
  }

  /**
   * Validate form data before submission
   */
  static validateFormData(formData: AddActionFormData): string | null {
    if (!formData.name.trim()) {
      return 'Action name is required';
    }

    if (!formData.description.trim()) {
      return 'Action description is required';
    }

    if (!formData.trigger_type.trim()) {
      return 'Trigger type is required';
    }

    return null;
  }
}

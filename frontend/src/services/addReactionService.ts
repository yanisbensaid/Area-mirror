export interface AddReactionFormData {
  name: string;
  description: string;
  reaction_type: string;
}

export interface ServiceDetails {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export interface CreateReactionResponse {
  id: number;
  name: string;
  description: string;
  reaction_type: string;
  service_id: number;
}

export class AddReactionService {
  private static readonly BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

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
   * Create a new reaction for a service
   */
  static async createReaction(
    serviceId: string, 
    formData: AddReactionFormData, 
    token: string
  ): Promise<CreateReactionResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}/reactions`, {
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
        throw new Error(data.message || `Failed to create reaction: ${response.status}`);
      }

      // Handle different response structures from the backend
      // Some endpoints wrap in 'server', others don't
      if (data.server && data.server.reaction) {
        return data.server.reaction;
      } else if (data.reaction) {
        return data.reaction;
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create reaction');
    }
  }

  /**
   * Get default form data for creating a new reaction
   */
  static getDefaultFormData(): AddReactionFormData {
    return {
      name: '',
      description: '',
      reaction_type: '',
    };
  }

  /**
   * Validate form data before submission
   */
  static validateFormData(formData: AddReactionFormData): string | null {
    if (!formData.name.trim()) {
      return 'Reaction name is required';
    }

    if (!formData.description.trim()) {
      return 'Reaction description is required';
    }

    if (!formData.reaction_type.trim()) {
      return 'Reaction type is required';
    }

    return null;
  }
}

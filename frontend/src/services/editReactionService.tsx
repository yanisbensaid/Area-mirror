export interface ServicesPageState {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export interface EditReactionData {
  id: number;
  name: string;
  description: string;
  action_type: string;
  service_id: number;
}

export interface ReactionFormData {
  name: string;
  description: string;
  reaction_type: string;
}

export class EditReactionService {
  private static readonly BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

  static async getReactionsByServiceId(serviceId: string): Promise<EditReactionData[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}/reactions`);

      if (!response.ok) {
        throw new Error(`Reactions not found: ${response.status}`);
      }

      const data = await response.json();
      return data.server.reactions || [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reactions');
    }
  }

  static async getReactionById(reactionId: string): Promise<EditReactionData> {
    try {
      const response = await fetch(`${this.BASE_URL}/reactions/${reactionId}`);

      if (!response.ok) {
        throw new Error(`Reaction not found: ${response.status}`);
      }

      const data = await response.json();
      return data.server.reaction;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch reaction');
    }
  }

  static async updateReaction(reactionId: string, formData: ReactionFormData, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/reactions/${reactionId}`, {
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
          throw new Error(data.message || 'Failed to update reaction');
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update reaction');
    }
  }

  static async deleteReaction(reactionId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/reactions/${reactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete reaction' }));
        throw new Error(data.message || 'Failed to delete reaction');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete reaction');
    }
  }

  static async createReaction(serviceId: string, formData: ReactionFormData, token: string): Promise<EditReactionData> {
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
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to create reaction');
        }
      }

      return data.server.reaction;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create reaction');
    }
  }

  static transformToFormData(reaction: EditReactionData): ReactionFormData {
    return {
      name: reaction.name,
      description: reaction.description || '',
      reaction_type: reaction.action_type
    };
  }

  static getDefaultFormData(): ReactionFormData {
    return {
      name: '',
      description: '',
      reaction_type: 'webhook'
    };
  }
}

export interface ServicesPageState {
  id: number;
  name: string;
  description: string;
  icon_url?: string;
}

export interface EditActionData {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  service_id: number;
}

export interface ActionFormData {
  name: string;
  description: string;
  trigger_type: string;
}

export class EditActionService {
  private static readonly BASE_URL = 'http://localhost:8000/api';

  static async getActionsByServiceId(serviceId: string): Promise<EditActionData[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/services/${serviceId}/actions`);

      if (!response.ok) {
        throw new Error(`Actions not found: ${response.status}`);
      }

      const data = await response.json();
      return data.server.actions || [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch actions');
    }
  }

  static async getActionById(actionId: string): Promise<EditActionData> {
    try {
      const response = await fetch(`${this.BASE_URL}/actions/${actionId}`);

      if (!response.ok) {
        throw new Error(`Action not found: ${response.status}`);
      }

      const data = await response.json();
      return data.server.action;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch action');
    }
  }

  static async updateAction(actionId: string, formData: ActionFormData, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/actions/${actionId}`, {
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
          throw new Error(data.message || 'Failed to update action');
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update action');
    }
  }

  static async deleteAction(actionId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete action' }));
        throw new Error(data.message || 'Failed to delete action');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete action');
    }
  }

  static async createAction(serviceId: string, formData: ActionFormData, token: string): Promise<EditActionData> {
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
          const errorMessages = Object.values(errors).flat().join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to create action');
        }
      }

      return data.server.action;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create action');
    }
  }

  static transformToFormData(action: EditActionData): ActionFormData {
    return {
      name: action.name,
      description: action.description || '',
      trigger_type: action.trigger_type
    };
  }

  static getDefaultFormData(): ActionFormData {
    return {
      name: '',
      description: '',
      trigger_type: ''
    };
  }
}

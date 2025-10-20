import React from 'react';
import { useAddAction } from '../../../contexts/AddActionContext';

const TRIGGER_TYPES = [
  { value: '', label: 'Select a trigger type' },
  { value: 'new_item', label: 'New Item Created' },
  { value: 'updated_item', label: 'Item Updated' },
  { value: 'deleted_item', label: 'Item Deleted' },
  { value: 'user_action', label: 'User Action' },
  { value: 'scheduled', label: 'Scheduled Event' },
  { value: 'webhook', label: 'Webhook Received' },
  { value: 'custom', label: 'Custom Trigger' },
];

interface AddActionFormProps {
  className?: string;
}

export const AddActionForm: React.FC<AddActionFormProps> = ({ className = '' }) => {
  const { formData, updateFormData, submitAction, submitting } = useAddAction();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData(name as keyof typeof formData, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAction();
  };

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Action Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., New Email Received, Song Liked, Stream Started"
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe when this action should be triggered..."
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="trigger_type" className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Type
          </label>
          <select
            id="trigger_type"
            name="trigger_type"
            value={formData.trigger_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
          >
            {TRIGGER_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Action'}
          </button>
        </div>
      </form>
    </div>
  );
};

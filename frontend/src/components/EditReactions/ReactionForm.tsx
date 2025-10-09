import React from 'react';
import type { ReactionFormData } from '../../services/editReactionService';

interface ReactionFormProps {
  formData: ReactionFormData;
  onInputChange: (field: keyof ReactionFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isCreate?: boolean;
  submitButtonText?: string;
}

export const ReactionForm: React.FC<ReactionFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  isCreate = false,
  submitButtonText,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onInputChange(name as keyof ReactionFormData, value);
  };

  const defaultButtonText = isCreate ? 'Create Reaction' : 'Update Reaction';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Reaction Name */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Reaction Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter reaction name"
        />
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter reaction description"
          rows={4}
        />
      </div>

      {/* Reaction Type */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Reaction Type
        </label>
        <select
          name="reaction_type"
          value={formData.reaction_type}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="webhook">Webhook</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="notification">Notification</option>
          <option value="api_call">API Call</option>
          <option value="database">Database</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isCreate ? 'Creating...' : 'Updating...'}
            </div>
          ) : (
            submitButtonText || defaultButtonText
          )}
        </button>
      </div>
    </form>
  );
};

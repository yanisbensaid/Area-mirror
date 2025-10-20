import React from 'react';
import { useAddReaction } from '../../../contexts/AddReactionContext';

const REACTION_TYPES = [
  { value: '', label: 'Select a reaction type' },
  { value: 'send_message', label: 'Send Message' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'create_post', label: 'Create Post' },
  { value: 'play_media', label: 'Play Media' },
  { value: 'create_notification', label: 'Create Notification' },
  { value: 'save_file', label: 'Save File' },
  { value: 'api_call', label: 'API Call' },
  { value: 'custom', label: 'Custom Action' },
];

interface AddReactionFormProps {
  className?: string;
}

export const AddReactionForm: React.FC<AddReactionFormProps> = ({ className = '' }) => {
  const { formData, updateFormData, submitReaction, submitting, service } = useAddReaction();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData(name as keyof typeof formData, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReaction();
  };

  if (!service) return null;

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Reaction Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Send Email, Play Song, Post Message, Create Notification"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe what this reaction will do when triggered..."
          />
        </div>

        <div>
          <label htmlFor="reaction_type" className="block text-sm font-medium text-gray-700 mb-2">
            Reaction Type *
          </label>
          <select
            id="reaction_type"
            name="reaction_type"
            value={formData.reaction_type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {REACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Reaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

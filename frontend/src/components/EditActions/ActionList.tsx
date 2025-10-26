import React from 'react';
import type { EditActionData } from '../../services/editActionService';

interface ActionListProps {
  actions: EditActionData[];
  onEdit: (action: EditActionData) => void;
  onDelete: (actionId: string, actionName: string) => void;
  isDeleting: boolean;
  isAdmin: boolean;
}

export const ActionList: React.FC<ActionListProps> = ({
  actions,
  onEdit,
  onDelete,
  isDeleting,
  isAdmin,
}) => {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3
          className="text-xl font-medium text-gray-900 mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          No actions found
        </h3>
        <p
          className="text-gray-600"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Create your first action to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div
          key={action.id}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className="text-lg font-semibold text-gray-900 mb-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {action.name}
              </h3>
              {action.description && (
                <p
                  className="text-gray-600 mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {action.description}
                </p>
              )}
              <div className="flex items-center space-x-4">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {action.trigger_type}
                </span>
                <span
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  ID: {action.id}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(action)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(action.id.toString(), action.name)}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
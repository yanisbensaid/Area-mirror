import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useEditActions } from '../../contexts/EditActionsContext';
import {
  EditActionsHeader,
  ActionForm,
  ActionList,
  MessageDisplay,
  LoadingState,
} from '../../components/services/editActions';
import type { EditActionData } from '../../services/editActionService';

const EditActions: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAction, setEditingAction] = useState<EditActionData | null>(null);

  const {
    actions,
    formData,
    loading,
    isUpdating,
    isDeleting,
    isCreating,
    error,
    success,
    fetchActions,
    updateFormData,
    setFormData,
    updateAction,
    deleteAction,
    createAction,
    clearMessages,
  } = useEditActions();

  // Fetch actions on mount
  useEffect(() => {
    if (!serviceId) {
      return;
    }
    fetchActions(serviceId);
  }, [serviceId, fetchActions]);

  // Clear success message after a delay and handle form closing
  useEffect(() => {
    if (success) {
      // Immediately close forms after successful operations
      if (success.includes('created')) {
        setShowCreateForm(false);
      }
      if (success.includes('updated')) {
        setEditingAction(null);
      }
      if (success.includes('deleted')) {
        setEditingAction(null);
      }

      // Clear the success message after a shorter delay
      const timer = setTimeout(() => {
        clearMessages();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  // Handler functions
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await createAction(serviceId, token);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAction) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await updateAction(editingAction.id.toString(), token);
  };

  const handleEdit = (action: EditActionData) => {
    setEditingAction(action);
    setFormData({
      name: action.name,
      description: action.description || '',
      trigger_type: action.trigger_type,
    });
    setShowCreateForm(false);
  };

  const handleDelete = async (actionId: string, actionName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await deleteAction(actionId, actionName, token);
  };

  const handleCancelEdit = () => {
    setEditingAction(null);
    setFormData({
      name: '',
      description: '',
      trigger_type: '',
    });
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setEditingAction(null);
    setFormData({
      name: '',
      description: '',
      trigger_type: '',
    });
  };

  if (!serviceId) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Invalid Service</h1>
          <p className="text-gray-600">Service ID not provided</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <EditActionsHeader
          serviceId={serviceId}
          title="Edit Actions"
          description="Manage actions for this service"
        />

        {/* Loading State */}
        {loading && <LoadingState message="Loading actions..." />}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Messages */}
            <MessageDisplay success={success} error={error} />

            {/* Create/Edit Form */}
            {(showCreateForm || editingAction) && isAdmin && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-xl font-semibold text-gray-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {editingAction ? 'Edit Action' : 'Create New Action'}
                  </h2>
                  <button
                    onClick={editingAction ? handleCancelEdit : () => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <ActionForm
                  formData={formData}
                  onInputChange={updateFormData}
                  onSubmit={editingAction ? handleUpdateSubmit : handleCreateSubmit}
                  isLoading={editingAction ? isUpdating : isCreating}
                  isCreate={!editingAction}
                />
              </div>
            )}

            {/* Actions */}
            {!showCreateForm && !editingAction && isAdmin && (
              <div className="mb-8">
                <button
                  onClick={handleShowCreateForm}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Action
                </button>
              </div>
            )}

            {/* Actions List */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2
                className="text-xl font-semibold text-gray-900 mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Actions ({actions.length})
              </h2>

              <ActionList
                actions={actions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                isAdmin={isAdmin}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default EditActions;

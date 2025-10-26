import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useEditReactions } from '../../contexts/EditReactionsContext';
import {
  EditReactionsHeader,
  ReactionForm,
  ReactionList,
  MessageDisplay,
  LoadingState,
} from '../../components/services/editReactions';
import type { EditReactionData } from '../../services/editReactionService';

const EditReactions: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReaction, setEditingReaction] = useState<EditReactionData | null>(null);

  const {
    reactions,
    formData,
    loading,
    isUpdating,
    isDeleting,
    isCreating,
    error,
    success,
    fetchReactions,
    updateFormData,
    setFormData,
    updateReaction,
    deleteReaction,
    createReaction,
    clearMessages,
  } = useEditReactions();

  // Fetch reactions on mount
  useEffect(() => {
    if (!serviceId) {
      return;
    }
    fetchReactions(serviceId);
  }, [serviceId, fetchReactions]);

  // Clear success message after a delay and handle form closing
  useEffect(() => {
    if (success) {
      // Immediately close forms after successful operations
      if (success.includes('created')) {
        setShowCreateForm(false);
      }
      if (success.includes('updated')) {
        setEditingReaction(null);
      }
      if (success.includes('deleted')) {
        setEditingReaction(null);
      }

      // Clear the success message after a shorter delay
      const timer = setTimeout(() => {
        clearMessages();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await createReaction(serviceId, token);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReaction) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await updateReaction(editingReaction.id.toString(), token);
  };

  const handleEdit = (reaction: EditReactionData) => {
    setEditingReaction(reaction);
    setFormData({
      name: reaction.name,
      description: reaction.description || '',
      reaction_type: reaction.action_type,
    });
    setShowCreateForm(false);
  };

  const handleDelete = async (reactionId: string, reactionName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await deleteReaction(reactionId, reactionName, token);
  };

  const handleCancelEdit = () => {
    setEditingReaction(null);
    setFormData({
      name: '',
      description: '',
      reaction_type: 'webhook',
    });
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    setEditingReaction(null);
    setFormData({
      name: '',
      description: '',
      reaction_type: 'webhook',
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
        <EditReactionsHeader
          serviceId={serviceId}
          title="Edit Reactions"
          description="Manage reactions for this service"
        />

        {/* Loading State */}
        {loading && <LoadingState message="Loading reactions..." />}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Messages */}
            <MessageDisplay success={success} error={error} />

            {/* Create/Edit Form */}
            {(showCreateForm || editingReaction) && isAdmin && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-xl font-semibold text-gray-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {editingReaction ? 'Edit Reaction' : 'Create New Reaction'}
                  </h2>
                  <button
                    onClick={editingReaction ? handleCancelEdit : () => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <ReactionForm
                  formData={formData}
                  onInputChange={updateFormData}
                  onSubmit={editingReaction ? handleUpdateSubmit : handleCreateSubmit}
                  isLoading={editingReaction ? isUpdating : isCreating}
                  isCreate={!editingReaction}
                />
              </div>
            )}

            {/* Actions */}
            {!showCreateForm && !editingReaction && isAdmin && (
              <div className="mb-8">
                <button
                  onClick={handleShowCreateForm}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Reaction
                </button>
              </div>
            )}

            {/* Reactions List */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2
                className="text-xl font-semibold text-gray-900 mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Reactions ({reactions.length})
              </h2>

              <ReactionList
                reactions={reactions}
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

export default EditReactions;

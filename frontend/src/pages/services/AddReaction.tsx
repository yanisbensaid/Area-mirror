import React, { useEffect } from 'react';
import { AddReactionProvider, useAddReaction } from '../../contexts/AddReactionContext';
import { LoadingSpinner, ErrorState, MessageDisplay } from '../../components/common/ui';
import {
  AddReactionHeader,
  AddReactionForm,
  ReactionInfoBox,
  NextStepsBox
} from '../../components/features/addReaction';

const AddReactionContent: React.FC = () => {
  const { service, loading, error, success, fetchService } = useAddReaction();

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
          <LoadingSpinner size="large" message="Loading service details..." />
        </div>
      </main>
    );
  }

  if (error && !service) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
          <ErrorState error={error} onRetry={fetchService} />
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
          <ErrorState error="Service not found" />
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <AddReactionHeader />

        {/* Messages */}
        <MessageDisplay success={success} error={error} />

        {/* Explanation */}
        <ReactionInfoBox />

        {/* Form */}
        <AddReactionForm />

        {/* Next Steps */}
        <NextStepsBox className="mt-6" />
      </div>
    </main>
  );
};

// Main AddReaction Component with Provider
export default function AddReaction() {
  return (
    <AddReactionProvider>
      <AddReactionContent />
    </AddReactionProvider>
  );
}

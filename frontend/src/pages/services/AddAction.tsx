import React, { useEffect } from 'react';
import { AddActionProvider, useAddAction } from '../../contexts/AddActionContext';
import { LoadingSpinner, ErrorState, MessageDisplay } from '../../components/common/ui';
import {
  AddActionHeader,
  AddActionForm,
  ActionInfoBox,
  NextStepsBox
} from '../../components/features/addAction';

const AddActionContent: React.FC = () => {
  const { service, loading, error, success, fetchService } = useAddAction();

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
        <AddActionHeader />

        {/* Messages */}
        <MessageDisplay success={success} error={error} />

        {/* Explanation */}
        <ActionInfoBox />

        {/* Form */}
        <AddActionForm />

        {/* Next Steps */}
        <NextStepsBox className="mt-6" />
      </div>
    </main>
  );
};

// Main AddAction Component with Provider
export default function AddAction() {
  return (
    <AddActionProvider>
      <AddActionContent />
    </AddActionProvider>
  );
}

import React from 'react';
import { useAddReaction } from '../../../contexts/AddReactionContext';

interface InfoBoxProps {
  className?: string;
}

export const ReactionInfoBox: React.FC<InfoBoxProps> = ({ className = '' }) => {
  const { service } = useAddReaction();

  if (!service) return null;

  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-purple-700">
            <strong>What's a Reaction?</strong> A reaction is something that {service.name} can do when triggered by an action from another service. 
            For example: "Send email", "Play song", "Post message", "Create notification".
          </p>
        </div>
      </div>
    </div>
  );
};

export const NextStepsBox: React.FC<InfoBoxProps> = ({ className = '' }) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700">
            <strong>Next:</strong> After creating this reaction, you'll be able to use it in automations. You can then connect actions from other services to trigger this reaction!
          </p>
        </div>
      </div>
    </div>
  );
};

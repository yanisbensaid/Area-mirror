import React from 'react';
import { useAddReaction } from '../../../contexts/AddReactionContext';

interface ServiceHeaderProps {
  className?: string;
}

export const AddReactionHeader: React.FC<ServiceHeaderProps> = ({ className = '' }) => {
  const { service, loading } = useAddReaction();

  if (loading || !service) {
    return (
      <div className={`text-center mb-8 ${className}`}>
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center mb-8 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <img
          src={service.icon_url || '/app_logo/default.png'}
          alt={service.name}
          className="w-16 h-16 object-contain mr-4"
          onError={(e) => {
            e.currentTarget.src = '/app_logo/default.png';
          }}
        />
        <div>
          <h1
            className="text-3xl font-semibold text-gray-900"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Add Reaction to {service.name}
          </h1>
        </div>
      </div>
      <p
        className="text-lg text-gray-600"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Create a response action that can be triggered by other services
      </p>
    </div>
  );
};

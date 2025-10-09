import React from 'react';
import { Link } from 'react-router-dom';

interface EditReactionsHeaderProps {
  serviceId: string;
  serviceName?: string;
  title: string;
  description: string;
}

export const EditReactionsHeader: React.FC<EditReactionsHeaderProps> = ({ 
  serviceId, 
  serviceName, 
  title, 
  description 
}) => {
  return (
    <div className="mb-8">
      <Link
        to={`/services/${serviceId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {serviceName || 'Service'}
      </Link>

      <h1
        className="text-4xl font-semibold text-gray-900 mb-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {title}
      </h1>
      <p
        className="text-gray-600"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {description}
      </p>
    </div>
  );
};

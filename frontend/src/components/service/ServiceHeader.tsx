import React from 'react';
import type { DatabaseService } from '../../services/serviceService';

interface ServiceHeaderProps {
  service: DatabaseService;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({ service }) => {
  return (
    <div className="flex items-center space-x-6 mb-8">
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={service.icon_url || '/app_logo/default.png'}
          alt={`${service.name} logo`}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
      <div>
        <h1
          className="text-4xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
        >
          {service.name}
        </h1>
        <p
          className="text-xl text-gray-600 max-w-3xl"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
        >
          {service.description || `${service.name} service integration`}
        </p>
      </div>
    </div>
  );
};

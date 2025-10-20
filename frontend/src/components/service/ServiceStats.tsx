import React from 'react';
import type { DatabaseService } from '../../services/serviceService';

interface ServiceStatsProps {
  service: DatabaseService;
}

export const ServiceStats: React.FC<ServiceStatsProps> = ({ service }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="text-2xl font-semibold text-gray-900 mb-1">
          {service.status === 'active' ? '🟢' : '🔴'}
        </div>
        <div className="text-sm text-gray-900 font-medium">Status: {service.status}</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="text-2xl font-semibold text-gray-900 mb-1">
          🔐
        </div>
        <div className="text-sm text-gray-900 font-medium">Auth: {service.auth_type}</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="text-2xl font-semibold text-gray-900 mb-1">
          {service.actions.length}
        </div>
        <div className="text-sm text-gray-900 font-medium">Actions Available</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="text-2xl font-semibold text-gray-900 mb-1">
          {service.reactions.length}
        </div>
        <div className="text-sm text-gray-900 font-medium">Reactions Available</div>
      </div>
    </div>
  );
};

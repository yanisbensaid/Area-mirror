import React from 'react';
import type { Service } from '../../services/servicesPageService';

interface ServicesPageStatsProps {
  services: Service[];
  categories: string[];
}

export const ServicesPageStats: React.FC<ServicesPageStatsProps> = ({ services, categories }) => {
  const totalAutomations = services.reduce((sum, service) => sum + service.automationCount, 0);
  const popularServices = services.filter(s => s.isPopular);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          {services.length}
        </div>
        <div className="text-xs md:text-sm text-gray-600">Total Services</div>
      </div>
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          {popularServices.length}
        </div>
        <div className="text-xs md:text-sm text-gray-600">Popular Services</div>
      </div>
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          {categories.length - 1}
        </div>
        <div className="text-xs md:text-sm text-gray-600">Categories</div>
      </div>
      <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm text-center">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
          {totalAutomations}
        </div>
        <div className="text-xs md:text-sm text-gray-600">Automations</div>
      </div>
    </div>
  );
};

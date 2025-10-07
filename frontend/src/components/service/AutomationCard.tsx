import React from 'react';
import type { Automation } from '../../services/serviceService';

interface AutomationCardProps {
  automation: Automation;
}

export const AutomationCard: React.FC<AutomationCardProps> = ({ automation }) => {
  const parseTags = (tags: string[] | string): string[] => {
    try {
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      return Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
      return [];
    }
  };

  const tags = parseTags(automation.tags);

  return (
    <div className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
      {/* Category and popularity badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
          {automation.category || 'Automation'}
        </span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span
            className="text-sm text-gray-600 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {automation.popularity}% use this
          </span>
        </div>
      </div>

      {/* Services flow */}
      <div className="flex items-center justify-between mb-6">
        {/* Trigger service */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
            <img
              src={automation.trigger_service.icon_url || '/app_logo/default.png'}
              alt={automation.trigger_service.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/app_logo/default.png';
              }}
            />
          </div>
          <span
            className="text-sm text-gray-600 text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {automation.trigger_service.name}
          </span>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center justify-center mx-4">
          <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Action service */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
            <img
              src={automation.action_service.icon_url || '/app_logo/default.png'}
              alt={automation.action_service.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/app_logo/default.png';
              }}
            />
          </div>
          <span
            className="text-sm text-gray-600 text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {automation.action_service.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3
          className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {automation.name}
        </h3>
        <p
          className="text-gray-600 text-sm leading-relaxed mb-4"
          style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.4' }}
        >
          {automation.description || `${automation.action.name} → ${automation.reaction.name}`}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.length > 0 ? (
            tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {tag}
              </span>
            ))
          ) : (
            <>
              <span
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                automation
              </span>
              <span
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {automation.trigger_service.name.toLowerCase()}
              </span>
              <span
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {automation.action_service.name.toLowerCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-200 hover:border-gray-300"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Configure Automation
        </button>
      </div>
    </div>
  );
};

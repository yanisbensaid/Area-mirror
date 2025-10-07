import React from 'react';

interface ServicesPageHeaderProps {
  title: string;
  description: string;
}

export const ServicesPageHeader: React.FC<ServicesPageHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-8 md:mb-12">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-3 md:mb-4"
        style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.2' }}
      >
        {title}
      </h1>
      <p
        className="text-lg sm:text-xl md:text-xl text-gray-600 max-w-2xl mx-auto px-2"
        style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}
      >
        {description}
      </p>
    </div>
  );
};

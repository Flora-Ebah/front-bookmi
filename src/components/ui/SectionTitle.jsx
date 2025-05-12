import React from 'react';

const SectionTitle = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`text-center mb-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle; 
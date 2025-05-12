import React from 'react';

const Badge = ({ 
  children, 
  color = 'blue', 
  className = '',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
    orange: 'bg-orange-100 text-orange-800'
  };

  const badgeClass = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.blue} ${className}`;

  return onClick ? (
    <button 
      type="button" 
      className={badgeClass} 
      onClick={onClick}
    >
      {children}
    </button>
  ) : (
    <span className={badgeClass}>
      {children}
    </span>
  );
};

export default Badge; 
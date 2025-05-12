import React from 'react';

const CardOption = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false 
}) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-bookmi-blue/50 hover:bg-gray-50 transition-all duration-300 cursor-pointer group ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="p-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 bg-gray-100 text-gray-600 group-hover:bg-bookmi-blue/10 group-hover:text-bookmi-blue">
          {icon}
        </div>
        <h3 className="font-bold text-lg mb-1 transition-colors duration-300 text-gray-800 group-hover:text-bookmi-blue">
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CardOption; 
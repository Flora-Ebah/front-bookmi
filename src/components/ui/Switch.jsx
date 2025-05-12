import React from 'react';

const Switch = ({ 
  checked = false, 
  onChange, 
  label = '', 
  name = '',
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}>
      {label && (
        <span className="mr-3 text-sm">{label}</span>
      )}
      
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
        />
        
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${
            checked ? 'bg-bookmi-blue' : 'bg-gray-300'
          }`}
        />
        
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'transform translate-x-4' : ''
          }`}
        />
      </div>
    </label>
  );
};

export default Switch; 
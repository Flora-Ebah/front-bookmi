import React from 'react';

const Radio = ({ 
  id,
  name, 
  value, 
  label, 
  checked, 
  onChange, 
  disabled = false,
  icon = null,
  className = '',
  labelClassName = '',
  helperText = ''
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5 mt-1">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-bookmi-blue focus:ring-bookmi-blue border-gray-300"
        />
      </div>
      <div className="ml-3 text-sm">
        <label 
          htmlFor={id} 
          className={`font-medium text-gray-700 select-none ${disabled ? 'opacity-60' : ''} ${labelClassName}`}
        >
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
          </div>
        </label>
        {helperText && (
          <p className="text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    </div>
  );
};

export default Radio; 
import React from 'react';

const Checkbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  children,
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange({ target: { name, checked: !checked } });
    }
  };

  return (
    <div className={`flex items-start group ${className}`}>
      <div className="flex items-center h-5 pt-0.5">
        <div className="relative">
          <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            disabled={disabled}
          />
          <div 
            onClick={handleClick}
            className={`h-5 w-5 rounded border-2 transition-all duration-300 flex items-center justify-center cursor-pointer ${
              checked 
                ? 'border-bookmi-blue bg-bookmi-blue' 
                : 'border-gray-300 group-hover:border-bookmi-blue'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {checked && (
              <svg 
                className="h-3 w-3 text-white transform transition-transform duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      {label && (
        <div className="ml-3 text-sm flex-1">
          <label 
            htmlFor={id} 
            onClick={handleClick}
            className={`cursor-pointer select-none transition-colors duration-300 block ${
              checked ? 'text-gray-800' : 'text-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {label}
          </label>
        </div>
      )}
      {children && (
        <div className="ml-3 text-sm flex-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default Checkbox; 
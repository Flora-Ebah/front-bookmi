import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner une option',
  required = false,
  disabled = false,
  error = '',
  className = '',
  helperText = ''
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            appearance-none w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-bookmi-blue/50
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}
            ${!value ? 'text-gray-500' : 'text-gray-900'}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <FiChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select; 
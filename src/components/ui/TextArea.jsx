import React from 'react';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  rows = 3,
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
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-bookmi-blue/50
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}
        `}
      />
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextArea; 
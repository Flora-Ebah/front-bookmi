import React from 'react';

const Input = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error = '',
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-gray-800 font-medium mb-2 text-base">
          {label} {required && '*'}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className={`w-full px-5 py-3 text-base rounded-xl border ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20'
        } outline-none transition-colors`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input; 
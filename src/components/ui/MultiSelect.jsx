import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({
  id,
  name,
  label,
  options = [],
  value = [],
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Sélectionnez des options',
  error = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer la liste déroulante si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue) => {
    let newValues;
    if (value.includes(optionValue)) {
      newValues = value.filter(val => val !== optionValue);
    } else {
      newValues = [...value, optionValue];
    }
    
    onChange({
      target: {
        name,
        value: newValues
      }
    });
  };

  const getSelectedLabels = () => {
    return value.map(val => {
      const option = options.find(opt => opt.value === val);
      return option ? option.label : '';
    }).join(', ');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-gray-800 font-medium mb-2 text-base">
          {label} {required && '*'}
        </label>
      )}
      
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-5 py-3 text-base rounded-xl border ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20'
        } outline-none transition-colors cursor-pointer flex justify-between items-center ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
          {value.length > 0 ? getSelectedLabels() : placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md py-1 max-h-60 overflow-y-auto border border-gray-200">
          {options.map((option) => (
            <div 
              key={option.value}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleToggleOption(option.value)}
            >
              <div className="flex-shrink-0 h-4 w-4 mr-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-bookmi-blue focus:ring-bookmi-blue"
                  checked={value.includes(option.value)}
                  onChange={() => {}} // Géré par le onClick du parent
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default MultiSelect; 
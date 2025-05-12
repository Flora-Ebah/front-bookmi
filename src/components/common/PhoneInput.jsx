import React, { useState } from 'react';

const countryCodes = [
  { code: 'CI', dialCode: '+225', name: 'Côte d\'Ivoire' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'US', dialCode: '+1', name: 'États-Unis' },
  { code: 'GB', dialCode: '+44', name: 'Royaume-Uni' },
  { code: 'DE', dialCode: '+49', name: 'Allemagne' },
  { code: 'ES', dialCode: '+34', name: 'Espagne' },
  { code: 'IT', dialCode: '+39', name: 'Italie' },
  { code: 'BE', dialCode: '+32', name: 'Belgique' },
  { code: 'CH', dialCode: '+41', name: 'Suisse' },
  { code: 'CA', dialCode: '+1', name: 'Canada' },
  { code: 'SN', dialCode: '+221', name: 'Sénégal' },
  { code: 'ML', dialCode: '+223', name: 'Mali' },
  { code: 'BF', dialCode: '+226', name: 'Burkina Faso' },
  { code: 'GN', dialCode: '+224', name: 'Guinée' },
  { code: 'GH', dialCode: '+233', name: 'Ghana' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria' },
  { code: 'CM', dialCode: '+237', name: 'Cameroun' },
  { code: 'TG', dialCode: '+228', name: 'Togo' },
  { code: 'BJ', dialCode: '+229', name: 'Bénin' },
  { code: 'GA', dialCode: '+241', name: 'Gabon' },
];

const PhoneInput = ({ value, onChange, required, placeholder }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const newValue = country.dialCode + phoneNumber;
    onChange(newValue);
  };

  const handlePhoneChange = (e) => {
    const number = e.target.value.replace(/\D/g, '');
    setPhoneNumber(number);
    const newValue = selectedCountry.dialCode + number;
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div className="flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 px-4 flex items-center border border-gray-300 rounded-l-xl hover:border-bookmi-blue focus:outline-none focus:ring-2 focus:ring-bookmi-blue/20 transition-colors"
          >
            <span className="text-base">{selectedCountry.dialCode}</span>
            <svg
              className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
              <div className="p-2">
                {countryCodes.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-lg flex items-center"
                  >
                    <span className="text-base">{country.dialCode}</span>
                    <span className="ml-2 text-sm text-gray-600">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required={required}
          placeholder={placeholder}
          className="flex-1 h-12 px-4 border border-l-0 border-gray-300 rounded-r-xl focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20 outline-none transition-colors"
        />
      </div>
    </div>
  );
};

export default PhoneInput; 
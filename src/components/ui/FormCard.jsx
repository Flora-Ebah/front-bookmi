import React from 'react';
import { Link } from 'react-router-dom';

const FormCard = ({ 
  title, 
  subtitle = null, 
  children, 
  error = '',
  onErrorClose = () => {},
  linkText = null,
  linkUrl = null
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {(subtitle || linkText) && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
              {linkText && linkUrl && (
                <>
                  {subtitle && ' '}
                  <Link to={linkUrl} className="font-medium text-bookmi-blue hover:text-primary-light">
                    {linkText}
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onErrorClose}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Fermer</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        )}
        
        <div className="mt-5 px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormCard; 
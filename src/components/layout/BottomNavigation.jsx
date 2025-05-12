import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = ({
  links = [],
  showActiveIndicator = true,
  activeIndicatorPosition = 'top',
  className = ''
}) => {
  const location = useLocation();
  
  // Fonction pour vérifier si un lien est actif
  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Obtenir les classes de l'indicateur actif
  const getActiveIndicatorClasses = () => {
    switch (activeIndicatorPosition) {
      case 'top':
        return 'absolute top-0 w-10 h-1 bg-bookmi-blue rounded-b-full';
      case 'bottom':
        return 'absolute bottom-0 w-10 h-1 bg-bookmi-blue rounded-t-full';
      default:
        return 'absolute top-0 w-10 h-1 bg-bookmi-blue rounded-b-full';
    }
  };
  
  const activeIndicatorClasses = getActiveIndicatorClasses();
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden ${className}`}>
      <div className="flex justify-between items-center h-16">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isLinkActive(link.to) 
                ? 'text-bookmi-blue' 
                : 'text-gray-500 hover:text-bookmi-blue'
            }`}
          >
            {link.icon && (
              <div className="mb-1">{link.icon}</div>
            )}
            
            {link.label && (
              <span className="text-xs font-medium">{link.label}</span>
            )}
            
            {/* Indicateur d'élément actif */}
            {showActiveIndicator && isLinkActive(link.to) && (
              <div className={activeIndicatorClasses}></div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation; 
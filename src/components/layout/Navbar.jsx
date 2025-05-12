import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ 
  title = 'BookMi',
  logo = null,
  links = [],
  actions = [],
  isTransparent = false,
  onMenuToggle = null,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (onMenuToggle) onMenuToggle(newState);
  };
  
  // Classes conditionnelles pour la navbar
  const navbarClasses = `w-full transition-all duration-300 ${
    isTransparent 
      ? 'bg-transparent py-6' 
      : 'bg-white border-b border-gray-100 h-16'
  } ${className}`;
  
  return (
    <nav className={navbarClasses}>
      <div className="px-4 md:px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {logo ? (
            logo
          ) : (
            <span className={`text-xl font-bold ${isTransparent ? 'text-white' : 'text-bookmi-blue'}`}>
              {title}
            </span>
          )}
        </Link>
        
        {/* Navigation pour écrans moyens et grands */}
        {links.length > 0 && (
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className={`font-medium text-sm transition-colors ${
                  isTransparent ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-bookmi-blue'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        
        {/* Boutons d'action (visibles sur tous les écrans) */}
        {actions.length > 0 && (
          <div className="flex items-center space-x-2 md:space-x-4">
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {action.type === 'custom' ? (
                  // Rendu direct du composant personnalisé
                  action.component
                ) : action.type === 'button' ? (
                  <button 
                    onClick={action.onClick}
                    className={action.className || `hidden md:flex px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                      isTransparent 
                        ? 'border border-white text-white hover:bg-white hover:text-bookmi-blue' 
                        : 'border border-bookmi-blue text-bookmi-blue hover:bg-bookmi-blue hover:text-white'
                    }`}
                  >
                    {action.icon ? (
                      <span className={action.label ? "mr-2" : ""}>{action.icon}</span>
                    ) : null}
                    <span className="hidden md:inline">{action.label}</span>
                  </button>
                ) : (
                  <Link 
                    to={action.to}
                    className={action.className || `hidden md:flex px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                      isTransparent 
                        ? 'bg-white text-bookmi-blue hover:bg-gray-100' 
                        : 'bg-bookmi-blue text-white hover:bg-primary-light'
                    }`}
                  >
                    {action.icon ? (
                      <span className={action.label ? "mr-2" : ""}>{action.icon}</span>
                    ) : null}
                    <span className="hidden md:inline">{action.label}</span>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
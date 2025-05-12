import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
  title = 'BookMi',
  logo = null,
  links = [],
  footer = null,
  userProfile = null
}) => {
  const location = useLocation();
  
  // Fonction pour vérifier si un lien est actif
  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="bg-white h-screen w-64 border-r border-gray-200 flex flex-col">
      {/* En-tête du sidebar */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between h-16">
        {logo || (
          <Link to="/" className="text-xl font-bold text-bookmi-blue flex items-center">
            {title}
          </Link>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {links.map((link, index) => (
            <li key={index}>
              <Link
                to={link.to}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${
                  isLinkActive(link.to) 
                    ? 'bg-bookmi-blue/10 text-bookmi-blue' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon && (
                  <span className="flex-shrink-0">{link.icon}</span>
                )}
                
                <span className="ml-3 font-medium">{link.label}</span>
                
                {isLinkActive(link.to) && link.activeIcon && (
                  <span className="ml-auto">{link.activeIcon}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Profil utilisateur */}
      {userProfile && (
        <div className="border-t border-gray-200 px-4 py-4">
          {userProfile.expanded}
        </div>
      )}
      
      {/* Footer */}
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4">
          {footer.expanded}
        </div>
      )}
    </div>
  );
};

export default Sidebar; 
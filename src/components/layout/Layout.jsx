import React from 'react';
import PropTypes from 'prop-types';

const Layout = ({
  header = null,
  sidebar = null,
  bottomNavigation = null,
  children,
  className = '',
  fullWidth = false,
  paddingTop = true
}) => {
  const hasHeader = !!header;
  const hasSidebar = !!sidebar;
  const hasBottomNav = !!bottomNavigation;
  
  // Conteneur principal
  const containerClasses = `flex min-h-screen flex-col bg-gray-50 ${className}`;
  
  // Classes pour le contenu principal
  const mainContainerClasses = `flex flex-1 flex-col ${hasSidebar ? 'lg:ml-64' : ''}`;
  const mainClasses = `flex-1 ${paddingTop ? (hasHeader ? 'pt-16 lg:pt-16' : '') : ''} ${hasBottomNav ? 'pb-16 lg:pb-0' : ''}`;
  const contentClasses = `${!fullWidth ? 'container mx-auto px-4 py-6' : ''}`;
  
  return (
    <div className={containerClasses}>
      {hasSidebar && (
        <div className="fixed left-0 top-0 hidden h-full lg:block z-10">
          {sidebar}
        </div>
      )}
      
      {hasHeader && (
        <header className={`fixed top-0 left-0 right-0 z-20 ${hasSidebar ? 'lg:pl-64' : ''}`}>
          {header}
        </header>
      )}
      
      <div className={mainContainerClasses}>
        <main className={mainClasses}>
          <div className={contentClasses}>
            {children}
          </div>
        </main>
        
        {hasBottomNav && (
          <div className="lg:hidden">
            {bottomNavigation}
          </div>
        )}
      </div>
    </div>
  );
};

Layout.propTypes = {
  header: PropTypes.node,
  sidebar: PropTypes.node,
  bottomNavigation: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  paddingTop: PropTypes.bool
};

export default Layout; 
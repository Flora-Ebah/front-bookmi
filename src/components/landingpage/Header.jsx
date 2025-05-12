import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/assets/logo.jpg';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Empêcher le défilement du body quand le menu est ouvert
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  return (
    <header className="bg-white py-5 px-2 sm:px-6 lg:px-12 xl:px-16 border-t border-gray-300 border-b border-gray-100 relative z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo sans texte */}
        <div className="flex items-center">
          <img src={logo} alt="Agence Talent" className="h-16 w-58" />
        </div>
        
        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#artistes" className="font-lato text-nav text-gray-800 hover:text-primary">Artistes</a>
          <a href="#comment" className="font-lato text-nav text-gray-800 hover:text-primary">Comment ça marche</a>
          <a href="#tarifs" className="font-lato text-nav text-gray-800 hover:text-primary">Tarifs</a>
          <a href="#contact" className="font-lato text-nav text-gray-800 hover:text-primary">Contact</a>
          <div className="flex items-center space-x-4">
            <Link to="/auth/login" className="text-secondary font-lato text-nav hover:text-primary transition-colors">
              Connexion
            </Link>
            <Link to="/auth/login" className="bg-black text-white font-lato text-nav px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
              Espace Artiste
            </Link>
          </div>
        </nav>
        
        {/* Bouton menu mobile */}
        <button 
          className="md:hidden flex flex-col justify-center items-center space-y-1.5 relative z-50"
          onClick={toggleMobileMenu}
          aria-label="Menu mobile"
        >
          {mobileMenuOpen ? (
            // On cache l'icône dans le header quand le menu est ouvert
            <span className="opacity-0">
              <span className="block w-7 h-0.5 bg-gray-800"></span>
              <span className="block w-5 h-0.5 bg-gray-800"></span>
              <span className="block w-7 h-0.5 bg-gray-800"></span>
            </span>
          ) : (
            // Icône menu hamburger
            <>
              <span className="block w-7 h-0.5 bg-gray-800"></span>
              <span className="block w-5 h-0.5 bg-gray-800"></span>
              <span className="block w-7 h-0.5 bg-gray-800"></span>
            </>
          )}
        </button>
        
        {/* Menu mobile plein écran avec animation */}
        <div 
          className={`fixed inset-0 bg-secondary z-40 md:hidden flex flex-col transition-all duration-500 ease-in-out transform ${
            mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
          }`}
        >
          {/* En-tête du menu mobile avec logo à gauche et icône fermeture à droite */}
          <div className="container mx-auto px-6 py-5 flex justify-between items-center border-b border-white border-opacity-20">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Agence Talent" 
                className={`h-16 w-auto transition-all duration-700 delay-100 transform ${
                  mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`} 
              />
            </div>
            <button 
              className={`w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-700 delay-200 transform ${
                mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
              }`}
              onClick={toggleMobileMenu}
              aria-label="Fermer le menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 flex flex-col h-full pt-8">
            <nav className="flex flex-col space-y-5">
              {['Artistes', 'Comment ça marche', 'Tarifs', 'Contact'].map((item, index) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '')}`}
                  className={`font-montserrat text-2xl font-bold text-white hover:text-primary py-2 text-left transition-all duration-700 transform ${
                    mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                  onClick={toggleMobileMenu}
                >
                  {item}
                </a>
              ))}
              
              <div className="flex flex-col space-y-4 pt-8">
                <Link 
                  to="/auth/login"
                  className={`font-lato text-lg font-medium text-white border border-white py-2.5 px-5 rounded-full hover:bg-white hover:text-secondary transition-colors text-left w-64 duration-700 transform ${
                    mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '700ms' }}
                  onClick={toggleMobileMenu}
                >
                  Connexion
                </Link>
                <Link 
                  to="/auth/login"
                  className={`bg-primary text-white font-lato text-lg font-medium py-2.5 px-5 rounded-full hover:bg-primary-light transition-colors text-left w-64 duration-700 transform ${
                    mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '800ms' }}
                  onClick={toggleMobileMenu}
                >
                  Espace Artiste
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
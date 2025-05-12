import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiLayout, FiCalendar, FiStar, FiPackage, FiMessageSquare, FiSettings, FiUser, FiLogOut, FiHelpCircle, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { Button, NotificationDropdown } from '../../../components/ui';
import { Layout, Sidebar, Navbar, BottomNavigation } from '../../../components/layout';
import { useAuth } from '../../../contexts/AuthContext';

const ArtistLayout = ({ children }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les informations de l'utilisateur depuis le contexte d'authentification
  const { currentUser, logout } = useAuth();
  
  // Fermer les menus si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Fermer les menus à chaque changement de route
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);
  
  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      // La redirection est gérée par le contexte d'authentification
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Liens de navigation pour le sidebar et la barre de navigation mobile
  const navigationLinks = [
    {
      label: 'Accueil',
      to: '/app/artist',
      icon: <FiHome className="h-5 w-5" />
    },
    {
      label: 'Événements',
      to: '/app/artist/events',
      icon: <FiCalendar className="h-5 w-5" />
    },
    {
      label: 'Mes prestations',
      to: '/app/artist/services',
      icon: <FiPackage className="h-5 w-5" />
    },
    {
      label: 'Mes avis',
      to: '/app/artist/reviews',
      icon: <FiStar className="h-5 w-5" />
    },
    {
      label: 'Messages',
      to: '/app/artist/messages',
      icon: <FiMessageSquare className="h-5 w-5" />
    },
    {
      label: 'Paramètres',
      to: '/app/artist/settings',
      icon: <FiSettings className="h-5 w-5" />
    }
  ];

  // Exemple de profil utilisateur pour le sidebar
  const userProfile = {
    expanded: (
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
          <img src="/placeholder-profile.jpg" alt="Profil" className="h-full w-full object-cover" />
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-800">{currentUser?.artistName || `${currentUser?.firstName} ${currentUser?.lastName}`}</p>
          <p className="text-sm text-gray-500">Artiste</p>
        </div>
      </div>
    ),
    collapsed: (
      <div className="flex justify-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
          <img src="/placeholder-profile.jpg" alt="Profil" className="h-full w-full object-cover" />
        </div>
      </div>
    )
  };

  // Élément personnalisé pour le logo
  const customLogo = (
    <Link to="/app/artist" className="flex items-center">
      <span className="text-xl font-bold text-bookmi-blue">
        BookMi Artiste
      </span>
    </Link>
  );
  
  // Composant pour l'en-tête avec menus déroulants
  const HeaderWithMenus = () => (
    <div className="relative w-full">
      <Navbar 
        logo={customLogo}
        actions={[
          // Composant de notification
          {
            type: 'custom',
            component: <NotificationDropdown />
          },
          // Avatar de l'utilisateur
          {
            type: 'button',
            onClick: () => setShowProfileMenu(!showProfileMenu),
            className: "flex items-center ml-2 md:ml-3",
            icon: (
              <div className="flex items-center">
                <div className="h-7 w-7 rounded-full bg-gray-300 overflow-hidden"></div>
                <FiChevronDown className="h-4 w-4 text-gray-600 transition-transform ml-1 hidden md:block" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </div>
            ),
            label: ""
          }
        ]}
        onMenuToggle={(open) => setSidebarOpen(open)}
      />
      
      {/* Menu déroulant du profil */}
      {showProfileMenu && (
        <div 
          ref={profileMenuRef}
          className="absolute right-4 top-16 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
          style={{ 
            maxHeight: 'calc(100vh - 4rem)', 
            overflowY: 'auto',
            position: 'fixed' 
          }}
        >
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="font-medium text-gray-800">{currentUser?.artistName || `${currentUser?.firstName} ${currentUser?.lastName}`}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
          
          <ul>
            <li>
              <Link 
                to="/app/artist/profile" 
                className="px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700"
              >
                <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                <span>Mon Profil</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/app/artist/settings" 
                className="px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700"
              >
                <FiSettings className="mr-3 h-5 w-5 text-gray-500" />
                <span>Paramètres</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/help" 
                className="px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700"
              >
                <FiHelpCircle className="mr-3 h-5 w-5 text-gray-500" />
                <span>Aide</span>
              </Link>
            </li>
            <li className="border-t border-gray-200 mt-2">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700 w-full text-left"
              >
                <FiLogOut className="mr-3 h-5 w-5 text-gray-500" />
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Layout
      sidebar={<Sidebar links={navigationLinks} userProfile={userProfile} />}
      header={<HeaderWithMenus />}
      bottomNavigation={<BottomNavigation 
        links={[
          navigationLinks[0], // Accueil
          navigationLinks[1], // Événements
          navigationLinks[2], // Mes prestations
          navigationLinks[3], // Mes avis
          navigationLinks[4], // Messages
        ]} 
      />}
    >
      {children}
    </Layout>
  );
};

export default ArtistLayout; 
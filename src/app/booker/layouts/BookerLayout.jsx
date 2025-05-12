import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiCalendar, FiStar, FiHeart, FiMessageSquare, FiSettings, FiBell, FiUser, FiLogOut, FiHelpCircle, FiChevronDown, FiCreditCard } from 'react-icons/fi';
import { Button, NotificationDropdown } from '../../../components/ui';
import { Layout, Sidebar, Navbar, BottomNavigation } from '../../../components/layout';
import { useAuth } from '../../../contexts/AuthContext';

const BookerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Récupérer les informations de l'utilisateur depuis le contexte d'authentification
  const { currentUser, logout } = useAuth();

  const profileMenuRef = useRef(null);

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

  const navItems = [
    { icon: <FiHome />, label: 'Accueil', to: '/app/booker' },
    { icon: <FiSearch />, label: 'Rechercher un artiste', to: '/app/booker/search' },
    { icon: <FiCalendar />, label: 'Mes réservations', to: '/app/booker/bookings' },
    { icon: <FiHeart />, label: 'Favoris', to: '/app/booker/favorites' },
    { icon: <FiMessageSquare />, label: 'Messages', to: '/app/booker/messages' },
    { icon: <FiCreditCard />, label: 'Paiement', to: '/app/booker/payment' },
    { icon: <FiSettings />, label: 'Paramètres', to: '/app/booker/settings' }
  ];

  const mobileNavItems = [
    { icon: <FiHome />, label: 'Accueil', to: '/app/booker' },
    { icon: <FiSearch />, label: 'Rechercher', to: '/app/booker/search' },
    { icon: <FiCalendar />, label: 'Réservations', to: '/app/booker/bookings' },
    { icon: <FiCreditCard />, label: 'Paiement', to: '/app/booker/payment' }
  ];

  // Profil utilisateur pour la sidebar
  const userProfile = {
    expanded: (
      <div className="flex items-center">
        <div className="h-9 w-9 rounded-full bg-gray-300 flex-shrink-0"></div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">{currentUser?.companyName || `${currentUser?.firstName} ${currentUser?.lastName}`}</p>
          <p className="text-xs text-gray-500">Organisateur</p>
        </div>
      </div>
    )
  };

  // Élément personnalisé pour le logo
  const customLogo = (
    <div className="flex items-center">
      <span className="text-xl font-bold text-bookmi-blue">
        BookMi Booker
      </span>
    </div>
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
            <p className="font-medium text-gray-800">{currentUser?.companyName || `${currentUser?.firstName} ${currentUser?.lastName}`}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
          
          <ul>
            <li>
              <Link 
                to="/app/booker/profile" 
                className="px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700"
              >
                <FiUser className="mr-3 h-5 w-5 text-gray-500" />
                <span>Mon Profil</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/app/booker/settings" 
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
      header={<HeaderWithMenus />}
      sidebar={<Sidebar
        title="BookMi"
        links={navItems}
        userProfile={userProfile}
      />}
      bottomNavigation={<BottomNavigation
        links={mobileNavItems}
        activeIndicatorPosition="top"
      />}
    >
      {children}
    </Layout>
  );
};

export default BookerLayout; 
import React, { useState, useRef, useEffect } from 'react';
import { Card, Badge, Switch } from '../../../components/ui';
import { 
  FiClock, FiDollarSign, FiEdit2, FiTrash2, FiMoreVertical, 
  FiList, FiImage, FiEye, FiEyeOff, FiMapPin, FiCalendar 
} from 'react-icons/fi';

const ServiceCard = ({ 
  service, 
  onEdit, 
  onDelete, 
  onToggleActive,
  viewMode = 'grid'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formater le prix en FCFA
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(parseInt(price)) + ' FCFA';
  };

  // Déterminer la couleur du badge en fonction de la catégorie
  const getBadgeColor = (category) => {
    switch (category) {
      case 'Concert':
        return 'blue';
      case 'Animation':
        return 'purple';
      case 'Atelier':
        return 'green';
      case 'Cours':
        return 'orange';
      case 'Festival':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Vérifier si le service a une image à afficher
  const hasImage = service.photos && service.photos.length > 0;
  
  // Génération d'un dégradé aléatoire mais harmonieux basé sur la catégorie
  const getGradientBackground = (category) => {
    const gradients = {
      'Concert': 'from-blue-400 to-indigo-500',
      'Animation': 'from-purple-400 to-pink-500',
      'Atelier': 'from-green-400 to-teal-500',
      'Cours': 'from-orange-400 to-yellow-500',
      'Festival': 'from-red-400 to-pink-500',
      'default': 'from-blue-400 to-indigo-500'
    };
    
    return gradients[category] || gradients.default;
  };
  
  // Version en grille (carte)
  if (viewMode === 'grid') {
    return (
      <Card className={`overflow-hidden h-full transition-all duration-300 hover:shadow-md ${!service.active ? 'bg-gray-50' : ''}`}>
        {/* Photo de couverture ou dégradé stylisé */}
        <div className="relative h-44 overflow-hidden">
          {hasImage ? (
            <img 
              src={service.photos[0]} 
              alt={service.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${getGradientBackground(service.category)} flex items-center justify-center`}>
              <span className="text-white text-3xl font-bold opacity-30">{service.category || 'Service'}</span>
            </div>
          )}
          
          {service.photos && service.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white rounded-full text-xs px-2 py-1 flex items-center">
              <FiImage className="mr-1 w-3 h-3" />
              <span>{service.photos.length}</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Badge color={getBadgeColor(service.category)}>{service.category}</Badge>
          </div>
        </div>
        
        <div className="p-5">
          {!hasImage && (
            <div className="flex justify-between items-start mb-3">
              <Badge color={getBadgeColor(service.category)}>{service.category}</Badge>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiMoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-10 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200"
                  >
                    <button
                      onClick={() => {
                        onEdit(service._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FiEdit2 className="mr-2 w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onDelete(service._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <FiTrash2 className="mr-2 w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-2 text-gray-800">{service.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.description}</p>
          
          <div className="flex flex-col space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="flex items-center mr-4">
                <FiClock className="mr-1.5 w-4 h-4 text-gray-500" />
                <span>{service.duration} heure{service.duration > 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center">
                <FiDollarSign className="mr-1.5 w-4 h-4 text-gray-500" />
                <span>{formatPrice(service.price)}</span>
              </div>
            </div>
            
            {/* Lieu si disponible */}
            {service.location && (
              <div className="flex items-center text-sm text-gray-600">
                <FiMapPin className="mr-1.5 w-4 h-4 text-gray-500" />
                <span className="truncate">{service.location}</span>
              </div>
            )}
            
            {/* Caractéristiques */}
            {service.features && service.features.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <FiList className="mr-1.5 w-4 h-4 text-gray-500" />
                <span>{service.features.length} caractéristique{service.features.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm">
              {service.active ? 
                <span className="flex items-center text-green-600">
                  <FiEye className="mr-1.5 w-4 h-4" />
                  Disponible
                </span> : 
                <span className="flex items-center text-gray-500">
                  <FiEyeOff className="mr-1.5 w-4 h-4" />
                  Non disponible
                </span>
              }
            </div>
            <div className="flex items-center">
              <button
                onClick={() => onEdit(service._id)}
                className="p-1.5 text-gray-500 hover:text-bookmi-blue transition-colors mr-1"
                aria-label="Modifier"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <Switch
                checked={service.active}
                onChange={() => onToggleActive(service._id)}
                label=""
                className="ml-2"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Version en liste
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${!service.active ? 'bg-gray-50' : ''}`}>
      <div className="flex flex-col md:flex-row">
        {/* Photo de couverture si disponible */}
        {hasImage && (
          <div className="w-full md:w-56 h-40 relative flex-shrink-0">
            <img 
              src={service.photos[0]} 
              alt={service.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge color={getBadgeColor(service.category)}>{service.category}</Badge>
            </div>
          </div>
        )}
        
        <div className="p-5 flex-grow">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="mb-2 md:mb-0">
              {!hasImage && (
                <Badge color={getBadgeColor(service.category)} className="mb-2">{service.category}</Badge>
              )}
              <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
            </div>
            
            <div className="flex items-center md:ml-4">
              <div className="flex items-center mr-4 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <FiDollarSign className="mr-1.5 w-4 h-4 text-bookmi-blue" />
                <span className="text-gray-800 font-medium">{formatPrice(service.price)}</span>
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiMoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-10 w-44 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200"
                  >
                    <button
                      onClick={() => {
                        onEdit(service._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FiEdit2 className="mr-2 w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onDelete(service._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <FiTrash2 className="mr-2 w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 my-3 line-clamp-2">{service.description}</p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FiClock className="mr-1.5 w-4 h-4 text-gray-500" />
              <span>{service.duration} heure{service.duration > 1 ? 's' : ''}</span>
            </div>
            
            {/* Lieu si disponible */}
            {service.location && (
              <div className="flex items-center">
                <FiMapPin className="mr-1.5 w-4 h-4 text-gray-500" />
                <span className="truncate">{service.location}</span>
              </div>
            )}
            
            {/* Caractéristiques */}
            {service.features && service.features.length > 0 && (
              <div className="flex items-center">
                <FiList className="mr-1.5 w-4 h-4 text-gray-500" />
                <span>{service.features.length} caractéristique{service.features.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm">
              {service.active ? 
                <span className="flex items-center text-green-600">
                  <FiEye className="mr-1.5 w-4 h-4" />
                  Disponible
                </span> : 
                <span className="flex items-center text-gray-500">
                  <FiEyeOff className="mr-1.5 w-4 h-4" />
                  Non disponible
                </span>
              }
            </div>
            <div>
              <Switch
                checked={service.active}
                onChange={() => onToggleActive(service._id)}
                label=""
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard; 
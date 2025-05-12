import React, { useEffect } from 'react';
import { FiClock, FiCalendar, FiMessageSquare, FiLink, FiYoutube, FiFacebook, FiInstagram, FiShare2 } from 'react-icons/fi';
import { Button, Badge } from '../ui';
import Modal from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

const ServiceDetailsModal = ({ service, isOpen, onClose, artistId }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Nettoyage lors du démontage du composant
    return () => {
      if (isOpen) {
        onClose();
      }
    };
  }, [isOpen, onClose]);

  if (!service || !isOpen) return null;

  const handleReservation = () => {
    // Fermer le modal
    onClose();
    // Rediriger vers la page de réservation avec les IDs de l'artiste et du service
    navigate(`/app/booker/reservation/${artistId || service.artist?._id}/${service._id}`);
  };

  const renderPhotos = () => (
    <div className="space-y-4">
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
        <img 
          src={service.photos?.[0] || '/placeholder-service.jpg'} 
          alt={service.title}
          className="w-full h-full object-cover"
        />
      </div>
      {service.photos?.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {service.photos.slice(1).map((photo, index) => (
            <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
              <img 
                src={photo} 
                alt={`${service.title} - Photo ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFeatures = () => {
    if (!service.features?.length) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Caractéristiques</h4>
        <ul className="grid grid-cols-2 gap-2">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-bookmi-blue rounded-full mr-2"></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSocialLinks = () => {
    if (!service.socialLinks) return null;
    
    const links = [
      { icon: <FiFacebook />, url: service.socialLinks.facebook, label: 'Facebook' },
      { icon: <FiInstagram />, url: service.socialLinks.instagram, label: 'Instagram' },
      { icon: <FiYoutube />, url: service.socialLinks.youtube, label: 'YouTube' },
      { icon: <FiShare2 />, url: service.socialLinks.tiktok, label: 'TikTok' }
    ].filter(link => link.url);

    if (links.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Réseaux sociaux</h4>
        <div className="flex space-x-3">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-bookmi-blue transition-colors"
              title={link.label}
            >
              <span className="mr-1">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderDetails = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <div className="flex items-center">
                <FiClock className="mr-1.5" />
                <span>{service.duration} heure{service.duration > 1 ? 's' : ''}</span>
              </div>
              <span className="mx-2">•</span>
              <Badge variant="primary">{service.category}</Badge>
            </div>
          </div>
          <Badge variant={service.active ? "success" : "danger"}>
            {service.active ? "Disponible" : "Indisponible"}
          </Badge>
        </div>
        <p className="text-gray-600">{service.description}</p>
      </div>

      {renderFeatures()}
      {renderSocialLinks()}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-bookmi-blue">{service.price}€</span>
            <span className="text-sm text-gray-500 ml-1">/heure</span>
          </div>
          <Badge variant="primary">{service.category}</Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <FiClock className="mr-2" />
            <span>Durée: {service.duration} heure{service.duration > 1 ? 's' : ''}</span>
          </div>
          {service.availability && (
            <div className="flex items-center text-gray-600">
              <FiCalendar className="mr-2" />
              <span>Disponibilité: {service.availability}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="primary" className="flex-1">
          <div className="flex items-center justify-center">
            <FiMessageSquare className="mr-2" />
            <span>Contacter</span>
          </div>
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1"
          onClick={handleReservation}
        >
          <div className="flex items-center justify-center">
            <FiCalendar className="mr-2" />
            <span>Réserver</span>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service.title}
      size="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPhotos()}
        {renderDetails()}
      </div>
    </Modal>
  );
};

export default ServiceDetailsModal; 
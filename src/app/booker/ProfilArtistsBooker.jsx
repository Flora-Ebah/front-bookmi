import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ReviewModal } from '../../components/ui';
import { FiStar, FiHeart, FiMapPin, FiClock, FiDollarSign, FiCalendar, FiMessageSquare, FiThumbsUp, FiMusic } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import BookerLayout from './layouts/BookerLayout';
import ServiceDetailsModal from '../../components/services/ServiceDetailsModal';
import { toast } from 'react-toastify';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FiStar key={`full-${i}`} className="text-yellow-400 fill-current" />
      ))}
      {hasHalfStar && (
        <FiStar key="half" className="text-yellow-400 fill-current opacity-50" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FiStar key={`empty-${i}`} className="text-gray-300" />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};

const ServiceCard = ({ service, onServiceClick }) => (
  <div 
    className="group cursor-pointer h-full rounded-lg overflow-hidden bg-white relative flex flex-col border border-gray-200 hover:border-bookmi-blue hover:shadow-md transition-all duration-300"
    onClick={() => onServiceClick(service)}
  >
    {/* En-tête de la carte avec image ou fond de couleur */}
    <div className="relative h-44">
      {service.photos?.[0] ? (
        <img 
          src={service.photos[0]} 
          alt={service.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiMusic className="text-bookmi-blue w-6 h-6" />
          </div>
        </div>
      )}
      
      {/* Statut de disponibilité */}
      <div className="absolute top-3 left-3">
        {service.active ? (
          <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
            Disponible
          </div>
        ) : (
          <div className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
            Indisponible
          </div>
        )}
      </div>
      
      {/* Catégorie et prix */}
      <div className="absolute bottom-0 inset-x-0 p-3 flex justify-between items-center bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-white text-sm font-medium">
          {service.category}
        </span>
        <div className="bg-white text-gray-800 px-2.5 py-1 rounded-md text-sm font-bold">
          {service.price}€<span className="text-xs font-normal text-gray-500">/h</span>
        </div>
      </div>
    </div>
    
    {/* Contenu principal */}
    <div className="p-4 flex-grow flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
      
      {/* Métadonnées */}
      <div className="flex flex-wrap text-sm text-gray-600 gap-4 mb-3">
        <div className="flex items-center">
          <FiClock className="text-bookmi-blue w-4 h-4 mr-1.5" />
          <span>{service.duration} heure{service.duration > 1 ? 's' : ''}</span>
        </div>
        
        {service.location && (
          <div className="flex items-center">
            <FiMapPin className="text-bookmi-blue w-4 h-4 mr-1.5" />
            <span>{service.location}</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
        {service.description || "Aucune description disponible pour cette prestation."}
      </p>
      
      {/* Pied de carte */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex justify-end">
        <div className="text-bookmi-blue font-medium text-sm flex items-center group-hover:text-bookmi-blue/80 transition-colors">
          Voir les détails
          <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);

// Composant pour afficher un avis individuel
const ReviewItem = ({ review }) => {
  const date = new Date(review.date);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Formater la date de réponse si elle existe
  let responseDate = null;
  if (review.artistResponse && review.artistResponse.date) {
    responseDate = new Date(review.artistResponse.date);
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {review.booker.profilePhoto ? (
              <img
                src={review.booker.profilePhoto}
                alt={review.booker.companyName || `${review.booker.firstName} ${review.booker.lastName}`}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200">
                <span className="text-bookmi-blue font-semibold text-xs">
                  {(review.booker.firstName ? review.booker.firstName.charAt(0) : '') + 
                   (review.booker.lastName ? review.booker.lastName.charAt(0) : '')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-800">
                {review.booker.companyName || `${review.booker.firstName} ${review.booker.lastName}`}
              </h4>
              <span className="text-xs text-gray-500 flex items-center">
                <FiCalendar className="mr-1 h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex-grow">
              {review.comment && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
              )}
            </div>
            
            {/* Réponse de l'artiste */}
            {review.artistResponse && review.artistResponse.text && (
              <div className="mt-3 pl-3 border-l-2 border-bookmi-blue bg-blue-50 p-3 rounded-r-md">
                <div className="flex items-center mb-1">
                  <span className="text-xs font-semibold text-bookmi-blue">Réponse de l'artiste</span>
                  {responseDate && (
                    <span className="ml-2 text-xs text-gray-500">
                      {responseDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700">{review.artistResponse.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section d'avis complète
const ReviewsSection = ({ artistId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await ServiceArtistBooker.getArtistReviews(artistId);
        
        if (response && response.success && response.data) {
          setReviews(response.data.reviews || []);
        } else {
          setReviews([]);
        }
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des avis:', err);
        setError('Impossible de charger les avis');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artistId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bookmi-blue mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des avis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiMessageSquare className="mr-2 text-bookmi-blue" /> 
          Avis ({reviews.length})
        </h2>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <FiMessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Aucun avis pour le moment</p>
          <p className="text-sm text-gray-500 mt-2">Soyez le premier à évaluer cet artiste</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <ReviewItem key={index} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilArtistsBooker = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching artist data for ID: ${artistId}`);
        
        const artistResponse = await ServiceArtistBooker.getArtistDetails(artistId);
        console.log('Artist response:', artistResponse);
        
        if (artistResponse && artistResponse.data) {
          setArtist(artistResponse.data);
          
          // Si les services sont inclus dans les détails de l'artiste
          if (artistResponse.data.services && Array.isArray(artistResponse.data.services)) {
            console.log('Services from artist details:', artistResponse.data.services);
            setServices(artistResponse.data.services);
          } else {
            // Sinon, récupérer les services séparément
            const servicesResponse = await ServiceArtistBooker.getArtistServices(artistId);
            console.log('Services response:', servicesResponse);
            
            if (servicesResponse && servicesResponse.data) {
              console.log('Setting services from services response:', servicesResponse.data);
              setServices(servicesResponse.data);
            } else {
              setServices([]);
            }
          }

          // Vérifier si l'artiste est déjà dans les favoris
          const favoritesResponse = await ServiceArtistBooker.getFavoriteArtists();
          console.log('Favorites response:', favoritesResponse);
          
          if (favoritesResponse && favoritesResponse.data) {
            const favorites = favoritesResponse.data;
            const isAlreadyFavorite = favorites.some(fav => fav._id === artistId);
            setIsFavorite(isAlreadyFavorite);
          }
        } else {
          throw new Error('Données d\'artiste non disponibles');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError('Impossible de charger les données de l\'artiste');
        toast.error('Erreur lors du chargement du profil');
        navigate('/app/booker/search');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId, navigate]);

  const handleToggleFavorite = async () => {
    try {
      setIsFavorite(prev => !prev); // Mise à jour optimiste de l'UI
      
      if (isFavorite) {
        await ServiceArtistBooker.removeFromFavorites(artistId);
        toast.success(`${artist.artistName || 'Artiste'} retiré des favoris`);
      } else {
        await ServiceArtistBooker.addToFavorites(artistId);
        toast.success(`${artist.artistName || 'Artiste'} ajouté aux favoris`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
      setIsFavorite(prev => !prev); // Annuler le changement en cas d'erreur
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const handleReservation = (service) => {
    navigate(`/app/booker/reservation/${artistId}/${service._id}`);
  };

  const handleRateArtist = () => {
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await ServiceArtistBooker.rateArtist(artistId, reviewData);
      
      if (response && response.success) {
        // Mettre à jour la note dans l'état local
        setArtist(prev => ({
          ...prev,
          rating: response.data.rating
        }));
        
        toast.success('Votre évaluation a été enregistrée');
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'envoi de l'évaluation");
    }
  };

  if (loading) {
    return (
      <BookerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bookmi-blue"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement du profil...</p>
          </div>
        </div>
      </BookerLayout>
    );
  }

  if (error || !artist) {
    return (
      <BookerLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <FiMessageSquare className="h-10 w-10 text-red-500" />
          </div>
          <div className="text-red-500 font-medium mb-4 text-center">{error || 'Artiste non trouvé'}</div>
          <Button variant="primary" onClick={() => navigate('/app/booker/search')}>
            Retour à la recherche
          </Button>
        </div>
      </BookerLayout>
    );
  }

  // Calculer le prix minimum des services s'il y en a
  const minPrice = services && services.length > 0 ? 
    Math.min(...services.filter(s => typeof s.price === 'number' && !isNaN(s.price)).map(s => s.price)) 
    : null;

  console.log('Services in render:', services);
  console.log('Min price:', minPrice);

  return (
    <BookerLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Barre de navigation contexte */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/app/booker/search')}
            className="flex items-center text-sm text-gray-600 hover:text-bookmi-blue"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la recherche
          </button>
        </div>
      
        {/* En-tête du profil */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Photo de couverture */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-bookmi-blue to-purple-600">
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Info mobile (position absolue sur couverture) */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-end space-x-4">
                <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src={artist.profilePhoto || '/placeholder-profile.jpg'} 
                    alt={artist.artistName || `${artist.firstName} ${artist.lastName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold truncate">
                    {artist.artistName || `${artist.firstName} ${artist.lastName}`}
                  </h1>
                  {artist.projectName && (
                    <p className="text-sm opacity-90 truncate">{artist.projectName}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Info desktop */}
            <div className="hidden md:block absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end space-x-6">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md">
                  <img 
                    src={artist.profilePhoto || '/placeholder-profile.jpg'} 
                    alt={artist.artistName || `${artist.firstName} ${artist.lastName}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {artist.artistName || `${artist.firstName} ${artist.lastName}`}
                  </h1>
                  {artist.projectName && (
                    <p className="text-lg opacity-90">{artist.projectName}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleRateArtist}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <span className="flex items-center">
                      <FiThumbsUp className="h-5 w-5 mr-2" />
                      Évaluer
                    </span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleToggleFavorite}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <span className="flex items-center">
                      <FiHeart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                      {isFavorite ? 'Favoris' : 'Ajouter'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            {/* Actions boutons mobiles */}
            <div className="flex md:hidden justify-end space-x-2 -mt-2 mb-4">
              <Button 
                variant="secondary" 
                onClick={handleRateArtist}
                className="p-2"
              >
                <FiThumbsUp className={`h-5 w-5`} />
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleToggleFavorite}
                className="p-2"
              >
                <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm">
                  <div className="bg-yellow-50 px-2 py-1 rounded-full flex items-center">
                    <FiStar className="text-yellow-500 mr-1 fill-current" />
                    <span className="font-medium">{(artist.rating?.value || 0).toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({artist.rating?.count || 0})</span>
                  </div>
                  
                  <span className="flex items-center text-gray-600">
                    <FiMapPin className="mr-1 text-bookmi-blue" />
                    {artist.city}, {artist.country}
                  </span>
                  
                  <span className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1 text-bookmi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {artist.profileViews || 0} vue{(artist.profileViews !== 1) ? 's' : ''}
                  </span>
                </div>
                
                {artist.bio && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-bookmi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      À propos
                    </h3>
                    <p className="text-gray-700">{artist.bio}</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button variant="primary" className="flex-1">
                    <div className="flex items-center justify-center">
                      <FiMessageSquare className="mr-2" />
                      <span>Contacter</span>
                    </div>
                  </Button>
                  {services && services.length > 0 && (
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => handleReservation(services[0])}
                    >
                      <div className="flex items-center justify-center">
                        <FiCalendar className="mr-2" />
                        <span>Réserver</span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
                <div className="flex items-center mb-5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-bookmi-blue to-purple-500 text-white flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-gray-800 text-lg">Informations clés</h3>
                    <p className="text-sm text-gray-500">Tout ce que vous devez savoir</p>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start p-3 rounded-lg border border-gray-100 bg-blue-50/30 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-bookmi-blue mr-3">
                        <FiClock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-600">Disponibilité</h4>
                        <p className="font-medium text-gray-900">{artist.availability || 'Sur demande'}</p>
                      </div>
                    </div>
                    
                    {minPrice !== null && (
                      <div className="flex items-start p-3 rounded-lg border border-gray-100 bg-green-50/30 hover:bg-green-50 transition-colors">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-100 text-green-600 mr-3">
                          <FiDollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Tarifs</h4>
                          <p className="font-medium text-gray-900">À partir de <span className="text-green-600 font-bold">{minPrice}€</span></p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start p-3 rounded-lg border border-gray-100 bg-purple-50/30 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-100 text-purple-600 mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-600">Prestations</h4>
                        <p className="font-medium text-gray-900">{services.length} prestation{services.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    {artist.discipline && (
                      <div className="flex items-start p-3 rounded-lg border border-gray-100 bg-red-50/30 hover:bg-red-50 transition-colors">
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-100 text-red-500 mr-3">
                          <FiMusic className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Discipline</h4>
                          <p className="font-medium text-gray-900">{artist.discipline}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {artist.genres && artist.genres.length > 0 && (
                  <div className="mt-4 pt-4">
                    <div className="flex items-center mb-2">
                      <div className="h-6 w-6 rounded-md bg-blue-100 text-bookmi-blue flex items-center justify-center mr-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-sm text-gray-700">Genres musicaux</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-8">
                      {artist.genres.map((genre, index) => (
                        <span key={index} className="bg-blue-50 text-bookmi-blue px-2 py-1 rounded-full text-xs font-medium">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services et prestations */}
        {services.length > 0 && (
          <div className="mb-12">
            <div className="relative mb-10 pb-6 border-b border-gray-100">
              {/* Fond décoratif */}
              <div className="absolute -top-6 -left-3 w-24 h-24 bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full filter blur-xl opacity-70"></div>
              
              <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-bookmi-blue to-blue-400 flex items-center justify-center text-white shadow-sm">
                      <FiCalendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Prestations proposées</h2>
                  </div>
                  <p className="text-gray-500 flex items-center">
                    <span className="bg-blue-100/50 text-bookmi-blue font-medium px-2 py-0.5 rounded-md text-sm mr-2">
                      {services.length}
                    </span>
                    prestation{services.length > 1 ? 's' : ''} disponible{services.length > 1 ? 's' : ''}
                  </p>
                </div>
                
                {services.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="group relative overflow-hidden border-bookmi-blue/80 bg-white text-bookmi-blue hover:bg-bookmi-blue hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
                  >
                    <span className="flex items-center">
                      Voir toutes les prestations
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Grille de services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.slice(0, 3).map(service => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  onServiceClick={handleServiceClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section des avis */}
        <ReviewsSection artistId={artistId} />

        {/* Galerie */}
        {artist.gallery && artist.gallery.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-bookmi-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Galerie
              </h2>
              {artist.gallery.length > 4 && (
                <Button variant="text" className="text-sm">
                  Voir toutes les photos
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artist.gallery.slice(0, 4).map((photo, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            {artist.gallery.length > 4 && (
              <div className="text-center mt-4 md:hidden">
                <Button variant="text" className="text-sm">
                  Voir toutes les photos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Service Details Modal */}
        <ServiceDetailsModal 
          service={selectedService}
          isOpen={!!selectedService}
          onClose={handleCloseModal}
          artistId={artistId}
        />

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
          artist={artist}
        />
      </div>
    </BookerLayout>
  );
};

export default ProfilArtistsBooker; 
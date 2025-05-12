import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button, ReviewModal } from '../../components/ui';
import { FiStar, FiHeart, FiMapPin, FiTrash2, FiEye, FiThumbsUp } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';

// Composant pour afficher la note sous forme d'étoiles
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

// Carte d'artiste favori
const FavoriteArtistCard = ({ artist, onRemove, onViewProfile, onRate }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Photo de l'artiste */}
      <div className="w-full h-48 bg-gray-200 flex-shrink-0">
        {artist.profilePhoto ? (
          <img 
            src={artist.profilePhoto} 
            alt={artist.artistName || `${artist.firstName} ${artist.lastName}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-bookmi-blue/70 to-purple-500/70">
            <FiStar className="text-white h-12 w-12" />
          </div>
        )}
      </div>
      
      {/* Détails de l'artiste */}
      <div className="p-4 flex-1 flex flex-col">
        <div>
          <h3 className="text-lg font-semibold mb-1 truncate">
            {artist.artistName || `${artist.firstName} ${artist.lastName}`}
          </h3>
          {artist.projectName && (
            <p className="text-sm text-gray-600 mb-1 truncate">{artist.projectName}</p>
          )}
          <div className="flex items-center mb-2">
            <StarRating rating={artist.rating?.value || 0} />
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FiMapPin className="mr-1" />
            <span className="truncate">{artist.city}, {artist.country}</span>
          </div>
          
          {artist.profileViews !== undefined && (
            <div className="text-xs text-gray-500">
              {artist.profileViews} vue{artist.profileViews !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="mt-auto flex space-x-3 pt-3">
          <Button 
            variant="primary" 
            onClick={() => onViewProfile(artist._id)}
            className="flex-1"
          >
            <span className="flex items-center justify-center">
              <FiEye className="mr-2" />
              Voir profil
            </span>
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onRate(artist)}
            className="flex-none px-3"
          >
            <span className="flex items-center justify-center">
              <FiThumbsUp />
            </span>
          </Button>
          <Button 
            variant="danger" 
            onClick={() => onRemove(artist)}
            className="flex-none px-3"
          >
            <span className="flex items-center justify-center">
              <FiTrash2 />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Page principale des favoris
const BookerFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ServiceArtistBooker.getFavoriteArtists();
      console.log('Favorites response:', response);
      
      if (response && response.data) {
        setFavorites(response.data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      setError('Impossible de charger vos artistes favoris');
      toast.error('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (artist) => {
    try {
      await ServiceArtistBooker.removeFromFavorites(artist._id);
      toast.success(`${artist.artistName || 'Artiste'} retiré des favoris`);
      
      // Mettre à jour la liste des favoris
      setFavorites(favorites.filter(fav => fav._id !== artist._id));
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  const handleViewProfile = (artistId) => {
    navigate(`/app/booker/artists/${artistId}`);
  };

  const handleRateArtist = (artist) => {
    setSelectedArtist(artist);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedArtist(null);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (!selectedArtist) return;
      
      const response = await ServiceArtistBooker.rateArtist(selectedArtist._id, reviewData);
      
      if (response && response.success) {
        // Mettre à jour la note dans l'état local
        setFavorites(prevFavorites => prevFavorites.map(artist => 
          artist._id === selectedArtist._id 
            ? { ...artist, rating: response.data.rating } 
            : artist
        ));
        
        toast.success('Votre évaluation a été enregistrée');
        setShowReviewModal(false);
        setSelectedArtist(null);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'envoi de l'évaluation");
    }
  };

  return (
    <BookerLayout>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mes artistes favoris</h1>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/app/booker/search')}
          >
            Découvrir plus d'artistes
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bookmi-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos favoris...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Button variant="primary" onClick={fetchFavorites}>
              Réessayer
            </Button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg p-8">
            <div className="text-5xl text-gray-300 mb-4">
              <FiHeart className="mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun artiste en favoris</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore ajouté d'artistes à vos favoris.
              Explorez notre sélection et marquez vos artistes préférés.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/app/booker/search')}
            >
              Découvrir des artistes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(artist => (
              <FavoriteArtistCard 
                key={artist._id} 
                artist={artist} 
                onRemove={handleRemoveFavorite}
                onViewProfile={handleViewProfile}
                onRate={handleRateArtist}
              />
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedArtist && (
          <ReviewModal
            isOpen={showReviewModal}
            onClose={handleCloseReviewModal}
            onSubmit={handleSubmitReview}
            artist={selectedArtist}
          />
        )}
      </div>
    </BookerLayout>
  );
};

export default BookerFavorites; 
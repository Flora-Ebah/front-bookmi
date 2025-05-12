import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button, Input, Select, ReviewModal } from '../../components/ui';
import { FiSearch, FiFilter, FiStar, FiHeart, FiX, FiMusic, FiClock, FiMapPin, FiDollarSign, FiEye, FiThumbsUp, FiSliders, FiChevronRight } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Options de sélection pour les différents filtres
const FILTER_OPTIONS = {
  category: [
    { value: '', label: 'Toutes' },
    { value: 'musicien', label: 'Musicien' },
    { value: 'dj', label: 'DJ' },
    { value: 'groupe', label: 'Groupe' },
    { value: 'humoriste', label: 'Humoriste' }
  ],
  price: [
    { value: '', label: 'Tous' },
    { value: '0-300', label: "Jusqu'à 300€" },
    { value: '300-500', label: '300€ - 500€' },
    { value: '500-1000', label: '500€ - 1000€' },
    { value: '1000+', label: 'Plus de 1000€' }
  ],
  rating: [
    { value: '', label: 'Toutes' },
    { value: '3', label: '3+ étoiles' },
    { value: '4', label: '4+ étoiles' },
    { value: '4.5', label: '4.5+ étoiles' }
  ],
  sort: [
    { value: 'newest', label: 'Plus récents' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'price_low', label: 'Prix croissant' },
    { value: 'price_high', label: 'Prix décroissant' },
    { value: 'rating', label: 'Mieux notés' }
  ]
};

// Composant pour chaque entrée de filtre
const FilterInput = ({ label, type, value, onChange, options = null, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'select' ? (
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        placeholder={`Tous les ${label.toLowerCase()}`}
        className="w-full"
      />
    ) : (
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

// Composant Modal pour les filtres sur mobile
const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply, searchTerm, setSearchTerm }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    setLocalFilters(filters);
    setLocalSearchTerm(searchTerm);
  }, [isOpen, filters, searchTerm]);
  
  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setLocalFilters({});
    setLocalSearchTerm('');
  };
  
  const handleApply = () => {
    console.log("FilterModal - Applying filters:", localFilters);
    setFilters(localFilters);
    setSearchTerm(localSearchTerm);
    onApply(localFilters);
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-auto sm:rounded-lg sm:max-w-md"
          >
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b z-10">
              <h2 className="text-lg font-semibold flex items-center">
                <FiSliders className="mr-2 text-bookmi-blue" />
                Filtres
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                <Input
                  type="text"
                  placeholder="Nom, style musical, ville..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                {FILTER_OPTIONS.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <Select
                      value={localFilters.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      options={FILTER_OPTIONS.category}
                      className="w-full"
                    />
                  </div>
                )}
                
                {FILTER_OPTIONS.price && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <Select
                      value={localFilters.price || ''}
                      onChange={(e) => handleChange('price', e.target.value)}
                      options={FILTER_OPTIONS.price}
                      className="w-full"
                    />
                  </div>
                )}
                
                {FILTER_OPTIONS.rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note minimum</label>
                    <Select
                      value={localFilters.rating || ''}
                      onChange={(e) => handleChange('rating', e.target.value)}
                      options={FILTER_OPTIONS.rating}
                      className="w-full"
                    />
                  </div>
                )}
                
                {FILTER_OPTIONS.sort && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                    <Select
                      value={localFilters.sort || ''}
                      onChange={(e) => handleChange('sort', e.target.value)}
                      options={FILTER_OPTIONS.sort}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between">
              <Button variant="text" onClick={handleReset}>
                Réinitialiser
              </Button>
              <Button variant="primary" onClick={handleApply}>
                Appliquer les filtres
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Composant pour les filtres
const FilterSection = ({ onApplyFilters, searchTerm, setSearchTerm, handleSearch }) => {
  // État des filtres locaux
  const [filters, setFilters] = useState({});
  // État pour contrôler l'ouverture du modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // Nombre de filtres actifs
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    const count = Object.values(filters).filter(val => val && val !== '').length;
    setActiveFilterCount(count);
  }, [filters]);

  // Ouvrir le modal de filtres
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  // Fermer le modal de filtres
  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  // Appliquer les filtres
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  // Réinitialiser tous les filtres
  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    onApplyFilters({});
  };

  // Supprimer un filtre individuel
  const removeFilter = (filterKey) => {
    const newFilters = {...filters};
    delete newFilters[filterKey];
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  return (
    <>
      {/* Section de recherche principale */}
      <Card className="mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Barre de recherche */}
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Rechercher un artiste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchTerm('');
                    handleSearch({ preventDefault: () => {} });
                  }}
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Boutons de recherche et filtres */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="primary" 
                onClick={handleSearch}
                className="w-full sm:w-auto"
              >
                <span className="flex items-center">
                  <FiSearch className="mr-1.5" />
                  <span>Rechercher</span>
                </span>
              </Button>
              
              <Button 
                variant="secondary"
                onClick={openFilterModal}
                className="w-full sm:w-auto relative"
              >
                <span className="flex items-center">
                  <FiFilter className="mr-1.5" />
                  <span>Filtres</span>
                </span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-bookmi-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              
              {filters.category && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>Catégorie: {FILTER_OPTIONS.category.find(opt => opt.value === filters.category)?.label}</span>
                  <button
                    onClick={() => removeFilter('category')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.price && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>Budget: {FILTER_OPTIONS.price.find(opt => opt.value === filters.price)?.label}</span>
                  <button
                    onClick={() => removeFilter('price')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.rating && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center">
                  <span>Note: {FILTER_OPTIONS.rating.find(opt => opt.value === filters.rating)?.label}</span>
                  <button
                    onClick={() => removeFilter('rating')}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-bookmi-blue text-xs hover:underline"
                >
                  Effacer tout
                </button>
              )}
            </div>
          )}
        </div>
      </Card>
      
      {/* Modal de filtres */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FiFilter className="mr-2 text-bookmi-blue" /> Filtres
              </h2>
              <button onClick={closeFilterModal} className="p-2 rounded-full hover:bg-gray-100">
                <FiX />
              </button>
            </div>
            
            <div className="p-5 max-h-[70vh] overflow-auto">
              {/* Catégorie - limité à 2 filtres essentiels */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie d'artiste
                </label>
                <Select
                  value={filters.category || ''}
                  onChange={(e) => {
                    const newFilters = {...filters, category: e.target.value};
                    setFilters(newFilters);
                  }}
                  options={FILTER_OPTIONS.category}
                  className="w-full rounded-xl border-gray-300 focus:ring-bookmi-blue focus:border-bookmi-blue py-2.5"
                />
              </div>
              
              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <Select
                  value={filters.price || ''}
                  onChange={(e) => {
                    const newFilters = {...filters, price: e.target.value};
                    setFilters(newFilters);
                  }}
                  options={FILTER_OPTIONS.price}
                  className="w-full rounded-xl border-gray-300 focus:ring-bookmi-blue focus:border-bookmi-blue py-2.5"
                />
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-between gap-3">
              <Button 
                variant="text" 
                onClick={clearAllFilters}
                className="w-1/2"
              >
                Réinitialiser
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  // Appliquer les filtres
                  onApplyFilters(filters);
                  
                  // Fermer le modal
                  closeFilterModal();
                  
                  // Déclencher la recherche
                  setTimeout(() => {
                    handleSearch({ preventDefault: () => {} });
                  }, 100);
                }}
                className="w-1/2"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Fonction pour afficher l'image de l'artiste ou un placeholder
const ArtistImage = ({ image, name, className = "" }) => (
  image ? (
    <img src={image} alt={name} className={`w-full h-full object-cover ${className}`} />
  ) : (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-r from-bookmi-blue/70 to-purple-500/70 ${className}`}>
      <FiMusic className="text-white h-16 w-16" />
    </div>
  )
);

// Composant d'information artiste avec icône
const ArtistInfoItem = ({ icon, children }) => (
  <span className="flex items-center mr-4 mb-2">
    {icon}
    <span className="ml-1">{children}</span>
  </span>
);

// Composant pour afficher les étoiles
const StarRating = ({ rating }) => {
  // Si pas de note, afficher un état par défaut
  if (!rating || isNaN(parseFloat(rating))) {
    return (
      <div className="flex items-center text-gray-400 text-sm">
        <span>Aucune note</span>
      </div>
    );
  }

  // Convertir en nombre si c'est un objet ou une chaîne
  const ratingValue = typeof rating === 'object' && 'value' in rating 
    ? parseFloat(rating.value) 
    : parseFloat(rating);
    
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <FiStar key={`full-${i}`} className="text-yellow-400 fill-current" />
      ))}
      {hasHalfStar && (
        <span className="relative inline-block">
          <FiStar className="text-gray-300" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <FiStar className="text-yellow-400 fill-current" />
          </span>
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FiStar key={`empty-${i}`} className="text-gray-300" />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-600">
        {ratingValue.toFixed(1)}
      </span>
    </div>
  );
};

// Carte d'artiste détaillée pour les résultats de recherche
const ArtistResultCard = ({ artist, onRate }) => {
  const navigate = useNavigate();
  const { artistName, projectName, discipline, city, country } = artist;
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [artistRating, setArtistRating] = useState(artist.rating);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [services, setServices] = useState(artist.services || []);
  
  useEffect(() => {
    // Afficher l'objet artiste complet
    console.log('Artist object:', artist);
    
    const fetchArtistDetails = async () => {
      try {
        setDetailsLoading(true);
        console.log(`Récupération des détails complets pour l'artiste ${artist._id}`);
        const response = await ServiceArtistBooker.getArtistDetails(artist._id);
        console.log('Détails de l\'artiste:', response);
        
        if (response && response.data) {
          console.log('Détails complets:', response.data);
          // Mise à jour de la note si disponible
          if (response.data.rating) {
            console.log('Note trouvée dans les détails:', response.data.rating);
            setArtistRating(response.data.rating);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
      } finally {
        setDetailsLoading(false);
      }
    };
    
    const fetchServices = async () => {
      if (!services || services.length === 0) {
        try {
          setLoading(true);
          console.log(`Fetching services for artist ${artist._id}`);
          const response = await ServiceArtistBooker.getArtistServices(artist._id);
          console.log('Services response:', response);
          
          if (response && response.data) {
            console.log('Setting services from response:', response.data);
            setServices(response.data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des services:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const checkFavoriteStatus = async () => {
      try {
        const response = await ServiceArtistBooker.getFavoriteArtists();
        if (response && response.data) {
          const favorites = response.data;
          // Vérifie si l'artiste est dans les favoris
          const favoriteArtist = favorites.find(fav => fav._id === artist._id);
          setIsFavorite(!!favoriteArtist);
          
          // Si l'artiste est dans les favoris et a un rating, on l'utilise
          if (favoriteArtist && favoriteArtist.rating) {
            console.log('Rating trouvé dans les favoris:', favoriteArtist.rating);
            setArtistRating(favoriteArtist.rating);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
      }
    };

    fetchArtistDetails(); // Récupérer les détails complets
    fetchServices();
    checkFavoriteStatus();
  }, [artist._id]);
  
  // Calculer le prix minimum des services
  const minPrice = useMemo(() => {
    if (!services || services.length === 0) return null;
    
    const prices = services
      .filter(s => typeof s.price === 'number' && !isNaN(s.price))
      .map(s => s.price);
      
    console.log('Service prices:', prices);
    
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [services]);

  // Calculer le nombre de services actifs
  const activeServicesCount = useMemo(() => {
    if (!services || services.length === 0) return 0;
    return services.filter(service => service.active !== false).length;
  }, [services]);

  // Format pour l'affichage du rating
  const formattedRating = useMemo(() => {
    // Si nous avons un rating d'artiste avec une valeur
    if (artistRating && typeof artistRating === 'object' && 'value' in artistRating) {
      console.log('Utilisation du rating objet avec propriété value:', artistRating.value);
      return Number(artistRating.value).toFixed(1);
    }
    
    // Si nous avons un rating direct (nombre)
    if (artistRating && typeof artistRating === 'number') {
      console.log('Utilisation du rating nombre:', artistRating);
      return artistRating.toFixed(1);
    }
    
    // Valeur par défaut
    return '0.0';
  }, [artistRating]);

  console.log('Formatted rating:', formattedRating);

  const handleViewProfile = () => {
    navigate(`/app/booker/artists/${artist._id}`);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (favoriteLoading) return;
    
    try {
      setFavoriteLoading(true);
      
      if (isFavorite) {
        await ServiceArtistBooker.removeFromFavorites(artist._id);
        toast.success(`${artistName} retiré des favoris`);
      } else {
        await ServiceArtistBooker.addToFavorites(artist._id);
        toast.success(`${artistName} ajouté aux favoris`);
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleRateArtist = () => {
    onRate(artist);
  };

  return (
    <div className="group cursor-pointer transition-all duration-300 h-full" onClick={handleViewProfile}>
      <Card variant="bordered" className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group-hover:translate-y-[-5px]">
        <div className="relative">
          {/* Image de couverture */}
          <div className="w-full h-44 bg-gray-200 flex-shrink-0 relative overflow-hidden">
            <ArtistImage 
              image={artist.profilePhoto} 
              name={artistName || `${artist.firstName} ${artist.lastName}`} 
            />
            
            {/* Badge du nombre de prestations */}
            <div className="absolute top-3 left-3 bg-white/90 px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center">
              <FiMusic className="text-blue-500 mr-1.5 h-3.5 w-3.5" />
              {loading ? '...' : `${activeServicesCount} prestation${activeServicesCount > 1 ? 's' : ''}`}
            </div>
            
            {/* Bouton favori */}
            <button 
              className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm 
                ${isFavorite ? 'text-red-500' : 'text-gray-400'} 
                ${favoriteLoading ? 'opacity-50' : 'hover:text-red-500'} 
                transition-colors duration-200`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
            >
              <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          {/* Informations principales */}
          <div>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {artistName || `${artist.firstName} ${artist.lastName}`}
              </h3>
              <div className="ml-2 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-medium text-yellow-700 flex items-center">
                <FiStar className="text-yellow-500 mr-0.5 h-3.5 w-3.5 fill-current" /> 
                {detailsLoading ? "..." : formattedRating}
              </div>
            </div>
            {projectName && (
              <p className="text-sm text-gray-600 truncate">{projectName}</p>
            )}
            <p className="text-sm text-gray-500 mb-3">{discipline}</p>
          </div>
          
          {/* Badges d'information */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-full text-xs font-medium text-blue-700">
              <FiMapPin className="mr-1 h-3 w-3" />
              {city}, {country}
            </span>
            {minPrice !== null && (
              <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full text-xs font-medium text-green-700">
                <FiDollarSign className="mr-1 h-3 w-3" />
                À partir de {minPrice}€
              </span>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={handleViewProfile} className="text-xs py-1.5">
              <span className="flex items-center justify-center">
                <FiEye className="mr-1.5 h-3.5 w-3.5" />
                Profil
              </span>
            </Button>
            <Button variant="secondary" className="text-xs py-1.5" onClick={(e) => { e.stopPropagation(); handleRateArtist(); }}>
              <span className="flex items-center justify-center">
                <FiThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                Évaluer
              </span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Composant assistant IA
const AIAssistantCard = () => (
  <Card className="mb-6 overflow-hidden p-0 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="relative overflow-hidden">
      {/* Arrière-plan avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full opacity-20 transform -translate-x-1/4 translate-y-1/4"></div>
      
      <div className="relative p-5 flex flex-col md:flex-row items-center">
        <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
            <FiSearch className="h-7 w-7 text-blue-600" />
          </div>
        </div>
        
        <div className="text-center md:text-left md:flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Assistant de recherche intelligent</h3>
          <p className="text-gray-600 mb-4 max-w-2xl">
            Décrivez votre événement (type, ambiance, budget) et notre IA vous recommandera les artistes les plus adaptés à vos besoins.
          </p>
          <Button variant="primary" className="shadow-sm">
            <span className="flex items-center">
              <FiSearch className="mr-2" />
              Utiliser l'assistant
            </span>
          </Button>
        </div>
      </div>
    </div>
  </Card>
);

// En-tête des résultats avec tri
const ResultsHeader = ({ count, sortValue, onSortChange }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
        <FiMusic className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {count > 0 ? (
            <>
              {count} artiste{count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}
            </>
          ) : (
            'Aucun résultat'
          )}
        </h2>
        <p className="text-sm text-gray-500 hidden sm:block">
          {count > 0 
            ? 'Découvrez nos artistes talentueux et trouvez celui qui correspond à votre événement.' 
            : 'Modifiez vos critères de recherche pour trouver des artistes.'}
        </p>
      </div>
    </div>
    
    <div className="flex items-center min-w-[200px]">
      <label className="text-sm font-medium text-gray-600 mr-2 whitespace-nowrap">Trier par :</label>
      <Select
        value={sortValue}
        onChange={onSortChange}
        options={FILTER_OPTIONS.sort}
        className="flex-1"
      />
    </div>
  </div>
);

// Page principale de recherche
const BookerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    console.log("BookerSearch - activeFilters changed:", activeFilters);
    console.log("BookerSearch - sortBy:", sortBy);
    fetchArtists();
  }, [activeFilters, sortBy]);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      console.log('Fetching artists with filters:', activeFilters);
      console.log('Fetching artists with sort:', sortBy);
      
      const filters = {
        ...activeFilters,
        sort: sortBy
      };
      console.log('Combined filters for API call:', filters);
      
      const response = await ServiceArtistBooker.searchArtists(filters);
      console.log('Artistes reçus:', response);
      
      if (response && response.data) {
        console.log('Setting artists from response:', response.data);
        
        // Analyse détaillée de la structure des données
        if (response.data.length > 0) {
          const firstArtist = response.data[0];
          console.log('Premier artiste - structure complète:', firstArtist);
          console.log('Premier artiste - rating:', firstArtist.rating);
          
          if (firstArtist.rating) {
            console.log('Rating type:', typeof firstArtist.rating);
            if (typeof firstArtist.rating === 'object') {
              console.log('Rating keys:', Object.keys(firstArtist.rating));
            }
          }
        }
        
        // Vérifier tous les artistes pour voir s'ils ont des ratings
        const artistsWithRatings = response.data.filter(artist => artist.rating !== undefined);
        console.log(`${artistsWithRatings.length}/${response.data.length} artistes ont un rating`);
        
        if (artistsWithRatings.length > 0) {
          console.log('Exemples de ratings:');
          artistsWithRatings.slice(0, 3).forEach((artist, index) => {
            console.log(`Artiste ${index + 1} rating:`, artist.rating);
          });
        }
        
        setArtists(response.data);
      } else {
        console.warn('No data in response');
        setArtists([]);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error(error.message || "Erreur lors de la récupération des artistes");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Searching artists with term:', searchTerm);
      console.log('Searching artists with filters:', activeFilters);
      console.log('Searching artists with sort:', sortBy);
      
      const searchFilters = {
        ...activeFilters,
        search: searchTerm,
        sort: sortBy
      };
      console.log('Combined search filters:', searchFilters);
      
      const response = await ServiceArtistBooker.searchArtists(searchFilters);
      console.log('Search results:', response);
      
      if (response && response.data) {
        setArtists(response.data);
      } else {
        setArtists([]);
      }
    } catch (error) {
      console.error('Error searching artists:', error);
      toast.error(error.message || "Erreur lors de la recherche");
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    console.log('BookerSearch - Applying filters:', filters);
    setActiveFilters(filters);
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    console.log('Changing sort to:', sortValue);
    setSortBy(sortValue);
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
        setArtists(prevArtists => prevArtists.map(artist => 
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

  // Composant pour l'état vide
  const EmptyState = () => (
    <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-gray-100">
      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FiSearch className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun artiste trouvé</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Nous n'avons pas trouvé d'artistes correspondant à vos critères de recherche. Essayez d'élargir vos critères.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          variant="secondary" 
          onClick={() => {
            setSearchTerm('');
            setActiveFilters({});
            fetchArtists();
          }}
        >
          <span className="flex items-center">
            <FiX className="mr-1.5" />
            <span>Réinitialiser les filtres</span>
          </span>
        </Button>
      </div>
    </div>
  );

  // Composant de chargement
  const LoadingState = () => (
    <div className="text-center py-12">
      <div className="inline-block relative w-16 h-16">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
        <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Recherche des meilleurs artistes...</p>
      <p className="text-sm text-gray-500">Cela ne prendra qu'un instant</p>
    </div>
  );

  // Mobile-friendly results list with sort option as dropdown
  const MobileResultsHeader = ({ count, sortValue, onSortChange }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-gray-800 flex items-center">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-2">
            <FiMusic className="text-blue-600" />
          </span>
          {count} artiste{count > 1 ? 's' : ''}
        </h2>
        
        <button 
          className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
          onClick={() => document.getElementById('mobile-sort-select').focus()}
        >
          <span>Trier</span>
          <FiChevronRight className="ml-1" />
        </button>
      </div>
      
      <div className="border-t pt-3">
        <select
          id="mobile-sort-select"
          value={sortValue}
          onChange={onSortChange}
          className="w-full border-gray-300 rounded-md text-sm"
        >
          {FILTER_OPTIONS.sort.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <BookerLayout>
      <div className="py-6 px-4 md:px-0 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Recherche d'artistes</h1>
            <p className="text-gray-500">Trouvez le talent parfait pour votre événement</p>
          </div>
        </div>

        <FilterSection 
          onApplyFilters={handleApplyFilters} 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
        />

        {loading ? (
          <LoadingState />
        ) : (
          <div>
            <div className="block sm:hidden">
              <MobileResultsHeader 
                count={artists.length} 
                sortValue={sortBy} 
                onSortChange={handleSortChange} 
              />
            </div>
            
            <div className="hidden sm:block">
              <ResultsHeader 
                count={artists.length} 
                sortValue={sortBy} 
                onSortChange={handleSortChange} 
              />
            </div>

            {artists.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {artists.map(artist => (
                  <ArtistResultCard 
                    key={artist._id} 
                    artist={artist} 
                    onRate={() => handleRateArtist(artist)}
                  />
                ))}
              </div>
            )}
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

export default BookerSearch; 
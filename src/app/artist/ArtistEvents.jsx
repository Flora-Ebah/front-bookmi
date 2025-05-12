import React, { useState, useEffect, useMemo } from 'react';
import ArtistLayout from './layouts/ArtistLayout';
import { Card, Button } from '../../components/ui';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheck, FiX, FiLoader, FiSearch, FiFilter, FiArrowUp, FiArrowDown, FiChevronDown, FiChevronRight, FiRefreshCw, FiInfo, FiEye } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Configuration des statuts
const STATUS_CONFIG = {
  'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiCheck className="mr-1" />, label: 'Confirmée' },
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="mr-1" />, label: 'En attente' },
  'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheck className="mr-1" />, label: 'Terminée' },
  'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="mr-1" />, label: 'Annulée' },
};

// Composant pour afficher le statut
const StatusBadge = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending';
  const { bg, text, icon, label } = STATUS_CONFIG[statusLower] || STATUS_CONFIG['pending'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {icon}
      {label}
    </span>
  );
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date non spécifiée';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  } catch (error) {
    return dateString;
  }
};

// Formater l'heure
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
};

// Obtenir le nom du booker
const getBookerName = (booker) => {
  if (!booker) return 'Client';
  if (booker.companyName) return booker.companyName;
  if (booker.firstName || booker.lastName) {
    return `${booker.firstName || ''} ${booker.lastName || ''}`.trim();
  }
  return 'Client';
};

// Calculer le montant total
const calculateTotal = (amount, serviceFee) => {
  const total = (parseFloat(amount) || 0) + (parseFloat(serviceFee) || 0);
  return total.toLocaleString('fr-FR');
};

// Composant pour afficher une réservation
const ReservationCard = ({ reservation, onViewDetails, onUpdateStatus }) => {
  const service = reservation.serviceId || {};
  const booker = reservation.booker || {};
  const bookerUser = booker.firstName ? booker : { firstName: 'Client', lastName: '' };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{service.title || 'Réservation'}</h3>
          <StatusBadge status={reservation.status} />
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <FiUser className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{bookerUser.firstName} {bookerUser.lastName}</span>
          </div>
          <div className="flex items-start">
            <FiCalendar className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{formatDate(reservation.date)}</span>
          </div>
          <div className="flex items-start">
            <FiClock className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{reservation.startTime} - {reservation.endTime}</span>
          </div>
          <div className="flex items-start">
            <FiMapPin className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="truncate">{reservation.location}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-col space-y-2">
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => onViewDetails(reservation._id)}
          >
            Voir les détails
          </Button>
          
          {reservation.status === 'pending' && (
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => onUpdateStatus(reservation._id, 'confirmed')}
            >
              Confirmer
            </Button>
          )}
          
          {reservation.status === 'confirmed' && (
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => onUpdateStatus(reservation._id, 'completed')}
            >
              Marquer comme terminée
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Composant de recherche et filtres
const SearchAndFilters = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, sortOrder, setSortOrder }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Recherche */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-bookmi-blue focus:border-bookmi-blue"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Boutons de filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiFilter className="mr-2" />
            Filtres
            <FiChevronDown className={`ml-2 transition-transform ${isFilterOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Trier
            {sortOrder === 'asc' ? 
              <FiArrowUp className="ml-2" /> : 
              <FiArrowDown className="ml-2" />
            }
          </button>
        </div>
      </div>
      
      {/* Panneau de filtres */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtrer par statut</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filterStatus === null 
                  ? 'bg-bookmi-blue text-white border-bookmi-blue' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tous
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, { label, bg, text }]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterStatus === key 
                    ? 'bg-bookmi-blue text-white border-bookmi-blue' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant de table responsive pour les réservations
const ReservationsTable = ({ reservations, onViewDetails, onUpdateStatus }) => {
  if (!reservations || reservations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Heure
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lieu
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <ReservationRow 
              key={reservation._id} 
              reservation={reservation} 
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Ligne de tableau pour une réservation
const ReservationRow = ({ reservation, onViewDetails, onUpdateStatus }) => {
  const { serviceId, booker, date, startTime, endTime, location, status, _id } = reservation;
  const serviceTitle = serviceId?.title || 'Prestation';
  const bookerName = getBookerName(booker);
  const formattedDate = formatDate(date);
  
  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{serviceTitle}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{bookerName}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formattedDate}</div>
        <div className="text-xs text-gray-500">{startTime} - {endTime}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">{location}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onViewDetails(_id)}
            className="text-bookmi-blue hover:text-bookmi-blue-dark"
          >
            Détails
          </button>
          
          {status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(_id, 'confirmed')}
              className="text-green-600 hover:text-green-800"
            >
              Confirmer
            </button>
          )}
          
          {status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(_id, 'completed')}
              className="text-blue-600 hover:text-blue-800"
            >
              Terminer
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Vue en cartes pour les petits écrans
const CardView = ({ reservations, onViewDetails, onUpdateStatus }) => {
  if (!reservations || reservations.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reservations.map((reservation) => (
        <ReservationCard 
          key={reservation._id}
          reservation={reservation}
          onViewDetails={onViewDetails}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};

// Composant pour afficher un message quand il n'y a pas de réservations
const EmptyState = () => (
  <div className="col-span-full py-12 px-4 text-center bg-white rounded-lg shadow-sm border border-gray-200">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-12 w-12 mx-auto text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
    <h3 className="mt-4 text-lg font-medium text-gray-800">Aucune réservation</h3>
    <p className="mt-2 text-gray-500">Vous n'avez pas de réservations correspondant à vos critères pour le moment.</p>
  </div>
);

// Composant principal
const ArtistEvents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' pour le plus ancien, 'desc' pour le plus récent
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'table');
  const navigate = useNavigate();

  // Détecter le changement de taille d'écran pour adapter l'affichage
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'card' : 'table');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Charger les réservations depuis l'API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        console.log('Récupération des réservations de l\'artiste...');
        
        const response = await ServiceArtistBooker.getArtistReservations();
        console.log('Réponse complète:', response);
        
        if (response && response.data) {
          console.log('Données de réservations reçues:', response.data);
          
          // Gérer différentes structures de réponses possibles
          const reservationsArray = Array.isArray(response.data) 
            ? response.data 
            : (response.success && Array.isArray(response.data) 
                ? response.data 
                : []);
          
          console.log('Nombre de réservations trouvées:', reservationsArray.length);
          
          // Si aucune réservation n'est trouvée, on laisse la liste vide
          if (reservationsArray.length === 0) {
            setReservations([]);
            setError(null);
            setLoading(false);
            return;
          }
          
          setReservations(reservationsArray);
        } else {
          console.error('Format de réponse inattendu:', response);
          setError("Impossible de récupérer vos réservations. Format de données incorrect.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations:", error);
        setError(`Une erreur est survenue: ${error.message}`);
        toast.error("Erreur de chargement des réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Filtrer et trier les réservations
  const filteredReservations = useMemo(() => {
    // Filtrer par statut
    let filtered = [...reservations];
    
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(r => 
        (r.status === 'pending' || r.status === 'confirmed') && 
        new Date(r.date) >= new Date().setHours(0, 0, 0, 0)
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(r => 
        r.status === 'completed' || 
        (new Date(r.date) < new Date().setHours(0, 0, 0, 0) && r.status !== 'cancelled')
      );
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(r => r.status === 'cancelled');
    }
    
    // Filtrer par statut supplémentaire (si filtre appliqué)
    if (filterStatus) {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const serviceTitle = r.serviceId?.title?.toLowerCase() || '';
        const location = r.location?.toLowerCase() || '';
        const bookerName = getBookerName(r.booker).toLowerCase();
        return serviceTitle.includes(term) || 
               location.includes(term) || 
               bookerName.includes(term);
      });
    }
    
    // Tri par date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [reservations, activeTab, searchTerm, filterStatus, sortOrder]);

  const handleViewDetails = (reservationId) => {
    // Naviguer vers la page de détails d'une réservation
    console.log(`Voir les détails de la réservation ${reservationId}`);
    navigate(`/app/artist/events/${reservationId}`);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      await ServiceArtistBooker.updateReservationStatus(id, newStatus);
      
      toast.success(`Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'terminée'} avec succès`);
      
      // Mettre à jour l'état local
      setReservations(reservations.map(reservation => 
        reservation._id === id 
          ? { ...reservation, status: newStatus }
          : reservation
      ));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await ServiceArtistBooker.getArtistReservations();
      
      if (response && response.data) {
        const reservationsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.success && Array.isArray(response.data) 
              ? response.data 
              : []);
        
        setReservations(reservationsArray);
        toast.success("Données actualisées");
      }
    } catch (error) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArtistLayout>
      <div className="py-4 md:py-8 px-2 md:px-4">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mes Événements</h1>
          
          <div className="flex space-x-3 mt-2 md:mt-0">
            <Button 
              variant="secondary" 
              className="text-sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <div className="flex items-center">
                <FiRefreshCw className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </div>
            </Button>
            
            <Button 
              variant="primary" 
              className="text-sm"
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            >
              <div className="flex items-center">
                <FiEye className="mr-1.5" />
                <span>{viewMode === 'table' ? 'Vue en cartes' : 'Vue en tableau'}</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Onglets de navigation */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-bookmi-blue text-bookmi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              Tous
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'border-bookmi-blue text-bookmi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              À venir
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'past'
                  ? 'border-bookmi-blue text-bookmi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Passés
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'cancelled'
                  ? 'border-bookmi-blue text-bookmi-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('cancelled')}
            >
              Annulés
            </button>
          </div>
        </div>
        
        {/* Recherche et filtres */}
        <SearchAndFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        {/* Message d'erreur */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bookmi-blue"></div>
          </div>
        )}
        
        {/* Liste des réservations */}
        {!loading && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredReservations.length} événement{filteredReservations.length !== 1 ? 's' : ''} trouvé{filteredReservations.length !== 1 ? 's' : ''}
            </div>
            
            {/* Affichage adaptatif selon le mode de vue choisi */}
            {viewMode === 'table' ? (
              <ReservationsTable 
                reservations={filteredReservations}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <CardView 
                reservations={filteredReservations}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}
      </div>
    </ArtistLayout>
  );
};

export default ArtistEvents; 
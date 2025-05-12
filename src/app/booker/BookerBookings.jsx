import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button, Select } from '../../components/ui';
import { FiCalendar, FiClock, FiCheck, FiX, FiDownload, FiMessageSquare, FiChevronRight, FiStar, 
         FiUser, FiMapPin, FiFilter, FiSearch, FiArrowUp, FiArrowDown, FiChevronDown, FiRefreshCw, FiEye, FiDollarSign } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';
import { STORAGE_KEYS } from '../../config/constants';

// Mapping statut -> configuration visuelle
const STATUS_CONFIG = {
  'confirmed': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheck className="mr-1" /> },
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="mr-1" /> },
  'completed': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiCheck className="mr-1" /> },
  'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="mr-1" /> },
  // Garder les anciennes clés pour compatibilité
  'confirmé': { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheck className="mr-1" /> },
  'en attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="mr-1" /> },
  'à payer': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FiClock className="mr-1" /> },
  'terminé': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiCheck className="mr-1" /> },
  'annulé': { bg: 'bg-red-100', text: 'text-red-800', icon: <FiX className="mr-1" /> }
};

// Mapping statut de paiement -> texte
const PAYMENT_STATUS_TEXT = {
  'paid': 'Payé intégralement',
  'pending': 'En attente de paiement',
  'failed': 'Échec du paiement',
  'refunded': 'Remboursé',
  // Garder les anciennes clés pour compatibilité
  'total_paid': 'Payé intégralement',
  'deposit_paid': 'Acompte payé',
  'not_paid': 'Non payé'
};

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date non spécifiée';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  try {
    // Essayer de formatter la date selon le format ISO
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  } catch (error) {
    // Si l'analyse échoue, retourner la chaîne originale
    return dateString;
  }
};

// Composant pour afficher le statut avec la couleur appropriée
const StatusBadge = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending';
  const { bg, text, icon } = STATUS_CONFIG[statusLower] || STATUS_CONFIG['pending'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {icon}
      {status}
    </span>
  );
};

// Composant pour les événements en format carte
const BookingCard = ({ booking, onClick }) => {
  const artist = booking.artistId || {};
  const service = booking.serviceId || {};
  const statusLower = booking.status?.toLowerCase() || 'pending';
  const { bg, text } = STATUS_CONFIG[statusLower] || STATUS_CONFIG['pending'];
  
  // Génération d'un dégradé pour l'en-tête de la carte
  const getHeaderGradient = () => {
    const statuses = {
      'confirmed': 'from-blue-50 to-indigo-100',
      'pending': 'from-yellow-50 to-amber-100',
      'completed': 'from-green-50 to-emerald-100',
      'cancelled': 'from-red-50 to-pink-100',
      'confirmé': 'from-blue-50 to-indigo-100',
      'en attente': 'from-yellow-50 to-amber-100',
      'à payer': 'from-orange-50 to-amber-100',
      'terminé': 'from-green-50 to-emerald-100',
      'annulé': 'from-red-50 to-pink-100'
    };
    
    return statuses[statusLower] || 'from-blue-50 to-indigo-100';
  };

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md group cursor-pointer border border-gray-200 hover:border-bookmi-blue"
      onClick={() => onClick(booking._id)}
    >
      {/* En-tête avec statut */}
      <div className={`relative h-28 bg-gradient-to-r ${getHeaderGradient()} flex items-center justify-center border-b border-gray-100`}>
        <div className="absolute top-3 left-3">
          <StatusBadge status={booking.status} />
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-1 border border-gray-100">
            <FiCalendar className="w-5 h-5 text-bookmi-blue" />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-bookmi-blue transition-colors" />
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-bookmi-blue transition-colors mb-2">
          {service.title || 'Réservation'}
        </h3>
        
        <div className="mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center mr-2 border border-purple-100">
              <FiUser className="w-3.5 h-3.5 text-purple-600" />
            </div>
            {artist.artistName || 'Artiste'}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2.5 text-sm text-gray-600 mt-auto">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 border border-blue-100">
              <FiCalendar className="w-3.5 h-3.5 text-bookmi-blue" />
            </div>
            <span>{formatDate(booking.date)}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 border border-blue-100">
              <FiClock className="w-3.5 h-3.5 text-bookmi-blue" />
            </div>
            <span>{booking.startTime || '--:--'} - {booking.endTime || '--:--'}</span>
          </div>
          
          {booking.location && (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mr-3 border border-blue-100">
                <FiMapPin className="w-3.5 h-3.5 text-bookmi-blue" />
              </div>
              <span className="truncate">{booking.location}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Composant pour afficher le récapitulatif hebdomadaire (version horizontale)
const WeeklyRecap = ({ bookings }) => {
  // Obtenir les dates de la semaine en cours
  const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = dimanche, 1 = lundi, ...
    const startOfWeek = new Date(now);
    // Ajuster pour commencer la semaine le lundi (1) au lieu de dimanche (0)
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(now.getDate() + diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates();
  
  // Mois en français
  const frenchMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  // Date actuelle pour l'affichage du mois et de l'année
  const currentMonth = frenchMonths[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  
  // Filtrer les réservations pour la semaine en cours
  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      // Convertir les dates au format YYYY-MM-DD pour la comparaison
      const bookingDateStr = booking.date ? 
        new Date(booking.date).toISOString().split('T')[0] : '';
      return bookingDateStr === dateStr;
    });
  };

  // Jours de la semaine en français
  const frenchDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Compteur total des événements de la semaine
  const totalWeekBookings = weekDates.reduce((total, date) => {
    return total + getBookingsForDate(date).length;
  }, 0);
  
  // Date actuelle pour comparer les jours passés
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer uniquement les dates
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center mr-3">
            <FiCalendar className="text-bookmi-blue h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {currentMonth} {currentYear}
            </h3>
            <p className="text-sm text-gray-600">Vue hebdomadaire</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-full text-gray-500 hover:text-bookmi-blue hover:bg-blue-50 transition-colors">
            <FiChevronRight className="h-4 w-4 transform rotate-180" />
          </button>
          <button className="p-1.5 rounded-full text-gray-500 hover:text-bookmi-blue hover:bg-blue-50 transition-colors">
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="py-4">
        <div className="grid grid-cols-7 border-b border-gray-100 mx-4 pb-2">
          {frenchDays.map((day, idx) => (
            <div key={`day-${idx}`} className="text-center">
              <div className="text-sm font-medium text-gray-600">{day}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 p-4">
          {weekDates.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const hasBookings = dayBookings.length > 0;
            const isPast = date < today;
            
            // Calculer le style en fonction du jour
            const cellStyle = isToday
              ? 'shadow-sm ring-2 ring-bookmi-blue bg-blue-50 text-bookmi-blue font-medium'
              : hasBookings
                ? 'bg-white hover:bg-blue-50 transition-colors hover:shadow-sm border-gray-200 text-gray-800'
                : 'bg-white hover:bg-gray-50 transition-colors border-gray-100 text-gray-600';
            
            return (
              <div key={`date-${index}`} className="aspect-square p-0.5">
                <div className={`h-full w-full rounded-md border flex flex-col ${cellStyle} overflow-hidden`}>
                  <div className={`text-right px-2 pt-1 text-sm ${isToday ? 'font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  {hasBookings ? (
                    <div className="mt-auto px-1 pb-1 overflow-hidden">
                      <div className="flex justify-between items-center px-1">
                        <div className="w-2 h-2 rounded-full bg-bookmi-blue"></div>
                        <span className="text-xs font-medium text-bookmi-blue">{dayBookings.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-600">Total cette semaine:</span>
        <span className="text-sm font-medium bg-white text-bookmi-blue px-2 py-0.5 rounded-full border border-blue-100">
          {totalWeekBookings} réservation{totalWeekBookings !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

// Composant tableau pour afficher les réservations
const BookingsTable = ({ bookings, onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  
  // Obtenir les réservations pour la page actuelle
  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return bookings.slice(startIndex, startIndex + itemsPerPage);
  }, [bookings, currentPage]);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  if (bookings.length === 0) {
    return <EmptyBookingsList activeTab="upcoming" />;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artiste</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map(booking => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-800">{booking.artistId?.artistName || 'Artiste'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{booking.serviceId?.title || 'Réservation'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{formatDate(booking.date)}</div>
                  <div className="text-xs text-gray-500">{booking.startTime || '--:--'} - {booking.endTime || '--:--'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => onViewDetails(booking._id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bookmi-blue"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">{Math.min(currentPage * itemsPerPage, bookings.length)}</span> sur <span className="font-medium">{bookings.length}</span> réservations
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Précédent
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Données d'une ligne de détail
const DetailRow = ({ label, value }) => (
  <div className="flex border-b border-gray-200 pb-3">
    <div className="w-1/3 font-medium text-gray-600">{label}</div>
    <div className="w-2/3">{value}</div>
  </div>
);

// Rendu des boutons d'action en fonction du statut
const ActionButtons = ({ booking, onClose }) => {
  const navigate = useNavigate();

  // Définition des boutons conditionnels
  const conditionalButtons = [
    {
      condition: booking.status === 'pending',
      button: (
        <Button 
          variant="primary" 
          key="pay"
          onClick={() => navigate(`/app/booker/booking/${booking._id}`)}
        >
          Finaliser le paiement
        </Button>
      )
    },
    {
      condition: booking.status === 'completed' && !booking.hasReview,
      button: (
        <Button variant="primary" key="review">
          <span className="flex items-center">
            <FiStar className="mr-1.5" />
            <span>Laisser un avis</span>
          </span>
        </Button>
      )
    },
    {
      condition: booking.status === 'pending' || booking.status === 'confirmed',
      button: <Button variant="danger" key="cancel">Annuler la réservation</Button>
    }
  ];

  // Filtrer pour ne garder que les boutons à afficher
  const visibleConditionalButtons = conditionalButtons
    .filter(item => item.condition)
    .map(item => item.button);

  // Boutons toujours présents
  const standardButtons = [
    <Button variant="secondary" key="contact">
      <span className="flex items-center">
        <FiMessageSquare className="mr-1.5" />
        <span>Contacter l'artiste</span>
      </span>
    </Button>,
    <Button 
      variant="secondary"
      onClick={onClose}
      className="ml-auto"
      key="back"
    >
      Retour
    </Button>
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {[...visibleConditionalButtons, ...standardButtons]}
    </div>
  );
};

// Détails d'une réservation spécifique
const BookingDetails = ({ booking, onClose }) => {
  const paymentStatusText = PAYMENT_STATUS_TEXT[booking.paymentStatus] || 'Statut inconnu';
  const artist = booking.artistId || {};
  const service = booking.serviceId || {};
  
  const details = [
    { label: 'Artiste', value: artist.artistName || 'Non spécifié' },
    { label: 'Type de prestation', value: service.title || 'Non spécifié' },
    { label: 'Date et heure', value: `${formatDate(booking.date)} de ${booking.startTime || '00:00'} à ${booking.endTime || '00:00'}` },
    { label: 'Lieu', value: booking.location || 'Non spécifié' },
    { label: 'Tarif', value: `${booking.amount?.toLocaleString() || 0} FCFA` },
    { label: 'Statut du paiement', value: paymentStatusText },
    { label: 'Commentaires', value: booking.notes || 'Aucun commentaire', noBorder: true }
  ];

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-800">{service.title || 'Détails de la réservation'}</h2>
        <StatusBadge status={booking.status} />
      </div>
      
      <div className="mt-4 space-y-4">
        {details.map((detail, index) => (
          <div 
            key={index} 
            className={`flex ${!detail.noBorder ? 'border-b border-gray-200 pb-3' : ''}`}
          >
            <div className="w-1/3 font-medium text-gray-600">{detail.label}</div>
            <div className="w-2/3">{detail.value}</div>
          </div>
        ))}
      </div>
      
      <ActionButtons booking={booking} onClose={onClose} />
    </Card>
  );
};

// Structure d'un onglet de navigation
const TabButton = ({ isActive, onClick, children }) => (
  <button
    className={`pb-2 px-4 font-medium ${
      isActive
        ? 'text-bookmi-blue border-b-2 border-bookmi-blue'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

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
            placeholder="Rechercher une réservation..."
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
            onClick={() => setSortOrder(sortOrder === 'date_asc' ? 'date_desc' : 'date_asc')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Trier
            {sortOrder === 'date_asc' ? 
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
            {Object.entries(STATUS_CONFIG).slice(0, 4).map(([key, { icon, bg, text }]) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filterStatus === key 
                    ? 'bg-bookmi-blue text-white border-bookmi-blue' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center">
                  {React.cloneElement(icon, { className: 'mr-1' })}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une liste vide avec un message
const EmptyBookingsList = ({ activeTab }) => (
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
    {activeTab === 'upcoming' && (
      <Link to="/app/booker/search">
        <Button variant="primary" className="mt-4">
          Trouver un artiste
        </Button>
      </Link>
    )}
  </div>
);

// Page principale des réservations
const BookerBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [bookings, setBookings] = useState({
    upcoming: [],
    past: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const navigate = useNavigate();

  // Fonction pour décoder un token JWT et afficher son contenu
  const decodeAndLogToken = (token) => {
    if (!token) {
      console.error('Aucun token fourni pour le décodage');
      return null;
    }
    
    try {
      // Récupérer la partie payload du token (second segment entre les points)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      console.log('Token décodé:', payload);
      
      // Vérification des dates d'expiration et d'émission
      const now = Date.now() / 1000;
      if (payload.exp) {
        console.log('Token expire le:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Expiré?', payload.exp < now);
      }
      if (payload.iat) {
        console.log('Token émis le:', new Date(payload.iat * 1000).toLocaleString());
      }
      
      return payload;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  };

  // Fonction pour rafraîchir les réservations
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshCounter(prev => prev + 1);
  };

  // Charger les réservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        
        // Vérification du token d'authentification
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        console.log('Token d\'authentification présent:', !!token);
        
        if (token) {
          // Décoder et afficher le contenu du token pour diagnostic
          const decodedToken = decodeAndLogToken(token);
          console.log('Contenu du token décodé:', decodedToken);
          
          // Vérifier seulement si le rôle est "booker"
          if (!decodedToken || decodedToken.role !== 'booker') {
            console.error('Le token ne contient pas le rôle "booker" ou est invalide');
            setError('Votre session est invalide. Vous devez être connecté en tant que booker.');
            toast.error('Token invalide, veuillez vous reconnecter');
            setLoading(false);
            return;
          }
        } else {
          setError('Veuillez vous connecter pour voir vos réservations.');
          toast.error('Session expirée, veuillez vous reconnecter');
          setLoading(false);
          return;
        }
        
        // Vérifier si l'utilisateur est connecté via authService
        if (!ServiceArtistBooker.api.defaults.headers.common['Authorization']) {
          console.log('Ajout manuel des en-têtes d\'autorisation pour la requête');
          ServiceArtistBooker.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        console.log('Appel de getMyReservations...');
        const response = await ServiceArtistBooker.getMyReservations();
        console.log('Réservations récupérées:', response);
        
        if (response.success && response.data) {
          // Catégoriser les réservations par statut
          const now = new Date();
          const allReservations = response.data;
          console.log('Nombre de réservations récupérées:', allReservations.length);
          
          const categorizedBookings = {
            upcoming: [],
            past: [],
            cancelled: []
          };

          allReservations.forEach(booking => {
            const bookingDate = new Date(booking.date);
            
            if (booking.status === 'cancelled') {
              categorizedBookings.cancelled.push(booking);
            } else if (booking.status === 'completed' || bookingDate < now) {
              categorizedBookings.past.push(booking);
            } else {
              categorizedBookings.upcoming.push(booking);
            }
          });

          console.log('Réservations catégorisées:', {
            upcoming: categorizedBookings.upcoming.length,
            past: categorizedBookings.past.length,
            cancelled: categorizedBookings.cancelled.length
          });

          setBookings(categorizedBookings);
        } else {
          console.warn('Format de réponse inattendu:', response);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        setError('Impossible de charger vos réservations. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des réservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [refreshCounter]);

  const handleViewBooking = (id) => {
    navigate(`/app/booker/booking/${id}`);
  };

  // Filtrer et trier les réservations
  const filteredBookings = useMemo(() => {
    // Filtrer par onglet actif
    let filtered = [...bookings[activeTab]];
    
    // Filtrer par statut supplémentaire (si filtre appliqué)
    if (filterStatus) {
      filtered = filtered.filter(r => r.status?.toLowerCase() === filterStatus.toLowerCase());
    }
    
    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking => {
        const service = booking.serviceId?.title?.toLowerCase() || '';
        const artist = booking.artistId?.artistName?.toLowerCase() || '';
        const location = booking.location?.toLowerCase() || '';
        return service.includes(term) || artist.includes(term) || location.includes(term);
      });
    }
    
    return filtered;
  }, [bookings, activeTab, searchTerm, filterStatus]);
  
  // Rendu du contenu principal (liste ou détails)
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bookmi-blue"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      );
    }

    if (selectedBooking) {
      return (
        <BookingDetails 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      );
    }

    const allBookings = [...bookings.upcoming, ...bookings.past, ...bookings.cancelled];
    
    return (
      <div className="flex flex-col space-y-6">
        <div>
          {/* Onglets de navigation */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <TabButton 
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </TabButton>
              ))}
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

          {/* Compteur de résultats */}
          <div className="mb-4 text-sm text-gray-600">
            {filteredBookings.length} réservation{filteredBookings.length !== 1 ? 's' : ''} trouvée{filteredBookings.length !== 1 ? 's' : ''}
          </div>

          {/* Tableau des réservations */}
          <BookingsTable 
            bookings={filteredBookings} 
            onViewDetails={handleViewBooking} 
          />
        </div>
        
        {/* Calendrier hebdomadaire */}
        <WeeklyRecap bookings={allBookings} />
      </div>
    );
  };

  // Configuration des onglets
  const tabs = [
    { id: 'upcoming', label: `À venir (${bookings.upcoming.length})` },
    { id: 'past', label: `Passées (${bookings.past.length})` },
    { id: 'cancelled', label: `Annulées (${bookings.cancelled.length})` }
  ];

  // Options de tri
  const sortOptions = [
    { value: 'date_desc', label: 'Date (plus récentes)' },
    { value: 'date_asc', label: 'Date (plus anciennes)' }
  ];

  return (
    <BookerLayout>
      <div className="py-4 md:py-8 px-2 md:px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Mes Réservations</h1>
        {renderContent()}
      </div>
    </BookerLayout>
  );
};

export default BookerBookings; 
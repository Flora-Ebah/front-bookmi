import React, { useState, useEffect } from 'react';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button } from '../../components/ui';
import { FiCalendar, FiClock, FiSearch, FiStar, FiUsers, FiMusic, FiAlertTriangle, FiDollarSign, FiHeart, FiCheck, FiBookOpen, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// Configuration des couleurs par type
const COLORS = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', accent: 'bg-blue-500' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-600', accent: 'bg-amber-500' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600', accent: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', accent: 'bg-orange-500' }
};

// Configuration des icônes par type d'alerte
const ALERT_ICONS = {
  paiement: <FiClock className="text-orange-500" />,
  alerte: <FiAlertTriangle className="text-red-500" />,
  rappel: <FiCalendar className="text-green-600" />
};

// Configuration des couleurs de statut
const STATUS_COLORS = {
  'Confirmé': 'bg-green-100 text-green-800 border-green-200',
  'En attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'À payer': 'bg-orange-100 text-orange-800 border-orange-200',
  'Annulé': 'bg-red-100 text-red-800 border-red-200'
};

const StatCard = ({ icon, label, value, color = 'blue', maxValue = 100, trend = 0 }) => {
  const { bg, text, accent } = COLORS[color] || COLORS.blue;
  
  // Calculer le pourcentage pour la barre (limité à deux décimales)
  const numValue = parseInt(value) || 0;
  const percentage = Math.min((numValue / maxValue) * 100, 100).toFixed(0);
  
  // Libellé de progression contextuel
  const progressLabel = () => {
    if (percentage <= 25) return "Faible";
    if (percentage <= 50) return "Modéré";
    if (percentage <= 75) return "Bon";
    return "Excellent";
  };
  
  return (
    <Card variant="bordered" className="shadow-sm h-40 overflow-hidden">
      <div className="p-4 h-full flex flex-col justify-between">
        {/* En-tête avec titre et icône */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600">{label}</div>
          <div className={`rounded-full ${bg} p-2 flex-shrink-0`}>
            {icon}
          </div>
        </div>
        
        {/* Valeur principale */}
        <div className={`text-3xl font-bold ${text} my-1`}>{value}</div>
        
        {/* Tendance */}
        {trend !== 0 && (
          <div className={`text-xs font-medium flex items-center ${
            trend > 0 ? 'text-emerald-600' : 'text-red-500'
          } truncate`}>
            {trend > 0 ? (
              <><FiTrendingUp className="mr-1 flex-shrink-0" /> <span className="truncate">+{trend}% vs mois dernier</span></>
            ) : (
              <><FiTrendingDown className="mr-1 flex-shrink-0" /> <span className="truncate">{trend}% vs mois dernier</span></>
            )}
          </div>
        )}
        
        {/* Barre de progression */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-500">{progressLabel()}</span>
            <span className="font-medium text-gray-700">{percentage}%</span>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${accent}`}
              style={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

const BookingCard = ({ artist, service, date, status }) => {
  const colorClasses = STATUS_COLORS[status] || STATUS_COLORS['En attente'];

  return (
    <motion.div 
      className={`p-4 border rounded-lg ${colorClasses}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{artist}</h3>
          <p className="text-sm">{service}</p>
          <p className="text-xs mt-1">{date}</p>
        </div>
        <span className="text-xs py-1 px-2 rounded bg-white bg-opacity-50">{status}</span>
      </div>
    </motion.div>
  );
};

const ArtistCard = ({ name, style, rating, image }) => {
  const artistImage = image ? (
    <img src={image} alt={name} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-bookmi-blue/70 to-purple-500/70">
      <FiMusic className="text-white h-10 w-10" />
    </div>
  );

  return (
    <Card variant="bordered" className="p-0 overflow-hidden">
      <div className="h-32 bg-gray-300 relative">
        {artistImage}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
          <FiStar className="text-yellow-500 mr-1" /> {rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-600">{style}</p>
        <Button variant="primary" className="w-full mt-3 text-sm">
          <span className="flex items-center justify-center">
            Voir le profil
          </span>
        </Button>
      </div>
    </Card>
  );
};

const ReminderCard = ({ title, date, type }) => {
  const icon = ALERT_ICONS[type] || ALERT_ICONS.rappel;

  return (
    <div className="flex items-start p-4 border border-gray-100 rounded-lg mb-3 hover:shadow-sm transition-all duration-200 bg-white">
      <div className="flex-shrink-0 mr-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          type === 'alerte' ? 'bg-red-50' : 
          type === 'paiement' ? 'bg-orange-50' : 
          'bg-green-50'
        }`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
};

const AssistantCard = () => (
  <div className="rounded-lg overflow-hidden border border-blue-100">
    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 flex items-start">
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
          <FiSearch className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div>
        <h3 className="font-medium text-gray-800">Assistant intelligent</h3>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          Utilisez notre assistant IA pour trouver l'artiste idéal pour votre événement
        </p>
        <Button variant="primary" className="text-xs py-1 px-3">
          <span className="flex items-center">
            <FiSearch className="mr-1.5 h-3 w-3" />
            Lancer l'assistant
          </span>
        </Button>
      </div>
    </div>
  </div>
);

const CalendarWidget = () => (
  <Card className="p-0 overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="text-xl font-semibold text-gray-800 relative">
        Calendrier des événements
        <span className="absolute -bottom-1 left-0 h-1 w-10 bg-blue-500 rounded-full"></span>
      </h2>
    </div>
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <FiCalendar className="text-blue-600 h-10 w-10" />
          </div>
        </div>
        <div className="md:w-2/3 md:pl-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Consultez votre planning d'événements</h3>
          <p className="text-gray-600 mb-4">Visualisez tous vos événements à venir et gérez votre agenda directement depuis le calendrier interactif.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" className="text-sm">
              <span className="flex items-center">
                <FiCalendar className="mr-1.5" />
                <span>Vue mensuelle</span>
              </span>
            </Button>
            <Button variant="secondary" className="text-sm">
              <span className="flex items-center">
                <FiClock className="mr-1.5" />
                <span>Vue hebdomadaire</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const SectionHeader = ({ title, buttonText, onClick }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-gray-800 relative">
      {title}
      <span className="absolute -bottom-1 left-0 h-1 w-10 bg-bookmi-blue rounded-full"></span>
    </h2>
    {buttonText && (
      <Button 
        variant="secondary" 
        className="text-sm" 
        onClick={onClick}
      >
        {buttonText}
      </Button>
    )}
  </div>
);

const BookerDashboard = () => {
  const [recommendedArtists, setRecommendedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Récupérer les statistiques du tableau de bord
      const statsResponse = await ServiceArtistBooker.getBookerDashboardStats();
      setDashboardStats(statsResponse.data);
      
      // Extraire les événements à venir
      if (statsResponse.data?.bookings?.upcomingEvents) {
        setUpcomingEvents(statsResponse.data.bookings.upcomingEvents);
      }
      
      // Récupérer les artistes recommandés séparément
      const artistsResponse = await ServiceArtistBooker.getRecommendedServices();
      setRecommendedArtists(artistsResponse.data);
    } catch (error) {
      toast.error(error.message || "Erreur lors du chargement des données");
      console.error("Erreur de chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Traduire les statuts en français
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  // Formater la date pour l'afficher de manière plus lisible
  const formatDate = (dateString, timeString) => {
    if (!dateString) return '';
    
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return dateString;
    
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const day = parseInt(dateParts[2]);
    const month = months[parseInt(dateParts[1]) - 1];
    const year = dateParts[0];
    
    return `${day} ${month} ${year}${timeString ? ` · ${timeString}` : ''}`;
  };

  // Formater un montant en FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Données pour chaque section (avec valeurs dynamiques si disponibles)
  const stats = [
    { 
      icon: <FiCalendar className="h-5 w-5 text-blue-600" />, 
      label: "Événements à venir", 
      value: dashboardStats?.bookings?.upcoming.toString() || "0", 
      color: "blue",
      maxValue: 10,
      trend: +15
    },
    { 
      icon: <FiClock className="h-5 w-5 text-orange-600" />, 
      label: "En attente de confirmation", 
      value: dashboardStats?.bookings?.pending.toString() || "0", 
      color: "orange",
      maxValue: 10,
      trend: -5
    },
    { 
      icon: <FiBookOpen className="h-5 w-5 text-emerald-600" />, 
      label: "Réservations en cours", 
      value: dashboardStats?.bookings?.confirmed.toString() || "0", 
      color: "green",
      maxValue: 10,
      trend: +8
    },
    { 
      icon: <FiCheck className="h-5 w-5 text-amber-600" />, 
      label: "Réservations terminées", 
      value: dashboardStats?.bookings?.completed.toString() || "0", 
      color: "yellow",
      maxValue: 15,
      trend: +25
    }
  ];

  // Convertir les événements à venir au format d'affichage
  const upcomingBookings = upcomingEvents.map(event => ({
    id: event.id,
    artist: event.artist,
    service: event.eventType,
    date: formatDate(event.date, event.time),
    rawStatus: event.status,
    status: translateStatus(event.status)
  }));

  // Sections du dashboard avec les données dynamiques
  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="cursor-pointer"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );

  const renderUpcomingBookings = () => (
    <Card className="mb-6 p-0 overflow-hidden">
      <div className="p-4 border-b">
        <SectionHeader 
          title="Réservations à venir" 
          buttonText="Voir tout" 
          onClick={() => navigate('/app/booker/bookings')}
        />
      </div>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bookmi-blue mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Chargement des réservations...</p>
        </div>
      ) : upcomingBookings.length > 0 ? (
        <div className="divide-y max-h-[500px] overflow-auto">
          {upcomingBookings.map((booking, index) => (
            <motion.div 
              key={index}
              className="p-5 hover:bg-gray-50 transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-bookmi-blue/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <FiCalendar className="text-bookmi-blue h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{booking.artist}</h3>
                    <p className="text-sm text-gray-600">{booking.service}</p>
                    <p className="text-xs mt-1 text-gray-500">{booking.date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs py-1 px-3 rounded-full inline-flex items-center ${
                    booking.rawStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.rawStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                  <Button 
                    variant="secondary" 
                    className="text-xs mt-2 py-1 px-3"
                    onClick={() => navigate(`/app/booker/booking/${booking.id}`)}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-gray-50">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiCalendar className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-medium">Aucune réservation à venir</p>
          <p className="text-gray-500 text-sm mb-4">Commencez par trouver des artistes pour votre événement</p>
          <Button 
            variant="primary" 
            className="text-sm"
            onClick={() => navigate('/app/booker/search')}
          >
            <span className="flex items-center">
              <FiSearch className="mr-1.5" />
              <span>Trouver des artistes</span>
            </span>
          </Button>
        </div>
      )}
    </Card>
  );

  const renderRecommendedArtists = () => (
    <Card>
      <SectionHeader 
        title="Artistes recommandés" 
        buttonText="Plus de suggestions" 
      />
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bookmi-blue mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Chargement des recommandations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommendedArtists.map((artist, index) => (
            <ArtistCard key={artist._id || index} {...artist} />
          ))}
        </div>
      )}
    </Card>
  );

  const renderRemindersAndAlerts = () => (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b">
        <SectionHeader title="Rappels et alertes" />
      </div>
      
      <div className="p-4 bg-gray-50">
        {!dashboardStats?.bookings?.pending && 
         !dashboardStats?.bookings?.upcoming && 
         !dashboardStats?.bookings?.confirmed ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FiAlertTriangle className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">Aucune alerte</p>
            <p className="text-gray-500 text-sm">Tout est à jour</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboardStats?.bookings?.pending > 0 && (
              <ReminderCard 
                title={`${dashboardStats.bookings.pending} réservation(s) en attente`}
                date="Nécessite votre attention"
                type="alerte"
              />
            )}
            {dashboardStats?.bookings?.upcoming > 0 && (
              <ReminderCard 
                title={`${dashboardStats.bookings.upcoming} événement(s) à venir`}
                date="Consultez votre calendrier"
                type="rappel"
              />
            )}
            {dashboardStats?.bookings?.confirmed > 0 && (
              <ReminderCard 
                title={`${dashboardStats.bookings.confirmed} réservation(s) en cours`}
                date="Prestations confirmées"
                type="paiement"
              />
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <AssistantCard />
      </div>
    </Card>
  );

  const renderFavoriteArtists = () => {
    const favorites = dashboardStats?.artists?.favoriteArtists || [];
    
    return (
      <Card className="mb-6 p-0 overflow-hidden">
        <div className="p-4 border-b">
          <SectionHeader 
            title="Mes artistes favoris" 
            buttonText={favorites.length > 0 ? "Voir tous" : null}
            onClick={favorites.length > 0 ? () => navigate('/app/booker/favorites') : null}
          />
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-xs text-gray-600">Chargement des favoris...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 max-h-[260px] overflow-auto">
            {favorites.map((artist, index) => (
              <motion.div 
                key={index} 
                className="flex items-center p-2 border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200 bg-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-2 overflow-hidden flex-shrink-0">
                  {artist.profilePhoto ? (
                    <img src={artist.profilePhoto} alt={artist.artistName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-bookmi-blue/70 to-purple-500/70">
                      <FiMusic className="text-white h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-800 truncate">{artist.artistName || artist.projectName}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{artist.discipline}</p>
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-medium text-yellow-700">
                        <FiStar className="text-yellow-500 mr-0.5 h-2.5 w-2.5" /> 
                        {artist.rating ? artist.rating.value.toFixed(1) : '0.0'}
                      </div>
                      <button className="ml-2 text-red-400 hover:text-red-500 transition-colors">
                        <FiHeart className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FiHeart className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium text-sm">Aucun artiste favori</p>
            <p className="text-gray-500 text-xs mb-3">Ajoutez des artistes à vos favoris</p>
            <Button 
              variant="primary" 
              className="text-xs py-1.5"
              onClick={() => navigate('/app/booker/search')}
            >
              <span className="flex items-center">
                <FiSearch className="mr-1.5 h-3 w-3" />
                <span>Découvrir des artistes</span>
              </span>
            </Button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <BookerLayout>
      <div className="py-8">
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Tableau de bord</h1>
            <p className="text-gray-500">Bienvenue dans votre espace de gestion</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button 
              variant="primary" 
              className="text-sm"
              onClick={() => navigate('/app/booker/search')}
            >
              <span className="flex items-center">
                <FiSearch className="mr-1.5" />
                <span>Trouver un artiste</span>
              </span>
            </Button>
          </div>
        </motion.div>
        
        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {renderStats()}
        </motion.div>

        {/* Contenu principal */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            {renderUpcomingBookings()}
            {renderFavoriteArtists()}
          </div>
          
          {/* Colonne latérale */}
          <div>
            {renderRemindersAndAlerts()}
          </div>
        </motion.div>
        
        {/* Calendrier en bas sur toute la largeur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <CalendarWidget />
        </motion.div>
      </div>
    </BookerLayout>
  );
};

export default BookerDashboard; 
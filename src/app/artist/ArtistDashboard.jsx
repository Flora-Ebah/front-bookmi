import React, { useState, useEffect } from 'react';
import ArtistLayout from './layouts/ArtistLayout';
import { Card, Button } from '../../components/ui';
import { FiEye, FiClock, FiStar, FiBarChart2, FiCalendar, FiDollarSign, FiAward, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock as FiClockCircle, FiAlertCircle } from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';

const StatCard = ({ icon, label, value, color = 'blue' }) => {
  const bgColors = {
    blue: 'bg-bookmi-blue/10',
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100'
  };
  
  const textColors = {
    blue: 'text-bookmi-blue',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    orange: 'text-orange-500',
    red: 'text-red-500'
  };
  
  return (
    <Card variant="bordered" className="px-4 py-4">
      <div className="flex items-center">
        <div className={`rounded-full ${bgColors[color]} p-2 mr-3`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">{label}</div>
          <div className={`text-xl font-semibold ${textColors[color]}`}>{value}</div>
        </div>
      </div>
    </Card>
  );
};

// Composant de cercle de progression pour les réservations
const ProgressCircle = ({ value, total, label, color, icon }) => {
  const radius = 30;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Limiter la valeur à total pour éviter les dépassements
  const safeValue = Math.min(value, total);
  
  // Calculer le pourcentage et s'assurer qu'il ne dépasse pas 100%
  const percentage = total > 0 ? Math.min(100, (safeValue / total) * 100) : 0;
  
  // Calculer la longueur de l'arc à masquer
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colors = {
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    blue: 'stroke-bookmi-blue',
    red: 'stroke-red-500'
  };
  
  const bgColors = {
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    blue: 'bg-bookmi-blue/10',
    red: 'bg-red-100'
  };
  
  const textColors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    blue: 'text-bookmi-blue',
    red: 'text-red-500'
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center mb-2">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={colors[color]}
          />
        </svg>
        <div className="absolute">
          <div className={`rounded-full ${bgColors[color]} p-2`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`text-xl font-semibold ${textColors[color]}`}>{value}</div>
      <div className="text-xs text-gray-500 text-center">{label}</div>
    </div>
  );
};

// Nouveau composant pour afficher les statistiques de réservation
const BookingStatsCard = ({ stats = {} }) => {
  const total = stats.total || 0;
  return (
    <Card variant="bordered" className="p-4">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-gray-700">Réservations</h3>
        <p className="text-xs text-gray-500">État de vos réservations</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <ProgressCircle
          value={stats.pending || 0}
          total={total}
          label="En attente"
          color="yellow"
          icon={<FiClockCircle className="h-4 w-4 text-yellow-600" />}
        />
        <ProgressCircle
          value={stats.confirmed || 0}
          total={total}
          label="Confirmées"
          color="blue"
          icon={<FiAlertCircle className="h-4 w-4 text-bookmi-blue" />}
        />
        <ProgressCircle
          value={stats.completed || 0}
          total={total}
          label="Terminées"
          color="green"
          icon={<FiCheckCircle className="h-4 w-4 text-green-600" />}
        />
        <ProgressCircle
          value={stats.cancelled || 0}
          total={total}
          label="Annulées"
          color="red"
          icon={<FiXCircle className="h-4 w-4 text-red-500" />}
        />
      </div>
    </Card>
  );
};

const EventCard = ({ title, location, date, time }) => (
  <div className="p-3 border border-gray-200 rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{location}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-bookmi-blue">{date}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  </div>
);

const RequestCard = ({ client, service, status }) => {
  const statusColors = {
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Confirmé': 'bg-green-100 text-green-800',
    'Annulé': 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{client}</p>
          <p className="text-sm text-gray-600">{service}</p>
        </div>
        <div className="text-right">
          <p className={`text-xs py-1 px-2 rounded ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant d'avis pour le tableau de bord
const ReviewCard = ({ review }) => {
  const date = new Date(review.date);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Nom du booker
  const bookerName = review.booker?.companyName || 
    `${review.booker?.firstName || ''} ${review.booker?.lastName || ''}`.trim() || 
    'Client';
  
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium">{bookerName}</p>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
    </div>
  );
};

const BadgeCard = ({ title, category, level }) => {
  const levelColors = {
    'bronze': 'bg-amber-100 text-amber-800 border-amber-200',
    'argent': 'bg-gray-100 text-gray-700 border-gray-200',
    'or': 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  return (
    <div className={`flex items-center p-3 border rounded-lg ${levelColors[level]}`}>
      <div className="flex-shrink-0 mr-3">
        <FiAward className="h-8 w-8" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs opacity-80">{category}</p>
      </div>
    </div>
  );
};

const ArtistDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les statistiques du tableau de bord
      const response = await ServiceArtistBooker.getDashboardStats();
      
      if (response.success && response.data) {
        setStatsData(response.data);
        // Récupérer les avis récents
        setRecentReviews(response.data.reviews?.recentReviews || []);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      setError(error.message || "Impossible de charger les données du tableau de bord");
      toast.error("Erreur lors du chargement des statistiques");
      
      // Utiliser des données fictives en cas d'erreur
      setStatsData({
        profileViews: 0,
        rating: { value: 0, count: 0 },
        reviews: { total: 0, averageRating: 0, ratingCount: 0, recentReviews: [] },
        bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, upcoming: 0, revenueThisMonth: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Statistiques personnelles avancées
  const getStatsAdvanced = () => {
    if (!statsData) {
      return [
        { icon: <FiEye className="h-5 w-5 text-bookmi-blue" />, label: "Vues du profil", value: "0", color: "blue" },
        { icon: <FiStar className="h-5 w-5 text-yellow-600" />, label: "Note moyenne", value: "0/5", color: "yellow" },
        { icon: <FiCalendar className="h-5 w-5 text-bookmi-blue" />, label: "Événements à venir", value: "0", color: "blue" },
        { icon: <FiDollarSign className="h-5 w-5 text-orange-500" />, label: "Revenu du mois", value: "0 FCFA", color: "orange" },
      ];
    }
    
    // Formatter le montant du revenu avec séparateur de milliers
    const formatCurrency = (amount) => {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };
    
    return [
      { icon: <FiEye className="h-5 w-5 text-bookmi-blue" />, label: "Vues du profil", value: statsData.profileViews.toString(), color: "blue" },
      { icon: <FiStar className="h-5 w-5 text-yellow-600" />, label: "Note moyenne", value: `${statsData.rating?.value?.toFixed(1) || '0'}/5`, color: "yellow" },
      { icon: <FiCalendar className="h-5 w-5 text-bookmi-blue" />, label: "Événements à venir", value: (statsData.bookings?.upcoming || 0).toString(), color: "blue" },
      { icon: <FiDollarSign className="h-5 w-5 text-orange-500" />, label: "Revenu du mois", value: `${formatCurrency(statsData.bookings?.revenueThisMonth || 0)} FCFA`, color: "orange" },
    ];
  };

  // Événements à venir (à remplacer par des données réelles)
  const upcomingEvents = [
    { title: "Festival de Jazz", location: "Paris, France", date: "15 juin 2023", time: "20:00" },
    { title: "Événement privé", location: "Lyon, France", date: "22 juin 2023", time: "18:30" }
  ];

  // Demandes récentes avec statuts variés
  const recentRequests = [
    { client: "Bar Le Central", service: "Concert acoustique", status: "En attente" },
    { client: "Mariage Dupont", service: "Animation soirée", status: "Confirmé" }
  ];

  // Badges de compétence
  const badges = [
    { title: "Artiste réactif", category: "Communication", level: "or" },
    { title: "Nouvelle révélation", category: "Popularité", level: "argent" }
  ];

  if (loading) {
    return (
      <ArtistLayout>
        <div className="py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bookmi-blue"></div>
        </div>
      </ArtistLayout>
    );
  }

  return (
    <ArtistLayout>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">Tableau de bord</h1>
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              className="text-sm" 
              onClick={fetchDashboardData}
            >
              <div className="flex items-center">
                <FiRefreshCw className="mr-1.5" />
                <span>Rafraîchir</span>
              </div>
            </Button>
            <Button 
              variant="primary" 
              className="text-sm"
              onClick={() => window.location.href = '/app/artist/events'}
            >
              <div className="flex items-center">
                <FiCalendar className="mr-1.5" />
                <span>Voir mon agenda</span>
              </div>
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {/* Statistiques avancées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {getStatsAdvanced().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
        
        {/* Statistiques de réservation avec cercles de progression */}
        <div className="mb-8">
          <BookingStatsCard stats={statsData?.bookings} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Événements à venir */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Prochains événements</h2>
            <div className="space-y-3">
              {statsData?.bookings?.upcoming > 0 ? (
                <div className="p-3 border border-gray-200 rounded-lg bg-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Vous avez {statsData.bookings.upcoming} événement(s) à venir</p>
                      <p className="text-sm text-gray-600">Consultez votre calendrier</p>
                    </div>
                    <div className="text-right">
                      <FiCalendar className="h-5 w-5 text-bookmi-blue" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun événement à venir</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="secondary" 
                className="text-sm w-full"
                onClick={() => window.location.href = '/app/artist/events'}
              >
                Voir tous les événements
              </Button>
            </div>
          </Card>
          
          {/* Derniers avis */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Derniers avis</h2>
            <div className="space-y-3">
              {recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun avis pour le moment</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="secondary" 
                className="text-sm w-full"
                onClick={() => window.location.href = '/app/artist/reviews'}
              >
                Voir tous les avis
              </Button>
            </div>
          </Card>
          
          {/* Badges de compétence */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Badges obtenus</h2>
            {statsData?.bookings?.completed > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-lg bg-yellow-100 text-yellow-700 border-yellow-200">
                  <div className="flex-shrink-0 mr-3">
                    <FiAward className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">Artiste expérimenté</p>
                    <p className="text-xs opacity-80">Félicitations pour vos {statsData.bookings.completed} prestation(s) réussie(s)!</p>
                  </div>
                </div>
                {statsData?.rating?.value >= 4 && statsData?.rating?.count >= 1 && (
                  <div className="flex items-center p-3 border rounded-lg bg-green-100 text-green-700 border-green-200">
                    <div className="flex-shrink-0 mr-3">
                      <FiStar className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-medium">Artiste bien noté</p>
                      <p className="text-xs opacity-80">Excellente note moyenne de {statsData.rating.value.toFixed(1)}/5</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Complétez des prestations pour obtenir des badges</p>
            )}
            <div className="mt-4 text-center">
              <Button variant="secondary" className="text-sm w-full">Voir tous les badges</Button>
            </div>
          </Card>
        </div>

        {/* Assistant IA */}
        <Card className="bg-bookmi-blue/5 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="rounded-full bg-bookmi-blue/20 p-3">
                <FiStar className="h-6 w-6 text-bookmi-blue" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Conseil IA pour améliorer votre profil</h3>
              <p className="text-gray-600 text-sm mb-3">
                {statsData && statsData.rating?.count > 0 
                  ? "Ajouter plus de photos de vos performances récentes pourrait augmenter votre taux de réservation de 20%."
                  : "Demandez à vos clients de vous laisser un avis pour augmenter votre visibilité et votre crédibilité."}
              </p>
              <Button variant="primary" className="text-sm">Améliorer mon profil</Button>
            </div>
          </div>
        </Card>
      </div>
    </ArtistLayout>
  );
};

export default ArtistDashboard; 
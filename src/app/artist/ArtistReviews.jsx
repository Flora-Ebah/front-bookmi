import React, { useState, useEffect, useMemo } from 'react';
import ArtistLayout from './layouts/ArtistLayout';
import { Card, Button } from '../../components/ui';
import { 
  FiStar, FiUser, FiCalendar, FiMessageSquare, 
  FiChevronDown, FiChevronUp, FiFilter, FiSearch, 
  FiRefreshCw, FiShare2, FiBarChart2, FiHeart,
  FiThumbsUp, FiClock
} from 'react-icons/fi';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Composant pour afficher un avis individuel
const ReviewItem = ({ review, expanded = false, onRespond }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const date = new Date(review.date);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Gérer les bookers qui peuvent avoir des structures différentes
  const bookerName = review.booker?.companyName || 
    `${review.booker?.firstName || ''} ${review.booker?.lastName || ''}`.trim() || 
    'Client';
  
  // Calculer la taille du commentaire pour déterminer s'il faut afficher le bouton "Voir plus"
  const hasLongComment = review.comment && review.comment.length > 150;
  
  // Formater la date de réponse si elle existe
  let responseDate = null;
  if (review.artistResponse && review.artistResponse.date) {
    responseDate = new Date(review.artistResponse.date);
  }
  
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() === '') return;
    
    setIsSubmitting(true);
    onRespond(review._id, replyText)
      .then(() => {
        setIsReplying(false);
        setReplyText('');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  // Déterminer la couleur en fonction de la note
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="p-5 flex flex-col h-full">
          {/* En-tête avec le nom du booker et la note */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden border border-gray-200">
                {review.booker?.profilePhoto ? (
                  <img 
                    src={review.booker.profilePhoto} 
                    alt={bookerName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="text-gray-400 w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{bookerName}</h3>
                <div className="flex items-center mt-1">
                  <div className={`flex items-center ${getRatingColor(review.rating)}`}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-1 font-medium">{review.rating}</span>
                  </div>
                  <div className="flex items-center ml-3 text-gray-500 text-sm">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {review.verified && (
                <div className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium flex items-center">
                  <FiThumbsUp className="w-3 h-3 mr-1" />
                  Vérifié
                </div>
              )}
            </div>
          </div>
          
          {/* Contenu du commentaire */}
          {review.comment && (
            <div className="mt-1 flex-grow">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                {isExpanded || !hasLongComment ? (
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment.substring(0, 150)}...</p>
                )}
                
                {hasLongComment && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-bookmi-blue hover:underline text-xs flex items-center"
                  >
                    {isExpanded ? (
                      <>
                        <FiChevronUp className="mr-1" /> Voir moins
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="mr-1" /> Voir plus
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Réponse de l'artiste si elle existe */}
          {review.artistResponse && review.artistResponse.text && (
            <div className="mt-4 pl-4 border-l-2 border-bookmi-blue bg-blue-50 p-3 rounded-r-lg">
              <div className="flex items-center mb-1">
                <span className="text-xs font-semibold text-bookmi-blue flex items-center">
                  <FiMessageSquare className="mr-1" />
                  Votre réponse
                </span>
                {responseDate && (
                  <span className="ml-2 text-xs text-gray-500 flex items-center">
                    <FiClock className="mr-1 w-3 h-3" />
                    {responseDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm">{review.artistResponse.text}</p>
            </div>
          )}
          
          {/* Formulaire de réponse */}
          {!review.artistResponse?.text && !isReplying && onRespond && (
            <div className="mt-auto pt-4 flex justify-end">
              <Button
                onClick={() => setIsReplying(true)}
                variant="secondary"
                size="sm"
                className="text-sm"
              >
                <span className="flex items-center">
                  <FiMessageSquare className="mr-1.5 w-4 h-4" />
                  Répondre
                </span>
              </Button>
            </div>
          )}
          
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden"
              >
                <form onSubmit={handleReplySubmit}>
                  <div className="mb-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-bookmi-blue text-sm"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => setIsReplying(false)}
                      variant="text"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Envoi...' : 'Envoyer la réponse'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

// Statistiques sur les avis avec cercles de progression
const ReviewsStats = ({ stats }) => {
  const { rating, reviewsCount } = stats;
  
  // Calculer le pourcentage pour l'anneau de progression
  const ratingPercentage = ((rating?.value || 0) / 5) * 100;
  const commentPercentage = rating?.count > 0 ? (reviewsCount / rating.count) * 100 : 0;
  
  // Composant Circle Progress
  const CircleProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6', children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Cercle de fond */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Cercle de progression */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="mb-6 overflow-hidden">
      <div className="p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FiBarChart2 className="mr-2 text-bookmi-blue" />
          Statistiques des avis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center">
            <CircleProgress percentage={ratingPercentage} color="#3b82f6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {rating?.value?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-gray-500">sur 5</div>
              </div>
            </CircleProgress>
            <div className="flex items-center justify-center mt-3 mb-1">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(rating?.value || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 text-center">
              <span className="font-medium">{rating?.count || 0}</span> évaluation{rating?.count !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center">
            <div className="h-[120px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-bookmi-blue flex items-center justify-center">
                  <FiMessageSquare className="text-gray-400 mr-2" />
                  {reviewsCount || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avis reçu{reviewsCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="mt-3 w-full">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Répartition</span>
                <span className="text-gray-800 font-medium">{reviewsCount || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-bookmi-blue" 
                  style={{ width: `${reviewsCount ? 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center">
            <CircleProgress percentage={commentPercentage} color="#10b981">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {Math.round(commentPercentage)}%
                </div>
                <div className="text-xs text-gray-500">taux</div>
              </div>
            </CircleProgress>
            <div className="text-sm text-gray-600 text-center mt-3">
              Des évaluations incluent un commentaire
            </div>
            <div className="mt-3 w-full">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Commentaires</span>
                <span>{reviewsCount || 0} / {rating?.count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Composant de filtre et tri
const ReviewFilters = ({ sortOption, setSortOption, totalReviews }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-gray-600 flex items-center">
          <FiMessageSquare className="mr-2 text-bookmi-blue" />
          <span className="font-medium">{totalReviews}</span> avis au total
        </div>
        
        <div className="flex items-center">
          <FiFilter className="mr-2 text-gray-600" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-bookmi-blue"
          >
            <option value="recent">Plus récents</option>
            <option value="highest">Meilleures notes</option>
            <option value="lowest">Notes les plus basses</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// État vide
const EmptyState = ({ onShare }) => {
  return (
    <Card>
      <div className="p-12 text-center">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiMessageSquare className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun avis pour le moment</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Vous n'avez pas encore reçu d'avis de vos clients. Partagez votre profil pour encourager vos clients à laisser un avis.
        </p>
        <Button variant="primary" onClick={onShare}>
          <span className="flex items-center">
            <FiShare2 className="mr-1.5 w-4 h-4" />
            <span>Partager votre profil</span>
          </span>
        </Button>
      </div>
    </Card>
  );
};

// Composant principal
const ArtistReviews = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ rating: { value: 0, count: 0 }, reviewsCount: 0 });
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('recent'); // 'recent', 'highest', 'lowest'
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les avis
      const response = await ServiceArtistBooker.getMyReviews();
      
      if (response.success && response.data) {
        const reviewsData = response.data.reviews || [];
        setReviews(reviewsData);
        
        // Calculer les statistiques
        setStats({
          rating: response.data.rating || { value: 0, count: 0 },
          reviewsCount: reviewsData.length
        });
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error);
      setError(error.message || "Impossible de charger les avis");
      toast.error("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour simuler l'actualisation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchReviews();
      // Attendre au moins 800ms pour l'animation
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Avis actualisés");
    } catch (error) {
      // L'erreur est déjà gérée dans fetchReviews
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fonction pour trier les avis
  const sortedReviews = useMemo(() => {
    if (!reviews.length) return [];
    
    const sortedList = [...reviews];
    
    switch (sortOption) {
      case 'highest':
        return sortedList.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sortedList.sort((a, b) => a.rating - b.rating);
      case 'recent':
      default:
        return sortedList.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [reviews, sortOption]);
  
  // Fonction pour répondre à un avis
  const handleRespondToReview = async (reviewId, responseText) => {
    try {
      const response = await ServiceArtistBooker.respondToReview(reviewId, responseText);
      
      if (response.success) {
        // Mettre à jour l'avis dans l'état local
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { ...review, artistResponse: response.data.artistResponse } 
              : review
          )
        );
        
        toast.success('Votre réponse a été publiée avec succès');
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de la réponse');
      throw error;
    }
  };
  
  // Fonction pour partager le profil
  const handleShareProfile = () => {
    // Fonctionnalité de partage à implémenter
    toast.info('Fonctionnalité de partage à implémenter');
  };
  
  if (loading) {
    return (
      <ArtistLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement de vos avis...</p>
        </div>
      </ArtistLayout>
    );
  }
  
  return (
    <ArtistLayout>
      <div className="py-6 md:py-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* En-tête avec titre et bouton d'actualisation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mes Avis</h1>
            <p className="text-gray-500 mt-1">Gérez les avis de vos clients</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0"
            >
              <div className="flex items-center">
                <FiRefreshCw className={`mr-1.5 w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </div>
            </Button>
            
            <Button 
              onClick={handleShareProfile}
              className="flex-shrink-0"
            >
              <div className="flex items-center">
                <FiShare2 className="mr-1.5 w-4 h-4" />
                <span>Partager profil</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Statistiques des avis */}
        <ReviewsStats stats={stats} />
        
        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-start">
            <FiMessageSquare className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Barre de tri */}
        <ReviewFilters 
          sortOption={sortOption} 
          setSortOption={setSortOption} 
          totalReviews={reviews.length}
        />
        
        {/* Liste des avis */}
        <div className="mb-6">
          {reviews.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {sortedReviews.map((review, index) => (
                <ReviewItem 
                  key={review._id || index} 
                  review={review} 
                  expanded={index === 0} 
                  onRespond={handleRespondToReview}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState onShare={handleShareProfile} />
          )}
        </div>
      </div>
    </ArtistLayout>
  );
};

export default ArtistReviews;
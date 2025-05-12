import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtistLayout from './layouts/ArtistLayout';
import { Card, Button } from '../../components/ui';
import { toast } from 'react-toastify';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import paymentService from '../../services/paymentService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiArrowLeft,
  FiMessageSquare,
  FiAward,
  FiAlertCircle,
  FiInfo,
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiClipboard,
  FiHash,
  FiPercent,
  FiChevronRight,
  FiChevronDown,
  FiExternalLink,
  FiRefreshCw,
  FiList,
  FiUserCheck,
  FiLayers
} from 'react-icons/fi';

// Configuration des statuts avec des couleurs plus modernes
const STATUS_CONFIG = {
  'confirmed': { 
    bg: 'bg-emerald-500', 
    text: 'text-white',
    icon: <FiCheckCircle className="mr-2" />,
    label: 'Confirmée',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-700',
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-200'
  },
  'pending': { 
    bg: 'bg-amber-500', 
    text: 'text-white', 
    icon: <FiClock className="mr-2" />,
    label: 'En attente',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-amber-600', 
    shadow: 'shadow-amber-200'
  },
  'completed': { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    icon: <FiAward className="mr-2" />,
    label: 'Terminée',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-200'
  },
  'cancelled': { 
    bg: 'bg-rose-500', 
    text: 'text-white', 
    icon: <FiAlertCircle className="mr-2" />,
    label: 'Annulée',
    lightBg: 'bg-rose-50',
    lightText: 'text-rose-700',
    border: 'border-rose-200',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-200'
  },
};

// Configuration des statuts de paiement
const PAYMENT_STATUS_CONFIG = {
  'paid': { 
    bg: 'bg-emerald-100', 
    text: 'text-emerald-800', 
    icon: <FiCheckCircle className="ml-1" />,
    label: 'Payé',
    badge: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badgeText: 'text-white'
  },
  'partial': { 
    bg: 'bg-blue-100', 
    text: 'text-blue-800', 
    icon: <FiPercent className="ml-1" />,
    label: 'Partiellement payé',
    badge: 'bg-gradient-to-r from-blue-500 to-blue-600',
    badgeText: 'text-white'
  },
  'unpaid': { 
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    icon: <FiClock className="ml-1" />,
    label: 'En attente',
    badge: 'bg-gradient-to-r from-amber-500 to-amber-600',
    badgeText: 'text-white'
  }
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'Date non spécifiée';
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  } catch (error) {
    return dateString;
  }
};

// Formater la date courte
const formatShortDate = (dateString) => {
  if (!dateString) return '--/--/----';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Formatter le prix
const formatPrice = (amount) => {
  if (!amount && amount !== 0) return 'Prix non spécifié';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'payment', 'client', 'transactions'
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [showFullNote, setShowFullNote] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' ou 'table'

  // Animations pour framer-motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideIn = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  const tabVariants = {
    inactive: { opacity: 0.6, y: 5 },
    active: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ServiceArtistBooker.getReservation(id);
        
        if (response?.success && response?.data) {
          console.log("Réservation récupérée avec succès:", response.data);
          setReservation(response.data);
          // Après avoir chargé la réservation, charger les paiements associés
          fetchPayments(response.data._id);
        } else {
          console.error("Format de réponse invalide:", response);
          setError("La réservation n'a pas pu être récupérée. Format de réponse incorrect.");
          toast.error("Erreur lors du chargement des détails de la réservation");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        setError(`Une erreur est survenue: ${error.message}`);
        toast.error("Impossible de charger les détails de l'événement");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (id) {
      fetchReservationDetails();
    }
  }, [id]);

  const fetchPayments = async (reservationId) => {
    try {
      setPaymentLoading(true);
      const response = await paymentService.getReceivedPayments();
      
      if (response.success && response.data) {
        // Filtrer les paiements qui correspondent à cette réservation
        const reservationPayments = response.data.filter(
          payment => payment.reservation?._id === reservationId
        );
        
        console.log("Paiements trouvés pour la réservation:", reservationPayments);
        setPayments(reservationPayments);
      } else {
        console.warn("Aucun paiement trouvé ou format de réponse incorrect");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error);
      toast.error("Impossible de charger les informations de paiement");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await paymentService.generateReceipt(paymentId);
      
      if (response.success && response.data) {
        // En production, cette fonction téléchargerait un PDF
        // Pour l'instant, affichons simplement un message de succès
        toast.success("Reçu téléchargé avec succès");
        
        // Ouvrir une nouvelle fenêtre avec les données formatées
        const receiptWindow = window.open('', '_blank');
        if (receiptWindow) {
          const receiptData = response.data;
          receiptWindow.document.write(`
            <html>
              <head>
                <title>Reçu de paiement</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  h1 { color: #3b82f6; }
                  .section { margin-bottom: 20px; }
                  .label { font-weight: bold; color: #666; }
                  .value { margin-top: 5px; }
                  .total { font-size: 1.2em; font-weight: bold; color: #3b82f6; }
                </style>
              </head>
              <body>
                <h1>Reçu de paiement</h1>
                <div class="section">
                  <div class="label">Numéro de reçu:</div>
                  <div class="value">${receiptData.receiptNumber || 'Non spécifié'}</div>
                </div>
                <div class="section">
                  <div class="label">Date:</div>
                  <div class="value">${new Date(receiptData.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div class="section">
                  <div class="label">Client:</div>
                  <div class="value">${receiptData.client.name}</div>
                  <div class="value">${receiptData.client.email}</div>
                  <div class="value">${receiptData.client.phone}</div>
                </div>
                <div class="section">
                  <div class="label">Artiste:</div>
                  <div class="value">${receiptData.artist.name}</div>
                </div>
                <div class="section">
                  <div class="label">Réservation:</div>
                  <div class="value">Service: ${receiptData.reservation.service}</div>
                  <div class="value">Date: ${receiptData.reservation.date}</div>
                  <div class="value">Heure: ${receiptData.reservation.time}</div>
                  <div class="value">Lieu: ${receiptData.reservation.location}</div>
                </div>
                <div class="section">
                  <div class="label">Paiement:</div>
                  <div class="value">Sous-total: ${formatPrice(receiptData.payment.subtotal)}</div>
                  <div class="value">Frais de service: ${formatPrice(receiptData.payment.serviceFee)}</div>
                  <div class="total">Total: ${formatPrice(receiptData.payment.total)}</div>
                  <div class="value">Type: ${receiptData.payment.paymentType === 'advance' ? 'Acompte' : 'Paiement complet'}</div>
                  <div class="value">Statut: ${receiptData.status === 'completed' ? 'Payé' : 'En attente'}</div>
                </div>
              </body>
            </html>
          `);
        } else {
          toast.warning("Le navigateur a bloqué l'ouverture de la fenêtre pour le reçu");
        }
      } else {
        toast.error("Erreur lors de la génération du reçu");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement du reçu:", error);
      toast.error("Impossible de télécharger le reçu");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      // Vérifier si l'artiste tente d'annuler une réservation déjà payée
      if (newStatus === 'cancelled' && (reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'partial')) {
        toast.error("Impossible d'annuler une réservation ayant déjà reçu un paiement");
        return;
      }
      
      setStatusUpdating(true);
      const response = await ServiceArtistBooker.updateReservationStatus(id, newStatus);
      
      if (response?.success && response?.data) {
        // Mettre à jour l'état local
        setReservation(prev => ({
          ...prev,
          status: newStatus
        }));
        
        // Une notification est automatiquement envoyée au booker par le backend
        // lorsque l'artiste change le statut de la réservation
        
        toast.success(`Statut mis à jour avec succès: ${newStatus}`);
      } else {
        toast.error("La mise à jour du statut a échoué");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await ServiceArtistBooker.getReservation(id);
      
      if (response?.success && response?.data) {
        setReservation(response.data);
        await fetchPayments(response.data._id);
        toast.success("Informations actualisées");
      } else {
        toast.error("Erreur lors de l'actualisation");
      }
    } catch (error) {
      toast.error("Impossible d'actualiser les données");
    } finally {
      // Attendre au moins 800ms pour l'animation
      await new Promise(resolve => setTimeout(resolve, 800));
      setRefreshing(false);
    }
  };

  // Contenus à afficher en fonction du statut
  const statusButtons = () => {
    if (!reservation) return null;
    
    // Définir les actions possibles
    const actions = [];
    
    // Vérifier si un paiement a été effectué
    const hasBeenPaid = reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'partial';
    
    if (reservation.status === 'pending') {
      actions.push({
        key: "confirm",
        icon: <FiCheckCircle />,
        text: statusUpdating ? 'Mise à jour...' : 'Confirmer',
        onClick: () => handleUpdateStatus('confirmed'),
        disabled: statusUpdating,
        variant: "primary",
        className: "bg-emerald-600 hover:bg-emerald-700"
      });
    } else if (reservation.status === 'confirmed') {
      actions.push({
        key: "complete",
        icon: <FiAward />,
        text: statusUpdating ? 'Mise à jour...' : 'Terminer',
        onClick: () => handleUpdateStatus('completed'),
        disabled: statusUpdating,
        variant: "primary",
        className: "bg-blue-600 hover:bg-blue-700"
      });
    }
    
    // N'afficher le bouton d'annulation que si la réservation n'est pas déjà annulée ou terminée
    // et si elle n'a pas encore été payée
    if (reservation.status !== 'cancelled' && reservation.status !== 'completed' && !hasBeenPaid) {
      actions.push({
        key: "cancel",
        icon: <FiAlertCircle />,
        text: "Annuler",
        onClick: () => handleUpdateStatus('cancelled'),
        variant: "outline",
        className: "border-2 border-rose-500 text-rose-500 hover:bg-rose-50"
      });
    } else if (reservation.status !== 'cancelled' && reservation.status !== 'completed' && hasBeenPaid) {
      // Si la réservation a été payée mais n'est pas annulée/terminée, montrer un bouton d'annulation désactivé
      actions.push({
        key: "cancel-disabled",
        icon: <FiAlertCircle />,
        text: "Annulation impossible",
        disabled: true,
        variant: "outline",
        className: "border-2 border-gray-300 text-gray-400 cursor-not-allowed"
      });
    }
    
    if (reservation.status !== 'cancelled') {
      actions.push({
        key: "calendar",
        icon: <FiCalendar />,
        text: "Calendrier",
        onClick: () => navigate(`/app/artist/events/${id}/calendar`),
        variant: "outline",
        className: "border-2 border-gray-400 text-gray-600 hover:bg-gray-50"
      });
    }
    
    if (reservation.booker?._id || typeof reservation.booker === 'string') {
      const bookerId = reservation.booker?._id || reservation.booker;
      actions.push({
        key: "contact",
        icon: <FiMessageSquare />,
        text: "Contacter",
        onClick: () => navigate(`/app/artist/messages/booker/${bookerId}`),
        variant: "outline",
        className: "border-2 border-bookmi-blue text-bookmi-blue hover:bg-bookmi-blue/10"
      });
    }
    
    // Nombre de boutons à afficher (pour calculer la largeur)
    const numButtons = actions.length;
    if (numButtons === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 md:flex md:justify-between md:space-x-2 md:w-full">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant === "outline" ? "custom" : action.variant}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${action.className} text-xs h-10 flex items-center justify-center font-medium`}
          >
            <span className="flex items-center">
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              <span className="truncate">{action.text}</span>
            </span>
          </Button>
        ))}
      </div>
    );
  };

  // Ajout d'une nouvelle fonction pour afficher le statut
  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || {
      bg: 'bg-gray-500',
      text: 'text-white',
      icon: <FiInfo className="mr-2" />,
      label: 'Indéfini',
      gradient: 'from-gray-500 to-gray-600'
    };
    
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className={`px-5 py-2.5 rounded-full flex items-center bg-gradient-to-r ${config.gradient} ${config.text} shadow-md ${config.shadow} transition-all`}
      >
        {config.icon}
        <span className="font-medium">{config.label}</span>
      </motion.div>
    );
  };
  
  // Ajout d'une nouvelle fonction pour afficher le statut de paiement
  const renderPaymentBadge = (status) => {
    const config = PAYMENT_STATUS_CONFIG[status] || {
      badge: 'bg-gradient-to-r from-gray-500 to-gray-600',
      badgeText: 'text-white',
      icon: <FiInfo className="ml-1" />,
      label: 'Indéfini'
    };
    
    return (
      <motion.span 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center ${config.badge} ${config.badgeText} shadow-sm`}
      >
        {config.label}
        {config.icon}
      </motion.span>
    );
  };
  
  // Fonction pour afficher les onglets
  const renderTabs = () => {
    const tabs = [
      { id: 'details', icon: <FiInfo />, label: 'Détails' },
      { id: 'payment', icon: <FiDollarSign />, label: 'Paiement' },
      { id: 'client', icon: <FiUser />, label: 'Client' },
      { id: 'transactions', icon: <FiCreditCard />, label: 'Transactions' },
    ];
    
    return (
      <div className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border border-gray-100">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === tab.id ? "active" : "inactive"}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 min-w-[80px] py-3 text-sm font-medium transition-all flex flex-col items-center justify-center ${
                activeTab === tab.id 
                  ? 'text-bookmi-blue border-b-2 border-bookmi-blue' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ArtistLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-20 h-20 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-600">Chargement des détails de l'événement...</p>
        </div>
      </ArtistLayout>
    );
  }

  if (error || !reservation) {
    return (
      <ArtistLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/artist/events')}
            className="mb-6 flex items-center text-sm"
          >
            <FiArrowLeft className="mr-2" /> Retour aux événements
          </Button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-8 max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Détails non disponibles
              </h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {error || "Nous n'avons pas pu trouver les détails de cet événement. Veuillez réessayer ou revenir à la liste des événements."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={handleRefresh}
                  className="flex items-center justify-center"
                >
                  <FiRefreshCw className="mr-2" />
                  Réessayer
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/app/artist/events')}
                  className="flex items-center justify-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Retour aux événements
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </ArtistLayout>
    );
  }

  // Extraire les données de la réservation
  const {
    status,
    date,
    startTime,
    endTime,
    location,
    eventType,
    amount,
    serviceFee,
    notes,
    paymentStatus,
    serviceId,
    booker
  } = reservation || {};

  // Récupération des informations correctement, avec gestion des différentes structures possibles
  const serviceName = serviceId?.title || 'Service non spécifié';
  
  // Gestion booker possible sous forme d'objet ou d'ID
  const bookerName = booker?.firstName && booker?.lastName 
    ? `${booker.firstName} ${booker.lastName}`
    : (booker?.companyName || (booker?.user?.firstName ? `${booker.user.firstName} ${booker.user.lastName}` : 'Client'));
  
  const bookerEmail = booker?.email || (booker?.user?.email || 'Email non disponible');
  const bookerPhone = booker?.phone || 'Téléphone non disponible';

  return (
    <ArtistLayout>
      <div className="container mx-auto px-0 py-0 md:py-6 max-w-4xl">
        {/* En-tête mobile différent */}
        <div className="md:hidden bg-white sticky top-0 z-10 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <Button 
            variant="text"
            size="sm"
            onClick={() => navigate('/app/artist/events')}
            className="flex items-center text-gray-700 p-0"
          >
            <FiArrowLeft className="mr-2" /> Retour
          </Button>
          
          <div>
            {renderStatusBadge(status)}
          </div>
          
          <Button
            variant="text"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center text-gray-600 p-0"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Entête desktop */}
        <div className="hidden md:flex justify-between items-center mb-6 px-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/artist/events')}
            className="hover:bg-gray-100 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Retour
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center text-gray-600"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
        
        {/* Aperçu du service mobile */}
        <div className="md:hidden bg-gradient-to-r from-blue-50 to-indigo-50 pt-4 pb-6 px-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{serviceName}</h1>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <FiCalendar className="mr-2" /> 
            <span>{formatDate(date)}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <FiMapPin className="text-bookmi-blue w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500">Lieu</p>
              <p className="font-medium text-xs truncate w-full text-center">{location || '-'}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="bg-amber-100 p-2 rounded-full mb-2">
                <FiClock className="text-amber-600 w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500">Horaire</p>
              <p className="font-medium text-xs">{startTime || '--:--'}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-full mb-2">
                <FiDollarSign className="text-emerald-600 w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500">Montant</p>
              <p className="font-medium text-xs">{formatPrice(amount).split(' ')[0]}</p>
            </div>
          </div>
        </div>
        
        {/* Entête principal desktop */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-6 px-4 hidden md:block"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{serviceName}</h1>
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2" /> 
                  <span>{formatDate(date)}</span>
                </div>
              </div>
              
              {renderStatusBadge(status)}
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div 
                variants={fadeIn}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiMapPin className="text-bookmi-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lieu</p>
                  <p className="font-medium">{location || 'Non spécifié'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4"
              >
                <div className="bg-amber-100 p-3 rounded-full">
                  <FiClock className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Horaire</p>
                  <p className="font-medium">{startTime || '--:--'} - {endTime || '--:--'}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4"
              >
                <div className="bg-emerald-100 p-3 rounded-full">
                  <FiDollarSign className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Montant</p>
                  <p className="font-medium">{formatPrice(amount + serviceFee)}</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4"
              >
                <div className="bg-purple-100 p-3 rounded-full">
                  <FiUser className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-medium truncate max-w-[140px]">{bookerName}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Système d'onglets */}
        <div className="md:px-4">
          {renderTabs()}
        </div>
        
        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:px-4"
          >
            <Card className="border-0 md:border md:rounded-xl shadow-none md:shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Section Détails */}
              {(activeTab === 'details' || !activeTab) && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-4 md:p-6">
                  <motion.div variants={fadeInUp} className="mb-6">
                    <div className="flex items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                        <FiInfo className="mr-2 text-bookmi-blue" />
                        Détails de l'événement
                      </h2>
                      <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-gray-700 flex items-center">
                        <span className="font-medium mr-2">Type:</span> 
                        <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-800 text-sm">{eventType}</span>
                      </p>
                    </div>
                    
                    {/* Affichage spécifique sur mobile */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <motion.div variants={slideIn} className="flex items-start rounded-lg p-3 bg-white border border-gray-200 hover:border-bookmi-blue transition-colors shadow-sm">
                        <div className="bg-bookmi-blue bg-opacity-10 p-2.5 rounded-full mr-3">
                          <FiCalendar className="text-bookmi-blue w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium mt-0.5 text-sm">{formatDate(date)}</p>
                        </div>
                      </motion.div>
                    
                      <motion.div variants={slideIn} className="flex items-start rounded-lg p-3 bg-white border border-gray-200 hover:border-bookmi-blue transition-colors shadow-sm">
                        <div className="bg-bookmi-blue bg-opacity-10 p-2.5 rounded-full mr-3">
                          <FiClock className="text-bookmi-blue w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Horaires</p>
                          <p className="font-medium mt-0.5 text-sm">{startTime || '--:--'} - {endTime || '--:--'}</p>
                        </div>
                      </motion.div>
                    
                      <motion.div variants={slideIn} className="flex items-start rounded-lg p-3 bg-white border border-gray-200 hover:border-bookmi-blue transition-colors shadow-sm">
                        <div className="bg-bookmi-blue bg-opacity-10 p-2.5 rounded-full mr-3">
                          <FiMapPin className="text-bookmi-blue w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Lieu</p>
                          <p className="font-medium mt-0.5 text-sm">{location || 'Lieu non spécifié'}</p>
                        </div>
                      </motion.div>
                    
                      <motion.div variants={slideIn} className="flex items-start rounded-lg p-3 bg-white border border-gray-200 hover:border-bookmi-blue transition-colors shadow-sm">
                        <div className="bg-bookmi-blue bg-opacity-10 p-2.5 rounded-full mr-3">
                          <FiDollarSign className="text-bookmi-blue w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Montant total</p>
                          <p className="font-medium mt-0.5 text-sm">{formatPrice(amount + serviceFee)}</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    {notes && (
                      <motion.div variants={scaleIn} className="mt-6">
                        <h3 className="text-base font-semibold mb-3 text-gray-700 flex items-center">
                          <FiFileText className="mr-2 text-gray-500" />
                          Notes
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                          {notes.length > 150 && !showFullNote ? (
                            <>
                              <p className="text-gray-700 text-sm">{notes.substring(0, 150)}...</p>
                              <button 
                                onClick={() => setShowFullNote(true)}
                                className="mt-2 text-bookmi-blue font-medium text-sm flex items-center"
                              >
                                Voir plus <FiChevronDown className="ml-1" />
                              </button>
                            </>
                          ) : (
                            <p className="text-gray-700 text-sm whitespace-pre-line">{notes}</p>
                          )}
                          
                          {showFullNote && (
                            <button 
                              onClick={() => setShowFullNote(false)}
                              className="mt-2 text-bookmi-blue font-medium text-sm flex items-center"
                            >
                              Voir moins <FiChevronRight className="ml-1 rotate-90" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
              
              {/* Section Paiement */}
              {activeTab === 'payment' && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-3 sm:p-6">
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FiDollarSign className="mr-2 text-bookmi-blue" />
                        Informations de paiement
                      </h2>
                      <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Statut du paiement:</span>
                        {renderPaymentBadge(paymentStatus)}
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <motion.div variants={slideIn} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <span className="text-gray-600 flex items-center">
                          <FiDollarSign className="mr-2 text-gray-400" />
                          Montant du service
                        </span>
                        <span className="font-medium">{formatPrice(amount)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideIn} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <span className="text-gray-600 flex items-center">
                          <FiPercent className="mr-2 text-gray-400" />
                          Frais de service
                        </span>
                        <span className="font-medium">{formatPrice(serviceFee)}</span>
                      </motion.div>
                      
                      <motion.div variants={slideIn} className="flex justify-between items-center p-4 bg-bookmi-blue bg-opacity-5 rounded-lg shadow-sm border-2 border-bookmi-blue">
                        <span className="text-gray-700 font-medium flex items-center">
                          <FiHash className="mr-2 text-bookmi-blue" />
                          Total
                        </span>
                        <span className="text-lg font-bold text-bookmi-blue">{formatPrice(amount + serviceFee)}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Section Client */}
              {activeTab === 'client' && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-3 sm:p-6">
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FiUser className="mr-2 text-bookmi-blue" />
                        Informations client
                      </h2>
                      <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <motion.div variants={scaleIn} className="flex-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiUser className="text-gray-500 w-8 h-8" />
                        </div>
                        <h3 className="text-center font-medium text-lg mb-2">{bookerName}</h3>
                        
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                              <FiMail className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-medium text-sm break-all">{bookerEmail}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                              <FiPhone className="text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Téléphone</p>
                              <p className="font-medium text-sm">{bookerPhone}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={scaleIn} className="flex-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                        {reservation.booker?._id || typeof reservation.booker === 'string' ? (
                          <>
                            <Button
                              variant="primary"
                              onClick={() => navigate(`/app/artist/messages/booker/${reservation.booker?._id || reservation.booker}`)}
                              className="mb-4 flex items-center justify-center"
                            >
                              <span className="flex items-center">
                                <FiMessageSquare className="mr-2" />
                                Contacter le client
                              </span>
                            </Button>
                            <p className="text-center text-gray-500 text-sm">
                              Vous pouvez contacter le client pour plus de détails ou modifications concernant l'événement.
                            </p>
                          </>
                        ) : (
                          <p className="text-center text-gray-500">
                            Les informations de contact pour ce client ne sont pas disponibles.
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Section Transactions */}
              {activeTab === 'transactions' && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-3 sm:p-6">
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FiCreditCard className="mr-2 text-bookmi-blue" />
                        Historique des transactions
                      </h2>
                      <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FiInfo className="text-blue-500" />
                        </div>
                        <p className="text-gray-700 text-sm">
                          Retrouvez ici l'historique des paiements liés à cette réservation.
                        </p>
                      </div>
                      
                      {paymentLoading ? (
                        <div className="flex justify-center p-8">
                          <div className="animate-spin h-10 w-10 border-3 border-bookmi-blue rounded-full border-t-transparent"></div>
                        </div>
                      ) : payments.length > 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {payments.map(payment => (
                                  <motion.tr 
                                    key={payment._id} 
                                    className="hover:bg-gray-50 transition-colors"
                                    variants={slideIn}
                                  >
                                    <td className="py-3 px-4 text-sm">
                                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                      {formatPrice(payment.amount)}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        payment.paymentType === 'advance' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}>
                                        {payment.paymentType === 'advance' ? 'Acompte' : 'Complet'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm capitalize">
                                      {payment.paymentMethod}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        payment.status === 'completed' 
                                          ? 'bg-green-100 text-green-800' 
                                          : payment.status === 'failed'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {payment.status === 'completed' ? 'Confirmé' : 
                                         payment.status === 'failed' ? 'Échoué' :
                                         'En attente'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadReceipt(payment._id)}
                                        className="flex items-center text-xs"
                                      >
                                        <span className="flex items-center">
                                          <FiDownload className="mr-1" /> Reçu
                                        </span>
                                      </Button>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <FiCreditCard className="text-gray-500 w-8 h-8" />
                          </div>
                          <p className="text-gray-600 mb-2">Aucune transaction n'a été trouvée pour cette réservation.</p>
                          <p className="text-gray-500 text-sm">Les paiements apparaîtront ici une fois traités.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Actions - plus de position fixe */}
              <div className="border-t border-gray-200 p-3 md:p-6 mt-6">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-700 flex items-center">
                    <FiLayers className="mr-2 text-bookmi-blue" />
                    Actions
                  </h3>
                  <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                </div>
                
                {statusButtons()}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </ArtistLayout>
  );
};

export default EventDetail; 
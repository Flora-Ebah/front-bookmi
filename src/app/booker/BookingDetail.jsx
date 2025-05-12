import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button, Modal } from '../../components/ui';
import { toast } from 'react-toastify';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import paymentService from '../../services/paymentService';
import authService from '../../services/authService';
import PaymentForm from './PaymentForm';
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
  FiLock,
  FiPercent,
  FiChevronRight,
  FiChevronDown,
  FiRefreshCw,
  FiHash,
  FiLayers
} from 'react-icons/fi';

// Configuration des statuts avec des couleurs modernes
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

// Formater le prix
const formatPrice = (amount) => {
  if (!amount && amount !== 0) return 'Prix non spécifié';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
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

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'payment', 'artist', 'transactions'
  const [showFullNote, setShowFullNote] = useState(false);

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
    // Vérifier l'authentification avant de charger les détails
    if (!authService.isAuthenticated()) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      navigate('/auth/login', { state: { from: `/app/booker/booking/${id}` } });
      return;
    }

    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
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
        
        // Si erreur d'authentification
        if (error.response?.status === 401) {
          toast.error("Votre session a expiré. Veuillez vous reconnecter.");
          navigate('/auth/login', { state: { from: `/app/booker/booking/${id}` } });
          return;
        }
        
        setError(`Une erreur est survenue: ${error.message}`);
        toast.error("Impossible de charger les détails de la réservation");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReservationDetails();
    }
  }, [id, navigate]);

  const fetchPayments = async (reservationId) => {
    try {
      setPaymentLoading(true);
      const response = await paymentService.getMyPayments();
      
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

  const handlePayment = () => {
    if (!authService.isAuthenticated()) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      navigate('/auth/login', { state: { from: `/app/booker/booking/${id}` } });
      return;
    }
    
    setIsVerifyingAuth(true);
    
    authService.getMe()
      .then(() => {
        setShowPaymentModal(true);
      })
      .catch(error => {
        console.error("Erreur d'authentification:", error);
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        navigate('/auth/login', { state: { from: `/app/booker/booking/${id}` } });
      })
      .finally(() => {
        setIsVerifyingAuth(false);
      });
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    setCurrentPayment(paymentData);
    
    // Mettre à jour les données de la réservation avec le nouveau statut
    setReservation(prev => ({
      ...prev,
      status: paymentData.status === 'completed' ? 'confirmed' : prev.status,
      paymentStatus: paymentData.paymentType === 'full' ? 'paid' : 'partial'
    }));
    
    // Afficher le modal de reçu
    setShowReceiptModal(true);
    fetchReceipt(paymentData._id);
  };

  const fetchReceipt = async (paymentId) => {
    try {
      setLoadingReceipt(true);
      const response = await paymentService.generateReceipt(paymentId);
      
      if (response.success) {
        setReceipt(response.data);
      } else {
        toast.error("Impossible de générer le reçu");
      }
    } catch (error) {
      console.error("Erreur lors de la génération du reçu:", error);
      toast.error("Échec de la génération du reçu");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      setLoadingReceipt(true);
      const response = await paymentService.generateReceipt(paymentId);
      
      if (response.success) {
        setReceipt(response.data);
        setShowReceiptModal(true);
      } else {
        toast.error("Impossible de générer le reçu");
      }
    } catch (error) {
      console.error("Erreur lors de la génération du reçu:", error);
      toast.error("Échec de la génération du reçu");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      const response = await ServiceArtistBooker.updateReservationStatus(id, 'cancelled');
      
      if (response?.success) {
        toast.success("La réservation a été annulée avec succès");
        setReservation(prev => ({
          ...prev,
          status: 'cancelled'
        }));
      } else {
        toast.error("Erreur lors de l'annulation de la réservation");
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error("Impossible d'annuler la réservation");
    }
  };

  // Composant pour le bouton de paiement
  const PaymentButton = ({ text, onClick, className, icon }) => {
    if (isVerifyingAuth) {
      return (
        <Button
          disabled
          variant="primary"
          className={`${className} flex items-center justify-center`}
        >
          <span className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            Vérification...
          </span>
        </Button>
      );
    }
    
    return (
      <Button
        variant="primary"
        onClick={onClick}
        className={`${className} flex items-center justify-center`}
      >
        <span className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </span>
      </Button>
    );
  };

  // Boutons d'action en fonction du statut
  const actionButtons = () => {
    if (!reservation) return null;
    
    // Définir les actions possibles
    const actions = [];
    
    if (reservation.status === 'pending') {
      actions.push({
        key: "pay",
        icon: <FiCreditCard />,
        text: "Finaliser le paiement",
        onClick: handlePayment,
        variant: "primary",
        className: "bg-emerald-600 hover:bg-emerald-700",
        isPaymentButton: true
      });
    }
    
    if (reservation.status === 'pending' || reservation.status === 'confirmed') {
      actions.push({
        key: "cancel",
        icon: <FiAlertCircle />,
        text: "Annuler la réservation",
        onClick: handleCancelReservation,
        variant: "outline",
        className: "border-2 border-rose-500 text-rose-500 hover:bg-rose-50"
      });
    }
    
    if (reservation.status === 'completed') {
      actions.push({
        key: "review",
        icon: <FiAward />,
        text: "Laisser un avis",
        onClick: () => navigate(`/app/booker/review/${reservation._id}`),
        variant: "primary",
        className: "bg-blue-600 hover:bg-blue-700"
      });
    }
    
    // Nouveau bouton d'action polyvalent qui change selon le statut
    const getActionText = () => {
      switch (reservation.status) {
        case 'pending':
          return "Effectuer un autre paiement";
        case 'confirmed':
          return "Gérer la réservation";
        case 'completed':
          return "Réserver à nouveau";
        case 'cancelled':
          return "Faire une nouvelle réservation";
        default:
          return "Options supplémentaires";
      }
    };
    
    actions.push({
      key: "additional_action",
      icon: <FiDollarSign />,
      text: getActionText(),
      onClick: reservation.status === 'pending' ? handlePayment : 
               reservation.status === 'cancelled' || reservation.status === 'completed' ? 
               () => navigate('/app/booker/search') : 
               () => setShowPaymentModal(true),
      variant: "primary", 
      className: "bg-bookmi-blue hover:bg-bookmi-blue/90"
    });
    
    // Contact de l'artiste
    if (reservation.artistId && (typeof reservation.artistId === 'object' || typeof reservation.artistId === 'string')) {
      const artistId = typeof reservation.artistId === 'object' ? reservation.artistId._id : reservation.artistId;
      actions.push({
        key: "contact",
        icon: <FiMessageSquare />,
        text: "Contacter l'artiste",
        onClick: () => navigate(`/app/booker/messages/artist/${artistId}`),
        variant: "outline",
        className: "border-2 border-bookmi-blue text-bookmi-blue hover:bg-bookmi-blue/10"
      });
    }
    
    if (actions.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-3 mt-6">
        {actions.map((action) => (
          action.isPaymentButton ? (
            <PaymentButton
              key={action.key}
              text={action.text}
              onClick={action.onClick}
              className={`${action.className} text-sm flex-1 h-10 font-medium`}
              icon={action.icon}
            />
          ) : (
            <Button
              key={action.key}
              variant={action.variant === "outline" ? "custom" : action.variant}
              onClick={action.onClick}
              className={`${action.className} text-sm flex-1 h-10 flex items-center justify-center font-medium`}
            >
              <span className="flex items-center">
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.text}
              </span>
            </Button>
          )
        ))}
      </div>
    );
  };

  // Composant pour afficher le reçu de paiement
  const ReceiptModal = () => {
    if (!receipt) return null;
    
    return (
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Reçu de paiement"
        size="lg"
      >
        {loadingReceipt ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-bookmi-blue rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="p-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">REÇU DE PAIEMENT</h2>
              <p className="text-gray-500 text-sm">N° {receipt.receiptNumber}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">ÉMIS À</h3>
                <p className="font-medium">{receipt.client.name}</p>
                <p className="text-sm text-gray-600">{receipt.client.email}</p>
                <p className="text-sm text-gray-600">{receipt.client.phone}</p>
              </div>
              
              <div className="text-right">
                <h3 className="text-sm font-medium text-gray-500 mb-1">DATE</h3>
                <p className="font-medium">{new Date(receipt.date).toLocaleDateString('fr-FR')}</p>
                <h3 className="text-sm font-medium text-gray-500 mt-2 mb-1">STATUT</h3>
                <p className="inline-block px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                  {receipt.status === 'completed' ? 'Payé' : receipt.status}
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">DÉTAILS DE LA PRESTATION</h3>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{receipt.reservation.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Artiste</p>
                  <p className="font-medium">{receipt.artist.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(receipt.reservation.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Heure</p>
                  <p className="font-medium">{receipt.reservation.time}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-medium">{receipt.reservation.location}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">PAIEMENT</h3>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Montant de la prestation</span>
                <span className="font-medium">{formatPrice(receipt.payment.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Frais de service</span>
                <span className="font-medium">{formatPrice(receipt.payment.serviceFee)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatPrice(receipt.payment.total)}</span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p className="font-medium">
                  {receipt.paymentMethod === 'visa' ? 'Carte de crédit' : 
                   receipt.paymentMethod === 'orange' ? 'Orange Money' :
                   receipt.paymentMethod === 'mtn' ? 'MTN Mobile Money' :
                   receipt.paymentMethod === 'moov' ? 'Moov Money' :
                   receipt.paymentMethod === 'wave' ? 'Wave' :
                   receipt.paymentMethod}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setShowReceiptModal(false)}
                className="px-4"
              >
                Fermer
              </Button>
              
              <Button
                variant="primary"
                className="bg-bookmi-blue hover:bg-bookmi-blue/90 px-4"
                onClick={() => handleDownloadReceipt(receipt._id)}
              >
                <FiDownload className="mr-2" />
                Télécharger le reçu
              </Button>
            </div>
          </div>
        )}
      </Modal>
    );
  };

  // Ajout de la fonction pour rafraîchir les données
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
      { id: 'artist', icon: <FiUser />, label: 'Artiste' },
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
      <BookerLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-20 h-20 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          <p className="mt-6 text-gray-600">Chargement des détails de la réservation...</p>
        </div>
      </BookerLayout>
    );
  }

  if (error || !reservation) {
    return (
      <BookerLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/booker/bookings')}
            className="mb-6 flex items-center text-sm"
          >
            <FiArrowLeft className="mr-2" /> Retour aux réservations
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
                {error || "Nous n'avons pas pu trouver les détails de cette réservation. Veuillez réessayer ou revenir à la liste des réservations."}
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
                  onClick={() => navigate('/app/booker/bookings')}
                  className="flex items-center justify-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Retour aux réservations
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </BookerLayout>
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
    artistId
  } = reservation;

  // Récupération des informations
  const serviceName = serviceId?.title || 'Service non spécifié';
  
  // Gestion artiste possible sous forme d'objet ou d'ID
  const artistName = artistId?.artistName 
    ? artistId.artistName
    : (artistId?.firstName && artistId?.lastName 
        ? `${artistId.firstName} ${artistId.lastName}` 
        : 'Artiste');
  
  const artistEmail = artistId?.email || 'Email non disponible';
  const artistPhone = artistId?.phone || 'Téléphone non disponible';

  return (
    <BookerLayout>
      <div className="container mx-auto px-0 py-0 md:py-6 max-w-4xl">
        {/* En-tête mobile différent */}
        <div className="md:hidden bg-white sticky top-0 z-10 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <Button 
            variant="text"
            size="sm"
            onClick={() => navigate('/app/booker/bookings')}
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
            onClick={() => navigate('/app/booker/bookings')}
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
                  <p className="text-xs text-gray-500">Artiste</p>
                  <p className="font-medium truncate max-w-[140px]">{artistName}</p>
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
                    
                    {reservation.status === 'pending' && (
                      <motion.div variants={scaleIn} className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-6">
                        <div className="flex items-start">
                          <div className="bg-amber-100 p-2 rounded-full mr-3 flex-shrink-0">
                            <FiInfo className="text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-amber-800 mb-1">Paiement en attente</h4>
                            <p className="text-sm text-amber-700">
                              Cette réservation est en attente de paiement. Veuillez finaliser votre paiement pour confirmer la réservation.
                            </p>
                            <Button
                              variant="primary"
                              onClick={handlePayment}
                              className="mt-4 bg-amber-600 hover:bg-amber-700"
                            >
                              <FiCreditCard className="mr-2" />
                              Finaliser le paiement
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {paymentStatus === 'paid' && (
                      <motion.div variants={scaleIn} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-6">
                        <div className="flex items-start">
                          <div className="bg-emerald-100 p-2 rounded-full mr-3 flex-shrink-0">
                            <FiCheckCircle className="text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-emerald-800 mb-1">Paiement confirmé</h4>
                            <p className="text-sm text-emerald-700">
                              Le paiement pour cette réservation a été effectué intégralement.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {paymentStatus === 'partial' && (
                      <motion.div variants={scaleIn} className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                            <FiPercent className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">Paiement partiel</h4>
                            <p className="text-sm text-blue-700">
                              Un acompte a été versé pour cette réservation. Un paiement complémentaire peut être effectué.
                            </p>
                            <Button
                              variant="primary"
                              onClick={handlePayment}
                              className="mt-4 bg-blue-600 hover:bg-blue-700"
                            >
                              <span className="flex items-center">
                                <FiCreditCard className="mr-2" />
                                Effectuer un autre paiement
                              </span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Section Artiste */}
              {activeTab === 'artist' && (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-3 sm:p-6">
                  <motion.div variants={fadeInUp}>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FiUser className="mr-2 text-bookmi-blue" />
                        Informations artiste
                      </h2>
                      <div className="ml-4 flex-grow h-0.5 bg-gradient-to-r from-bookmi-blue/20 to-transparent rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <motion.div variants={scaleIn} className="flex-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiUser className="text-gray-500 w-8 h-8" />
                        </div>
                        <h3 className="text-center font-medium text-lg mb-2">{artistName}</h3>
                        
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                              <FiMail className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-medium text-sm break-all">{artistEmail}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                              <FiPhone className="text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Téléphone</p>
                              <p className="font-medium text-sm">{artistPhone}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={scaleIn} className="flex-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
                        {artistId && (typeof artistId === 'object' || typeof artistId === 'string') ? (
                          <>
                            <Button
                              variant="primary"
                              onClick={() => navigate(`/app/booker/messages/artist/${typeof artistId === 'object' ? artistId._id : artistId}`)}
                              className="mb-4 flex items-center justify-center"
                            >
                              <span className="flex items-center">
                                <FiMessageSquare className="mr-2" />
                                Contacter l'artiste
                              </span>
                            </Button>
                            <p className="text-center text-gray-500 text-sm">
                              Vous pouvez contacter l'artiste pour plus de détails ou modifications concernant l'événement.
                            </p>
                          </>
                        ) : (
                          <p className="text-center text-gray-500">
                            Les informations de contact pour cet artiste ne sont pas disponibles.
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
                                        <FiDownload className="mr-1" /> Reçu
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
                
                {actionButtons()}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Finaliser le paiement"
        >
          <PaymentForm 
            reservation={reservation} 
            onSuccess={handlePaymentSuccess} 
            onCancel={() => setShowPaymentModal(false)}
          />
        </Modal>
      )}

      <ReceiptModal />
    </BookerLayout>
  );
};

export default BookingDetail; 
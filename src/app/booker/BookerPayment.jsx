import React, { useState, useEffect } from 'react';
import BookerLayout from './layouts/BookerLayout';
import { Card, Button, Modal } from '../../components/ui';
import { motion } from 'framer-motion';
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiFilter, 
  FiDownload, 
  FiPlus, 
  FiRefreshCw, 
  FiCalendar, 
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiX,
  FiInfo,
  FiClock,
  FiTrash2,
  FiEdit,
  FiSmartphone,
  FiCreditCard as FiVisa,
  FiCreditCard as FiMastercard,
  FiDroplet
} from 'react-icons/fi';
import paymentService from '../../services/paymentService';
import paymentMethodService from '../../services/paymentMethodService';
import { toast } from 'react-toastify';

const BookerPayment = () => {
  // États pour gérer les données et les filtres
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showManagePaymentModal, setShowManagePaymentModal] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [perPage] = useState(10);
  
  // Nouveau moyen de paiement
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: '',
    name: '',
    details: {
      cardNumber: '',
      expiryDate: '',
      phoneNumber: ''
    },
    isDefault: false
  });
  
  // Stats des paiements
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0
  });

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Fonction pour les notifications toast
  const showToast = (type, message) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };

  // Définir les types de paiement disponibles
  const paymentTypes = [
    { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', icon: <FiSmartphone className="text-white" /> },
    { id: 'mtn', name: 'MTN Money', color: 'bg-yellow-500', icon: <FiSmartphone className="text-white" /> },
    { id: 'moov', name: 'Moov Money', color: 'bg-blue-500', icon: <FiSmartphone className="text-white" /> },
    { id: 'wave', name: 'Wave', color: 'bg-teal-500', icon: <FiDroplet className="text-white" /> },
    { id: 'visa', name: 'Carte VISA', color: 'bg-indigo-500', icon: <FiVisa className="text-white" /> },
    { id: 'mastercard', name: 'Mastercard', color: 'bg-red-500', icon: <FiMastercard className="text-white" /> },
  ];

  // Gestionnaire pour sélectionner un type de paiement
  const handleSelectPaymentType = (type) => {
    setNewPaymentMethod({
      ...newPaymentMethod,
      type
    });
  };

  // Charger les moyens de paiement
  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await paymentMethodService.getMyPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        setPaymentMethods([]);
        toast.info("Impossible de charger vos moyens de paiement");
      }
    } catch (error) {
      console.error('Erreur lors du chargement des moyens de paiement:', error);
      toast.error('Impossible de charger vos moyens de paiement');
      setPaymentMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  };

  // Charger les statistiques de paiement
  const loadPaymentStats = async () => {
    try {
      const response = await paymentService.getPaymentStats();
      if (response.success && response.data) {
        setPaymentStats(response.data);
      } else {
        // Définir des valeurs par défaut en cas d'échec
        setPaymentStats({
          totalAmount: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          totalCount: 0
        });
        toast.info("Impossible de charger les statistiques de paiement");
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de paiement:', error);
      // Définir des valeurs par défaut en cas d'erreur
      setPaymentStats({
        totalAmount: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        totalCount: 0
      });
      toast.error("Erreur lors du chargement des statistiques");
    }
  };

  // Charger les transactions
  const loadTransactions = async (page = 1, filters = {}) => {
    try {
      setLoadingTransactions(true);
      
      // Préparer les filtres
      const requestFilters = {
        page,
        limit: perPage,
        ...filters
      };
      
      // Ajouter les filtres de date si sélectionnés
      if (selectedDateRange !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch (selectedDateRange) {
          case 'today':
            // Aujourd'hui (minuit)
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'week':
            // 7 jours avant aujourd'hui
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            // 30 jours avant aujourd'hui
            startDate.setDate(today.getDate() - 30);
            break;
          default:
            break;
        }
        
        requestFilters.startDate = startDate.toISOString().split('T')[0];
        requestFilters.endDate = new Date().toISOString().split('T')[0];
      }
      
      // Ajouter le filtre de statut si sélectionné
      if (selectedStatus !== 'all') {
        requestFilters.status = selectedStatus;
      }
      
      // Ajouter la recherche si présente
      if (searchQuery.trim()) {
        requestFilters.search = searchQuery.trim();
      }
      
      try {
        const response = await paymentService.getMyPayments(requestFilters);
        
        if (response.success && response.data) {
          setTransactions(response.data.transactions || []);
          setTotalPages(response.data.totalPages || 1);
          setTotalTransactions(response.data.totalCount || 0);
          setCurrentPage(response.data.currentPage || 1);
        } else {
          setTransactions([]);
          setTotalPages(1);
          setTotalTransactions(0);
          toast.info("Impossible de charger les transactions");
        }
      } catch (apiError) {
        console.error('Erreur API lors du chargement des transactions:', apiError);
        toast.error('Erreur lors du chargement des transactions');
        setTransactions([]);
        setTotalPages(1);
        setTotalTransactions(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      toast.error('Impossible de charger vos transactions');
      setTransactions([]);
      setTotalPages(1);
      setTotalTransactions(0);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadTransactions(1),
          loadPaymentMethods(),
          loadPaymentStats()
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        setError('Erreur lors du chargement des données. Veuillez rafraîchir la page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Filtrer les transactions lorsque les filtres changent
  useEffect(() => {
    if (!loading) {
      loadTransactions(1);
    }
  }, [selectedDateRange, selectedStatus, searchQuery]);

  // Ajouter un moyen de paiement
  const handleAddNewPaymentMethod = async (e) => {
    e.preventDefault();
    
    try {
      // Valider les données
      if (!newPaymentMethod.type) {
        toast.error('Veuillez sélectionner un type de paiement');
        return;
      }
      
      if (!newPaymentMethod.name.trim()) {
        toast.error('Veuillez donner un nom à votre moyen de paiement');
        return;
      }
      
      // Préparer les détails selon le type
      const details = {};
      if (newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard') {
        if (!newPaymentMethod.details.cardNumber || !newPaymentMethod.details.expiryDate) {
          toast.error('Veuillez saisir toutes les informations de la carte');
          return;
        }
        details.cardNumber = newPaymentMethod.details.cardNumber;
        details.expiryDate = newPaymentMethod.details.expiryDate;
      } else {
        // Mobile money
        if (!newPaymentMethod.details.phoneNumber) {
          toast.error('Veuillez saisir le numéro de téléphone');
          return;
        }
        details.phoneNumber = newPaymentMethod.details.phoneNumber;
      }
      
      // Préparer les données pour l'API
      const paymentMethodData = {
        type: newPaymentMethod.type,
        name: newPaymentMethod.name,
        details,
        isDefault: newPaymentMethod.isDefault
      };
      
      const response = await paymentMethodService.addPaymentMethod(paymentMethodData);
      
      if (response.success) {
        toast.success('Moyen de paiement ajouté avec succès');
        setShowAddPaymentModal(false);
        
        // Réinitialiser le formulaire
        setNewPaymentMethod({
          type: '',
          name: '',
          details: {
            cardNumber: '',
            expiryDate: '',
            phoneNumber: ''
          },
          isDefault: false
        });
        
        // Recharger les moyens de paiement
        loadPaymentMethods();
      } else {
        toast.error(response.message || 'Erreur lors de l\'ajout du moyen de paiement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du moyen de paiement:', error);
      toast.error('Erreur lors de l\'ajout du moyen de paiement');
    }
  };

  // Supprimer un moyen de paiement
  const handleDeletePaymentMethod = async () => {
    if (!currentPaymentMethod) return;
    
    try {
      const response = await paymentMethodService.deletePaymentMethod(currentPaymentMethod.id);
      
      if (response.success) {
        toast.success('Moyen de paiement supprimé avec succès');
        setShowManagePaymentModal(false);
        setCurrentPaymentMethod(null);
        
        // Recharger les moyens de paiement
        loadPaymentMethods();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression du moyen de paiement');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du moyen de paiement:', error);
      toast.error('Erreur lors de la suppression du moyen de paiement');
    }
  };

  // Définir un moyen de paiement comme défaut
  const handleSetAsDefault = async () => {
    if (!currentPaymentMethod) return;
    
    try {
      const response = await paymentMethodService.setDefaultPaymentMethod(currentPaymentMethod.id);
      
      if (response.success) {
        toast.success('Moyen de paiement défini comme défaut');
        setShowManagePaymentModal(false);
        setCurrentPaymentMethod(null);
        
        // Recharger les moyens de paiement
        loadPaymentMethods();
      } else {
        toast.error(response.message || 'Erreur lors de la définition du moyen de paiement par défaut');
      }
    } catch (error) {
      console.error('Erreur lors de la définition du moyen de paiement par défaut:', error);
      toast.error('Erreur lors de la définition du moyen de paiement par défaut');
    }
  };

  // Télécharger un reçu
  const handleDownloadReceipt = async (paymentId) => {
    try {
      await paymentService.downloadReceipt(paymentId);
    } catch (error) {
      console.error('Erreur lors du téléchargement du reçu:', error);
      toast.error('Erreur lors du téléchargement du reçu');
    }
  };

  // Exporter les transactions
  const handleExportTransactions = async () => {
    try {
      setExportLoading(true);
      
      // Préparer les filtres
      const filters = {};
      
      // Ajouter les filtres de date si sélectionnés
      if (selectedDateRange !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch (selectedDateRange) {
          case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setDate(today.getDate() - 30);
            break;
          default:
            break;
        }
        
        filters.startDate = startDate.toISOString().split('T')[0];
        filters.endDate = new Date().toISOString().split('T')[0];
      }
      
      // Ajouter le filtre de statut si sélectionné
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      // Ajouter la recherche si présente
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      await paymentService.exportTransactions(filters);
      toast.success('Export des transactions réussi');
    } catch (error) {
      console.error('Erreur lors de l\'export des transactions:', error);
      toast.error('Erreur lors de l\'export des transactions');
    } finally {
      setExportLoading(false);
    }
  };

  const handleManagePayment = (method) => {
    setCurrentPaymentMethod(method);
    setShowManagePaymentModal(true);
  };

  // Fonction pour actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadTransactions(1),
        loadPaymentMethods(),
        loadPaymentStats()
      ]);
      toast.success('Données actualisées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'actualisation des données:', error);
      toast.error('Erreur lors de l\'actualisation des données');
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour mettre à jour les filtres et recharger les données
  const applyFilters = () => {
    loadTransactions(1);
  };

  // Gestionnaire pour le changement de page
  const handlePageChange = (page) => {
    loadTransactions(page);
  };

  // Fonction pour formater le prix
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Réussie'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'En attente'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Échouée'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Inconnue'
        };
    }
  };

  // Fonction pour obtenir l'icône et la couleur de la méthode de paiement
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'visa':
        return {
          color: 'text-blue-600',
          name: 'Carte VISA'
        };
      case 'mastercard':
        return {
          color: 'text-red-500',
          name: 'Mastercard'
        };
      case 'orange':
        return {
          color: 'text-orange-500',
          name: 'Orange Money'
        };
      case 'mtn':
        return {
          color: 'text-yellow-500',
          name: 'MTN Mobile Money'
        };
      case 'moov':
        return {
          color: 'text-blue-500',
          name: 'Moov Money'
        };
      case 'wave':
        return {
          color: 'text-green-500',
          name: 'Wave'
        };
      default:
        return {
          color: 'text-gray-500',
          name: 'Autre'
        };
    }
  };

  // Filtrer les transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Filtre par statut
    if (selectedStatus !== 'all' && transaction.status !== selectedStatus) {
      return false;
    }
    
    // Filtre par date
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const transactionDate = new Date(transaction.date);
      
      switch (selectedDateRange) {
        case 'today':
          if (transactionDate.toDateString() !== today.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (transactionDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (transactionDate < monthAgo) {
            return false;
          }
          break;
        default:
          break;
      }
    }
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query) ||
        formatPrice(transaction.amount).toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Affichage des statistiques
  const StatsSection = () => (
    <Card className="mb-4 md:mb-6 mx-0 rounded-none sm:rounded-lg sm:mx-0">
      <div className="p-3 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center mb-3 md:mb-4">
          <FiDollarSign className="mr-1.5 md:mr-2 text-bookmi-blue" />
          Statistiques de paiement
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 mb-1">Total des paiements</p>
            <p className="text-lg md:text-xl font-semibold text-gray-800">
              {formatPrice(paymentStats.totalAmount || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 mb-1">Paiements réussis</p>
            <div className="flex items-center">
              <p className="text-lg md:text-xl font-semibold text-green-600 mr-2">
                {paymentStats.completedCount || 0}
              </p>
              <span className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-0.5">
                {paymentStats.totalCount 
                  ? Math.round((paymentStats.completedCount / paymentStats.totalCount) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 mb-1">En attente</p>
            <div className="flex items-center">
              <p className="text-lg md:text-xl font-semibold text-yellow-600 mr-2">
                {paymentStats.pendingCount || 0}
              </p>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full px-2 py-0.5">
                {paymentStats.totalCount 
                  ? Math.round((paymentStats.pendingCount / paymentStats.totalCount) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500 mb-1">Échoués</p>
            <div className="flex items-center">
              <p className="text-lg md:text-xl font-semibold text-red-600 mr-2">
                {paymentStats.failedCount || 0}
              </p>
              <span className="bg-red-100 text-red-800 text-xs font-medium rounded-full px-2 py-0.5">
                {paymentStats.totalCount 
                  ? Math.round((paymentStats.failedCount / paymentStats.totalCount) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Affichage des moyens de paiement
  const PaymentMethodsSection = () => (
    <Card className="mb-4 md:mb-6 mx-0 rounded-none sm:rounded-lg sm:mx-0">
      <div className="p-3 md:p-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
            <FiCreditCard className="mr-1.5 md:mr-2 text-bookmi-blue" />
            Moyens de paiement
          </h2>
          <Button 
            variant="primary"
            size="sm"
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center"
          >
            <span className="flex items-center">
              <FiPlus className="mr-1" />
              Ajouter
            </span>
          </Button>
        </div>
        
        {loadingMethods ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className="flex flex-col justify-between p-2.5 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-bookmi-blue transition-all shadow-sm"
              >
                <div className="flex items-center mb-2 md:mb-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${getPaymentMethodIcon(method.type).color} bg-opacity-10 flex items-center justify-center mr-2 md:mr-3`}>
                    <FiCreditCard className={getPaymentMethodIcon(method.type).color} />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium text-gray-800">
                      {method.name} 
                      {method.details && method.details.cardNumber && 
                        `(•••• ${method.details.cardNumber.slice(-4)})`}
                      {method.details && method.details.phoneNumber && 
                        `(${method.details.phoneNumber.slice(-4)})`}
                    </p>
                    {method.details && method.details.expiryDate && (
                      <p className="text-xs md:text-sm text-gray-500">Expire le: {method.details.expiryDate}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 md:mt-2">
                  {method.isDefault && (
                    <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full">
                      <FiCheck className="mr-0.5 md:mr-1" />
                      Par défaut
                    </span>
                  )}
                  {!method.isDefault && <div></div>}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs md:text-sm text-gray-500 border-gray-300"
                    onClick={() => handleManagePayment(method)}
                  >
                    Gérer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 bg-gray-50 rounded-none sm:rounded-lg">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <FiCreditCard className="text-gray-400 w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-1 md:mb-2">Aucun moyen de paiement enregistré</p>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 px-2 md:px-0">Ajoutez un moyen de paiement pour effectuer des transactions.</p>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => setShowAddPaymentModal(true)}
              className="flex items-center mx-auto text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
            >
              <span className="flex items-center">
                <FiPlus className="mr-1" />
                Ajouter un moyen de paiement
              </span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  // Affichage des filtres
  const FilterSection = () => (
    <div className="mb-4 md:mb-6 bg-white shadow-sm border border-gray-200 rounded-none sm:rounded-lg mx-0 sm:mx-0">
      <div className="p-3 md:p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-3 md:mb-4 lg:mb-0 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mr-2 text-xs border-gray-300 py-1 px-2 md:py-2 md:px-3"
            >
              <span className="flex items-center">
                <FiFilter className="mr-1" />
                Filtres
                <FiChevronDown className={`ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </span>
            </Button>
            
            <div className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-bookmi-blue text-xs md:text-sm"
              />
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm" />
            </div>
          </div>
          
          <div className="flex space-x-1 md:space-x-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-gray-300 text-xs py-1 px-2 md:py-2 md:px-3"
            >
              <span className="flex items-center">
                <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTransactions}
              disabled={exportLoading}
              className="border-gray-300 text-xs py-1 px-2 md:py-2 md:px-3"
            >
              <span className="flex items-center">
                <FiDownload className="mr-1" />
                {exportLoading ? 'Export...' : 'Exporter'}
              </span>
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Période</p>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <Button
                    variant={selectedDateRange === 'all' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateRange('all')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedDateRange !== 'all' ? 'border-gray-300' : ''}`}
                  >
                    Toutes
                  </Button>
                  <Button
                    variant={selectedDateRange === 'today' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateRange('today')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedDateRange !== 'today' ? 'border-gray-300' : ''}`}
                  >
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" />
                      Aujourd'hui
                    </span>
                  </Button>
                  <Button
                    variant={selectedDateRange === 'week' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateRange('week')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedDateRange !== 'week' ? 'border-gray-300' : ''}`}
                  >
                    7 derniers jours
                  </Button>
                  <Button
                    variant={selectedDateRange === 'month' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateRange('month')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedDateRange !== 'month' ? 'border-gray-300' : ''}`}
                  >
                    30 derniers jours
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Statut</p>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <Button
                    variant={selectedStatus === 'all' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('all')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedStatus !== 'all' ? 'border-gray-300' : ''}`}
                  >
                    Tous
                  </Button>
                  <Button
                    variant={selectedStatus === 'completed' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('completed')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedStatus !== 'completed' ? 'border-gray-300' : ''}`}
                  >
                    <span className="flex items-center">
                      <FiCheck className="mr-1" />
                      Réussies
                    </span>
                  </Button>
                  <Button
                    variant={selectedStatus === 'pending' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('pending')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedStatus !== 'pending' ? 'border-gray-300' : ''}`}
                  >
                    <span className="flex items-center">
                      <FiClock className="mr-1" />
                      En attente
                    </span>
                  </Button>
                  <Button
                    variant={selectedStatus === 'failed' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('failed')}
                    className={`text-xs py-1 px-2 md:py-2 md:px-3 ${selectedStatus !== 'failed' ? 'border-gray-300' : ''}`}
                  >
                    <span className="flex items-center">
                      <FiX className="mr-1" />
                      Échouées
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  // Affichage des transactions
  const TransactionsSection = () => (
    <Card className="rounded-none sm:rounded-lg mx-0 sm:mx-0">
      <div className="p-3 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center mb-3 md:mb-4">
          <FiDollarSign className="mr-1.5 md:mr-2 text-bookmi-blue" />
          Historique des transactions
        </h2>
        
        {loadingTransactions ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map(transaction => {
                    const statusConfig = getStatusColor(transaction.status);
                    const methodConfig = getPaymentMethodIcon(transaction.paymentMethod);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 font-medium">
                          {transaction.reference}
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700">
                          {transaction.description}
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">
                          <span className={`flex items-center ${methodConfig.color}`}>
                            <FiCreditCard className="mr-1" />
                            {methodConfig.name}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-gray-900">
                          {formatPrice(transaction.amount)}
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm">
                          <span className={`inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(transaction.id)}
                            className="text-xs border-gray-300"
                          >
                            <span className="flex items-center">
                              <FiDownload className="mr-1" />
                              Reçu
                            </span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-300"
                  >
                    <FiChevronRight className="transform rotate-180" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={currentPage !== page ? 'border-gray-300' : ''}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-300"
                  >
                    <FiChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 md:py-12 bg-gray-50 rounded-none sm:rounded-lg">
            <div className="w-12 md:w-16 h-12 md:h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <FiDollarSign className="text-gray-500 w-6 md:w-8 h-6 md:h-8" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-800 mb-1 md:mb-2">Aucune transaction trouvée</h3>
            <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto mb-4 md:mb-6 px-2 sm:px-0">
              {searchQuery || selectedStatus !== 'all' || selectedDateRange !== 'all' 
                ? "Aucune transaction ne correspond aux filtres sélectionnés."
                : "Vous n'avez effectué aucune transaction pour le moment."
              }
            </p>
            {(searchQuery || selectedStatus !== 'all' || selectedDateRange !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedDateRange('all');
                }}
                className="mx-auto"
              >
                <span className="flex items-center">
                  <FiX className="mr-1" />
                  Réinitialiser les filtres
                </span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  // Composant Modal pour ajouter un moyen de paiement
  const AddPaymentModal = () => (
    <Modal
      isOpen={showAddPaymentModal}
      onClose={() => setShowAddPaymentModal(false)}
      title={
        <div className="flex items-center text-lg font-semibold">
          <FiPlus className="mr-2 text-bookmi-blue" />
          Ajouter un moyen de paiement
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleAddNewPaymentMethod}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de paiement</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentTypes.map(type => (
              <div 
                key={type.id}
                onClick={() => handleSelectPaymentType(type.id)}
                className={`cursor-pointer rounded-lg border-2 transition-all p-3 flex flex-col items-center ${
                  newPaymentMethod.type === type.id 
                    ? 'border-bookmi-blue shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${type.color} flex items-center justify-center mb-2`}>
                  {type.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {newPaymentMethod.type && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {(newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard') 
                  ? 'Numéro de carte' 
                  : 'Numéro de téléphone'}
              </label>
              <input 
                type="text"
                value={(newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard')
                  ? newPaymentMethod.details.cardNumber
                  : newPaymentMethod.details.phoneNumber}
                onChange={(e) => {
                  if (newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard') {
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      details: {
                        ...newPaymentMethod.details,
                        cardNumber: e.target.value
                      }
                    });
                  } else {
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      details: {
                        ...newPaymentMethod.details,
                        phoneNumber: e.target.value
                      }
                    });
                  }
                }}
                placeholder={newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard' 
                  ? '4242 4242 4242 4242' 
                  : '07 00 00 00 00'}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bookmi-blue focus:border-transparent"
                required
              />
            </div>
            
            {(newPaymentMethod.type === 'visa' || newPaymentMethod.type === 'mastercard') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                <input 
                  type="text"
                  value={newPaymentMethod.details.expiryDate}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod,
                    details: {
                      ...newPaymentMethod.details,
                      expiryDate: e.target.value
                    }
                  })}
                  placeholder="MM/AA"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bookmi-blue focus:border-transparent"
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du moyen de paiement</label>
              <input 
                type="text"
                value={newPaymentMethod.name}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                placeholder={`Mon ${paymentTypes.find(t => t.id === newPaymentMethod.type)?.name || ''}`}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bookmi-blue focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input 
                type="checkbox"
                id="set-default"
                checked={newPaymentMethod.isDefault}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, isDefault: e.target.checked})}
                className="w-4 h-4 mr-2 rounded text-bookmi-blue focus:ring-bookmi-blue"
              />
              <label htmlFor="set-default" className="text-sm text-gray-700">
                Définir comme moyen de paiement par défaut
              </label>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => setShowAddPaymentModal(false)}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={!newPaymentMethod.type}
          >
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  );

  // Composant Modal pour gérer un moyen de paiement existant
  const ManagePaymentModal = () => (
    <Modal
      isOpen={showManagePaymentModal && currentPaymentMethod !== null}
      onClose={() => setShowManagePaymentModal(false)}
      title={
        <div className="flex items-center text-lg font-semibold">
          <FiEdit className="mr-2 text-bookmi-blue" />
          Gérer le moyen de paiement
        </div>
      }
      size="md"
    >
      {currentPaymentMethod && (
        <>
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 rounded-full ${getPaymentMethodIcon(currentPaymentMethod.type).color} bg-opacity-10 flex items-center justify-center mr-4`}>
              <FiCreditCard className={`${getPaymentMethodIcon(currentPaymentMethod.type).color} w-6 h-6`} />
            </div>
            <div>
              <p className="font-medium text-gray-800">{currentPaymentMethod.name}</p>
              <p className="text-sm text-gray-500">
                {getPaymentMethodIcon(currentPaymentMethod.type).name} 
                {currentPaymentMethod.details && currentPaymentMethod.details.cardNumber && 
                  ` (•••• ${currentPaymentMethod.details.cardNumber.slice(-4)})`}
                {currentPaymentMethod.details && currentPaymentMethod.details.phoneNumber && 
                  ` (${currentPaymentMethod.details.phoneNumber})`}
              </p>
              {currentPaymentMethod.details && currentPaymentMethod.details.expiryDate && (
                <p className="text-xs text-gray-500">Expire le: {currentPaymentMethod.details.expiryDate}</p>
              )}
            </div>
          </div>
          
          {!currentPaymentMethod.isDefault && (
            <div className="mb-4">
              <Button 
                variant="secondary"
                onClick={handleSetAsDefault}
                className="w-full"
              >
                <span className="flex items-center justify-center">
                  <FiCheck className="mr-2" />
                  Définir comme moyen de paiement par défaut
                </span>
              </Button>
            </div>
          )}
          
          <div className="mb-4">
            <Button 
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleDeletePaymentMethod}
            >
              <span className="flex items-center justify-center">
                <FiTrash2 className="mr-2" />
                Supprimer ce moyen de paiement
              </span>
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              onClick={() => setShowManagePaymentModal(false)}
            >
              Fermer
            </Button>
          </div>
        </>
      )}
    </Modal>
  );

  return (
    <BookerLayout>
      <div className="container mx-auto px-0 sm:px-2 md:px-4 py-4 md:py-8 max-w-6xl">
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            <p className="flex items-center">
              <FiInfo className="mr-2" />
              {error}
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <header className="mb-4 md:mb-6 px-2 sm:px-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Paiements</h1>
              <p className="text-sm md:text-base text-gray-600">Gérez vos moyens de paiement et consultez l'historique de vos transactions</p>
            </header>
            
            {/* Statistiques */}
            <StatsSection />
            
            {/* Moyens de paiement */}
            <PaymentMethodsSection />
            
            {/* Filtres */}
            <FilterSection />
            
            {/* Transactions */}
            <TransactionsSection />
            
            {/* Modals */}
            <AddPaymentModal />
            <ManagePaymentModal />
          </motion.div>
        )}
      </div>
    </BookerLayout>
  );
};

export default BookerPayment; 
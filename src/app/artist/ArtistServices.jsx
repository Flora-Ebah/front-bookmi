import React, { useState, useEffect } from 'react';
import ArtistLayout from './layouts/ArtistLayout';
import { Button, Card } from '../../components/ui';
import { 
  FiPlus, FiSearch, FiGrid, FiList, FiFilter, FiRefreshCw, 
  FiChevronDown, FiTrendingUp, FiBookOpen, FiCheckCircle, FiActivity,
  FiEye, FiEyeOff, FiStar
} from 'react-icons/fi';
import ServiceCard from './components/ServiceCard';
import ServiceModal from './components/ServiceModal';
import ConfirmDialog from './components/ConfirmDialog';
import { useService } from '../../contexts/ServiceContext';
import { AnimatePresence, motion } from 'framer-motion';

const ArtistServices = () => {
  // Utiliser le contexte de service
  const { 
    services, 
    loading, 
    error, 
    fetchServices, 
    createService, 
    updateService, 
    deleteService, 
    toggleServiceStatus 
  } = useService();

  // États pour les modales et filtres
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats cards
  const activeServicesCount = services.filter(service => service.active).length;
  const inactiveServicesCount = services.length - activeServicesCount;
  const avgServicePrice = services.length > 0 
    ? Math.round(services.reduce((acc, svc) => acc + parseInt(svc.price || 0), 0) / services.length) 
    : 0;
  
  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && service.active) || 
      (filterStatus === 'inactive' && !service.active);
    
    const matchesCategory = categoryFilter === 'all' || 
      service.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Catégories uniques pour les filtres
  const categories = ['all', ...new Set(services.map(service => service.category))].filter(Boolean);

  // Simuler l'effet de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchServices();
      // Attendre au moins 800ms pour l'animation
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gestion des services
  const handleAddService = () => {
    setCurrentService(null);
    setModalOpen(true);
  };

  const handleEditService = (id) => {
    const serviceToEdit = services.find(service => service._id === id);
    setCurrentService(serviceToEdit);
    setModalOpen(true);
  };

  const handleDeletePrompt = (id) => {
    setServiceToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteService(serviceToDelete);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setServiceToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleServiceSubmit = async (serviceData) => {
    try {
      if (serviceData._id) {
        await updateService(serviceData._id, serviceData);
      } else {
        await createService(serviceData);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleServiceStatus(id);
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  // Formater le prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(parseInt(price)) + ' FCFA';
  };
  
  // Animations pour framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <ArtistLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 border-t-4 border-bookmi-blue border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement de vos prestations...</p>
        </div>
      </ArtistLayout>
    );
  }

  if (error) {
    return (
      <ArtistLayout>
        <div className="py-12 px-4 max-w-lg mx-auto text-center">
          <div className="p-6 bg-red-50 rounded-lg border border-red-200 mb-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
            <p className="text-red-600">{error}</p>
          </div>
          <Button onClick={fetchServices} className="mx-auto">
            <span className="flex items-center">
              <FiRefreshCw className="mr-1.5 w-4 h-4" />
              <span>Réessayer</span>
            </span>
          </Button>
        </div>
      </ArtistLayout>
    );
  }

  // Statistiques à afficher
  const statCards = [
    {
      title: "Prestations actives",
      value: activeServicesCount,
      icon: <FiCheckCircle className="h-6 w-6 text-green-500" />,
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Prestations inactives",
      value: inactiveServicesCount,
      icon: <FiEyeOff className="h-6 w-6 text-orange-500" />,
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "Prix moyen",
      value: formatPrice(avgServicePrice),
      icon: <FiTrendingUp className="h-6 w-6 text-bookmi-blue" />,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Total prestations",
      value: services.length,
      icon: <FiBookOpen className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-50 border-purple-200"
    }
  ];

  return (
    <ArtistLayout>
      <div className="py-6 md:py-8 px-4 md:px-6 max-w-7xl mx-auto">
        {/* En-tête avec titre et boutons d'action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mes Prestations</h1>
            <p className="text-gray-500 mt-1">Gérez vos services et prestations artistiques</p>
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
              onClick={handleAddService}
              className="flex-shrink-0"
            >
              <div className="flex items-center">
                <FiPlus className="mr-1.5 w-4 h-4" />
                <span>Ajouter</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${stat.color} border`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-xl font-bold mt-1 text-gray-800">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-bookmi-blue focus:border-bookmi-blue"
                  placeholder="Rechercher une prestation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="secondary" 
                  className="flex items-center"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <FiFilter className="mr-1.5" />
                  <span>Filtres</span>
                  <FiChevronDown className={`ml-1.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                <div className="hidden md:flex border border-gray-300 rounded-md overflow-hidden">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-600'}`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-600'}`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panneau de filtres */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFilterStatus('all')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filterStatus === 'all' 
                              ? 'bg-bookmi-blue text-white' 
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={() => setFilterStatus('active')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filterStatus === 'active' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Actives
                        </button>
                        <button
                          onClick={() => setFilterStatus('inactive')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filterStatus === 'inactive' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Inactives
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Catégorie</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            categoryFilter === 'all' 
                              ? 'bg-bookmi-blue text-white' 
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          Toutes
                        </button>
                        {categories.filter(c => c !== 'all').map(category => (
                          <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              categoryFilter === category
                                ? 'bg-bookmi-blue text-white' 
                                : 'bg-white text-gray-700 border border-gray-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Résultats de recherche */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {filteredServices.length} prestation{filteredServices.length !== 1 ? 's' : ''} trouvée{filteredServices.length !== 1 ? 's' : ''}
          </h2>
          <div className="md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Liste des prestations */}
        {filteredServices.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" 
              : "flex flex-col gap-4"
            }
          >
            {filteredServices.map((service) => (
              <motion.div key={service._id} variants={itemVariants}>
                <ServiceCard
                  service={service}
                  onEdit={handleEditService}
                  onDelete={handleDeletePrompt}
                  onToggleActive={handleToggleActive}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {searchTerm || filterStatus !== 'all' || categoryFilter !== 'all' ? (
              <Card className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-500 mb-5">Aucune prestation ne correspond à vos critères de recherche.</p>
                <div className="flex justify-center gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setCategoryFilter('all');
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-bookmi-blue bg-opacity-10 flex items-center justify-center mb-4">
                  <FiStar className="w-8 h-8 text-bookmi-blue" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Commencez à créer vos prestations</h3>
                <p className="text-gray-500 mb-5">Vous n'avez pas encore ajouté de prestations. Créez votre première prestation maintenant.</p>
                <Button 
                  onClick={handleAddService}
                  className="mx-auto"
                >
                  <span className="flex items-center">
                    <FiPlus className="mr-1.5 w-4 h-4" />
                    <span>Ajouter une prestation</span>
                  </span>
                </Button>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      {/* Modales */}
      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        service={currentService}
        onSubmit={handleServiceSubmit}
      />

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Supprimer la prestation"
        message="Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </ArtistLayout>
  );
};

export default ArtistServices; 
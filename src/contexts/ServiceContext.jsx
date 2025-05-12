import React, { createContext, useContext, useState, useEffect } from 'react';
import artistServiceApi from '../services/artistServiceApi';
import { toast } from 'react-toastify';

// Création du contexte
const ServiceContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useService = () => useContext(ServiceContext);

// Fournisseur du contexte
export const ServiceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Charger les services lors du montage du composant
  useEffect(() => {
    fetchServices();
  }, [refreshTrigger]);

  // Fonction pour récupérer les services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await artistServiceApi.getMyServices();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
      setError('Impossible de charger vos services.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un service
  const createService = async (serviceData) => {
    try {
      setLoading(true);
      const newService = await artistServiceApi.createService(serviceData);
      setServices(prev => [...prev, newService]);
      toast.success('Service créé avec succès');
      return newService;
    } catch (err) {
      console.error('Erreur lors de la création du service:', err);
      toast.error('Erreur lors de la création du service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour un service
  const updateService = async (serviceId, serviceData) => {
    try {
      setLoading(true);
      const updatedService = await artistServiceApi.updateService(serviceId, serviceData);
      setServices(prev => 
        prev.map(service => service._id === serviceId ? updatedService : service)
      );
      toast.success('Service mis à jour avec succès');
      return updatedService;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du service:', err);
      toast.error('Erreur lors de la mise à jour du service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un service
  const deleteService = async (serviceId) => {
    try {
      setLoading(true);
      await artistServiceApi.deleteService(serviceId);
      setServices(prev => prev.filter(service => service._id !== serviceId));
      toast.success('Service supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du service:', err);
      toast.error('Erreur lors de la suppression du service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour basculer l'état actif d'un service
  const toggleServiceStatus = async (serviceId) => {
    try {
      setLoading(true);
      const updatedService = await artistServiceApi.toggleServiceStatus(serviceId);
      setServices(prev => 
        prev.map(service => service._id === serviceId ? updatedService : service)
      );
      toast.success(`Service ${updatedService.active ? 'activé' : 'désactivé'} avec succès`);
      return updatedService;
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      toast.error('Erreur lors du changement de statut du service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour forcer un rafraîchissement des données
  const refreshServices = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Valeur du contexte
  const value = {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refreshServices
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceContext; 
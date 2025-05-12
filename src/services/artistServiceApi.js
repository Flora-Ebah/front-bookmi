import axios from './config/axiosConfig';

/**
 * Service pour gérer les prestations/services des artistes
 */
class ArtistServiceApi {
  /**
   * Récupérer tous les services d'un artiste
   * @returns {Promise<Array>} Liste des services de l'artiste connecté
   */
  async getMyServices() {
    try {
      const response = await axios.get('/artists/me/services');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching artist services:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Récupérer un service spécifique par son ID
   * @param {string} serviceId - ID du service à récupérer
   * @returns {Promise<Object>} Détails du service
   */
  async getService(serviceId) {
    try {
      const response = await axios.get(`/services/${serviceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching service details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Créer un nouveau service
   * @param {Object} serviceData - Données du service à créer
   * @returns {Promise<Object>} Le service créé
   */
  async createService(serviceData) {
    try {
      // On passe par artists/me/services pour que l'ID de l'artiste soit ajouté automatiquement
      const response = await axios.post('/artists/me/services', serviceData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating service:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mettre à jour un service existant
   * @param {string} serviceId - ID du service à mettre à jour
   * @param {Object} serviceData - Nouvelles données du service
   * @returns {Promise<Object>} Le service mis à jour
   */
  async updateService(serviceId, serviceData) {
    try {
      const response = await axios.put(`/services/${serviceId}`, serviceData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating service:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Supprimer un service
   * @param {string} serviceId - ID du service à supprimer
   * @returns {Promise<Object>} Réponse de confirmation
   */
  async deleteService(serviceId) {
    try {
      const response = await axios.delete(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Activer ou désactiver un service
   * @param {string} serviceId - ID du service à modifier
   * @returns {Promise<Object>} Le service mis à jour
   */
  async toggleServiceStatus(serviceId) {
    try {
      const response = await axios.patch(`/services/${serviceId}/toggle-status`);
      return response.data.data;
    } catch (error) {
      console.error('Error toggling service status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Uploader une photo pour un service
   * @param {string} serviceId - ID du service
   * @param {File} photoFile - Fichier photo à uploader
   * @returns {Promise<Object>} URL de la photo uploadée
   */
  async uploadServicePhoto(serviceId, photoFile) {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await axios.post(`/services/${serviceId}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading service photo:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ArtistServiceApi(); 
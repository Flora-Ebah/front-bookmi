import axios from './config/axiosConfig';
import authService from './authService';

/**
 * Service pour gérer les moyens de paiement
 */
class PaymentMethodService {
  /**
   * Vérifier et rafraîchir le token si nécessaire
   * @private
   */
  async _ensureAuthenticated() {
    if (!authService.isAuthenticated()) {
      try {
        // Tenter de rafraîchir le token
        await authService.refreshToken();
      } catch (error) {
        console.error('Échec du rafraîchissement du token:', error);
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
      }
    }
  }

  /**
   * Obtenir tous les moyens de paiement de l'utilisateur
   * @returns {Promise<Object>} Liste des moyens de paiement
   */
  async getMyPaymentMethods() {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des moyens de paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Ajouter un nouveau moyen de paiement
   * @param {Object} paymentMethodData - Données du moyen de paiement
   * @param {string} paymentMethodData.type - Type de moyen de paiement (visa, mtn, orange, etc.)
   * @param {string} paymentMethodData.name - Nom personnalisé du moyen de paiement
   * @param {Object} paymentMethodData.details - Détails spécifiques au type de paiement
   * @param {boolean} paymentMethodData.isDefault - Définir comme moyen de paiement par défaut
   * @returns {Promise<Object>} Le moyen de paiement créé
   */
  async addPaymentMethod(paymentMethodData) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.post('/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du moyen de paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un moyen de paiement spécifique
   * @param {string} paymentMethodId - ID du moyen de paiement
   * @returns {Promise<Object>} Détails du moyen de paiement
   */
  async getPaymentMethod(paymentMethodId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.get(`/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du moyen de paiement ${paymentMethodId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mettre à jour un moyen de paiement
   * @param {string} paymentMethodId - ID du moyen de paiement
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Le moyen de paiement mis à jour
   */
  async updatePaymentMethod(paymentMethodId, updateData) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.put(`/payment-methods/${paymentMethodId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du moyen de paiement ${paymentMethodId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Définir un moyen de paiement comme défaut
   * @param {string} paymentMethodId - ID du moyen de paiement
   * @returns {Promise<Object>} Le moyen de paiement mis à jour
   */
  async setDefaultPaymentMethod(paymentMethodId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.put(`/payment-methods/${paymentMethodId}/default`, {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la définition du moyen de paiement ${paymentMethodId} comme défaut:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Supprimer un moyen de paiement
   * @param {string} paymentMethodId - ID du moyen de paiement
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async deletePaymentMethod(paymentMethodId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.delete(`/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du moyen de paiement ${paymentMethodId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new PaymentMethodService(); 
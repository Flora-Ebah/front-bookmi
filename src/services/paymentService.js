import axios from './config/axiosConfig';
import authService from './authService';

/**
 * Service pour gérer les paiements dans l'application
 */
class PaymentService {
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
   * Créer un nouveau paiement
   * @param {Object} paymentData - Les données du paiement
   * @param {string} paymentData.reservationId - ID de la réservation
   * @param {number} paymentData.amount - Montant du paiement
   * @param {number} paymentData.serviceFee - Frais de service
   * @param {string} paymentData.paymentMethod - Méthode de paiement (ex: 'visa', 'mtn', 'orange')
   * @param {string} paymentData.paymentMethodId - ID du moyen de paiement enregistré (optionnel)
   * @param {string} paymentData.paymentType - Type de paiement ('full', 'advance', 'balance')
   * @param {Object} paymentData.paymentDetails - Détails du paiement selon la méthode
   * @param {string} paymentData.notes - Notes additionnelles
   * @returns {Promise<Object>} Les données du paiement créé
   */
  async createPayment(paymentData) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir tous les paiements du booker connecté avec pagination et filtres
   * @param {Object} filters - Filtres à appliquer
   * @param {string} filters.status - Filtrer par statut (completed, pending, failed)
   * @param {string} filters.startDate - Date de début (YYYY-MM-DD)
   * @param {string} filters.endDate - Date de fin (YYYY-MM-DD)
   * @param {number} filters.page - Numéro de page
   * @param {number} filters.limit - Nombre d'éléments par page
   * @returns {Promise<Object>} Liste des paiements effectués avec pagination
   */
  async getMyPayments(filters = {}) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await axios.get(`/payments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des paiements du booker
   * @returns {Promise<Object>} Statistiques des paiements
   */
  async getPaymentStats() {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      try {
        const response = await axios.get('/payments/stats');
        return response.data;
      } catch (apiError) {
        console.error('Erreur API lors de la récupération des statistiques de paiement:', apiError.response?.data || apiError.message);
        
        // Renvoyer des données par défaut si le backend renvoie une erreur
        // Cela permettra à l'interface utilisateur de continuer à fonctionner
        return {
          success: true,
          data: {
            totalAmount: 0,
            completedCount: 0,
            pendingCount: 0,
            failedCount: 0,
            totalCount: 0,
            monthlyPayments: [],
            paymentsByMethod: []
          }
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de paiement:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir les paiements reçus par l'artiste connecté avec pagination et filtres
   * @param {Object} filters - Filtres à appliquer
   * @param {string} filters.status - Filtrer par statut
   * @param {string} filters.startDate - Date de début (YYYY-MM-DD)
   * @param {string} filters.endDate - Date de fin (YYYY-MM-DD)
   * @param {number} filters.page - Numéro de page
   * @param {number} filters.limit - Nombre d'éléments par page
   * @returns {Promise<Object>} Liste des paiements reçus avec pagination
   */
  async getReceivedPayments(filters = {}) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await axios.get(`/payments/received?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements reçus:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un paiement spécifique
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Object>} Détails du paiement
   */
  async getPayment(paymentId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du paiement ${paymentId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Générer un reçu pour un paiement
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Object>} Données du reçu
   */
  async generateReceipt(paymentId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.get(`/payments/${paymentId}/receipt`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la génération du reçu pour le paiement ${paymentId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Télécharger un reçu pour un paiement (PDF)
   * @param {string} paymentId - ID du paiement
   * @returns {Promise<Blob>} Blob contenant le PDF du reçu
   */
  async downloadReceipt(paymentId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      // Demander le PDF avec responseType 'blob'
      const response = await axios.get(`/payments/${paymentId}/receipt/download`, {
        responseType: 'blob'
      });
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-paiement-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error(`Erreur lors du téléchargement du reçu pour le paiement ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Exporter l'historique des transactions au format CSV
   * @param {Object} filters - Filtres à appliquer avant l'export
   * @returns {Promise<Blob>} Blob contenant le fichier CSV
   */
  async exportTransactions(filters = {}) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      // Demander le CSV avec responseType 'blob'
      const response = await axios.get(`/payments/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un URL pour le blob et déclencher le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Générer un nom de fichier avec la date actuelle
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `transactions-${date}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export des transactions:', error);
      throw error;
    }
  }

  /**
   * Simuler une confirmation de paiement (webhook)
   * Normalement cette fonction serait appelée par un service de paiement externe
   * @param {string} paymentId - ID du paiement
   * @param {string} status - Nouveau statut ('completed', 'failed', etc.)
   * @param {string} transactionId - ID de transaction externe
   * @returns {Promise<Object>} Résultat de la confirmation
   */
  async simulatePaymentConfirmation(paymentId, status, transactionId) {
    try {
      // S'assurer que l'utilisateur est authentifié
      await this._ensureAuthenticated();
      
      const response = await axios.post(`/payments/${paymentId}/webhook`, {
        status,
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la simulation de confirmation de paiement:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Calculer les frais de service pour un montant donné
   * @param {number} amount - Montant du paiement
   * @returns {number} Frais de service calculés
   */
  calculateServiceFee(amount) {
    // Par exemple, 5% du montant avec un minimum de 500 FCFA
    const feePercentage = 0.05;
    const minimumFee = 500;
    
    const calculatedFee = Math.round(amount * feePercentage);
    return Math.max(calculatedFee, minimumFee);
  }

  /**
   * Tester l'authentification pour s'assurer que tout fonctionne
   * @returns {Promise<boolean>} true si l'authentification est valide
   */
  async testAuthentication() {
    try {
      // Tenter de vérifier l'état de l'authentification
      await this._ensureAuthenticated();
      
      // Vérifier le token JWT dans le localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token dans le localStorage');
        return false;
      }
      
      // Décoder le token JWT pour vérifier les rôles et les ID
      try {
        // Décodage manuel du token JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedToken = JSON.parse(atob(base64));
        
        console.log('Décodage du token JWT:', decodedToken);
        
        // Vérifier que les champs essentiels sont présents
        if (!decodedToken.id || !decodedToken.role) {
          console.error('Token JWT incomplet (manque id ou role)');
          return false;
        }
        
        if (decodedToken.role === 'booker' && !decodedToken.booker) {
          console.error('Token JWT incomplet pour un booker (manque booker ID)');
          return false;
        }
        
        // Tout semble correct
        console.log('Authentification testée et valide');
        return true;
      } catch (decodeError) {
        console.error('Erreur lors du décodage du token JWT:', decodeError);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du test d\'authentification:', error);
      return false;
    }
  }
}

export default new PaymentService(); 
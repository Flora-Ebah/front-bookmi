import axios from './config/axiosConfig';
import { ERROR_MESSAGES } from '../config/constants';

/**
 * Service pour gérer les notifications
 */
class NotificationService {
  /**
   * Récupérer les notifications de l'utilisateur
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Promise<Object>} - Liste des notifications
   */
  async getNotifications(options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const params = new URLSearchParams({
        page,
        limit,
        unreadOnly
      });
      
      const response = await axios.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer le nombre de notifications non lues
   * @returns {Promise<Number>} - Nombre de notifications non lues
   */
  async getUnreadCount() {
    try {
      const response = await axios.get('/notifications?unreadOnly=true&limit=1');
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur de notifications:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {String} notificationId - ID de la notification
   * @returns {Promise<Object>} - La notification mise à jour
   */
  async markAsRead(notificationId) {
    try {
      const response = await axios.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async markAllAsRead() {
    try {
      const response = await axios.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprimer une notification
   * @param {String} notificationId - ID de la notification
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Gérer les erreurs de l'API
   * @param {Error} error - L'erreur à gérer
   * @returns {Error} - L'erreur formatée
   */
  handleError(error) {
    if (error.response) {
      // L'erreur vient du serveur avec une réponse
      const status = error.response.status;
      let message = error.response.data.error || error.response.data.message;

      switch (status) {
        case 401:
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 403:
          message = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
          message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          message = message || 'Une erreur est survenue';
      }

      throw new Error(message);
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Erreur lors de la configuration de la requête
      throw new Error('Une erreur est survenue lors de la requête');
    }
  }
}

export default new NotificationService(); 
import axios from './config/axiosConfig';
import { STORAGE_KEYS } from './config/constants';

/**
 * Service pour gérer l'authentification des utilisateurs
 */
class AuthService {
  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - Les identifiants de connexion
   * @param {string} credentials.email - Email de l'utilisateur
   * @param {string} credentials.password - Mot de passe de l'utilisateur
   * @param {boolean} credentials.rememberMe - Option se souvenir de moi
   * @returns {Promise<Object>} Les données de l'utilisateur connecté
   */
  async login(credentials) {
    try {
      const response = await axios.post('/auth/login', credentials);
      
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Inscription d'un booker
   * @param {Object} bookerData - Les données d'inscription du booker
   * @returns {Promise<Object>} Les données du booker inscrit
   */
  async registerBooker(bookerData) {
    try {
      const response = await axios.post('/auth/register/booker', bookerData);
      
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register booker error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Inscription d'un artiste
   * @param {Object} artistData - Les données d'inscription de l'artiste
   * @returns {Promise<Object>} Les données de l'artiste inscrit
   */
  async registerArtist(artistData) {
    try {
      const response = await axios.post('/auth/register/artist', artistData);
      
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register artist error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Vérification du compte avec le code SMS
   * @param {Object} verificationData - Les données de vérification
   * @param {string} verificationData.email - Email de l'utilisateur
   * @param {string} verificationData.code - Code de vérification reçu par SMS
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async verifyAccount(verificationData) {
    try {
      const response = await axios.post('/auth/verify', verificationData);
      
      // Si la vérification renvoie un token, le stocker comme après login/register
      if (response.data.token) {
        this.setSession(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Verification error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Demande d'un nouveau code de vérification
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} Résultat de la demande
   */
  async resendVerificationCode(email) {
    try {
      const response = await axios.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Demande de réinitialisation du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} Résultat de la demande
   */
  async forgotPassword(email) {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Réinitialisation du mot de passe
   * @param {Object} resetData - Les données de réinitialisation
   * @param {string} resetData.email - Email de l'utilisateur
   * @param {string} resetData.code - Code de vérification
   * @param {string} resetData.newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat de la réinitialisation
   */
  async resetPassword(resetData) {
    try {
      const response = await axios.put('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mise à jour des informations utilisateur
   * @param {Object} userData - Les nouvelles données utilisateur
   * @returns {Promise<Object>} Les données utilisateur mises à jour
   */
  async updateUserDetails(userData) {
    try {
      const response = await axios.put('/auth/updatedetails', userData);
      
      // Mettre à jour les données utilisateur dans le localStorage
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update user details error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mise à jour du mot de passe de l'utilisateur connecté
   * @param {Object} passwordData - Les données de mot de passe
   * @param {string} passwordData.currentPassword - Mot de passe actuel
   * @param {string} passwordData.newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updatePassword(passwordData) {
    try {
      const response = await axios.put('/auth/updatepassword', passwordData);
      
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update password error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   * @returns {Promise<Object>} Les données de l'utilisateur
   */
  async getMe() {
    try {
      const response = await axios.get('/auth/me');
      
      // Mettre à jour les données utilisateur dans le localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data));
      
      return response.data.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await axios.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Rafraîchir le token d'accès
   * @returns {Promise<Object>} Le nouveau token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error.response?.data || error.message);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Enregistrer les informations de session
   * @param {Object} data - Les données de session
   * @param {string} data.token - Le token JWT
   * @param {string} data.refreshToken - Le refresh token
   * @param {Object} data.user - Les données utilisateur
   * @private
   */
  setSession(data) {
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    }
    
    if (data.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    
    if (data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
  }

  /**
   * Supprimer les informations de session
   * @private
   */
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} True si authentifié, false sinon
   */
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    
    console.log('authService.isAuthenticated - Vérification de l\'authentification');
    console.log('Token présent:', !!token);
    console.log('User présent:', !!user);
    
    if (token && user) {
      try {
        // Vérifier si le token est un JWT valide
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObject = JSON.parse(user);
        
        console.log('Payload du token:', payload);
        console.log('ID utilisateur:', payload.id);
        console.log('Rôle utilisateur:', payload.role);
        console.log('ID booker dans le token:', payload.booker);
        console.log('User stocké:', userObject);
        
        // Vérifier si le token n'est pas expiré
        const now = Date.now() / 1000;
        return payload.exp > now;
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Obtenir l'utilisateur actuel depuis le localStorage
   * @returns {Object|null}
   */
  getUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Obtenir le rôle de l'utilisateur
   * @returns {string|null}
   */
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

export default new AuthService(); 
import axios from 'axios';
import { API_URL, ERROR_MESSAGES, SORT_OPTIONS, STORAGE_KEYS } from '../config/constants';
import authService from './authService';

class ServiceArtistBooker {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Intercepteur pour ajouter le token d'authentification à chaque requête
    this.api.interceptors.request.use(
      (config) => {
        // Utiliser authService pour obtenir le token d'authentification
        console.log('Intercepteur de requête - vérification de l\'authentification');
        const isAuth = authService.isAuthenticated();
        console.log('Authentifié selon authService:', isAuth);
        
        if (isAuth) {
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          console.log('Token récupéré:', token ? 'présent' : 'absent');
          
          if (token) {
            try {
              // Analyser le token pour vérifier son contenu
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('Token payload:', payload);
              console.log('ID booker dans token:', payload.booker);
              
              // Ajouter le token aux en-têtes
              config.headers['Authorization'] = `Bearer ${token}`;
              console.log('En-tête Authorization ajouté à la requête');
            } catch (error) {
              console.error('Erreur lors de l\'analyse du token:', error);
            }
          } else {
            console.warn('Token absent malgré isAuthenticated=true');
          }
        } else {
          console.warn('Utilisateur non authentifié selon authService');
        }
        
        return config;
      },
      (error) => {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
      }
    );
  }

  // Récupérer tous les services avec filtres
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres à l'URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await this.api.get(`/services?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Récupérer un service spécifique
  async getService(id) {
    try {
      const response = await this.api.get(`/services/${id}`);
      // Vérifier si les données sont dans un objet imbriqué 'data'
      if (response.data && response.data.success && response.data.data) {
        return { data: response.data.data };
      }
      return { data: response.data };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Récupérer les services d'un artiste spécifique
  async getArtistServices(artistId) {
    try {
      console.log(`Récupération des services pour l'artiste ID: ${artistId}`);
      const response = await this.api.get(`/artists/${artistId}/services`);
      console.log('Réponse brute des services:', response.data);
      
      // Vérifier si les données sont dans un objet imbriqué 'data'
      if (response.data && response.data.success && response.data.data) {
        console.log('Services extraits (format success):', response.data.data);
        return { data: response.data.data };
      }
      
      console.log('Services extraits (format direct):', response.data);
      return { data: response.data };
    } catch (error) {
      console.error('Erreur getArtistServices:', error);
      throw this.handleError(error);
    }
  }

  // Récupérer les services recommandés
  async getRecommendedServices() {
    try {
      const response = await this.api.get('/services', {
        params: {
          recommended: true,
          limit: 6,
          sort: SORT_OPTIONS.POPULAR
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Rechercher des services
  async searchServices(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        ...filters
      });

      const response = await this.api.get(`/services?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Rechercher des artistes
  async searchArtists(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres à l'URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      console.log(`Recherche d'artistes avec filtres: ${params.toString()}`);
      const response = await this.api.get(`/bookers/search/artists?${params.toString()}`);
      console.log('Réponse brute de searchArtists:', response.data);
      
      // Si les données sont enveloppées dans un objet data
      if (response.data && response.data.success && response.data.data) {
        console.log('Artistes extraits (format success):', response.data.data);
        return { data: response.data.data };
      }
      
      console.log('Artistes extraits (format direct):', response.data);
      return { data: response.data };
    } catch (error) {
      console.error('Erreur searchArtists:', error);
      throw this.handleError(error);
    }
  }

  // Récupérer les détails d'un artiste avec ses services
  async getArtistDetails(artistId) {
    try {
      console.log(`Récupération des détails de l'artiste ID: ${artistId}`);
      const response = await this.api.get(`/bookers/artists/${artistId}`);
      console.log('Réponse brute des détails artiste:', response.data);
      
      // Vérifier si les données sont dans un objet imbriqué 'data'
      if (response.data && response.data.success && response.data.data) {
        console.log('Détails artiste extraits (format success):', response.data.data);
        return { data: response.data.data };
      }
      
      console.log('Détails artiste extraits (format direct):', response.data);
      return { data: response.data };
    } catch (error) {
      console.error('Erreur getArtistDetails:', error);
      throw this.handleError(error);
    }
  }

  // Évaluer un artiste
  async rateArtist(artistId, ratingData) {
    try {
      console.log(`Évaluation de l'artiste ${artistId}`, ratingData);
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.post(`/bookers/artists/${artistId}/review`, ratingData, {
        headers,
        withCredentials: true
      });
      console.log('Réponse évaluation:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'évaluation (artiste ${artistId}):`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Récupérer les avis d'un artiste
  async getArtistReviews(artistId) {
    try {
      console.log(`Récupération des avis pour l'artiste ${artistId}`);
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get(`/bookers/artists/${artistId}/reviews`, {
        headers,
        withCredentials: true
      });
      console.log('Réponse récupération avis:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des avis (artiste ${artistId}):`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Ajouter un artiste aux favoris
  async addToFavorites(artistId) {
    try {
      console.log(`Ajout de l'artiste ${artistId} aux favoris`);
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.post(`/bookers/favorites/artists/${artistId}`, {}, {
        headers,
        withCredentials: true
      });
      console.log('Réponse ajout aux favoris:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur ajout aux favoris (artiste ${artistId}):`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Retirer un artiste des favoris
  async removeFromFavorites(artistId) {
    try {
      console.log(`Retrait de l'artiste ${artistId} des favoris`);
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.delete(`/bookers/favorites/artists/${artistId}`, {
        headers,
        withCredentials: true
      });
      console.log('Réponse retrait des favoris:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur retrait des favoris (artiste ${artistId}):`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Récupérer la liste des artistes favoris
  async getFavoriteArtists() {
    try {
      console.log('Récupération des artistes favoris');
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        console.error('Authentification manquante lors de la récupération des favoris');
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error('Token manquant lors de la récupération des favoris');
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || user.role !== 'booker') {
        console.error('Type d\'utilisateur incorrect:', user?.role);
        throw new Error("Vous devez être connecté en tant que booker pour accéder à vos favoris.");
      }
      
      console.log('Utilisateur booker confirmé:', user.role);
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('En-têtes de la requête:', headers);
      
      // Appel API avec en-têtes explicites
      const response = await this.api.get('/bookers/favorites/artists', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse récupération favoris:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Créer une nouvelle réservation
  async createReservation(reservationData) {
    try {
      console.log('Création de réservation - données envoyées:', reservationData);
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Token d\'authentification présent:', !!token);
      
      if (!token) {
        throw new Error("Authentification requise. Veuillez vous connecter pour effectuer une réservation.");
      }
      
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || user.role !== 'booker') {
        throw new Error("Vous devez être connecté en tant que booker pour effectuer une réservation.");
      }
      
      // Ajouter l'ID du booker aux données de réservation si ce n'est pas déjà fait
      if (!reservationData.booker && user._id) {
        reservationData.booker = user._id;
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Appel API avec en-têtes explicites
      const response = await this.api.post('/reservations', reservationData, {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse de création de réservation:', response.data);
      console.log('Les notifications sont gérées automatiquement par le backend - une notification sera envoyée à l\'artiste');
      
      return response.data;
    } catch (error) {
      console.error('Erreur création réservation:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Si l'erreur concerne le champ booker manquant, fournir un message plus clair
      if (error.response && error.response.data && 
          (error.response.data.error === "Path `booker` is required." || 
           error.response.data.error?.includes('booker'))) {
        throw new Error("Erreur d'authentification. Veuillez vous reconnecter et réessayer.");
      }
      throw this.handleError(error);
    }
  }

  // Récupérer toutes les réservations du booker connecté
  async getMyReservations() {
    try {
      console.log('Récupération des réservations - démarrage de la requête');
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Token d\'authentification présent:', !!token);
      
      if (!token) {
        throw new Error("Authentification requise. Veuillez vous connecter pour voir vos réservations.");
      }
      
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || user.role !== 'booker') {
        throw new Error("Vous devez être connecté en tant que booker pour accéder à vos réservations.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Appel API avec en-têtes explicites
      const response = await this.api.get('/reservations', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse brute getMyReservations:', response.data);
      console.log('URL utilisée pour getMyReservations:', '/reservations');
      
      return response.data;
    } catch (error) {
      console.error('Erreur récupération réservations:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Récupérer une réservation spécifique
  async getReservation(id) {
    try {
      console.log(`Récupération des détails de la réservation ID: ${id}`);
      
      // Vérifier le token d'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter pour accéder à cette réservation.");
      }
      
      // Récupérer l'utilisateur depuis authService
      const user = authService.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non trouvé. Veuillez vous reconnecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // URL différente selon le rôle de l'utilisateur
      let url = '';
      if (user.role === 'artist') {
        url = `/reservations/artist/${id}`;
        console.log('Utilisation de la route d\'artiste pour accéder à la réservation');
      } else {
        url = `/reservations/${id}`;
      }
      
      // Appel API avec en-têtes explicites
      const response = await this.api.get(url, {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse de getReservation:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur récupération détails réservation:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Mettre à jour le statut d'une réservation
  async updateReservationStatus(id, status) {
    try {
      console.log(`Mise à jour du statut de la réservation ${id} vers ${status}`);
      
      // Vérifier le token d'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter pour mettre à jour cette réservation.");
      }
      
      // Récupérer l'utilisateur depuis authService
      const user = authService.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non trouvé. Veuillez vous reconnecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // URL différente selon le rôle de l'utilisateur
      let url = '';
      if (user.role === 'artist') {
        url = `/reservations/artist/${id}/status`;
        console.log('Utilisation de la route d\'artiste pour mettre à jour le statut');
      } else {
        url = `/reservations/${id}/status`;
      }
      
      // Appel API avec en-têtes explicites
      const response = await this.api.patch(url, { status }, {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse de mise à jour du statut:', response.data);
      console.log('Les notifications liées au changement de statut sont gérées automatiquement par le backend');
      
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour statut réservation:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Récupérer les réservations d'un artiste (si l'utilisateur est un artiste)
  async getArtistReservations() {
    try {
      console.log('Appel de getArtistReservations - début de la requête');
      
      // Vérifier l'authentification via authService
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter pour voir vos réservations.");
      }
      
      // Récupérer l'utilisateur depuis authService
      const user = authService.getUser();
      console.log('Utilisateur récupéré depuis authService:', user);
      
      if (!user || user.role !== 'artist') {
        throw new Error("Vous devez être connecté en tant qu'artiste pour accéder à vos réservations.");
      }
      
      // Récupérer le token JWT pour l'analyse
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // Analyser le token pour récupérer l'ID de l'artiste
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload du token JWT:', payload);
      
      // Identifier l'ID de l'artiste à partir de différentes sources possibles
      const artistId = payload.artist || user.id || user._id;
      
      console.log('ID Artiste extrait pour la requête:', artistId);
      
      if (!artistId) {
        throw new Error("Impossible de déterminer l'ID de l'artiste. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('URL utilisée pour getArtistReservations:', '/reservations/artist');
      
      // Appel API avec en-têtes explicites
      const response = await this.api.get('/reservations/artist', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse brute getArtistReservations:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur récupération réservations artiste:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Créer des réservations de test pour un artiste (UNIQUEMENT pour le développement)
  async createTestReservationsForArtist() {
    try {
      console.log('Création de réservations de test pour l\'artiste...');
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error("Authentification requise.");
      }
      
      // Récupérer l'utilisateur depuis le localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || user.role !== 'artist') {
        throw new Error("Vous devez être connecté en tant qu'artiste.");
      }
      
      const artistId = user.id;
      console.log('ID Artiste pour les réservations de test:', artistId);
      
      // Créer des données de test - simuler des réservations créées par un booker
      const testReservations = [
        {
          serviceId: "681a952ec49894d2a181de80", // ID d'un service existant
          artistId: artistId,
          booker: "681a422ed8a4df63ce922cbd", // ID d'un booker existant
          date: new Date().toISOString().split('T')[0],
          startTime: "14:00",
          endTime: "16:00",
          location: "Paris, Studio Central",
          eventType: "Concert privé",
          notes: "Réservation de test 1",
          paymentMethod: "visa",
          amount: 15000,
          serviceFee: 1500,
          status: "pending",
          paymentStatus: "pending"
        },
        {
          serviceId: "681a952ec49894d2a181de80", // ID d'un service existant
          artistId: artistId,
          booker: "681a422ed8a4df63ce922cbd", // ID d'un booker existant
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // Dans une semaine
          startTime: "20:00",
          endTime: "23:00",
          location: "Lyon, Salle des fêtes",
          eventType: "Mariage",
          notes: "Réservation de test 2",
          paymentMethod: "visa",
          amount: 25000,
          serviceFee: 2500,
          status: "confirmed",
          paymentStatus: "paid"
        },
        {
          serviceId: "681a952ec49894d2a181de80", // ID d'un service existant
          artistId: artistId,
          booker: "681a422ed8a4df63ce922cbd", // ID d'un booker existant
          date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0], // Il y a deux semaines
          startTime: "19:00",
          endTime: "22:00",
          location: "Marseille, Bar Le Central",
          eventType: "Soirée d'entreprise",
          notes: "Réservation de test 3 (passée)",
          paymentMethod: "visa",
          amount: 18000,
          serviceFee: 1800,
          status: "completed",
          paymentStatus: "paid"
        }
      ];
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Créer les réservations une par une
      const createdReservations = [];
      for (const reservationData of testReservations) {
        console.log(`Création de la réservation de test: ${reservationData.eventType}`);
        try {
          const response = await this.api.post('/reservations/dev/test-reservation', reservationData, {
            headers,
            withCredentials: true
          });
          createdReservations.push(response.data);
          console.log('Réservation créée avec succès:', response.data);
        } catch (error) {
          console.error(`Erreur lors de la création de la réservation ${reservationData.eventType}:`, error.response?.data || error.message);
        }
      }
      
      return {
        success: true,
        count: createdReservations.length,
        data: createdReservations
      };
    } catch (error) {
      console.error('Erreur création réservations test:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Traiter un paiement
  async processPayment(paymentData) {
    try {
      console.log('Traitement du paiement - données:', paymentData);
      
      // Vérifier le token d'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter pour effectuer un paiement.");
      }
      
      // Récupérer l'utilisateur depuis authService
      const user = authService.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non trouvé. Veuillez vous reconnecter.");
      }
      
      // En production, vous feriez un appel API réel ici
      // const response = await this.api.post('/payments', paymentData);
      
      // Simuler une réponse positive après un délai
      return new Promise((resolve) => {
        setTimeout(() => {
          // Après le paiement réussi, mettre à jour le statut de la réservation
          this.updateReservationStatus(paymentData.reservationId, 'confirmed')
            .then(() => {
              resolve({
                success: true,
                data: {
                  paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
                  amount: paymentData.amount,
                  status: 'success',
                  date: new Date().toISOString()
                },
                message: "Paiement traité avec succès"
              });
            })
            .catch((error) => {
              console.error("Erreur lors de la mise à jour du statut après paiement:", error);
              // On renvoie quand même un succès pour le paiement, la mise à jour du statut sera gérée séparément
              resolve({
                success: true,
                data: {
                  paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
                  amount: paymentData.amount,
                  status: 'success',
                  date: new Date().toISOString()
                },
                message: "Paiement traité avec succès, mais erreur lors de la mise à jour du statut"
              });
            });
        }, 2000); // Simuler un délai de traitement
      });
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      return { success: false, message: error.message };
    }
  }

  // Récupérer les statistiques de l'artiste connecté
  async getArtistStats() {
    try {
      console.log('Récupération des statistiques de l\'artiste');
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get('/artists/me/stats', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse statistiques:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  // Récupérer les avis de l'artiste connecté
  async getMyReviews() {
    try {
      console.log('Récupération des avis de l\'artiste');
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get('/artists/me/reviews', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse avis artiste:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération des avis:', error);
      throw this.handleError(error);
    }
  }

  // Répondre à un avis
  async respondToReview(reviewId, responseText) {
    try {
      console.log(`Réponse à l'avis ${reviewId}`);
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Vérifier le rôle
      const user = authService.getUser();
      if (!user || user.role !== 'artist') {
        throw new Error("Vous devez être connecté en tant qu'artiste pour répondre aux avis.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.post(`/artists/me/reviews/${reviewId}/respond`, 
        { response: responseText },
        {
          headers,
          withCredentials: true
        }
      );
      
      console.log('Réponse enregistrée:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réponse à l'avis ${reviewId}:`, error);
      console.error('Détails de l\'erreur:', error.response?.data);
      throw this.handleError(error);
    }
  }

  // Récupérer les statistiques du tableau de bord
  async getDashboardStats() {
    try {
      console.log('Récupération des statistiques du tableau de bord');
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get('/artists/me/dashboard', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse statistiques tableau de bord:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération des statistiques du tableau de bord:', error);
      throw this.handleError(error);
    }
  }

  // Récupérer les statistiques du tableau de bord du booker
  async getBookerDashboardStats() {
    try {
      console.log('Récupération des statistiques du tableau de bord booker');
      
      // Vérifier l'authentification
      if (!authService.isAuthenticated()) {
        throw new Error("Authentification requise. Veuillez vous connecter.");
      }
      
      // Récupérer le token
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }
      
      // S'assurer que les en-têtes contiennent bien le token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get('/bookers/me/dashboard', {
        headers,
        withCredentials: true
      });
      
      console.log('Réponse statistiques tableau de bord booker:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération des statistiques du tableau de bord booker:', error);
      throw this.handleError(error);
    }
  }

  // Gérer les erreurs
  handleError(error) {
    console.error('Erreur API:', error);
    if (error.response) {
      // L'erreur vient du serveur avec une réponse
      const status = error.response.status;
      let message = error.response.data.message;

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

export default new ServiceArtistBooker(); 
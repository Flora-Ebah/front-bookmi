import axios from 'axios';

// Constante pour l'URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'https://back-bookmi-production.up.railway.app/api';

// Création d'une instance axios avec une configuration par défaut
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour permettre l'envoi et la réception de cookies
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token ajouté à la requête:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Aucun token trouvé pour la requête:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Récupérer la requête originale
    const originalRequest = error.config;
    console.error('Erreur API interceptée:', error.response?.status, error.response?.data, originalRequest.url);

    // Si l'erreur est 401 (non autorisé) et que nous n'avons pas déjà essayé de renouveler le token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Tentative de rafraîchissement du token pour:', originalRequest.url);

      try {
        // Tentative de rafraîchissement du token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('RefreshToken trouvé, tentative de rafraîchissement');
          
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.token) {
            console.log('Nouveau token obtenu, mise à jour');
            
            // Mise à jour du token dans le localStorage
            localStorage.setItem('token', response.data.token);
            
            // Mise à jour du header pour la requête originale
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            // Réessayer la requête originale
            console.log('Réessai de la requête originale');
            return axiosInstance(originalRequest);
          } else {
            console.warn('Pas de nouveau token dans la réponse');
          }
        } else {
          console.warn('Pas de refreshToken trouvé');
        }
        
        // Si on arrive ici, c'est que le refreshToken a échoué ou n'existe pas
        throw new Error('Échec de rafraîchissement du token');
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion avec l'URL de retour
        const returnUrl = window.location.pathname;
        console.log('Redirection vers la page de connexion, URL de retour:', returnUrl);
        window.location.href = `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
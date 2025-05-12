// Configuration de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Clés localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

// Log des clés pour debug
console.log('STORAGE_KEYS dans constants.js:', STORAGE_KEYS);

// Rôles utilisateurs
export const USER_ROLES = {
  ARTIST: 'artist',
  BOOKER: 'booker',
  ADMIN: 'admin'
};

// Statuts des réservations
export const BOOKING_STATUS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  PAID: 'Payé',
  CANCELLED: 'Annulé'
};

// Catégories de services
export const SERVICE_CATEGORIES = {
  MUSICIAN: 'musicien',
  DJ: 'dj',
  GROUP: 'groupe',
  COMEDIAN: 'humoriste'
};

// Options de tri
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  POPULAR: 'popular',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  RATING: 'rating'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Impossible de contacter le serveur',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette fonctionnalité',
  FORBIDDEN: 'Vous n\'avez pas les droits nécessaires pour effectuer cette action',
  NOT_FOUND: 'La ressource demandée n\'existe pas',
  SERVER_ERROR: 'Une erreur est survenue sur le serveur'
}; 
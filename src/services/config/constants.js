// Configuration de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Clés pour le localStorage
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Identifiants incorrects, veuillez réessayer.',
  REGISTER_FAILED: 'Échec de l\'inscription. Veuillez vérifier vos informations.',
  NETWORK_ERROR: 'Problème de connexion au serveur. Veuillez réessayer plus tard.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  VERIFICATION_FAILED: 'Échec de la vérification. Veuillez réessayer avec un code valide.',
  DEFAULT: 'Une erreur est survenue. Veuillez réessayer plus tard.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie.',
  REGISTER_SUCCESS: 'Inscription réussie. Veuillez vérifier votre téléphone pour le code de vérification.',
  VERIFICATION_SUCCESS: 'Votre compte a été vérifié avec succès.',
  PASSWORD_RESET: 'Votre mot de passe a été réinitialisé avec succès.',
  LOGOUT_SUCCESS: 'Vous avez été déconnecté avec succès.'
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REGISTER_BOOKER: '/auth/register-booker',
  REGISTER_ARTIST: '/auth/register-artist',
  VERIFY: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  BOOKER_DASHBOARD: '/app/booker',
  ARTIST_DASHBOARD: '/app/artist'
};

// Rôles utilisateur
export const USER_ROLES = {
  BOOKER: 'booker',
  ARTIST: 'artist',
  ADMIN: 'admin'
}; 
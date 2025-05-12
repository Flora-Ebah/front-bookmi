import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { ROUTES, USER_ROLES } from '../services/config/constants';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Fonction pour mettre à jour l'état d'authentification
  const updateAuthState = (user = null) => {
    setCurrentUser(user);
    setIsAuthenticated(!!user);
  };

  // Vérification de l'état d'authentification au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        // Vérifier si un token est présent
        if (authService.isAuthenticated()) {
          // Récupérer les informations de l'utilisateur depuis le stockage local
          const user = authService.getUser();
          
          if (user) {
            updateAuthState(user);
            
            // Tenter de récupérer les données à jour de l'utilisateur
            try {
              const updatedUser = await authService.getMe();
              updateAuthState(updatedUser);
            } catch (error) {
              console.error('Failed to fetch updated user data');
            }
          } else {
            // Si pas d'utilisateur, on essaye de récupérer les informations
            try {
              const user = await authService.getMe();
              updateAuthState(user);
            } catch (error) {
              // Si on ne peut pas récupérer l'utilisateur, on déconnecte
              authService.clearSession();
              updateAuthState(null);
            }
          }
        } else {
          updateAuthState(null);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        updateAuthState(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      updateAuthState(response.user);
      
      // Rediriger vers le tableau de bord approprié
      const role = response.user.role;
      if (role === USER_ROLES.BOOKER) {
        navigate(ROUTES.BOOKER_DASHBOARD);
      } else if (role === USER_ROLES.ARTIST) {
        navigate(ROUTES.ARTIST_DASHBOARD);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription pour les bookers
  const registerBooker = async (bookerData) => {
    setLoading(true);
    try {
      const response = await authService.registerBooker(bookerData);
      updateAuthState(response.user);
      
      // Si l'utilisateur n'est pas vérifié, rediriger vers la page de vérification
      if (response.user && !response.user.isVerified) {
        navigate(ROUTES.VERIFY, { state: { email: response.user.email } });
      } else {
        navigate(ROUTES.BOOKER_DASHBOARD);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription pour les artistes
  const registerArtist = async (artistData) => {
    setLoading(true);
    try {
      const response = await authService.registerArtist(artistData);
      updateAuthState(response.user);
      
      // Si l'utilisateur n'est pas vérifié, rediriger vers la page de vérification
      if (response.user && !response.user.isVerified) {
        navigate(ROUTES.VERIFY, { state: { email: response.user.email } });
      } else {
        navigate(ROUTES.ARTIST_DASHBOARD);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de vérification de compte
  const verifyAccount = async (verificationData) => {
    setLoading(true);
    try {
      const response = await authService.verifyAccount(verificationData);
      
      // Mettre à jour l'état avec les données renvoyées par la vérification
      if (response.user) {
        updateAuthState(response.user);
        
        // Rediriger vers le tableau de bord approprié
        if (response.user.role === USER_ROLES.BOOKER) {
          navigate(ROUTES.BOOKER_DASHBOARD);
        } else if (response.user.role === USER_ROLES.ARTIST) {
          navigate(ROUTES.ARTIST_DASHBOARD);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      updateAuthState(null);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de mise à jour des informations utilisateur
  const updateUserDetails = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.updateUserDetails(userData);
      const updatedUser = response.data;
      updateAuthState(updatedUser);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    registerBooker,
    registerArtist,
    verifyAccount,
    logout,
    updateUserDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 
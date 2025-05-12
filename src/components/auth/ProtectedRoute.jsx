import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../services/config/constants';

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu à afficher si l'utilisateur est authentifié
 * @param {Array<string>} [props.allowedRoles] - Les rôles autorisés à accéder à cette route
 * @returns {React.ReactNode} Le contenu ou une redirection
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Si le chargement est en cours, on affiche un chargement
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bookmi-blue"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, on redirige vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Si des rôles sont spécifiés, vérifier que l'utilisateur a le rôle requis
  if (allowedRoles && allowedRoles.length > 0) {
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      // Rediriger vers le tableau de bord approprié en fonction du rôle
      if (currentUser.role === 'booker') {
        return <Navigate to={ROUTES.BOOKER_DASHBOARD} replace />;
      } else if (currentUser.role === 'artist') {
        return <Navigate to={ROUTES.ARTIST_DASHBOARD} replace />;
      } else {
        return <Navigate to={ROUTES.HOME} replace />;
      }
    }
  }

  // Si l'utilisateur est authentifié et a le rôle requis, on affiche le contenu
  return children;
};

export default ProtectedRoute; 
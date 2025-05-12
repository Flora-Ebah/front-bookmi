import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

// Créer le contexte
const ToastContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider');
  }
  return context;
};

// Provider du contexte
export const ToastProvider = ({ children }) => {
  // État local pour une éventuelle configuration
  const [toastConfig, setToastConfig] = useState({
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });

  // Fonction pour afficher un toast
  const showToast = (type, message, options = {}) => {
    const config = { ...toastConfig, ...options };
    
    switch (type) {
      case 'success':
        toast.success(message, config);
        break;
      case 'error':
        toast.error(message, config);
        break;
      case 'info':
        toast.info(message, config);
        break;
      case 'warning':
        toast.warning(message, config);
        break;
      default:
        toast(message, config);
    }
  };

  // Fonctions pour les différents types de toast
  const success = (message, options = {}) => showToast('success', message, options);
  const error = (message, options = {}) => showToast('error', message, options);
  const info = (message, options = {}) => showToast('info', message, options);
  const warning = (message, options = {}) => showToast('warning', message, options);

  // Mettre à jour la configuration globale des toasts
  const updateConfig = (newConfig) => {
    setToastConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Valeur du contexte
  const value = {
    showToast,
    success,
    error,
    info,
    warning,
    updateConfig,
    config: toastConfig
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext; 
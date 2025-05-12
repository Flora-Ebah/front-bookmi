import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

/**
 * Type d'icône en fonction du type de notification
 */
const NOTIFICATION_ICONS = {
  'new_reservation': <FiCalendar className="w-4 h-4 text-blue-500" />,
  'reservation_confirmed': <FiCheckCircle className="w-4 h-4 text-green-500" />,
  'reservation_completed': <FiCheck className="w-4 h-4 text-teal-500" />,
  'reservation_cancelled': <FiX className="w-4 h-4 text-red-500" />,
  'payment_received': <FiCheck className="w-4 h-4 text-green-500" />,
  'payment_confirmed': <FiCheckCircle className="w-4 h-4 text-emerald-500" />,
  'payment_refunded': <FiCheck className="w-4 h-4 text-orange-500" />,
  'payment_failed': <FiX className="w-4 h-4 text-red-500" />,
  'message_received': <FiClock className="w-4 h-4 text-purple-500" />,
  'review_received': <FiStar className="w-4 h-4 text-yellow-500" />,
  'service_booked': <FiCalendar className="w-4 h-4 text-blue-500" />
};

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Charger les notifications au montage et quand le dropdown s'ouvre
  useEffect(() => {
    // Charger le compteur de notifications non lues au montage
    fetchUnreadCount();
    
    // Charger les notifications si le dropdown est ouvert
    if (isOpen) {
      fetchNotifications();
    }
    
    // Mettre à jour le compteur toutes les minutes
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ limit: 10 });
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur de notifications:', error);
    }
  };
  
  const handleNotificationClick = async (notification) => {
    try {
      // Marquer la notification comme lue
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id 
              ? { ...n, isRead: true } 
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Rediriger vers la page appropriée selon le type de notification
      if (notification.relatedModel === 'Reservation' && notification.relatedId) {
        // Déterminer l'URL selon le rôle de l'utilisateur (artist ou booker)
        const role = notification.recipientModel === 'Artist' ? 'artist' : 'booker';
        navigate(`/app/${role}/events/${notification.relatedId}`);
      }
      
      // Fermer le dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Mettre à jour localement
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };
  
  // Formater la date relative
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de notification avec compteur */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5 text-gray-600" />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-6 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map(notification => (
                  <div 
                    key={notification._id}
                    className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {NOTIFICATION_ICONS[notification.type] || <FiAlertCircle className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="ml-2 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">Aucune notification</p>
              </div>
            )}
          </div>
          
          <div className="py-2 px-4 bg-gray-50 border-t text-center">
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => navigate('/app/notifications')}
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
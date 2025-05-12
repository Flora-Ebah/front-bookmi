import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  TextArea, 
  Select,
  Radio,
  StepIndicator,
  Card
} from '../../components/ui';
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiCheck, FiInfo, FiUser, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import BookerLayout from './layouts/BookerLayout';
import ServiceArtistBooker from '../../services/ServiceArtistBooker';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const ReservationPage = () => {
  const { artistId, serviceId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState('');
  const [serviceDetails, setServiceDetails] = useState(null);
  const [artistDetails, setArtistDetails] = useState(null);
  const [artistServices, setArtistServices] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    eventType: '',
    notes: '',
    paymentMethod: 'mtn',
    paymentNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    serviceId: '',
    artistId: artistId || ''
  });

  // Charger les détails du service et de l'artiste
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoadingService(true);
        console.log("Paramètres URL - serviceId:", serviceId, "artistId:", artistId);
        
        if (serviceId) {
          // L'utilisateur vient d'un service spécifique
          try {
            console.log("Récupération du service spécifique:", serviceId);
            const serviceResponse = await ServiceArtistBooker.getService(serviceId);
            console.log("Service response:", serviceResponse);
            
            // Extraire le service en fonction de la structure de la réponse
            let service;
            if (serviceResponse && serviceResponse.data) {
              service = serviceResponse.data;
            } else {
              throw new Error("Format de réponse de service inattendu");
            }
            
            console.log("Service traité:", service);
            
            if (service) {
              setServiceDetails(service);
              console.log("Prix du service:", service.price);
              console.log("Service actif:", service.active);
              
              setFormData(prev => ({
                ...prev,
                serviceId: service._id || '',
                artistId: service.artist?._id || artistId || '',
              }));

              // Récupérer les détails de l'artiste
              if (service.artist && service.artist._id) {
                const artistResponse = await ServiceArtistBooker.getArtistDetails(service.artist._id);
                console.log("Artiste response pour le service:", artistResponse);
                
                if (artistResponse && artistResponse.data) {
                  setArtistDetails(artistResponse.data);
                  
                  // Récupérer tous les services de l'artiste pour référence
                  const servicesResponse = await ServiceArtistBooker.getArtistServices(service.artist._id);
                  console.log("Services de l'artiste:", servicesResponse);
                  
                  if (servicesResponse && servicesResponse.data) {
                    setArtistServices(servicesResponse.data);
                  }
                }
              } else {
                console.error("Données d'artiste manquantes dans le service");
              }
            } else {
              setError("Le service demandé n'a pas été trouvé");
            }
          } catch (serviceError) {
            console.error("Erreur lors de la récupération du service:", serviceError);
            setError("Impossible de charger les détails du service");
          }
        } else if (artistId) {
          // L'utilisateur vient directement du profil de l'artiste
          try {
            console.log("Récupération de l'artiste:", artistId);
            const artistResponse = await ServiceArtistBooker.getArtistDetails(artistId);
            console.log("Artiste response:", artistResponse);
            
            let artist;
            if (artistResponse && artistResponse.data) {
              artist = artistResponse.data;
            } else {
              throw new Error("Format de réponse d'artiste inattendu");
            }
            
            if (artist) {
              setArtistDetails(artist);
              
              // Récupérer tous les services de l'artiste
              const servicesResponse = await ServiceArtistBooker.getArtistServices(artistId);
              console.log("Services de l'artiste:", servicesResponse);
              
              let artistServices = [];
              if (servicesResponse && servicesResponse.data) {
                artistServices = servicesResponse.data;
                setArtistServices(artistServices);
                
                if (artistServices.length > 0) {
                  // Sélectionner le premier service par défaut
                  const defaultService = artistServices[0];
                  console.log("Service par défaut:", defaultService);
                  setServiceDetails(defaultService);
                  setFormData(prev => ({
                    ...prev,
                    serviceId: defaultService._id || '',
                  }));
                } else {
                  setError("Cet artiste n'a pas de services disponibles");
                }
              } else {
                setError("Impossible de récupérer les services de l'artiste");
              }
            }
          } catch (artistError) {
            console.error("Erreur lors de la récupération de l'artiste:", artistError);
            setError("Impossible de charger les détails de l'artiste");
          }
        } else {
          setError("Aucun artiste ou service spécifié");
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des détails");
        console.error(error);
      } finally {
        setLoadingService(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, artistId]);

  // Définition des étapes du formulaire
  const steps = [
    { 
      id: 'event-details', 
      title: 'Détails',
      subtitle: 'Date et type',
      icon: <FiCalendar /> 
    },
    { 
      id: 'location', 
      title: 'Lieu',
      subtitle: 'Adresse',
      icon: <FiMapPin /> 
    },
    { 
      id: 'payment', 
      title: 'Paiement',
      subtitle: 'Méthode',
      icon: <FiCreditCard /> 
    },
    { 
      id: 'confirmation', 
      title: 'Confirmation',
      subtitle: 'Vérification',
      icon: <FiCheck /> 
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Types d'événements
  const eventTypes = [
    { value: 'mariage', label: 'Mariage' },
    { value: 'anniversaire', label: 'Anniversaire' },
    { value: 'entreprise', label: 'Événement d\'entreprise' },
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
    { value: 'autre', label: 'Autre' }
  ];

  // Options de paiement
  const paymentMethods = [
    { 
      value: 'orange', 
      label: 'Orange Money', 
      icon: <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white"><FiSmartphone size={16} /></div> 
    },
    { 
      value: 'mtn', 
      label: 'MTN Mobile Money', 
      icon: <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white"><FiSmartphone size={16} /></div> 
    },
    { 
      value: 'moov', 
      label: 'Moov Money', 
      icon: <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><FiSmartphone size={16} /></div> 
    },
    { 
      value: 'wave', 
      label: 'Wave', 
      icon: <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white"><FiSmartphone size={16} /></div> 
    },
    { 
      value: 'visa', 
      label: 'Carte VISA', 
      icon: <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white"><FiCreditCard size={16} /></div> 
    }
  ];

  // Calcul des frais de réservation (5%)
  const calculateReservationFee = () => {
    if (!serviceDetails) return 0;
    const price = parseFloat(serviceDetails.price);
    if (isNaN(price)) return 0;
    return price * 0.05;
  };

  // Calcul du total à payer
  const calculateTotal = () => {
    if (!serviceDetails) return 0;
    const price = parseFloat(serviceDetails.price);
    if (isNaN(price)) return 0;
    return price + calculateReservationFee();
  };

  // Navigation entre les étapes
  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (index) => {
    if (index <= currentStep) {
      setCurrentStep(index);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!authService.isAuthenticated()) {
        setError("Vous devez être connecté pour effectuer une réservation. Veuillez vous reconnecter.");
        toast.error("Session expirée ou utilisateur non connecté");
        return;
      }
      
      // Récupérer les informations de l'utilisateur connecté
      const currentUser = authService.getUser();
      console.log("Utilisateur complet:", currentUser);
      
      // Récupérer le token pour vérification
      const token = localStorage.getItem('token');
      console.log("Token présent:", !!token);
      
      // Déterminer l'ID du booker selon la structure observée
      let bookerId = null;
      
      // Vérifier les différentes structures possibles
      if (currentUser) {
        if (currentUser._id) {
          bookerId = currentUser._id; // Si l'utilisateur a directement un _id
        } else if (currentUser.booker) {
          bookerId = currentUser.booker; // Si l'utilisateur a une propriété booker
        } else if (currentUser.id) {
          bookerId = currentUser.id; // Autre possibilité
        }
      }
      
      console.log("ID du booker identifié:", bookerId);
      
      if (!bookerId) {
        setError("Impossible d'identifier votre ID de booker. Veuillez vous reconnecter.");
        toast.error("Session invalide ou incomplète");
        return;
      }
      
      // Préparation des données dans le format attendu par l'API
      const reservationData = {
        serviceId: formData.serviceId,
        artistId: formData.artistId,
        booker: bookerId, // Ajouter explicitement l'ID du booker
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        eventType: formData.eventType,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        amount: calculateTotal(),
        serviceFee: calculateReservationFee()
      };
      
      // Ajouter les informations de paiement selon la méthode
      if (['orange', 'mtn', 'moov', 'wave'].includes(formData.paymentMethod)) {
        reservationData.paymentNumber = formData.paymentNumber;
      } else if (formData.paymentMethod === 'visa') {
        reservationData.cardNumber = formData.cardNumber;
        reservationData.expiryDate = formData.expiryDate;
        reservationData.cvv = formData.cvv;
        reservationData.cardName = formData.cardName;
      }
      
      console.log("Envoi des données de réservation:", reservationData);
      console.log("Utilisateur authentifié:", authService.isAuthenticated());
      
      // Appel API pour créer la réservation
      const response = await ServiceArtistBooker.createReservation(reservationData);
      
      // Notification déjà gérée côté serveur lors de la création de la réservation
      // Le backend crée automatiquement une notification pour l'artiste l'informant
      // qu'une nouvelle réservation a été effectuée par un booker
      
      toast.success('Réservation créée avec succès !');
      navigate('/app/booker/bookings');
    } catch (error) {
      setError(error.message || 'Erreur lors de la création de la réservation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer le service sélectionné
  const handleServiceChange = (e) => {
    const selectedServiceId = e.target.value;
    console.log("Service sélectionné ID:", selectedServiceId);
    
    const selectedService = artistServices.find(service => service._id === selectedServiceId);
    
    if (selectedService) {
      console.log("Service sélectionné depuis le select:", selectedService);
      
      // Vérifier si le service est actif
      if (selectedService.active === false) {
        toast.warning("Ce service n'est pas disponible actuellement");
        return;
      }
      
      // Mettre à jour les détails du service et le formulaire
      setServiceDetails(selectedService);
      setFormData(prev => ({
        ...prev,
        serviceId: selectedServiceId,
      }));
      
      // Reset potential error
      if (error) setError("");
    } else {
      console.error("Service non trouvé dans la liste des services disponibles");
      toast.error("Service non trouvé. Veuillez sélectionner un autre service.");
    }
  };

  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    if (loadingService) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bookmi-blue"></div>
        </div>
      );
    }

    switch (currentStep) {
      case 0: // Détails de l'événement
        return (
          <div className="space-y-6">
            {artistDetails && serviceDetails && (
              <Card className="p-4 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={artistDetails.profilePhoto || 'https://via.placeholder.com/64'} 
                    alt={artistDetails.artistName || 'Artiste'} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{artistDetails.artistName || 'Artiste'}</h3>
                  <p className="text-gray-600">{serviceDetails?.title || 'Service'}</p>
                  {serviceDetails?.price && (
                    <p className="text-bookmi-blue font-semibold mt-1">
                      {serviceDetails.price.toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Sélection du service (uniquement si on vient directement du profil de l'artiste) */}
            {!serviceId && artistServices.length > 1 && (
              <div className="mb-4">
                <Select
                  label="Service à réserver"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleServiceChange}
                  options={artistServices
                    .filter(service => service.active !== false) // N'afficher que les services actifs
                    .map(service => ({
                      value: service._id,
                      label: `${service.title} - ${service.price.toLocaleString()} FCFA${service.active === false ? ' (Indisponible)' : ''}`
                    }))}
                  required
                  helperText="Choisissez le service que vous souhaitez réserver parmi les prestations disponibles"
                />
              </div>
            )}

            <Input
              label="Date de l'événement"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              helperText="Choisissez la date de votre événement"
            />
            
            <Select
              label="Type d'événement"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              options={eventTypes}
              required
              helperText="Sélectionnez le type d'événement"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Heure de début"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                helperText="Indiquez l'heure de début"
              />
              
              <Input
                label="Heure de fin"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                helperText="Indiquez l'heure de fin prévue"
              />
            </div>
          </div>
        );
        
      case 1: // Localisation
        return (
          <div className="space-y-6">
            <Input
              label="Adresse de l'événement"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              helperText="Indiquez l'adresse complète où se déroulera l'événement"
            />
            
            <TextArea
              label="Notes supplémentaires"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ajoutez des informations complémentaires sur l'événement..."
              rows={5}
              helperText="Précisez tous les détails importants pour l'artiste"
            />
          </div>
        );
        
      case 2: // Paiement
        return (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800">Informations de paiement</h4>
              </div>
              
              <div className="p-4 md:p-6 space-y-4">
                {serviceDetails && (
                  <div className="mb-5 flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      {artistDetails && artistDetails.profilePhoto && (
                        <img 
                          src={artistDetails.profilePhoto} 
                          alt={artistDetails.artistName || 'Artiste'} 
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium">{serviceDetails.title || 'Service'}</p>
                        {artistDetails && (
                          <p className="text-sm text-gray-500">{artistDetails.artistName || 'Artiste'}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-bookmi-blue text-lg">
                        {serviceDetails && !isNaN(parseFloat(serviceDetails.price)) 
                          ? parseFloat(serviceDetails.price).toLocaleString()
                          : '0'} FCFA
                      </p>
                      {serviceDetails.active === true ? (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Montant de la prestation</span>
                  <span className="font-medium">
                    {serviceDetails && !isNaN(parseFloat(serviceDetails.price)) 
                      ? parseFloat(serviceDetails.price).toLocaleString()
                      : '0'} FCFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Frais de réservation (5%)</span>
                  <span className="font-medium">{calculateReservationFee().toLocaleString()} FCFA</span>
                </div>
                
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-medium text-gray-800">Total à payer</span>
                  <span className="font-bold text-lg text-bookmi-blue">{calculateTotal().toLocaleString()} FCFA</span>
                </div>
              </div>
            </Card>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Moyen de paiement</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <div 
                    key={method.value}
                    onClick={() => handleInputChange({ target: { name: 'paymentMethod', value: method.value } })}
                    className={`
                      cursor-pointer rounded-lg border-2 p-4 transition-all
                      ${formData.paymentMethod === method.value 
                        ? 'border-bookmi-blue bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {method.icon}
                        <span className="font-medium ml-3">{method.label}</span>
                      </div>
                      {formData.paymentMethod === method.value && (
                        <div className="w-5 h-5 rounded-full bg-bookmi-blue flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Champs supplémentaires en fonction du mode de paiement */}
              {formData.paymentMethod && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  {/* Mobile Money (Orange, MTN, Moov, Wave) */}
                  {['orange', 'mtn', 'moov', 'wave'].includes(formData.paymentMethod) && (
                    <div className="space-y-4">
                      <Input
                        label={`Numéro ${
                          formData.paymentMethod === 'orange' ? 'Orange Money' :
                          formData.paymentMethod === 'mtn' ? 'MTN Mobile Money' :
                          formData.paymentMethod === 'moov' ? 'Moov Money' :
                          'Wave'
                        }`}
                        name="paymentNumber"
                        value={formData.paymentNumber}
                        onChange={handleInputChange}
                        required
                        type="tel"
                        placeholder="Entrez votre numéro"
                      />
                    </div>
                  )}
                  
                  {/* Carte VISA */}
                  {formData.paymentMethod === 'visa' && (
                    <div className="space-y-4">
                      <Input
                        label="Numéro de carte"
                        name="cardNumber"
                        value={formData.cardNumber || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="1234 5678 9012 3456"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Date d'expiration"
                          name="expiryDate"
                          value={formData.expiryDate || ''}
                          onChange={handleInputChange}
                          required
                          placeholder="MM/AA"
                        />
                        
                        <Input
                          label="Code de sécurité (CVV)"
                          name="cvv"
                          value={formData.cvv || ''}
                          onChange={handleInputChange}
                          required
                          type="password"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                      
                      <Input
                        label="Nom sur la carte"
                        name="cardName"
                        value={formData.cardName || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="Prénom NOM"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 3: // Confirmation
        return (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800">Récapitulatif de la réservation</h4>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-2">{formData.eventType ? eventTypes.find(type => type.value === formData.eventType)?.label : 'Type non spécifié'}</span>
              </div>
              
              {artistDetails && serviceDetails && (
                <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src={artistDetails.profilePhoto || 'https://via.placeholder.com/64'} 
                        alt={artistDetails.artistName || 'Artiste'} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Artiste:</p>
                      <p className="font-medium">{artistDetails.artistName || 'Artiste'}</p>
                      <p className="text-sm text-gray-600">{serviceDetails.title || 'Service'}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Service sélectionné:</p>
                      <p className="font-semibold text-lg">{serviceDetails.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Prix:</p>
                      <p className="text-xl font-bold text-bookmi-blue">
                        {serviceDetails && !isNaN(parseFloat(serviceDetails.price)) 
                          ? parseFloat(serviceDetails.price).toLocaleString()
                          : '0'} FCFA
                      </p>
                      {serviceDetails.active === true ? (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs mt-1">
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs mt-1">
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date:</p>
                  <p className="font-medium flex items-center">
                    <FiCalendar className="mr-2 text-blue-500" />
                    {formData.date ? new Date(formData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Horaires:</p>
                  <p className="font-medium flex items-center">
                    <FiClock className="mr-2 text-blue-500" />
                    {formData.startTime && formData.endTime 
                      ? `${formData.startTime} - ${formData.endTime}` 
                      : 'Non renseignés'}
                  </p>
                </div>
              </div>
              
              <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Lieu:</p>
                <p className="font-medium flex items-center">
                  <FiMapPin className="mr-2 text-blue-500 flex-shrink-0" />
                  <span>{formData.location || 'Non renseigné'}</span>
                </p>
              </div>
              
              <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Détails du paiement:</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Prix du service</span>
                    <span className="font-medium">{serviceDetails?.price?.toLocaleString() || 0} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Frais de réservation (5%)</span>
                    <span className="font-medium">{calculateReservationFee().toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-medium text-gray-800">Total à payer</span>
                    <span className="font-bold text-lg text-bookmi-blue">{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Méthode de paiement:</p>
                  <div className="flex items-center">
                    {formData.paymentMethod === 'orange' && 
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white mr-3"><FiSmartphone size={16} /></div>}
                    {formData.paymentMethod === 'mtn' && 
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white mr-3"><FiSmartphone size={16} /></div>}
                    {formData.paymentMethod === 'moov' && 
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3"><FiSmartphone size={16} /></div>}
                    {formData.paymentMethod === 'wave' && 
                      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white mr-3"><FiSmartphone size={16} /></div>}
                    {formData.paymentMethod === 'visa' && 
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white mr-3"><FiCreditCard size={16} /></div>}
                    
                    <div>
                      <p className="font-medium">
                        {formData.paymentMethod === 'orange' ? 'Orange Money' :
                        formData.paymentMethod === 'mtn' ? 'MTN Mobile Money' :
                        formData.paymentMethod === 'moov' ? 'Moov Money' :
                        formData.paymentMethod === 'wave' ? 'Wave' :
                        formData.paymentMethod === 'visa' ? 'Carte VISA' : 'Méthode inconnue'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.paymentMethod !== 'visa' && formData.paymentNumber && `Numéro: ${formData.paymentNumber}`}
                        {formData.paymentMethod === 'visa' && formData.cardNumber && `Carte: ****${formData.cardNumber.slice(-4)}`}
                      </p>
                      {formData.paymentMethod === 'visa' && formData.cardName && (
                        <p className="text-sm text-gray-600">Titulaire: {formData.cardName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
              <FiInfo className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                En confirmant cette réservation, vous acceptez les conditions générales de service et vous engagez à payer le montant total indiqué.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <BookerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
          <p className="text-gray-600">Complétez les informations pour réserver l'artiste</p>
        </div>
        
        <div className="mb-8">
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>
        
        <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : nextStep}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
              {error}
              <button 
                type="button" 
                className="float-right" 
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}
          
          {renderStepContent()}
          
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={currentStep === 0 ? () => navigate('/app/booker/artists/' + (artistId || '')) : prevStep}
            >
              {currentStep === 0 ? 'Annuler' : 'Précédent'}
            </Button>
            
            <Button 
              type="submit"
              disabled={loading}
            >
              {currentStep === steps.length - 1 ? (loading ? 'Confirmation en cours...' : 'Confirmer la réservation') : 'Suivant'}
            </Button>
          </div>
        </form>
      </div>
    </BookerLayout>
  );
};

export default ReservationPage; 
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from '../common/PhoneInput';
import { 
  FormCard, 
  StepIndicator,
  Input, 
  Select,
  MultiSelect,
  Button, 
  Checkbox 
} from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { ERROR_MESSAGES } from '../../services/config/constants';

const RegisterArtistForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { registerArtist } = useAuth();
  const [formData, setFormData] = useState({
    // Étape 1 - Informations personnelles
    firstName: '',
    lastName: '',
    birthDate: '',
    
    // Étape 2 - Profil artistique
    hasProfessionalCard: false,
    eventTypes: [],
    artistName: '',
    projectName: '',
    discipline: '',
    
    // Étape 3 - Coordonnées
    country: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
    phone: '',
    
    // Étape 4 - Finalisation
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    acceptTerms: false,
  });

  const steps = [
    { label: 'Identité' },
    { label: 'Profil' },
    { label: 'Contact' },
    { label: 'Sécurité' }
  ];

  const eventTypeOptions = [
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
    { value: 'mariage', label: 'Mariage' },
    { value: 'soiree_privee', label: 'Soirée privée' },
    { value: 'corporate', label: 'Événement d\'entreprise' },
    { value: 'autre', label: 'Autre' },
  ];

  const disciplineOptions = [
    { value: 'music', label: 'Musique' },
    { value: 'dance', label: 'Danse' },
    { value: 'theater', label: 'Théâtre' },
    { value: 'visual', label: 'Arts visuels' },
    { value: 'circus', label: 'Arts du cirque' },
    { value: 'other', label: 'Autre' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prevState => ({
      ...prevState,
      phone: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        profilePhoto: e.target.files[0]
      }));
    }
  };

  const handleBackToProfileSelection = () => {
    navigate('/auth/register');
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.birthDate) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.artistName || !formData.discipline || formData.eventTypes.length === 0) {
        setError('Veuillez remplir tous les champs obligatoires et sélectionner au moins un type d\'événement');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.email || !formData.phone || !formData.country || !formData.city) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep(4);
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation et la politique de confidentialité');
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparation des données pour l'API
      const artistData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'artist',
        birthDate: formData.birthDate,
        hasProfessionalCard: formData.hasProfessionalCard,
        eventTypes: formData.eventTypes,
        artistName: formData.artistName,
        projectName: formData.projectName,
        discipline: formData.discipline,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      };
      
      // Traitement de la photo de profil
      if (formData.profilePhoto) {
        const formDataWithFile = new FormData();
        
        // Ajouter toutes les données de l'artiste
        Object.keys(artistData).forEach(key => {
          if (Array.isArray(artistData[key])) {
            // Traiter les tableaux comme eventTypes
            artistData[key].forEach(value => {
              formDataWithFile.append(`${key}[]`, value);
            });
          } else {
            formDataWithFile.append(key, artistData[key]);
          }
        });
        
        // Ajouter la photo de profil
        formDataWithFile.append('profilePhoto', formData.profilePhoto);
        
        // Appel au service d'authentification avec FormData
        await registerArtist(formDataWithFile);
      } else {
        // Appel au service d'authentification sans photo
        await registerArtist(artistData);
      }
      
      // La redirection est gérée par le contexte d'authentification
      // L'utilisateur sera redirigé vers la page de vérification
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      if (error.response) {
        setError(error.response.data?.error || ERROR_MESSAGES.REGISTER_FAILED);
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  // Étape 1 - Informations personnelles
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="firstName"
          name="firstName"
          label="Prénom"
          placeholder="Entrez votre prénom"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          id="lastName"
          name="lastName"
          label="Nom"
          placeholder="Entrez votre nom"
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      
      <Input
        id="birthDate"
        name="birthDate"
        type="date"
        label="Date de naissance"
        value={formData.birthDate}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleBackToProfileSelection}
          disabled={loading}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Chargement...' : 'Continuer'}
        </Button>
      </div>
    </div>
  );

  // Étape 2 - Profil artistique
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-8 py-2">
        <span className="text-gray-800 font-medium">Je possède une carte professionnelle :</span>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasProfessionalCard"
              value="true"
              checked={formData.hasProfessionalCard === true}
              onChange={() => setFormData({...formData, hasProfessionalCard: true})}
              className="form-radio h-4 w-4 text-bookmi-blue"
            />
            <span className="ml-2">Oui</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasProfessionalCard"
              value="false"
              checked={formData.hasProfessionalCard === false}
              onChange={() => setFormData({...formData, hasProfessionalCard: false})}
              className="form-radio h-4 w-4 text-bookmi-blue"
            />
            <span className="ml-2">Non</span>
          </label>
        </div>
      </div>
      
      <Input
        id="artistName"
        name="artistName"
        label="Nom d'artiste/Groupe"
        placeholder="Entrez votre nom d'artiste ou de groupe"
        value={formData.artistName}
        onChange={handleChange}
        required
        disabled={loading}
      />
      
      <Input
        id="projectName"
        name="projectName"
        label="Nom du projet"
        placeholder="Entrez le nom de votre projet"
        value={formData.projectName}
        onChange={handleChange}
        disabled={loading}
      />
      
      <MultiSelect
        id="eventTypes"
        name="eventTypes"
        label="Types d'événements recherchés"
        value={formData.eventTypes}
        onChange={handleChange}
        options={eventTypeOptions}
        required
        disabled={loading}
        placeholder="Sélectionnez un ou plusieurs types d'événements"
      />
      
      <Select
        id="discipline"
        name="discipline"
        label="Discipline"
        value={formData.discipline}
        onChange={handleChange}
        options={disciplineOptions}
        required
        disabled={loading}
      />

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep(1)}
          disabled={loading}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1"
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  // Étape 3 - Coordonnées
  const renderStep3 = () => (
    <div className="space-y-4">
      <Select
        id="country"
        name="country"
        label="Pays"
        value={formData.country}
        onChange={handleChange}
        required
        disabled={loading}
        options={[
          { value: 'france', label: 'France' },
          { value: 'belgique', label: 'Belgique' },
          { value: 'suisse', label: 'Suisse' },
          { value: 'canada', label: 'Canada' },
          { value: 'autre', label: 'Autre' },
        ]}
      />
      
      <Input
        id="address"
        name="address"
        label="Adresse"
        placeholder="Entrez votre adresse"
        value={formData.address}
        onChange={handleChange}
        disabled={loading}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="city"
          name="city"
          label="Ville"
          placeholder="Entrez votre ville"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <Input
          id="postalCode"
          name="postalCode"
          label="Code postal"
          placeholder="Code postal"
          value={formData.postalCode}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="exemple@email.com"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={loading}
      />
      
      <div>
        <label htmlFor="phone" className="block text-gray-800 font-medium mb-2 text-base">
          Téléphone *
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          required={true}
          placeholder="Entrez votre numéro de téléphone"
          disabled={loading}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep(2)}
          disabled={loading}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1"
        >
          Continuer
        </Button>
      </div>
    </div>
  );

  // Étape 4 - Finalisation
  const renderStep4 = () => (
    <div className="space-y-4">
      <Input
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        placeholder="Créez un mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirmez le mot de passe"
        placeholder="Confirmez votre mot de passe"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        disabled={loading}
      />
      
      <div>
        <label htmlFor="profilePhoto" className="block text-gray-800 font-medium mb-2 text-base">
          Photo de profil
        </label>
        <div className="flex items-center">
          <input
            id="profilePhoto"
            name="profilePhoto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          <label 
            htmlFor="profilePhoto" 
            className="cursor-pointer px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Choisir
          </label>
          <span className="ml-3 text-gray-600 text-sm">
            {formData.profilePhoto ? formData.profilePhoto.name : 'Aucun fichier sélectionné'}
          </span>
        </div>
      </div>

      <Checkbox
        id="acceptTerms"
        name="acceptTerms"
        checked={formData.acceptTerms}
        onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
        disabled={loading}
        className="pt-4"
      >
        <div className="text-sm select-none">
          J'accepte les{' '}
          <Link 
            to="/terms" 
            className="font-medium text-bookmi-blue hover:text-primary-light transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            Conditions d'utilisation
          </Link>
          {' '}et la{' '}
          <Link 
            to="/privacy" 
            className="font-medium text-bookmi-blue hover:text-primary-light transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            Politique de confidentialité
          </Link>
        </div>
      </Checkbox>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep(3)}
          disabled={loading}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Inscription en cours...' : 'Finaliser'}
        </Button>
      </div>
    </div>
  );

  return (
    <FormCard
      title="Inscrivez-vous en tant qu'artiste"
      subtitle="Ou"
      linkText="connectez-vous à votre compte existant"
      linkUrl="/auth/login"
      error={error}
      onErrorClose={() => setError('')}
    >
      <StepIndicator currentStep={step} steps={steps} />
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {step === 1 ? renderStep1() 
        : step === 2 ? renderStep2() 
        : step === 3 ? renderStep3()
        : renderStep4()}
      </form>
    </FormCard>
  );
};

export default RegisterArtistForm; 
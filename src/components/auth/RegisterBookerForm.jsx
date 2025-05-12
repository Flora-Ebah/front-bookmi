import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../common/PhoneInput';
import { 
  FormCard, 
  StepIndicator, 
  Input, 
  Select, 
  Button, 
  Checkbox 
} from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { ERROR_MESSAGES } from '../../services/config/constants';

const RegisterBookerForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { registerBooker } = useAuth();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    companyName: '',
    address: '',
    country: '',
    city: '',
    postalCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
  });

  const steps = [
    { label: 'Informations' },
    { label: 'Adresse' },
    { label: 'Sécurité' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prevState => ({
      ...prevState,
      phone: value
    }));
  };

  const handleBackToProfileSelection = () => {
    navigate('/auth/register');
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.companyName) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.address || !formData.country || !formData.city || !formData.postalCode) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      setStep(3);
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
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
      const bookerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'booker',
        companyName: formData.companyName,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      };
      
      // Appel au service d'authentification
      await registerBooker(bookerData);
      
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

  const renderStep1 = () => (
    <div className="space-y-4">
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
        id="companyName"
        name="companyName"
        label="Nom de l'entreprise"
        placeholder="Entrez le nom de votre entreprise"
        value={formData.companyName}
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
          Continuer
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <Input
        id="address"
        name="address"
        label="Adresse"
        placeholder="Entrez votre adresse"
        value={formData.address}
        onChange={handleChange}
        required
        disabled={loading}
      />
      
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
        placeholder="Entrez votre code postal"
        value={formData.postalCode}
        onChange={handleChange}
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

  const renderStep3 = () => (
    <div className="space-y-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Adresse email"
        placeholder="exemple@email.com"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div>
        <label htmlFor="phone" className="block text-gray-800 font-medium mb-2 text-base">
          Numéro de téléphone *
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={handlePhoneChange}
          required={true}
          placeholder="Entrez votre numéro de téléphone"
          disabled={loading}
        />
      </div>

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
        label="Confirmer le mot de passe"
        placeholder="Confirmez votre mot de passe"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        disabled={loading}
      />

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
          <a 
            href="/terms" 
            className="font-medium text-bookmi-blue hover:text-primary-light transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            Conditions d'utilisation
          </a>
          {' '}et la{' '}
          <a 
            href="/privacy" 
            className="font-medium text-bookmi-blue hover:text-primary-light transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            Politique de confidentialité
          </a>
        </div>
      </Checkbox>

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
      title="Inscrivez-vous en tant que booker"
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
        : renderStep3()}
      </form>
    </FormCard>
  );
};

export default RegisterBookerForm; 
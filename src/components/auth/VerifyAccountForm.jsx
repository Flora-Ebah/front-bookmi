import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormCard, Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from '../../services/config/constants';

// Composant pour le code de vérification
const VerifyAccountForm = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyAccount } = useAuth();

  // Récupérer l'email depuis l'état de la route ou le localStorage
  useEffect(() => {
    const emailFromState = location.state?.email;
    const userStr = localStorage.getItem('user');
    let userEmail = '';
    
    if (emailFromState) {
      userEmail = emailFromState;
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.email) {
          userEmail = user.email;
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // Si pas d'email, rediriger vers la page de connexion
      navigate(ROUTES.LOGIN);
    }
  }, [location, navigate]);

  // Gestion du compteur pour le bouton de renvoi de code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Veuillez entrer le code de vérification');
      return;
    }
    
    if (!email) {
      setError('Email introuvable. Veuillez vous reconnecter');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await verifyAccount({ email, code: verificationCode });
      setSuccess(SUCCESS_MESSAGES.VERIFICATION_SUCCESS);
      
      // La redirection est gérée par le service d'authentification
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.response) {
        setError(error.response.data?.error || ERROR_MESSAGES.VERIFICATION_FAILED);
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  // Gérer le renvoi du code de vérification
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    if (!email) {
      setError('Email introuvable. Veuillez vous reconnecter');
      return;
    }
    
    setResendLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.resendVerificationCode(email);
      setSuccess('Un nouveau code de vérification a été envoyé');
      setCountdown(60); // Bloquer le renvoi pendant 60 secondes
    } catch (error) {
      console.error('Resend code error:', error);
      
      if (error.response) {
        setError(error.response.data?.error || 'Erreur lors de l\'envoi du code');
      } else {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <FormCard
      title="Vérification de compte"
      subtitle="Vérifiez votre numéro de téléphone"
      error={error}
      onErrorClose={() => setError('')}
      success={success}
      onSuccessClose={() => setSuccess('')}
    >
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Un code de vérification a été envoyé au numéro de téléphone associé à votre compte.
          Veuillez entrer ce code ci-dessous pour vérifier votre compte.
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          id="verificationCode"
          name="verificationCode"
          type="text"
          label="Code de vérification"
          placeholder="Entrez le code à 6 chiffres reçu par SMS"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
          disabled={loading}
          maxLength={6}
          className="text-center text-xl tracking-wide"
        />
        
        <Button
          type="submit"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Vérification en cours...' : 'Vérifier mon compte'}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Vous n'avez pas reçu de code ?
          </p>
          <Button
            type="button"
            variant="text"
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
          >
            {countdown > 0 
              ? `Renvoyer un code (${countdown}s)` 
              : resendLoading 
                ? 'Envoi en cours...' 
                : 'Renvoyer un code'}
          </Button>
        </div>
      </form>
    </FormCard>
  );
};

export default VerifyAccountForm; 
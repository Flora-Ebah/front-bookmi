import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormCard } from '../ui';

const RegistrationSuccess = ({ userType }) => {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/auth/login');
  };

  const handleNavigateToHome = () => {
    navigate('/');
  };

  return (
    <FormCard
      title="Inscription réussie !"
    >
      <div className="text-center mb-6">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        <p className="text-lg text-gray-700 font-medium">
          Vous recevrez un SMS avec un code pour vérifier votre compte.
        </p>
        <p className="mt-3 text-gray-600">
          Merci de vous être inscrit{userType === 'artist' ? '(e)' : ''} en tant que {userType === 'artist' ? 'artiste' : 'booker'} sur BookMi.
        </p>
      </div>
      
      <div className="space-y-4 mt-8">
        <Button
          type="button"
          onClick={handleNavigateToLogin}
          className="w-full"
        >
          Se connecter
        </Button>
        
        <Button
          type="button"
          onClick={handleNavigateToHome}
          variant="secondary"
          className="w-full"
        >
          Retour à l'accueil
        </Button>
      </div>
    </FormCard>
  );
};

export default RegistrationSuccess; 
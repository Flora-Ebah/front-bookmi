import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormCard, SectionTitle, CardOption } from '../ui';

const RegisterForm = () => {
  const navigate = useNavigate();

  const handleBookerClick = () => {
    navigate('/auth/register-booker');
  };

  const handleArtistClick = () => {
    navigate('/auth/register-artist');
  };

  const bookerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const artistIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );

  return (
    <FormCard 
      title="Créer un compte" 
      subtitle="Ou" 
      linkText="connectez-vous à votre compte existant" 
      linkUrl="/auth/login"
    >
      <div className="space-y-6">
        <SectionTitle 
          title="Choisissez votre profil" 
          subtitle="Sélectionnez le type de compte que vous souhaitez créer" 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <CardOption
            title="Booker"
            description="Je cherche à réserver des artistes"
            icon={bookerIcon}
            onClick={handleBookerClick}
          />
          
          <CardOption
            title="Artiste"
            description="Je propose mes services artistiques"
            icon={artistIcon}
            onClick={handleArtistClick}
          />
        </div>
      </div>
    </FormCard>
  );
};

export default RegisterForm; 
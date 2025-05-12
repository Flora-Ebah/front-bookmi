import React from 'react';

const ProfileCard = ({ artist }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Bannière et photo de profil */}
      <div className="relative h-40 bg-gradient-to-r from-bookmi-blue to-primary-light">
        <div className="absolute -bottom-12 left-6">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden">
            {artist.profileImage ? (
              <img 
                src={artist.profileImage} 
                alt={artist.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl font-bold">
                  {artist.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Informations de l'artiste */}
      <div className="pt-14 px-6 pb-6">
        <h2 className="text-xl font-bold text-gray-800">{artist.name}</h2>
        <p className="text-gray-600 mt-1">{artist.discipline}</p>
        
        <div className="mt-4 space-y-3">
          {artist.location && (
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{artist.location}</span>
            </div>
          )}
          
          {artist.eventTypes && artist.eventTypes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {artist.eventTypes.map((type, index) => (
                <span 
                  key={index}
                  className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {artist.bio && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">À propos</h3>
            <p className="text-gray-600 text-sm">{artist.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard; 
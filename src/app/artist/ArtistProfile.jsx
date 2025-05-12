import React, { useState } from 'react';
import ArtistLayout from './layouts/ArtistLayout';
import ProfileCard from './components/ProfileCard';
import { Button, Input, Select, MultiSelect } from '../../components/ui';
import { FiEdit } from 'react-icons/fi';

const ArtistProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [artist, setArtist] = useState({
    name: 'Jean Dupont',
    artistName: 'JD Music',
    discipline: 'Musique',
    location: 'Paris, France',
    bio: 'Musicien professionnel avec 10 ans d\'expérience dans la production musicale et la performance live.',
    eventTypes: ['Concert', 'Festival', 'Événement d\'entreprise'],
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    profileImage: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArtist(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventTypesChange = (e) => {
    setArtist(prev => ({
      ...prev,
      eventTypes: e.target.value
    }));
  };

  const handleSaveChanges = () => {
    console.log('Profil mis à jour:', artist);
    setIsEditing(false);
  };

  const eventTypeOptions = [
    { value: 'Concert', label: 'Concert' },
    { value: 'Festival', label: 'Festival' },
    { value: 'Mariage', label: 'Mariage' },
    { value: 'Soirée privée', label: 'Soirée privée' },
    { value: 'Événement d\'entreprise', label: 'Événement d\'entreprise' },
    { value: 'Autre', label: 'Autre' },
  ];

  const disciplineOptions = [
    { value: 'Musique', label: 'Musique' },
    { value: 'Danse', label: 'Danse' },
    { value: 'Théâtre', label: 'Théâtre' },
    { value: 'Arts visuels', label: 'Arts visuels' },
    { value: 'Arts du cirque', label: 'Arts du cirque' },
    { value: 'Autre', label: 'Autre' },
  ];

  return (
    <ArtistLayout>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="secondary"
              className="flex items-center"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>

        {!isEditing ? (
          // Mode visualisation
          <ProfileCard artist={artist} />
        ) : (
          // Mode édition
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('profile-photo').click()}>
                      <span className="text-gray-500 text-2xl font-bold">
                        {artist.name.charAt(0)}
                      </span>
                      <input 
                        type="file" 
                        id="profile-photo"
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setArtist(prev => ({
                                ...prev,
                                profileImage: e.target.result
                              }));
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-16 px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  name="name"
                  label="Nom complet"
                  value={artist.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  id="artistName"
                  name="artistName"
                  label="Nom d'artiste"
                  value={artist.artistName}
                  onChange={handleChange}
                  required
                />

                <Select
                  id="discipline"
                  name="discipline"
                  label="Discipline"
                  value={artist.discipline}
                  onChange={handleChange}
                  options={disciplineOptions}
                  required
                />

                <Input
                  id="location"
                  name="location"
                  label="Localisation"
                  value={artist.location}
                  onChange={handleChange}
                  required
                />

                <div className="md:col-span-2">
                  <MultiSelect
                    id="eventTypes"
                    name="eventTypes"
                    label="Types d'événements"
                    value={artist.eventTypes}
                    onChange={handleEventTypesChange}
                    options={eventTypeOptions.map(opt => ({ ...opt, value: opt.value }))}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-gray-800 font-medium mb-2 text-base">
                    Biographie
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={artist.bio}
                    onChange={handleChange}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:border-bookmi-blue"
                    rows={4}
                  />
                </div>

                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={artist.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  id="phone"
                  name="phone"
                  label="Téléphone"
                  value={artist.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveChanges}
                  className="flex-1"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ArtistLayout>
  );
};

export default ArtistProfile; 
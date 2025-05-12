import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  TextArea, 
  Select,
  Checkbox,
  StepIndicator
} from '../../../components/ui';
import { FiPlus, FiTrash2, FiCheck, FiImage, FiLink, FiUpload } from 'react-icons/fi';

const ServiceFormSteps = ({ 
  service = null, 
  onSubmit, 
  onCancel 
}) => {
  // État des étapes du formulaire
  const [currentStep, setCurrentStep] = useState(0);
  
  // État initial par défaut ou à partir du service à modifier
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    price: '',
    description: '',
    category: '',
    active: true,
    features: [],
    photos: [],
    videos: [],
    socialLinks: {
      facebook: '',
      youtube: '',
      tiktok: '',
      instagram: ''
    }
  });

  // États temporaires pour l'ajout de caractéristiques et vidéos
  const [newFeature, setNewFeature] = useState('');
  const [newVideo, setNewVideo] = useState('');

  // Mettre à jour le formulaire si un service est fourni (mode édition)
  useEffect(() => {
    if (service) {
      setFormData({
        _id: service._id || null,
        title: service.title || '',
        duration: service.duration || '',
        price: service.price || '',
        description: service.description || '',
        category: service.category || '',
        active: service.active !== undefined ? service.active : true,
        features: service.features || [],
        photos: service.photos || [],
        videos: service.videos || [],
        socialLinks: service.socialLinks || {
          facebook: '',
          youtube: '',
          tiktok: '',
          instagram: ''
        }
      });
    }
  }, [service]);

  // Options de catégorie pour le menu déroulant
  const categoryOptions = [
    { value: 'Concert', label: 'Concert' },
    { value: 'Animation', label: 'Animation' },
    { value: 'Atelier', label: 'Atelier' },
    { value: 'Cours', label: 'Cours particulier' },
    { value: 'Festival', label: 'Festival' },
    { value: 'Autre', label: 'Autre' }
  ];

  // Définition des étapes du formulaire - Réduit à 4 étapes
  const steps = [
    { 
      id: 'basics', 
      title: 'Informations de base',
      subtitle: 'Nom, prix, durée',
      icon: <FiCheck /> 
    },
    { 
      id: 'features', 
      title: 'Caractéristiques',
      subtitle: 'Points clés et réseaux',
      icon: <FiCheck /> 
    },
    { 
      id: 'media', 
      title: 'Médias',
      subtitle: 'Photos et vidéos',
      icon: <FiImage /> 
    },
    { 
      id: 'verification', 
      title: 'Confirmation',
      subtitle: 'Vérification finale',
      icon: <FiCheck /> 
    }
  ];

  // Gestionnaire de modification des champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Ajout d'une caractéristique
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  // Suppression d'une caractéristique
  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Ajout d'une vidéo YouTube
  const handleAddVideo = () => {
    if (newVideo.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo.trim()]
      }));
      setNewVideo('');
    }
  };

  // Suppression d'une vidéo
  const handleRemoveVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  // Gestionnaire d'ajout d'images (simulé pour le prototype)
  const handleAddPhoto = () => {
    // Dans une implémentation réelle, vous utiliseriez un input file et une API pour l'upload
    const dummyPhoto = `https://source.unsplash.com/random/300x200?sig=${Date.now()}`;
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, dummyPhoto]
    }));
  };

  // Suppression d'une photo
  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (index) => {
    setCurrentStep(index);
    window.scrollTo(0, 0);
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    // Construire l'objet final à soumettre
    const finalData = {
      ...formData
    };

    // Si c'est un nouveau service, ne pas inclure l'identifiant null
    if (!finalData._id) {
      delete finalData._id;
    }

    onSubmit(finalData);
  };

  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    return price ? new Intl.NumberFormat('fr-FR').format(parseInt(price)) + ' FCFA' : 'Non renseigné';
  };

  // Contenu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informations de base
        return (
          <div className="space-y-8">
            <Input
              label="Nom du service"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Concert acoustique"
              required
              helperText="Choisissez un nom accrocheur et descriptif"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Durée (heures)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Ex: 2"
                required
                helperText="Estimez la durée en heures"
                type="number"
                min="0.5"
                step="0.5"
              />
              
              <Input
                label="Prix (FCFA)"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ex: 50000"
                required
                helperText="Tarification de votre prestation"
                type="number"
                min="0"
              />
            </div>
            
            <Select
              label="Catégorie"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              required
              helperText="Choisissez la catégorie qui correspond le mieux"
            />
            
            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre prestation en détail..."
              rows={4}
              required
              helperText="Décrivez précisément ce que vous proposez, le déroulement et les avantages"
            />
            
            <Checkbox
              name="active"
              checked={formData.active}
              onChange={handleChange}
            >
              Service actif et disponible à la réservation
            </Checkbox>
          </div>
        );
        
      case 1: // Caractéristiques et réseaux sociaux
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <h4 className="text-lg font-medium mb-3">Caractéristiques du service</h4>
              <p className="text-gray-600 text-sm mb-4">
                Ajoutez les éléments qui rendent votre service unique (matériel fourni, ambiance, spécificités...)
              </p>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Ex: Inclut l'équipement sonore"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && handleAddFeature()}
                />
                <Button 
                  onClick={handleAddFeature}
                  type="button"
                  title="Ajouter cette caractéristique"
                >
                  <FiPlus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mt-4">
                {formData.features.length > 0 ? (
                  <ul className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <li 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    Aucune caractéristique ajoutée
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-medium mb-3">Liens réseaux sociaux</h4>
              <p className="text-gray-600 text-sm mb-4">
                Connectez vos réseaux sociaux pour augmenter votre visibilité
              </p>
              
              <div className="space-y-4">
                <Input
                  label="Facebook"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  placeholder="https://www.facebook.com/..."
                  icon={<FiLink />}
                />
                
                <Input
                  label="YouTube"
                  name="socialLinks.youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/..."
                  icon={<FiLink />}
                />
                
                <Input
                  label="TikTok"
                  name="socialLinks.tiktok"
                  value={formData.socialLinks.tiktok}
                  onChange={handleChange}
                  placeholder="https://www.tiktok.com/..."
                  icon={<FiLink />}
                />
                
                <Input
                  label="Instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/..."
                  icon={<FiLink />}
                />
              </div>
            </div>
          </div>
        );
        
      case 2: // Médias (photos et vidéos)
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h4 className="text-lg font-medium mb-2 flex items-center">
                <FiImage className="mr-2 text-purple-600" /> Photos de présentation
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Ajoutez des photos de qualité montrant votre prestation en action
              </p>
              
              <div className="mb-4">
                <Button 
                  onClick={handleAddPhoto}
                  type="button"
                  variant="secondary"
                  className="w-full py-8 border-dashed flex flex-col items-center justify-center"
                >
                  <FiUpload className="h-8 w-8 mb-2 text-gray-400" />
                  <span>Ajouter une photo</span>
                  <span className="text-sm text-gray-500 mt-1">Format recommandé: JPG, PNG (max 5MB)</span>
                </Button>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-40 object-cover rounded-md shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-medium mb-2 flex items-center">
                <FiLink className="mr-2 text-red-500" /> Vidéos YouTube
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Partagez des liens vers vos performances sur YouTube
              </p>
              
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && handleAddVideo()}
                />
                <Button 
                  onClick={handleAddVideo}
                  type="button"
                >
                  <FiPlus className="w-5 h-5" />
                </Button>
              </div>
              
              {formData.videos.length > 0 ? (
                <ul className="space-y-2">
                  {formData.videos.map((video, index) => (
                    <li 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <span className="truncate flex-1 mr-2">{video}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  Aucune vidéo ajoutée
                </p>
              )}
            </div>
          </div>
        );
        
      case 3: // Confirmation
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800">{formData.title || 'Titre non renseigné'}</h4>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-2">{formData.category || 'Catégorie non définie'}</span>
              </div>
              
              <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Durée:</p>
                  <p className="font-medium">{formData.duration ? `${formData.duration} heure(s)` : 'Non renseignée'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Prix:</p>
                  <p className="font-medium text-bookmi-blue">{formatPrice(formData.price)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Description:</p>
                  <p className="whitespace-pre-wrap">{formData.description || 'Non renseignée'}</p>
                </div>
              </div>
              
              {formData.features.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <h5 className="font-medium text-gray-800 mb-2">Caractéristiques</h5>
                  <ul className="space-y-1">
                    {formData.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {(formData.photos.length > 0 || formData.videos.length > 0) && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <h5 className="font-medium text-gray-800 mb-2">Médias</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Photos:</p>
                      <p className="font-medium">{formData.photos.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vidéos:</p>
                      <p className="font-medium">{formData.videos.length}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="px-6 py-4">
                <h5 className="font-medium text-gray-800 mb-2">Statut</h5>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${formData.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <span>{formData.active ? 'Actif et disponible' : 'Inactif'}</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-16">
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep}
          onStepClick={goToStep}
        />
      </div>
      
      <form className="mt-8" onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === steps.length - 1) {
          handleSubmit();
        } else {
          nextStep();
        }
      }}>
        {renderStepContent()}
        
        <div className="flex justify-between mt-10 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={currentStep === 0 ? onCancel : prevStep}
          >
            {currentStep === 0 ? 'Annuler' : 'Précédent'}
          </Button>
          
          <Button type="submit">
            {currentStep === steps.length - 1 ? 'Publier le service' : 'Suivant'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceFormSteps; 
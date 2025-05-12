import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  TextArea, 
  Select,
  Card,
  Checkbox
} from '../../../components/ui';

const ServiceForm = ({ 
  service = null, 
  onSubmit, 
  onCancel 
}) => {
  // État initial par défaut ou à partir du service à modifier
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    category: '',
    active: true
  });

  // Mettre à jour le formulaire si un service est fourni (mode édition)
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        duration: service.duration || '',
        price: service.price || '',
        category: service.category || '',
        active: service.active !== undefined ? service.active : true
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

  // Gestionnaire de modification des champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: service?.id // Conserver l'ID si on est en mode édition
    });
  };

  const isEditMode = !!service;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Modifier la prestation' : 'Ajouter une prestation'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre de la prestation"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Concert acoustique"
          required
        />
        
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez votre prestation en détail..."
          rows={4}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Durée"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Ex: 1-2 heures"
            required
          />
          
          <Input
            label="Prix"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Ex: 300€"
            required
          />
        </div>
        
        <Select
          label="Catégorie"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
          required
        />
        
        <Checkbox
          name="active"
          checked={formData.active}
          onChange={handleChange}
        >
          Service actif et disponible à la réservation
        </Checkbox>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Annuler
          </Button>
          
          <Button type="submit">
            {isEditMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ServiceForm; 
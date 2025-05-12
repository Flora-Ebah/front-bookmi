import React, { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { Button, TextArea } from './';

const RatingStars = ({ rating, setRating, size = 'default' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleMouseEnter = (index) => {
    setHoverRating(index);
  };
  
  const handleMouseLeave = () => {
    setHoverRating(0);
  };
  
  const handleClick = (index) => {
    setRating(index);
  };
  
  const starSize = size === 'large' ? 'w-8 h-8' : 'w-6 h-6';
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          className={`focus:outline-none ${starSize} text-gray-300 ${
            (hoverRating || rating) >= index ? 'text-yellow-400 fill-current' : ''
          }`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        >
          <FiStar className="w-full h-full" />
        </button>
      ))}
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, artist }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    // Validation
    if (rating === 0) {
      setError('Veuillez attribuer une note');
      return;
    }
    
    onSubmit({ rating, review });
    
    // Réinitialiser le formulaire
    setRating(0);
    setReview('');
    setError('');
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Évaluer {artist.artistName || `${artist.firstName} ${artist.lastName}`}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre note
            </label>
            <div className="flex justify-center mb-2">
              <RatingStars rating={rating} setRating={setRating} size="large" />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre avis (optionnel)
            </label>
            <TextArea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Partagez votre expérience avec cet artiste..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
            >
              Soumettre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal; 
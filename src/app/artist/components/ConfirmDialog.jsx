import React from 'react';
import { Button } from '../../../components/ui';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmation', 
  message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          
          <Button
            type="button"
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 
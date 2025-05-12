import React from 'react';
import { FiX } from 'react-icons/fi';
import ServiceFormSteps from './ServiceFormSteps';

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  service, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white lg:bg-black lg:bg-opacity-50 overflow-y-auto">
      <div className="w-full h-full lg:flex lg:items-center lg:justify-center">
        <div className="bg-white w-full h-full lg:h-auto lg:max-h-[90vh] lg:w-4/5 lg:max-w-5xl lg:rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">
              {service ? 'Modifier la prestation' : 'Ajouter une prestation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <ServiceFormSteps
              service={service}
              onSubmit={(formData) => {
                onSubmit(formData);
                onClose();
              }}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal; 
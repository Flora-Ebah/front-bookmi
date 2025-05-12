import React from 'react';

const StepIndicatorNew = ({ 
  steps, 
  currentStep = 0, 
  onStepClick,
  className = ''
}) => {
  const isCompleted = (index) => {
    return index < currentStep;
  };

  const isCurrent = (index) => {
    return index === currentStep;
  };
  
  // Vérifier si l'utilisateur peut cliquer sur une étape
  const canClick = (index) => {
    // Ne permettre de cliquer que sur les étapes précédentes ou l'étape courante + 1
    return index <= currentStep + 1 && index <= steps.length - 1;
  };

  // Version mobile : affichage simplifié avec des traits horizontaux
  const renderMobileSteps = () => (
    <div className="block md:hidden w-full mb-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Détermine si l'étape est complétée, courante ou inactive
          const stepStatus = isCompleted(index) 
            ? 'completed' 
            : isCurrent(index) 
              ? 'current' 
              : 'inactive';
              
          return (
            <div 
              key={step.id || index} 
              className="flex flex-col items-center relative"
              style={{ width: `${100 / steps.length}%` }}
            >
              {/* Connexion à gauche */}
              {index > 0 && (
                <div 
                  className={`absolute h-1 top-3.5 right-1/2 left-0 -ml-px
                    ${isCompleted(index) ? 'bg-bookmi-blue' : 'bg-gray-200'}
                  `}
                ></div>
              )}
              
              {/* Connexion à droite */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute h-1 top-3.5 left-1/2 right-0 -mr-px
                    ${isCompleted(index + 1) ? 'bg-bookmi-blue' : isCompleted(index) ? 'bg-bookmi-blue opacity-50' : 'bg-gray-200'}
                  `}
                ></div>
              )}
              
              {/* Cercle de l'étape */}
              <button
                type="button"
                onClick={() => canClick(index) && onStepClick && onStepClick(index)}
                disabled={!canClick(index)}
                className={`
                  relative z-10 flex items-center justify-center w-7 h-7 rounded-full
                  transition-all duration-200
                  ${
                    stepStatus === 'completed' 
                      ? 'bg-bookmi-blue text-white' 
                      : stepStatus === 'current'
                        ? 'bg-white border-2 border-bookmi-blue text-bookmi-blue' 
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                  }
                  ${canClick(index) ? 'cursor-pointer' : 'cursor-default opacity-70'}
                `}
              >
                {isCompleted(index) ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </button>
              
              {/* Titre (version mobile) */}
              <span 
                className={`
                  text-[10px] mt-1.5 text-center truncate max-w-full px-1
                  ${isCurrent(index) ? 'text-bookmi-blue font-medium' : isCompleted(index) ? 'text-gray-700' : 'text-gray-500'}
                `}
              >
                {step.title || step.label || `Étape ${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Version desktop : affichage complet avec cercles et titres
  const renderDesktopSteps = () => (
    <div className="hidden md:block w-full mb-10">
      {/* Barre de progression des étapes */}
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.id || index} 
            className="flex flex-col items-center relative"
            style={{ width: `${100 / steps.length}%`, maxWidth: '180px', minWidth: '90px' }}
          >
            {/* Ligne horizontale de base (grise) - à droite */}
            {index < steps.length - 1 && (
              <div 
                className="absolute h-1 bg-gray-200" 
                style={{ 
                  left: '50%', 
                  right: '0',
                  top: '19px',
                  zIndex: 0 
                }}
              ></div>
            )}
            
            {/* Ligne horizontale colorée pour les étapes complétées - à droite */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute h-1 bg-bookmi-blue transition-all duration-300`}
                style={{ 
                  left: '50%', 
                  right: '0',
                  top: '19px',
                  zIndex: 1,
                  width: isCompleted(index) ? '100%' : '0%'
                }}
              ></div>
            )}
            
            {/* Ligne horizontale de gauche */}
            {index > 0 && (
              <div 
                className="absolute h-1 bg-gray-200" 
                style={{ 
                  right: '50%', 
                  left: '0',
                  top: '19px',
                  zIndex: 0 
                }}
              ></div>
            )}
            
            {/* Ligne horizontale colorée de gauche pour les étapes complétées */}
            {index > 0 && (
              <div 
                className={`absolute h-1 bg-bookmi-blue transition-all duration-300`}
                style={{ 
                  right: '50%', 
                  left: '0',
                  top: '19px',
                  zIndex: 1,
                  width: isCompleted(index) ? '100%' : '0%'
                }}
              ></div>
            )}
            
            {/* Cercle de l'étape */}
            <button
              type="button"
              onClick={() => canClick(index) && onStepClick && onStepClick(index)}
              disabled={!canClick(index)}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full
                transition-all duration-200
                ${isCompleted(index) ? 
                  'bg-bookmi-blue text-white' : 
                  isCurrent(index) ?
                    'bg-white border-2 border-bookmi-blue text-bookmi-blue' :
                    'bg-white border-2 border-gray-200 text-gray-400'
                }
                ${canClick(index) ? 'cursor-pointer hover:shadow-md' : 'cursor-default opacity-70'}
              `}
              style={{ zIndex: 10 }}
            >
              {isCompleted(index) ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : step.icon ? (
                <span className="w-5 h-5">{step.icon}</span>
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
            
            {/* Titre et sous-titre */}
            <div className="mt-3 text-center px-1 w-full">
              <span 
                className={`
                  text-sm font-medium block mb-1
                  ${isCurrent(index) ? 'text-bookmi-blue' : isCompleted(index) ? 'text-gray-700' : 'text-gray-500'}
                `}
              >
                {step.title || step.label || `Étape ${index + 1}`}
              </span>
              {step.subtitle && (
                <span 
                  className={`
                    text-xs block leading-tight
                    ${isCurrent(index) ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {step.subtitle}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={className}>
      {renderMobileSteps()}
      {renderDesktopSteps()}
    </div>
  );
};

export default StepIndicatorNew; 
import React from 'react';

/**
 * Composant Card réutilisable
 * 
 * @param {ReactNode} children - Contenu de la carte
 * @param {ReactNode} header - Contenu de l'en-tête (optionnel)
 * @param {ReactNode} footer - Contenu du pied de page (optionnel)
 * @param {string} className - Classes CSS supplémentaires
 * @param {boolean} noPadding - Désactive le padding interne
 * @param {boolean} noShadow - Désactive l'ombre
 * @param {string} variant - Variante (default, bordered, flat)
 * @param {boolean} isInteractive - Ajoute un effet hover
 * @param {function} onClick - Fonction appelée au clic
 */
const Card = ({ 
  children,
  header,
  footer,
  className = '',
  noPadding = false,
  noShadow = false,
  variant = 'default',
  isInteractive = false,
  onClick = null,
  ...props
}) => {
  // Calculer les classes CSS en fonction des props
  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-gray-200 bg-white';
      case 'flat':
        return 'bg-gray-50';
      default:
        return 'bg-white';
    }
  };

  const shadowClasses = noShadow ? '' : 'shadow-sm';
  const paddingClasses = noPadding ? '' : 'p-6';
  const interactiveClasses = isInteractive 
    ? 'transition-all duration-200 hover:shadow-md cursor-pointer' 
    : '';

  return (
    <div 
      className={`rounded-xl overflow-hidden ${getVariantClasses()} ${shadowClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-100">
          {header}
        </div>
      )}
      
      <div className={paddingClasses}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 
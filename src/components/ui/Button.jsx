import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClasses = "font-medium text-base py-3 px-6 rounded-xl transition-colors relative overflow-hidden";
  
  const variantClasses = {
    primary: "bg-bookmi-blue hover:bg-primary-light text-white relative group",
    secondary: "border-2 border-gray-300 hover:border-bookmi-blue text-gray-700 hover:text-bookmi-blue",
    link: "text-bookmi-blue hover:text-primary-light underline"
  };
  
  const widthClasses = fullWidth ? "w-full" : "";
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {variant === 'primary' && (
        <>
          <span className="relative z-10">{children}</span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 group-hover:h-full transition-all duration-300"></div>
        </>
      )}
      {variant !== 'primary' && children}
    </button>
  );
};

export default Button; 
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false 
}) => {
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${sizeClass[size]} d-flex align-items-center justify-content-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '', disabled = false, ...props }) => {
  return (
    <button 
      type={type} 
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

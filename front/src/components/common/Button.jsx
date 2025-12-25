import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ children, variant = 'contained', color = 'primary', ...props }) => {
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      fontWeight: 600,
      textTransform: 'none',
      padding: '10px 20px',
    };

    if (variant === 'contained') {
      return {
        ...baseStyles,
        backgroundColor: color === 'primary' ? '#22c55e' : '#15803d',
        '&:hover': {
          backgroundColor: color === 'primary' ? '#16a34a' : '#166534',
        },
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        borderColor: '#22c55e',
        color: '#22c55e',
        '&:hover': {
          borderColor: '#16a34a',
          backgroundColor: '#f0fdf4',
        },
      };
    }

    return baseStyles;
  };

  return (
    <MuiButton
      variant={variant}
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
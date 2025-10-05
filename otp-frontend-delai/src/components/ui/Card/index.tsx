import React from 'react';
import { Paper, PaperProps } from '@mui/material';

interface CardProps extends Omit<PaperProps, 'variant'> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  sx = {},
  ...props
}: CardProps) {
  // Map our custom variants to Material-UI variants
  const getElevation = () => {
    switch (variant) {
      case 'elevated': return 3;
      case 'outlined': return 0;
      default: return 1;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return 1;
      case 'large': return 3;
      default: return 2;
    }
  };

  return (
    <Paper
      elevation={getElevation()}
      variant={variant === 'outlined' ? 'outlined' : 'elevation'}
      sx={{
        borderRadius: 2,
        p: getPadding(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  ...props
}: ButtonProps) {
  // Map our custom variants to Material-UI variants
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained';
  const muiColor = variant === 'secondary' ? 'secondary' : 'primary';

  return (
    <MuiButton
      variant={muiVariant}
      color={muiColor}
      size={size}
      {...props}
    >
      {children}
    </MuiButton>
  );
}
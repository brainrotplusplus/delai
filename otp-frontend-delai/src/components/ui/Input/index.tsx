import React, { forwardRef } from 'react';
import { 
  TextField, 
  TextFieldProps, 
  InputAdornment, 
  IconButton
} from '@mui/material';
import { Clear } from '@mui/icons-material';

interface CustomInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  clearable?: boolean;
  onClear?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLDivElement, CustomInputProps>(({
  clearable = false,
  onClear,
  startIcon,
  endIcon,
  value,
  variant = 'outlined',
  size = 'small',
  sx,
  ...props
}, ref) => {
  const showClearButton = clearable && value && value !== '';

  const startAdornment = startIcon ? (
    <InputAdornment position="start">
      {startIcon}
    </InputAdornment>
  ) : undefined;

  const endAdornment = (showClearButton || endIcon) ? (
    <InputAdornment position="end">
      <>
        {showClearButton && (
          <IconButton
            onMouseDown={(e) => {
              e.preventDefault(); // Prevents onBlur
              onClear?.();
            }}
            size="small"
            edge="end"
            sx={{ padding: '4px' }}
          >
            <Clear fontSize="small" />
          </IconButton>
        )}
        {endIcon}
      </>
    </InputAdornment>
  ) : undefined;

  return (
    <TextField
      ref={ref}
      variant={variant}
      size={size}
      value={value}
      InputProps={{
        startAdornment,
        endAdornment,
      }}
      sx={[
        {
          height: 40,
          '& .MuiOutlinedInput-root': {
            minHeight: 40,
            borderRadius: '28px',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
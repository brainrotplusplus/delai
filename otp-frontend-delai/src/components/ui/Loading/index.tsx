import React from 'react';
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  text?: string;
  fullscreen?: boolean;
}

export default function Loading({
  size = 'medium',
  color = 'primary',
  text,
  fullscreen = false
}: LoadingProps) {
  // Map our sizes to Material-UI sizes
  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40;
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <CircularProgress
        size={getSize()}
        color={color === 'secondary' ? 'secondary' : 'primary'}
      />
      {text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullscreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
        }}
        open={true}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
}
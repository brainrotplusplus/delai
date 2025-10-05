'use client';

import React, { useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { navigationItems } from '../../../lib/constants/navigation';

export default function BottomNavigationMenu() {
  const [value, setValue] = useState(0);

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 10, 
        left: 10, 
        right: 10,
        zIndex: 10,
        borderRadius: 2,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          borderRadius: 2,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
          },
        }}
      >
        {navigationItems.map((item, index) => {
          const IconComponent = item.iconComponent;
          return (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              icon={<IconComponent />}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
'use client';

import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { navigationItems } from '../../../lib/constants/navigation';

interface SidePanelNavigationProps {
  onChange?: (value: string) => void;
}

export default function SidePanelNavigation({ onChange }: SidePanelNavigationProps) {
  const [value, setValue] = useState('trip');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        sx={{
          borderRadius: '0 0 12px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {navigationItems.map((item) => {
          const IconComponent = item.iconComponent;
          return (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={<IconComponent />}
              sx={{ minWidth: 'auto', flex: 1 }}
            />
          );
        })}
      </BottomNavigation>
    </Box>
  );
}
'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, List, ListItem, ListItemButton } from '@mui/material';
import SidePanelNavigation from "../features/navigation/SidePanelNavigation";
import StopsComponent from "../features/trip/TripComponent";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';
const MOBILE_MIN_SHEET_HEIGHT = 160;

const getViewportHeight = () => (typeof window !== 'undefined' ? window.innerHeight : 0);

type Props = {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  top?: number | string;
  left?: number | string;
  background?: string;
  opacity?: number;
  pointerEvents?: "auto" | "none";
};

export default function SidePanel({
  children,
  width = 300,
  height = "100vh",
  top = 0,
  left = 0,
  background = "rgba(255, 255, 255)",
  opacity = 1,
  pointerEvents = "auto",
}: Props) {
  const [activeTab, setActiveTab] = useState('trip');
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT_QUERY);
  const [sheetHeight, setSheetHeight] = useState(() => {
    const viewport = getViewportHeight();
    return viewport > 0 ? viewport : MOBILE_MIN_SHEET_HEIGHT;
  });
  const [isDragging, setIsDragging] = useState(false);
  const maxHeightRef = useRef(sheetHeight || 0);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const handleNavigationChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (!isMobile) {
      setIsDragging(false);
      return;
    }

    const updateHeights = () => {
      const viewportHeight = getViewportHeight() || MOBILE_MIN_SHEET_HEIGHT;
      maxHeightRef.current = viewportHeight;
      setSheetHeight((previous) => {
        const next = previous || viewportHeight;
        if (next > viewportHeight) {
          return viewportHeight;
        }
        if (next < MOBILE_MIN_SHEET_HEIGHT) {
          return MOBILE_MIN_SHEET_HEIGHT;
        }
        return next;
      });
    };

    updateHeights();
    window.addEventListener('resize', updateHeights);

    return () => {
      window.removeEventListener('resize', updateHeights);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    setSheetHeight(maxHeightRef.current || getViewportHeight() || MOBILE_MIN_SHEET_HEIGHT);
  }, [isMobile]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const delta = dragStartYRef.current - event.clientY;
      const maxHeight = maxHeightRef.current || MOBILE_MIN_SHEET_HEIGHT;
      const proposed = dragStartHeightRef.current + delta;
      const nextHeight = Math.min(Math.max(proposed, MOBILE_MIN_SHEET_HEIGHT), maxHeight);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        setSheetHeight(nextHeight);
      });
    };

    const endDrag = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [MOBILE_MIN_SHEET_HEIGHT, isDragging]);

  const handleDragStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isMobile) {
        return;
      }

      event.preventDefault();
      dragStartYRef.current = event.clientY;
      dragStartHeightRef.current = sheetHeight || maxHeightRef.current || MOBILE_MIN_SHEET_HEIGHT;
      setIsDragging(true);
    },
    [isMobile, sheetHeight]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('sidepanel-tab-change', {
        detail: { tab: activeTab },
      })
    );
  }, [activeTab]);
  return (
    <Paper
      sx={{
        position: 'fixed',
        top: isMobile ? 'auto' : 20,
        bottom: isMobile ? 0 : 20,
        left: isMobile ? 0 : 20,
        right: isMobile ? 0 : 'auto',
        borderRadius: isMobile ? '24px 24px 0 0' : 3,
        p: isMobile ? 0.75 : 1.25,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: isMobile ? '100%' : typeof width === "number" ? `${width}px` : width,
        maxWidth: isMobile ? '100vw' : undefined,
        boxSizing: 'border-box',
        height: isMobile ? `${sheetHeight}px` : undefined,
        maxHeight: isMobile ? `${maxHeightRef.current || sheetHeight}px` : undefined,
        background: background,
        opacity: opacity,
        pointerEvents: pointerEvents,
        zIndex: isMobile ? 1300 : 'auto',
        transition: isMobile && !isDragging ? 'height 0.2s ease-out' : 'none',
        ...(isMobile
          ? {
              fontSize: '0.9rem',
              lineHeight: 1.35,
              '& .MuiTypography-h5': {
                fontSize: '1.2rem',
              },
              '& .MuiTypography-h6': {
                fontSize: '1.02rem',
                fontWeight: 600,
              },
              '& .MuiTypography-subtitle2': {
                fontSize: '0.88rem',
              },
              '& .MuiTypography-body1': {
                fontSize: '0.92rem',
              },
              '& .MuiTypography-body2': {
                fontSize: '0.84rem',
              },
              '& .MuiTypography-caption': {
                fontSize: '0.74rem',
              },
              '& .MuiButtonBase-root': {
                fontSize: '0.85rem',
              },
            }
          : {}),
      }}
    >
      {children || (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {isMobile && (
            <Box
              onPointerDown={handleDragStart}
              sx={{
                width: '100%',
                py: 0.75,
                display: 'flex',
                justifyContent: 'center',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: 'rgba(120, 120, 120, 0.8)',
                }}
              />
            </Box>
          )}
          {/* Główna zawartość panelu */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              pb: isMobile ? '88px' : '60px',
              px: isMobile ? 1.5 : 0,
            }}
          >
            <Box sx={{ display: activeTab === 'trip' ? 'block' : 'none', height: '100%' }}>
              <StopsComponent />
            </Box>

            <Box sx={{ display: activeTab === 'stops' ? 'block' : 'none', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                Stops
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Manage your stops
              </Typography>
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: 'grey.100',
                      '&:hover': {
                        bgcolor: 'grey.200',
                      },
                    }}
                  >
                    <Typography variant="body2">Stop 1</Typography>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: 'grey.100',
                      '&:hover': {
                        bgcolor: 'grey.200',
                      },
                    }}
                  >
                    <Typography variant="body2">Stop 2</Typography>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      borderRadius: 1.5,
                      bgcolor: 'grey.100',
                      '&:hover': {
                        bgcolor: 'grey.200',
                      },
                    }}
                  >
                    <Typography variant="body2">Stop 3</Typography>
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>

            <Box sx={{ display: activeTab === 'routes' ? 'block' : 'none', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                Routes
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Manage your routes
              </Typography>
            </Box>
          </Box>
          {/* Nawigacja na dole panelu */}
          <SidePanelNavigation onChange={handleNavigationChange} />
        </Box>
      )}
    </Paper>
  );
}
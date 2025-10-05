'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  Button,
  Alert,
  Collapse,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CloseIcon from '@mui/icons-material/Close';

const INCIDENT_TYPES: Array<{ id: number; label: string }> = [
  { id: 1, label: 'Wypadek' },
  { id: 2, label: 'Pożar' },
  { id: 3, label: 'Agresywna osoba' },
  { id: 4, label: 'Zbyt zimno' },
  { id: 5, label: 'Zbyt gorąco' },
  { id: 6, label: 'Niedziałające biletomaty' },
];

const REPORT_ENDPOINT = 'http://127.0.0.1:2137/api/report';

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export default function IncidentReportButton() {
  const theme = useTheme();
  const isCompact = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleOpen = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
    setOpen((previous) => !previous);
    setErrorMessage(null);
    if (submissionState === 'success') {
      setSubmissionState('idle');
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setVehicleNumber('');
    setSubmissionState('idle');
    setErrorMessage(null);
  };

  const canSubmit = useMemo(() => {
    return Boolean(vehicleNumber.trim()) && selectedType !== null && submissionState !== 'loading';
  }, [selectedType, submissionState, vehicleNumber]);

  const handleTypeSelect = useCallback((id: number) => {
    setSelectedType(id);
    setSubmissionState('idle');
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!canSubmit || selectedType === null) {
        return;
      }

      const trimmedVehicle = vehicleNumber.trim();
      if (!trimmedVehicle) {
        setErrorMessage('Podaj numer pojazdu.');
        return;
      }

      setSubmissionState('loading');
      setErrorMessage(null);

      try {
        const response = await fetch(REPORT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'numer-pojazdu': trimmedVehicle,
            'typ-alertu': selectedType,
          }),
        });

        if (!response.ok) {
          throw new Error(`Serwer zwrócił status ${response.status}`);
        }

        setSubmissionState('success');
        setErrorMessage(null);
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
        autoCloseTimeoutRef.current = setTimeout(() => {
          resetForm();
          setOpen(false);
          autoCloseTimeoutRef.current = null;
        }, 1500);
      } catch (error) {
        console.error('Błąd wysyłania raportu incydentu:', error);
        setSubmissionState('error');
        setErrorMessage('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.');
      }
    },
    [canSubmit, selectedType, vehicleNumber]
  );

  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isCompact ? 96 : 32,
        right: isCompact ? 16 : 32,
        zIndex: 1600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      <Collapse in={open} orientation="vertical" unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            width: isCompact ? '90vw' : 320,
            maxWidth: 360,
            pointerEvents: 'auto',
            borderRadius: 3,
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Zgłoś incydent
            </Typography>
            <Button
              size="small"
              onClick={() => {
                toggleOpen();
                resetForm();
              }}
              startIcon={<CloseIcon fontSize="small" />}
            >
              Zamknij
            </Button>
          </Box>

          <Divider />

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Typ incydentu
              </Typography>
              <List dense sx={{ mt: 0.5, borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                {INCIDENT_TYPES.map((incident) => (
                  <ListItemButton
                    key={incident.id}
                    selected={incident.id === selectedType}
                    onClick={() => handleTypeSelect(incident.id)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 72, 66, 0.12)',
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 72, 66, 0.18)',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{ variant: 'body2', fontWeight: incident.id === selectedType ? 600 : 500 }}
                      primary={incident.label}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            <TextField
              label="Numer pojazdu"
              value={vehicleNumber}
              onChange={(event) => {
                setVehicleNumber(event.target.value);
                if (submissionState === 'error') {
                  setSubmissionState('idle');
                  setErrorMessage(null);
                }
              }}
              placeholder="np. KMŁ 12345"
              fullWidth
              size={isCompact ? 'small' : 'medium'}
              inputProps={{ maxLength: 32 }}
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={!canSubmit}
              sx={{ alignSelf: 'flex-end', minWidth: 140 }}
            >
              {submissionState === 'loading' ? <CircularProgress size={20} color="inherit" /> : 'Wyślij zgłoszenie'}
            </Button>

            <Collapse in={submissionState === 'success' || submissionState === 'error'}>
              {submissionState === 'success' ? (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Zgłoszenie wysłane pomyślnie.
                </Alert>
              ) : submissionState === 'error' ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errorMessage || 'Wystąpił błąd podczas wysyłania.'}
                </Alert>
              ) : null}
            </Collapse>
          </Box>
        </Paper>
      </Collapse>

      <Fab
        color="error"
        aria-label={open ? 'Ukryj zgłoszenie' : 'Zgłoś incydent'}
        onClick={toggleOpen}
        sx={{ pointerEvents: 'auto' }}
      >
        <ReportProblemIcon />
      </Fab>
    </Box>
  );
}

import React, { useState, useRef } from 'react';
import { IconButton, InputAdornment, Box } from '@mui/material';
import { ImportExport } from '@mui/icons-material';
import Input from './index';
import AutocompleteDropdown from './AutocompleteDropdown';
import { usePlaceSearch, PlaceSuggestion } from '../../../hooks/usePlaceSearch';
import { useReverseGeocode } from '../../../hooks/useReverseGeocode';

interface LocationInputProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onFromCoordinatesChange?: (coordinates: [number, number] | null) => void;
  onToCoordinatesChange?: (coordinates: [number, number] | null) => void;
  onSwap?: () => void;
  fromLabel?: string;
  toLabel?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  fromCoordinatesValue?: [number, number] | null;
  toCoordinatesValue?: [number, number] | null;
}

export default function LocationInput({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  onFromCoordinatesChange,
  onToCoordinatesChange,
  onSwap,
  fromLabel = "From",
  toLabel = "To",
  fromPlaceholder = "Enter starting location",
  toPlaceholder = "Enter destination",
  fromCoordinatesValue = null,
  toCoordinatesValue = null,
}: LocationInputProps) {
  const fromReverse = useReverseGeocode();
  const toReverse = useReverseGeocode();
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const [fromCoordinates, setFromCoordinates] = useState<[number, number] | null>(fromCoordinatesValue);
  const [toCoordinates, setToCoordinates] = useState<[number, number] | null>(toCoordinatesValue);
  const [fromCoordinateSource, setFromCoordinateSource] = useState<'marker' | 'suggestion' | 'coordinate' | null>(null);
  const [toCoordinateSource, setToCoordinateSource] = useState<'marker' | 'suggestion' | 'coordinate' | null>(null);
  const fromSearch = usePlaceSearch();
  const toSearch = usePlaceSearch();
  const fromInputRef = useRef<HTMLDivElement>(null);
  const toInputRef = useRef<HTMLDivElement>(null);

  const coordinatesEqual = React.useCallback((a: [number, number] | null, b: [number, number] | null) => {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a[0] === b[0] && a[1] === b[1];
  }, []);

  React.useEffect(() => {
    if (coordinatesEqual(fromCoordinates, fromCoordinatesValue ?? null)) {
      return;
    }

    setFromCoordinates(fromCoordinatesValue ?? null);
    if (fromCoordinatesValue === null) {
      setFromCoordinateSource(null);
    }
  }, [fromCoordinatesValue, coordinatesEqual, fromCoordinates]);

  React.useEffect(() => {
    if (coordinatesEqual(toCoordinates, toCoordinatesValue ?? null)) {
      return;
    }

    setToCoordinates(toCoordinatesValue ?? null);
    if (toCoordinatesValue === null) {
      setToCoordinateSource(null);
    }
  }, [toCoordinatesValue, coordinatesEqual, toCoordinates]);

  const formatCoordinates = React.useCallback((coordinates: [number, number] | null) => {
    if (!coordinates) return '';
    const [lng, lat] = coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }, []);

  const getSuggestionDisplayName = (suggestion: PlaceSuggestion) => {
    if (suggestion.properties.isCoordinate) {
      return suggestion.properties.name || suggestion.properties.label || `${(suggestion.geometry.coordinates[1] ?? 0).toFixed(6)}, ${(suggestion.geometry.coordinates[0] ?? 0).toFixed(6)}`;
    }

    const placeName = [
      suggestion.properties.name,
      suggestion.properties.street && suggestion.properties.housenumber
        ? `${suggestion.properties.street} ${suggestion.properties.housenumber}`
        : suggestion.properties.street,
      suggestion.properties.city,
      suggestion.properties.country
    ].filter(Boolean).join(', ');

    return placeName || suggestion.properties.name;
  };

  // Synchronizacja adresu reverse geocode z polem input
  React.useEffect(() => {
    if (fromReverse.loading) {
      return;
    }

    if (!fromReverse.address && !fromCoordinates) {
      return;
    }

    const coordinateLabel = fromCoordinates ? formatCoordinates(fromCoordinates) : '';

    if (fromReverse.address) {
      if (fromValue !== fromReverse.address) {
        onFromChange(fromReverse.address);
      }
      return;
    }

    if (fromCoordinates && coordinateLabel && fromCoordinateSource === 'marker' && fromValue !== coordinateLabel) {
      onFromChange(coordinateLabel);
    }
  }, [fromReverse.address, fromReverse.loading, fromValue, onFromChange, fromCoordinates, formatCoordinates, fromCoordinateSource]);

  React.useEffect(() => {
    if (toReverse.loading) {
      return;
    }

    if (!toReverse.address && !toCoordinates) {
      return;
    }

    const coordinateLabel = toCoordinates ? formatCoordinates(toCoordinates) : '';

    if (toReverse.address) {
      if (toValue !== toReverse.address) {
        onToChange(toReverse.address);
      }
      return;
    }

    if (toCoordinates && coordinateLabel && toCoordinateSource === 'marker' && toValue !== coordinateLabel) {
      onToChange(coordinateLabel);
    }
  }, [toReverse.address, toReverse.loading, toValue, onToChange, toCoordinates, formatCoordinates, toCoordinateSource]);

  // Obsługa przeciągania markerów na mapie
  React.useEffect(() => {
    const handleMarkerDragged = (e: CustomEvent) => {
      const { type, coordinates } = e.detail;
      if (type === 'from') {
        setFromCoordinates(coordinates);
        setFromCoordinateSource('marker');
        onFromCoordinatesChange?.(coordinates);
        fromReverse.clearAddress();
        fromReverse.reverseGeocode(coordinates[0], coordinates[1]);
        fromSearch.clearSuggestions();
      } else if (type === 'to') {
        setToCoordinates(coordinates);
        setToCoordinateSource('marker');
        onToCoordinatesChange?.(coordinates);
        toReverse.clearAddress();
        toReverse.reverseGeocode(coordinates[0], coordinates[1]);
        toSearch.clearSuggestions();
      }
    };
    window.addEventListener('marker-dragged', handleMarkerDragged as EventListener);
    return () => {
      window.removeEventListener('marker-dragged', handleMarkerDragged as EventListener);
    };
  }, [onFromCoordinatesChange, onToCoordinatesChange, fromReverse, toReverse, formatCoordinates, fromSearch.clearSuggestions, toSearch.clearSuggestions]);

  const handleClearFrom = () => {
    onFromChange('');
    fromSearch.clearSuggestions();
    onFromCoordinatesChange?.(null);
    setFromCoordinates(null);
    setFromCoordinateSource(null);
    window.dispatchEvent(new CustomEvent('map-zoom', {
      detail: {
        from: null,
        to: toCoordinates,
        flyTo: false
      }
    }));
  };

  const handleClearTo = () => {
    onToChange('');
    toSearch.clearSuggestions();
    onToCoordinatesChange?.(null);
    setToCoordinates(null);
    setToCoordinateSource(null);
    window.dispatchEvent(new CustomEvent('map-zoom', {
      detail: {
        from: fromCoordinates,
        to: null,
        flyTo: false
      }
    }));
  };

  const handleSwapLocations = () => {
    onSwap?.();
    onFromChange(toValue); // zamień tekst w polu From
    onToChange(fromValue); // zamień tekst w polu To
    // Zamień współrzędne
    const tempFrom = fromCoordinates;
    const tempTo = toCoordinates;
  const tempFromSource = fromCoordinateSource;
  const tempToSource = toCoordinateSource;
    setFromCoordinates(tempTo);
    setToCoordinates(tempFrom);
  setFromCoordinateSource(tempToSource);
  setToCoordinateSource(tempFromSource);
    onFromCoordinatesChange?.(tempTo);
    onToCoordinatesChange?.(tempFrom);
    // Uruchom reverse geocode dla nowych współrzędnych
    if (tempTo) {
      fromReverse.reverseGeocode(tempTo[0], tempTo[1]);
    }
    if (tempFrom) {
      toReverse.reverseGeocode(tempFrom[0], tempFrom[1]);
    }
    window.dispatchEvent(new CustomEvent('map-zoom', {
      detail: {
        from: tempTo,
        to: tempFrom,
        flyTo: false
      }
    }));
  };

  const handleFromChange = (value: string) => {
    onFromChange(value);
    fromSearch.searchPlaces(value);
    setFromCoordinates(null);
  setFromCoordinateSource(null);
    onFromCoordinatesChange?.(null);
    window.dispatchEvent(new CustomEvent('map-zoom', {
      detail: {
        from: null,
        to: toCoordinates,
        flyTo: false
      }
    }));
  };

  const handleToChange = (value: string) => {
    onToChange(value);
    toSearch.searchPlaces(value);
    setToCoordinates(null);
  setToCoordinateSource(null);
    onToCoordinatesChange?.(null);
    window.dispatchEvent(new CustomEvent('map-zoom', {
      detail: {
        from: fromCoordinates,
        to: null,
        flyTo: false
      }
    }));
  };

  const handleFromSelect = (suggestion: PlaceSuggestion) => {
    const placeName = getSuggestionDisplayName(suggestion);
    fromReverse.clearAddress();
  setFromCoordinateSource(suggestion.properties.isCoordinate ? 'coordinate' : 'suggestion');
    onFromChange(placeName);
    onFromCoordinatesChange?.(suggestion.geometry.coordinates as [number, number]);
    fromSearch.clearSuggestions();
    setFromCoordinates(suggestion.geometry.coordinates as [number, number]);
    if (suggestion.properties.isCoordinate) {
      const [lng, lat] = suggestion.geometry.coordinates as [number, number];
      fromReverse.reverseGeocode(lng, lat);
    }
    if (toCoordinates) {
      window.dispatchEvent(new CustomEvent('map-zoom', {
        detail: {
          from: suggestion.geometry.coordinates as [number, number],
          to: toCoordinates,
          fitBounds: true
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('map-zoom', {
        detail: {
          from: suggestion.geometry.coordinates as [number, number],
          to: toCoordinates,
          flyTo: true
        }
      }));
    }
  };

  const handleToSelect = (suggestion: PlaceSuggestion) => {
    const placeName = getSuggestionDisplayName(suggestion);
    toReverse.clearAddress();
  setToCoordinateSource(suggestion.properties.isCoordinate ? 'coordinate' : 'suggestion');
    onToChange(placeName);
    onToCoordinatesChange?.(suggestion.geometry.coordinates as [number, number]);
    toSearch.clearSuggestions();
    setToCoordinates(suggestion.geometry.coordinates as [number, number]);
    if (suggestion.properties.isCoordinate) {
      const [lng, lat] = suggestion.geometry.coordinates as [number, number];
      toReverse.reverseGeocode(lng, lat);
    }
    if (fromCoordinates) {
      window.dispatchEvent(new CustomEvent('map-zoom', {
        detail: {
          from: fromCoordinates,
          to: suggestion.geometry.coordinates as [number, number],
          fitBounds: true
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('map-zoom', {
        detail: {
          from: fromCoordinates,
          to: suggestion.geometry.coordinates as [number, number],
          flyTo: true
        }
      }));
    }
  };

  const showSwapButton = fromValue && toValue && !fromFocused && !toFocused;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Input
          ref={fromInputRef}
          label={fromLabel}
          fullWidth
          value={fromFocused
            ? fromValue
            : (fromValue !== ''
                ? fromValue
                : (fromReverse.address
                    ? fromReverse.address
                    : (fromCoordinates ? formatCoordinates(fromCoordinates) : '')))}
          onChange={(e) => {
            if (fromReverse.address) fromReverse.clearAddress();
            handleFromChange(e.target.value);
          }}
          onFocus={() => setFromFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setFromFocused(false);
              if (!fromCoordinates) {
                onFromCoordinatesChange?.(null);
              }
            }, 0);
          }}
          placeholder={fromPlaceholder}
          clearable={fromFocused}
          onClear={() => {
            if (fromReverse.clearAddress) fromReverse.clearAddress();
            handleClearFrom();
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& fieldset': {
                borderColor: 'primary.main',
                borderBottomColor: fromFocused && (fromSearch.loading || fromSearch.suggestions.length > 0 || fromSearch.error !== null) ? 'rgba(0, 0, 0, 0.12)' : 'primary.main',
              },
            },
          }}
        />
        <AutocompleteDropdown
          suggestions={fromSearch.suggestions}
          loading={fromSearch.loading}
          error={fromSearch.error}
          onSelect={handleFromSelect}
          visible={fromFocused && (fromSearch.loading || fromSearch.suggestions.length > 0 || fromSearch.error !== null)}
        />
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Input
          ref={toInputRef}
          label={toLabel}
          fullWidth
          value={toFocused
            ? toValue
            : (toValue !== ''
                ? toValue
                : (toReverse.address
                    ? toReverse.address
                    : (toCoordinates ? formatCoordinates(toCoordinates) : '')))}
          onChange={(e) => {
            if (toReverse.address) toReverse.clearAddress();
            handleToChange(e.target.value);
          }}
          onFocus={() => setToFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setToFocused(false);
              if (!toCoordinates) {
                onToCoordinatesChange?.(null);
              }
            }, 150);
          }}
          placeholder={toPlaceholder}
          clearable={toFocused}
          onClear={() => {
            if (toReverse.clearAddress) toReverse.clearAddress();
            handleClearTo();
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& fieldset': {
                borderColor: 'primary.main',
                borderBottomColor: toFocused && (toSearch.loading || toSearch.suggestions.length > 0 || toSearch.error !== null) ? 'rgba(0, 0, 0, 0.12)' : 'primary.main',
              },
            },
          }}
          endIcon={showSwapButton ? (
            <IconButton
              onMouseDown={(e) => {
                e.preventDefault();
                handleSwapLocations();
              }}
              size="small"
              edge="end"
              sx={{ padding: '4px' }}
            >
              <ImportExport fontSize="small" />
            </IconButton>
          ) : undefined}
        />
        <AutocompleteDropdown
          suggestions={toSearch.suggestions}
          loading={toSearch.loading}
          error={toSearch.error}
          onSelect={handleToSelect}
          visible={toFocused && (toSearch.loading || toSearch.suggestions.length > 0 || toSearch.error !== null)}
        />
      </Box>
    </Box>
  );
}
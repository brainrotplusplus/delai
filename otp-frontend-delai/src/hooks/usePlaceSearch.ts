import { useState, useEffect, useCallback } from 'react';

export interface PlaceSuggestion {
  properties: {
    name: string;
    street?: string;
    housenumber?: string;
    city?: string;
    country?: string;
    osm_key?: string;
    osm_value?: string;
    label?: string;
    isCoordinate?: boolean;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

export function usePlaceSearch() {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCoordinateInput = useCallback((query: string) => {
    const sanitized = query
      .trim()
      .replace(/[;\s]+/g, ' ')
      .replace(/\s*,\s*/g, ',');

    const match = sanitized.match(/(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (!match) {
      return null;
    }

    const first = parseFloat(match[1]);
    const second = parseFloat(match[2]);
    if (Number.isNaN(first) || Number.isNaN(second)) {
      return null;
    }

    const withinLat = (value: number) => Math.abs(value) <= 90;
    const withinLng = (value: number) => Math.abs(value) <= 180;

    let lat: number;
    let lng: number;

    const firstLooksLat = withinLat(first) && withinLng(second);
    const firstLooksLng = withinLng(first) && withinLat(second);

    if (firstLooksLat && !firstLooksLng) {
      lat = first;
      lng = second;
    } else if (!firstLooksLat && firstLooksLng) {
      lat = second;
      lng = first;
    } else if (firstLooksLat && firstLooksLng) {
      // Ambiguous, prefer the format lat, lng by default
      lat = first;
      lng = second;
    } else {
      return null;
    }

    if (!withinLat(lat) || !withinLng(lng)) {
      return null;
    }

    const formattedLabel = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    const coordinateSuggestion: PlaceSuggestion = {
      properties: {
        name: formattedLabel,
        label: `Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`,
        isCoordinate: true,
      },
      geometry: {
        coordinates: [lng, lat],
      },
    };

    return coordinateSuggestion;
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    const coordinateSuggestion = parseCoordinateInput(query);

    if (query.trim().length < 3 && !coordinateSuggestion) {
      setSuggestions([]);
      return;
    }

    const shouldFetch = query.trim().length >= 3;

    setLoading(shouldFetch);
    setError(null);

    try {
      let apiSuggestions: PlaceSuggestion[] = [];

      if (shouldFetch) {
        // Using Photon API (free, OSM-based geocoding service)
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }

        const data = await response.json();
        apiSuggestions = data.features || [];
      }

      const combinedSuggestions = coordinateSuggestion
        ? [coordinateSuggestion, ...apiSuggestions]
        : apiSuggestions;

      setSuggestions(combinedSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSuggestions(coordinateSuggestion ? [coordinateSuggestion] : []);
    } finally {
      setLoading(false);
    }
  }, [parseCoordinateInput]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchPlaces,
    clearSuggestions,
  };
}
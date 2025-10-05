import { useState, useCallback } from 'react';

export function useReverseGeocode() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    setLoading(true);
    setError(null);
    setAddress(null);
    try {
      // Photon reverse geocoding
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=en`
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        // Build address string from available properties
        const addressParts = [
          props.name,
          props.street && props.housenumber ? `${props.street} ${props.housenumber}` : props.street,
          props.city,
          props.country
        ].filter(Boolean);
        setAddress(addressParts.join(', '));
      } else {
        setAddress(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reverse geocoding failed');
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAddress = () => setAddress(null);
  return { address, loading, error, reverseGeocode, clearAddress };
}

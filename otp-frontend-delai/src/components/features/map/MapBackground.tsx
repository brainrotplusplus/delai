'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PlaceIcon from '@mui/icons-material/Place';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const EXCLUDED_ENDPOINT_MODES = new Set([
  'WALK',
  'BICYCLE',
  'BIKE',
  'SCOOTER',
  'MICROMOBILITY',
  'MICROMOBILITY_RENTAL',
  'BICYCLE_RENTAL',
]);

export default function MapBackground() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const fromMarker = useRef<maplibregl.Marker | null>(null);
  const toMarker = useRef<maplibregl.Marker | null>(null);
  const mapLoadedRef = useRef(false);
  const pendingRoute = useRef<DrawItineraryDetail | null>(null);
  const endpointMarkersRef = useRef<maplibregl.Marker[]>([]);
  const lastFromCoordinatesRef = useRef<[number, number] | null>(null);
  const lastToCoordinatesRef = useRef<[number, number] | null>(null);
  const isTripActiveRef = useRef(true);
  const routeVisibilityRef = useRef(true);
  const [isMounted, setIsMounted] = useState(false);

  const ROUTE_SOURCE_ID = 'selected-itinerary-route';
  const ROUTE_LAYER_ID = 'selected-itinerary-layer';
  const ROUTE_WALK_LAYER_ID = 'selected-itinerary-layer-walk';
  const clearEndpointMarkers = useCallback(() => {
    endpointMarkersRef.current.forEach((marker) => marker.remove());
    endpointMarkersRef.current = [];
  }, []);

  const createEndpointMarker = useCallback(
    (coordinate: [number, number]) => {
      if (!map.current) {
        return;
      }

      const el = document.createElement('div');
  el.style.width = '4px';
  el.style.height = '4px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ffffff';
      el.style.border = '1px solid #6e6e6e';
      el.style.boxSizing = 'content-box';
  el.style.boxShadow = '0 0 0 0.5px rgba(110, 110, 110, 0.5)';
      el.style.pointerEvents = 'none';

      const marker = new maplibregl.Marker({ element: el, draggable: false }).setLngLat(coordinate).addTo(map.current);
      el.style.zIndex = '0';
      endpointMarkersRef.current.push(marker);
    },
    []
  );

  const removeFromMarker = useCallback((keepLast = false) => {
    if (!keepLast) {
      lastFromCoordinatesRef.current = null;
    }

    if (fromMarker.current) {
      fromMarker.current.remove();
      fromMarker.current = null;
    }
  }, []);

  const removeToMarker = useCallback((keepLast = false) => {
    if (!keepLast) {
      lastToCoordinatesRef.current = null;
    }

    if (toMarker.current) {
      toMarker.current.remove();
      toMarker.current = null;
    }
  }, []);

  const ensureFromMarker = useCallback((coordinate: [number, number]) => {
    lastFromCoordinatesRef.current = coordinate;

    if (!map.current) {
      return;
    }

    const existing = fromMarker.current;

    if (!existing) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = ReactDOMServer.renderToString(
        <RadioButtonCheckedIcon style={{ color: 'black', fontSize: 20 }} />
      );
      el.style.zIndex = '10';

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(coordinate)
        .addTo(map.current);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        window.dispatchEvent(
          new CustomEvent('marker-dragged', {
            detail: {
              type: 'from',
              coordinates: [lngLat.lng, lngLat.lat] as [number, number],
            },
          })
        );
      });

      fromMarker.current = marker;
    } else {
      const lngLat = existing.getLngLat();
      if (lngLat.lng !== coordinate[0] || lngLat.lat !== coordinate[1]) {
        existing.setLngLat(coordinate);
      }
    }
  }, []);

  const ensureToMarker = useCallback((coordinate: [number, number]) => {
    lastToCoordinatesRef.current = coordinate;

    if (!map.current) {
      return;
    }

    const existing = toMarker.current;

    if (!existing) {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = ReactDOMServer.renderToString(
        <PlaceIcon style={{ color: 'red', fontSize: 32 }} />
      );
      el.style.zIndex = '10';

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(coordinate)
        .addTo(map.current);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        window.dispatchEvent(
          new CustomEvent('marker-dragged', {
            detail: {
              type: 'to',
              coordinates: [lngLat.lng, lngLat.lat] as [number, number],
            },
          })
        );
      });

      toMarker.current = marker;
    } else {
      const lngLat = existing.getLngLat();
      if (lngLat.lng !== coordinate[0] || lngLat.lat !== coordinate[1]) {
        existing.setLngLat(coordinate);
      }
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const drawRouteOnMap = useCallback(
    (detail: DrawItineraryDetail | null) => {
      if (!map.current || !mapLoadedRef.current) {
        return;
      }

      clearEndpointMarkers();

      const segments = detail?.segments ?? [];

      if (!map.current.getSource(ROUTE_SOURCE_ID)) {
        map.current.addSource(ROUTE_SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });
      }

      if (!map.current.getLayer(ROUTE_LAYER_ID)) {
        map.current.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          filter: ['!=', ['get', 'isWalk'], true],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#1976d2'],
            'line-width': 6,
            'line-opacity': 1,
          },
        });
      }

      if (!map.current.getLayer(ROUTE_WALK_LAYER_ID)) {
        map.current.addLayer({
          id: ROUTE_WALK_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          filter: ['==', ['get', 'isWalk'], true],
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#1976d2'],
            'line-width': 6,
            'line-opacity': 1,
            'line-dasharray': [0, 1.5],
          },
        });
      }

      const source = map.current.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (!source) {
        return;
      }

      const features = segments.map((segment, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: segment.coordinates,
        },
        properties: {
          color: segment.color,
          isWalk: segment.isWalk,
          index,
        },
      })) ?? [];

      source.setData({
        type: 'FeatureCollection',
        features,
      });

      if (!segments.length || !routeVisibilityRef.current) {
        return;
      }

      const seenEndpoints = new Set<string>();

      const addEndpoint = (coordinate: [number, number] | undefined) => {
        if (!coordinate) {
          return;
        }

        const key = `${coordinate[0].toFixed(6)},${coordinate[1].toFixed(6)}`;
        if (seenEndpoints.has(key)) {
          return;
        }
        seenEndpoints.add(key);
        createEndpointMarker(coordinate);
      };

      segments.forEach((segment) => {
        const normalizedMode = segment.mode?.toUpperCase?.() ?? '';
        if (segment.isWalk || EXCLUDED_ENDPOINT_MODES.has(normalizedMode)) {
          return;
        }

        addEndpoint(segment.start);
        addEndpoint(segment.end);
      });
    },
    [clearEndpointMarkers, createEndpointMarker]
  );

  const updateRouteVisibility = useCallback(
    (visible: boolean) => {
      routeVisibilityRef.current = visible;

      if (!map.current || !mapLoadedRef.current) {
        return;
      }

      const visibility = visible ? 'visible' : 'none';

      if (map.current.getLayer(ROUTE_LAYER_ID)) {
        map.current.setLayoutProperty(ROUTE_LAYER_ID, 'visibility', visibility);
      }

      if (map.current.getLayer(ROUTE_WALK_LAYER_ID)) {
        map.current.setLayoutProperty(ROUTE_WALK_LAYER_ID, 'visibility', visibility);
      }

      if (visible) {
        if (pendingRoute.current) {
          drawRouteOnMap(pendingRoute.current);
        }
      } else {
        clearEndpointMarkers();
      }
    },
    [clearEndpointMarkers, drawRouteOnMap]
  );

  useEffect(() => {
    if (!isMounted || map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [19.9450, 50.0647], // Kraków coordinates [lng, lat]
      zoom: 12,
      pitchWithRotate: false, // Disable rotation
      dragRotate: false, // Disable drag rotation
      touchZoomRotate: false, // Disable touch rotation
    });

    map.current.on('load', () => {
      mapLoadedRef.current = true;
      drawRouteOnMap(pendingRoute.current);
      updateRouteVisibility(routeVisibilityRef.current);
      if (isTripActiveRef.current) {
        if (lastFromCoordinatesRef.current) {
          ensureFromMarker(lastFromCoordinatesRef.current);
        }
        if (lastToCoordinatesRef.current) {
          ensureToMarker(lastToCoordinatesRef.current);
        }
      }
    });

    return () => {
      if (map.current) {
        clearEndpointMarkers();
        map.current.remove();
        map.current = null;
      }
      mapLoadedRef.current = false;
      pendingRoute.current = null;
    };
  }, [clearEndpointMarkers, drawRouteOnMap, ensureFromMarker, ensureToMarker, isMounted, updateRouteVisibility]);

  useEffect(() => {
    if (!map.current) {
      return;
    }

    const handleMapZoom = (
      event: CustomEvent<{
        from?: [number, number] | null;
        to?: [number, number] | null;
        fitBounds?: boolean;
        flyTo?: boolean;
      }>
    ) => {
      if (!map.current) {
        return;
      }

      const { from, to, fitBounds, flyTo } = event.detail ?? {};

      if (from !== undefined) {
        if (from) {
          lastFromCoordinatesRef.current = from;
          if (isTripActiveRef.current) {
            ensureFromMarker(from);
          } else {
            removeFromMarker(true);
          }
        } else {
          lastFromCoordinatesRef.current = null;
          removeFromMarker();
        }
      }

      if (to !== undefined) {
        if (to) {
          lastToCoordinatesRef.current = to;
          if (isTripActiveRef.current) {
            ensureToMarker(to);
          } else {
            removeToMarker(true);
          }
        } else {
          lastToCoordinatesRef.current = null;
          removeToMarker();
        }
      }

      const effectiveFrom = from !== undefined ? from : lastFromCoordinatesRef.current;
      const effectiveTo = to !== undefined ? to : lastToCoordinatesRef.current;

      if (fitBounds && effectiveFrom && effectiveTo) {
        const minLng = Math.min(effectiveFrom[0], effectiveTo[0]);
        const maxLng = Math.max(effectiveFrom[0], effectiveTo[0]);
        const minLat = Math.min(effectiveFrom[1], effectiveTo[1]);
        const maxLat = Math.max(effectiveFrom[1], effectiveTo[1]);
        map.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 100,
            minZoom: 10,
            maxZoom: 14,
          }
        );
      } else if (flyTo && effectiveFrom && !effectiveTo) {
        map.current.flyTo({ center: effectiveFrom, zoom: 15 });
      } else if (flyTo && effectiveTo && !effectiveFrom) {
        map.current.flyTo({ center: effectiveTo, zoom: 15 });
      }
    };

    window.addEventListener('map-zoom', handleMapZoom as EventListener);

    return () => {
      window.removeEventListener('map-zoom', handleMapZoom as EventListener);
    };
  }, [ensureFromMarker, ensureToMarker, isMounted, removeFromMarker, removeToMarker]);

  useEffect(() => {
    const handleDrawItinerary = (event: CustomEvent<DrawItineraryDetail>) => {
      pendingRoute.current = event.detail;
      drawRouteOnMap(event.detail);
    };

    window.addEventListener('draw-itinerary', handleDrawItinerary as EventListener);

    return () => {
      window.removeEventListener('draw-itinerary', handleDrawItinerary as EventListener);
    };
  }, [drawRouteOnMap]);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
      const tab = event.detail?.tab;
      if (!tab) {
        return;
      }

      isTripActiveRef.current = tab === 'trip';

      if (tab === 'trip') {
        updateRouteVisibility(true);
        if (lastFromCoordinatesRef.current) {
          ensureFromMarker(lastFromCoordinatesRef.current);
        }
        if (lastToCoordinatesRef.current) {
          ensureToMarker(lastToCoordinatesRef.current);
        }
      } else {
        removeFromMarker(true);
        removeToMarker(true);
        updateRouteVisibility(false);
      }
    };

    window.addEventListener('sidepanel-tab-change', handleTabChange as EventListener);

    return () => {
      window.removeEventListener('sidepanel-tab-change', handleTabChange as EventListener);
    };
  }, [ensureFromMarker, ensureToMarker, removeFromMarker, removeToMarker, updateRouteVisibility]);

  return (
    <div
      ref={mapContainer}
      className="fixed inset-0 w-full h-full z-0"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', cursor: 'default' }}
      onMouseEnter={() => {
        if (mapContainer.current) {
          mapContainer.current.style.cursor = 'default';
        }
        const canvases = document.getElementsByClassName('maplibregl-canvas');
        for (let i = 0; i < canvases.length; i++) {
          (canvases[i] as HTMLElement).style.cursor = 'default';
        }
      }}
    />
  );
}

type DrawItineraryDetail = {
  segments: Array<{
    coordinates: [number, number][];
    color: string;
    isWalk: boolean;
    mode: string;
    start: [number, number];
    end: [number, number];
  }>;
};
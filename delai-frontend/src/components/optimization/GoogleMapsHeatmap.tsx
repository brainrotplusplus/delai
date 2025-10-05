import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { HeatmapPoint } from "../../types/route-optimization";
import * as L from "leaflet";

// Funkcja tworząca gradientowe kółka SVG
function createSVGGradientCircles(points: HeatmapPoint[]): L.LayerGroup {
  const group = L.layerGroup();

  points.forEach(point => {
    const latlng = [point.lat, point.lng] as [number, number];
    const weight = point.weight || 1;
    const size = 200 * weight; // Rozmiar SVG

    // Tworzymy SVG z gradientem radialnym
    const svgString = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad-${point.lat}-${point.lng}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#FF0000" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#FF4400" stop-opacity="0.6"/>
            <stop offset="70%" stop-color="#FF8800" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#FFFF00" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad-${point.lat}-${point.lng})"/>
      </svg>
    `;

    // Konwertujemy SVG na Data URL
    const svgUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

    // Obliczamy bounds dla imageOverlay (obszar zajmowany przez SVG)
    const radiusInDegrees = 0.005 * weight; // Dopasuj do swoich potrzeb
    const bounds = L.latLngBounds(
      [point.lat - radiusInDegrees, point.lng - radiusInDegrees],
      [point.lat + radiusInDegrees, point.lng + radiusInDegrees]
    );

    // Tworzymy nakładkę obrazu SVG
    L.imageOverlay(svgUrl, bounds, {
      opacity: 0.8,
      interactive: false
    }).addTo(group);
  });

  return group;
}

// Alternatywna wersja z markerami DIV (prostsza)
function createSVGMarkerCircles(points: HeatmapPoint[]): L.LayerGroup {
  const group = L.layerGroup();

  points.forEach(point => {
    const latlng = [point.lat, point.lng] as [number, number];
    const weight = point.weight || 1;
    const size = 150 * weight;

    // SVG z gradientem
    const svgString = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad-${point.lat}-${point.lng}">
            <stop offset="0%" stop-color="#FF0000" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#FF5500" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#FFFF00" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad-${point.lat}-${point.lng})"/>
      </svg>
    `;

    L.marker(latlng, {
      icon: L.divIcon({
        html: svgString,
        iconSize: [size, size],
        className: 'svg-gradient-marker'
      })
    }).addTo(group);
  });

  return group;
}

function HeatmapLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !points.length) return;

    console.log("Creating SVG gradient circles with points:", points);

    // Usuń poprzednią warstwę
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    // Utwórz gradientowe kółka SVG - wybierz jedną z opcji:
    // layerRef.current = createSVGGradientCircles(points); // ImageOverlay wersja
    layerRef.current = createSVGMarkerCircles(points); // Marker wersja (łatwiejsza)

    layerRef.current.addTo(map);

    // Dostosuj widok do punktów
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.1));

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, points]);

  return null;
}

interface GoogleMapsHeatmapProps {
  points: HeatmapPoint[];
}

export function GoogleMapsHeatmap({ points }: GoogleMapsHeatmapProps) {
  if (!points || points.length === 0) {
    return (
      <div style={{
        height: "300px",
        borderRadius: "1rem",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
        border: "2px dashed #ccc"
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Brak danych do wyświetlenia</p>
          <p>Liczba punktów: 0</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "300px", borderRadius: "1rem", overflow: "hidden", position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '5px 10px',
        borderRadius: '4px',
        zIndex: 1000,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        Punkty: {points.length}
      </div>

      <MapContainer
        center={[50.0647, 19.945]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        minZoom={12}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <HeatmapLayer points={points} />
      </MapContainer>
    </div>
  );
}
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import * as L from "leaflet";
import { vehiclesPoints } from "../../data/route-optimization";
import type { VehiclePoint, VehiclePointInfo } from "../../types/route-optimization";

// Funkcja tworząca kropki z tooltipami
function createDotWithTooltip(points: { lat: number; lng: number }[]) {
  return points.map((point, index) => (
    <Marker
      key={index}
      position={[point.lat, point.lng]}
      icon={L.divIcon({
        html: '<div class="simple-dot"></div>',
        iconSize: [8, 8],
        iconAnchor: [4, 4],
        className: 'simple-dot-marker'
      })}
      eventHandlers={{
        mouseover: (e) => {
          e.target.openTooltip();
        },
        mouseout: (e) => {
          e.target.closeTooltip();
        }
      }}
    >
      <Tooltip
        permanent={false}
        direction="top"
        offset={[0, -10]}
        opacity={0.9}
      >
        <div style={{ textAlign: 'center' }}>
          <strong>Linia {point.label}</strong><br />
        </div>
      </Tooltip>
    </Marker>
  ));
}

// Funkcja mapująca pojazdy na punkty
export function mapToHeatmapPoints(vehicles: VehiclePoint[]): VehiclePointInfo[] {
  if (!vehicles || !Array.isArray(vehicles)) {
    return [];
  }

  return vehicles
    .filter(vehicle =>
      vehicle?.vehicle?.position?.latitude != null &&
      vehicle?.vehicle?.position?.longitude != null
    )
    .map(vehicle => ({
      lat: vehicle.vehicle.position.latitude,
      lng: vehicle.vehicle.position.longitude,
      label: vehicle.vehicle.vehicle.label
    }));
}

// Główny komponent mapy
export function VehiclesMap() {
    console.log("przed",vehiclesPoints);
  const points = mapToHeatmapPoints(vehiclesPoints);
  console.log(points);
  const [hoveredPoint, setHoveredPoint] = useState<{ lat: number; lng: number } | null>(null);

  // Style CSS dla kropek
  const dotStyles = `
    .simple-dot {
      width: 12px;
      height: 12px;
      background-color: #0033ff;
      border-radius: 50%;
      border: 1px solid #FFFFFF;
      box-shadow: 0 0 2px rgba(0,0,0,0.5);
      transition: all 0.2s ease;
    }
    .simple-dot:hover {
      transform: scale(1.3);
      background-color: #FF4444;
    }
    .simple-dot-marker {
      background: transparent;
      border: none;
    }
    .leaflet-tooltip {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
    }
  `;

  return (
    <div style={{ height: "500px", borderRadius: "1rem", overflow: "hidden", position: 'relative' }}>
      <style>{dotStyles}</style>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '5px 10px',
        borderRadius: '4px',
        zIndex: 1000,
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'black'
      }}>
        Pojazdy: {points.length}
        {hoveredPoint && (
          <div style={{ marginTop: '5px', fontSize: '10px'}}>
            Aktywne: {hoveredPoint.lat.toFixed(4)}, {hoveredPoint.lng.toFixed(4)}
          </div>
        )}
      </div>

      <MapContainer
        center={[50.0647, 19.945]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        minZoom={10}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Renderowanie kropek z tooltipami */}
        {createDotWithTooltip(points)}
      </MapContainer>
    </div>
  );
}
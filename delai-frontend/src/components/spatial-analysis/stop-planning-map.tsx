"use client";

import React from "react";
import { MapPin, Plus, Users, AlertTriangle } from "lucide-react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState } from "react";
import { suggestedStops, popularRoutes, excludedAreas } from "./data";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Custom Polyline component
function RoutePolyline({
  path,
  intensity,
}: {
  path: Array<{ lat: number; lng: number }>;
  intensity: number;
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (!map || !window.google) return;

    // Create polyline
    const newPolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor:
        intensity > 80 ? "#ef4444" : intensity > 60 ? "#f97316" : "#eab308",
      strokeOpacity: 0.8,
      strokeWeight: Math.max(2, intensity / 20),
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: "#ffffff",
            strokeWeight: 1,
            fillColor:
              intensity > 80
                ? "#ef4444"
                : intensity > 60
                ? "#f97316"
                : "#eab308",
            fillOpacity: 1,
          },
          offset: "50%",
          repeat: "200px",
        },
      ],
    });

    newPolyline.setMap(map);

    return () => {
      if (newPolyline) {
        newPolyline.setMap(null);
      }
    };
  }, [map, path, intensity]);

  React.useEffect(() => {
    const mapElement = document.querySelector(".gm-style");
    if (mapElement && window.google) {
      const mapInstance = new google.maps.Map(mapElement as HTMLElement);
      setMap(mapInstance);
    }
  }, []);

  return null;
}

// Custom Circle component for excluded areas
function ExcludedAreaCircle({ area }: { area: (typeof excludedAreas)[0] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  React.useEffect(() => {
    if (!map || !window.google) return;

    const circle = new google.maps.Circle({
      strokeColor: area.severity === "high" ? "#dc2626" : "#ea580c",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: area.severity === "high" ? "#dc2626" : "#ea580c",
      fillOpacity: 0.15,
      map: map,
      center: area.center,
      radius: area.radius,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, area]);

  React.useEffect(() => {
    const mapElement = document.querySelector(".gm-style");
    if (mapElement && window.google) {
      const mapInstance = new google.maps.Map(mapElement as HTMLElement);
      setMap(mapInstance);
    }
  }, []);

  return null;
}

export function StopPlanningMap() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[400px] bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg flex items-center justify-center border border-blue-200">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-2" />
          <p className="text-blue-600 font-medium">
            Mapa Planowania Przystanków
          </p>
          <p className="text-sm text-blue-500">
            Wymagany klucz API Google Maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <Map
          defaultCenter={{ lat: 50.0647, lng: 19.945 }}
          defaultZoom={13}
          mapId="kraków-stops"
          style={{ width: "100%", height: "100%" }}
          disableDefaultUI={true}
          zoomControl={true}
          colorScheme="LIGHT"
        >
          {/* Route lines */}
          {popularRoutes.map((route) => (
            <RoutePolyline
              key={route.id}
              path={route.path}
              intensity={route.intensity}
            />
          ))}

          {/* Excluded areas (poor coverage) */}
          {excludedAreas.map((area) => (
            <ExcludedAreaCircle key={area.id} area={area} />
          ))}

          {/* Excluded areas centers with warning markers */}
          {excludedAreas.map((area) => (
            <AdvancedMarker
              key={`${area.id}-center`}
              position={area.center}
              title={`Słaba dostępność: ${area.name}`}
            >
              <div className="w-8 h-8 rounded-full bg-red-500/90 border-2 border-red-400 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Suggested stops */}
          {suggestedStops.map((stop) => (
            <AdvancedMarker
              key={stop.id}
              position={stop.coordinates}
              title={stop.location}
              onClick={() =>
                setSelectedStop(selectedStop === stop.id ? null : stop.id)
              }
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-3 shadow-lg hover:scale-110 transition-transform cursor-pointer ${
                  stop.priority === "Wysoki"
                    ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/30"
                    : "bg-blue-500 border-blue-400 shadow-blue-500/30"
                }`}
              >
                <Plus className="h-4 w-4 text-white" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Info windows for selected stops */}
          {selectedStop && (
            <InfoWindow
              position={
                suggestedStops.find((s) => s.id === selectedStop)?.coordinates
              }
              onCloseClick={() => setSelectedStop(null)}
            >
              {(() => {
                const stop = suggestedStops.find((s) => s.id === selectedStop);
                if (!stop) return null;

                return (
                  <div className="p-2 max-w-xs">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {stop.location}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{stop.reason}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {stop.impact} pasażerów/dzień
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          stop.priority === "Wysoki"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {stop.priority} Priorytet
                      </span>
                    </div>
                  </div>
                );
              })()}
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Legenda</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border border-emerald-400"></div>
            <span className="text-white/70">Wysoki priorytet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-400"></div>
            <span className="text-white/70">Średni priorytet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500 rounded"></div>
            <span className="text-white/70">Intensywna trasa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-400"></div>
            <span className="text-white/70">Słaba dostępność</span>
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

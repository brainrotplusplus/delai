"use client";

import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import { Train } from "lucide-react";

export interface TramStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isTerminal?: boolean;
}

export interface TramRoute {
  id: string;
  name: string;
  stops: TramStop[];
  path: { lat: number; lng: number }[];
  color?: string;
}

interface TramLineMapProps {
  route: TramRoute;
  className?: string;
  height?: number;
}

// Component to handle polyline rendering
function TramLinePolyline({
  path,
  color = "#074feb",
}: {
  path: { lat: number; lng: number }[];
  color?: string;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !window.google?.maps) {
      return;
    }

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    polylineRef.current = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: map,
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, path, color]);

  return null;
}

export function TramLineMap({
  route,
  className = "",
  height = 300,
}: TramLineMapProps) {
  // Calculate center and bounds from route stops
  const center = {
    lat:
      route.stops.reduce((sum, stop) => sum + stop.lat, 0) / route.stops.length,
    lng:
      route.stops.reduce((sum, stop) => sum + stop.lng, 0) / route.stops.length,
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center border border-white/10 ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/20">
            <Train className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="text-white/80 font-medium">
              Podgląd Trasy {route.name}
            </p>
            <p className="text-sm text-white/50">
              {route.stops.length} przystanków
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden border border-white/10 ${className}`}
    >
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={["visualization"]}
      >
        <Map
          mapId="tram-line-map"
          style={{ width: "100%", height: `${height}px` }}
          defaultCenter={center}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          styles={[
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#1a1a2e" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#000000" }, { lightness: 13 }],
            },
            {
              featureType: "administrative",
              elementType: "geometry.fill",
              stylers: [{ color: "#1a1a2e" }],
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [
                { color: "#144b53" },
                { lightness: 14 },
                { weight: 1.4 },
              ],
            },
            {
              featureType: "landscape",
              elementType: "all",
              stylers: [{ color: "#08304b" }],
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [{ color: "#0c4152" }, { lightness: 5 }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.fill",
              stylers: [{ color: "#000080" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b434f" }, { lightness: 25 }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.fill",
              stylers: [{ color: "#000080" }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b3d51" }, { lightness: 16 }],
            },
            {
              featureType: "road.local",
              elementType: "geometry",
              stylers: [{ color: "#000080" }],
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ color: "#146474" }],
            },
            {
              featureType: "water",
              elementType: "all",
              stylers: [{ color: "#021019" }],
            },
          ]}
        >
          {/* Render tram line polyline */}
          <TramLinePolyline path={route.path} color={route.color} />

          {/* Render tram stops */}
          {route.stops.map((stop) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={stop.name}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}

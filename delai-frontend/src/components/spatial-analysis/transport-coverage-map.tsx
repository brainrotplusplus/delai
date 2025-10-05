"use client";

import { MapPin } from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { excludedAreas } from "./data";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function TransportCoverageMap() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[300px] bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 font-medium">
            Mapa Wykluczenia Transportowego
          </p>
          <p className="text-sm text-red-500">Wymagany klucz API Google Maps</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-[450px] w-full rounded-lg overflow-hidden">
        <Map
          defaultCenter={{ lat: 50.0647, lng: 19.945 }}
          defaultZoom={12}
          mapId="kraków-coverage"
          style={{ width: "100%", height: "100%" }}
          disableDefaultUI={true}
          zoomControl={true}
          colorScheme="LIGHT"
        >
          {excludedAreas.map((area) => (
            <AdvancedMarker
              key={area.id}
              position={area.center}
              title={area.name}
            >
              <div className="relative">
                {/* Exclusion circle */}
                <div
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{
                    width: `${Math.max(area.radius / 10, 60)}px`,
                    height: `${Math.max(area.radius / 10, 60)}px`,
                    backgroundColor:
                      area.severity === "high" ? "#ef4444" : "#f97316",
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                />

                {/* Area marker */}
                <div
                  className={`w-4 h-4 rounded-full border-2 relative z-10 ${
                    area.severity === "high"
                      ? "bg-red-500 border-red-400"
                      : "bg-orange-500 border-orange-400"
                  }`}
                ></div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

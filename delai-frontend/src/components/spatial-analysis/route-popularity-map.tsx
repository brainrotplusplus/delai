"use client";

import { TrendingUp } from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { popularRoutes } from "./data";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function RoutePopularityMap() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[300px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-purple-200">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-600 font-medium">
            Mapa Cieplna Popularności Tras
          </p>
          <p className="text-sm text-purple-500">
            Wymagany klucz API Google Maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-[300px] w-full rounded-lg overflow-hidden">
        <Map
          defaultCenter={{ lat: 50.0647, lng: 19.945 }}
          defaultZoom={13}
          mapId="kraków-popularity"
          style={{ width: "100%", height: "100%" }}
          disableDefaultUI={true}
          zoomControl={true}
          colorScheme="LIGHT"
        >
          {popularRoutes.map((route) => (
            <div key={route.id}>
              {/* Route markers at start and end */}
              <AdvancedMarker
                position={route.path[0]}
                title={`${route.name} - Start`}
              >
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{
                    backgroundColor:
                      route.intensity > 80
                        ? "#dc2626"
                        : route.intensity > 60
                        ? "#ea580c"
                        : "#eab308",
                    borderColor:
                      route.intensity > 80
                        ? "#b91c1c"
                        : route.intensity > 60
                        ? "#c2410c"
                        : "#ca8a04",
                  }}
                />
              </AdvancedMarker>

              <AdvancedMarker
                position={route.path[route.path.length - 1]}
                title={`${route.name} - Koniec`}
              >
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{
                    backgroundColor:
                      route.intensity > 80
                        ? "#dc2626"
                        : route.intensity > 60
                        ? "#ea580c"
                        : "#eab308",
                    borderColor:
                      route.intensity > 80
                        ? "#b91c1c"
                        : route.intensity > 60
                        ? "#c2410c"
                        : "#ca8a04",
                  }}
                />
              </AdvancedMarker>
            </div>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

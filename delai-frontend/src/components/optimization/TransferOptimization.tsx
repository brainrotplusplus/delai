"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { MapPin, Users, Clock, TrendingUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "$/components/ui/sheet";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface TransferHub {
  id: string;
  name: string;
  connections: number;
  passengers: number;
  efficiency: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  optimizationPotential: number;
  issues?: string[];
  improvements?: string[];
}

const transferHubs: TransferHub[] = [
  {
    id: "th1",
    name: "Dworzec Główny",
    connections: 12,
    passengers: 45000,
    efficiency: 87,
    coordinates: { lat: 50.0677, lng: 19.9456 },
    radius: 500,
    optimizationPotential: 15,
    issues: [
      "Przeciążenie w godzinach szczytu",
      "Nieefektywne rozmieszczenie peronów",
    ],
    improvements: [
      "Dodatkowe perony",
      "Lepsze oznakowanie",
      "Optymalizacja rozkładów",
    ],
  },
  {
    id: "th2",
    name: "Rondo Mogilskie",
    connections: 8,
    passengers: 32000,
    efficiency: 92,
    coordinates: { lat: 50.0833, lng: 19.9425 },
    radius: 400,
    optimizationPotential: 8,
    issues: ["Długie czasy przesiadki między tramwajami"],
    improvements: ["Synchronizacja rozkładów", "Dodatkowe wiaty"],
  },
  {
    id: "th3",
    name: "Plac Centralny",
    connections: 10,
    passengers: 38000,
    efficiency: 78,
    coordinates: { lat: 50.0614, lng: 19.9228 },
    radius: 450,
    optimizationPotential: 22,
    issues: ["Niewystarczająca pojemność", "Problemy z dostępnością"],
    improvements: [
      "Rozbudowa infrastruktury",
      "Poprawa dostępności",
      "Nowe połączenia",
    ],
  },
  {
    id: "th4",
    name: "Plac Wszystkich Świętych",
    connections: 6,
    passengers: 28000,
    efficiency: 95,
    coordinates: { lat: 50.0619, lng: 19.9352 },
    radius: 350,
    optimizationPotential: 5,
    improvements: ["Drobne optymalizacje rozkładów"],
  },
  {
    id: "th5",
    name: "Nowy Kleparz",
    connections: 7,
    passengers: 24000,
    efficiency: 84,
    coordinates: { lat: 50.0776, lng: 19.9441 },
    radius: 380,
    optimizationPotential: 12,
    issues: ["Nieoptymalne połączenia z autobusami"],
    improvements: ["Integracja rozkładów", "Poprawa infrastruktury"],
  },
];

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function TransferHubsMap() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-[400px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl flex items-center justify-center border border-white/10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/20">
            <MapPin className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <p className="text-white/80 font-medium">
              Interaktywna Mapa Węzłów Przesiadkowych
            </p>
            <p className="text-sm text-white/50">
              Wymagany klucz API Google Maps
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-[400px] w-full rounded-xl overflow-hidden border border-white/10">
        <Map
          defaultCenter={{ lat: 50.0647, lng: 19.945 }}
          defaultZoom={13}
          mapId="kraków-transfer-hubs"
          style={{ width: "100%", height: "100%" }}
          disableDefaultUI={true}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          colorScheme="DARK"
        >
          {transferHubs.map((hub) => (
            <AdvancedMarker
              key={hub.id}
              position={hub.coordinates}
              title={hub.name}
            >
              <div className="relative">
                {/* Circle around hub */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    width: `${Math.max(hub.radius / 8, 40)}px`,
                    height: `${Math.max(hub.radius / 8, 40)}px`,
                    backgroundColor:
                      hub.efficiency > 90
                        ? "#10b981"
                        : hub.efficiency > 80
                        ? "#3b82f6"
                        : "#ef4444",
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                />

                {/* Hub marker */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 relative z-10 ${
                    hub.efficiency > 90
                      ? "bg-green-500 border-green-400"
                      : hub.efficiency > 80
                      ? "bg-blue-500 border-blue-400"
                      : "bg-red-500 border-red-400"
                  }`}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

export function TransferOptimization() {
  const [selectedHub, setSelectedHub] = useState<TransferHub | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleShowDetails = (hub: TransferHub) => {
    setSelectedHub(hub);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="linear-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-semibold">
              Wydajność Węzłów Przesiadkowych
            </CardTitle>
            <CardDescription className="text-white/60">
              Metryki wydajności dla głównych punktów przesiadkowych
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transferHubs.map((hub) => (
                <div
                  key={hub.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200 cursor-pointer"
                  onClick={() => handleShowDetails(hub)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        hub.efficiency > 90
                          ? "bg-green-400"
                          : hub.efficiency > 80
                          ? "bg-blue-400"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <div>
                      <h4 className="font-semibold text-white">{hub.name}</h4>
                      <p className="text-sm text-white/60">
                        {hub.connections} połączeń •{" "}
                        {hub.passengers.toLocaleString()} pasażerów dziennie
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-lg ${
                        hub.efficiency > 90
                          ? "linear-badge-success"
                          : hub.efficiency > 80
                          ? "linear-badge"
                          : "linear-badge-destructive"
                      }`}
                    >
                      {hub.efficiency}% wydajności
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="linear-card w-[95vw] sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  selectedHub?.efficiency && selectedHub.efficiency > 90
                    ? "bg-green-500/20 border-green-500/30"
                    : selectedHub?.efficiency && selectedHub.efficiency > 80
                    ? "bg-blue-500/20 border-blue-500/30"
                    : "bg-red-500/20 border-red-500/30"
                }`}
              >
                <MapPin
                  className={`h-6 w-6 ${
                    selectedHub?.efficiency && selectedHub.efficiency > 90
                      ? "text-green-400"
                      : selectedHub?.efficiency && selectedHub.efficiency > 80
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <SheetTitle className="text-xl text-white">
                  {selectedHub?.name}
                </SheetTitle>
                <SheetDescription className="text-white/60">
                  Szczegóły węzła przesiadkowego
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Hub Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-white/60">Pasażerowie</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {selectedHub?.passengers.toLocaleString()}
                </p>
                <p className="text-xs text-white/40">dziennie</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-white/60">Połączenia</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {selectedHub?.connections}
                </p>
                <p className="text-xs text-white/40">linii</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-white/60">Wydajność</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {selectedHub?.efficiency}%
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-white/60">Potencjał</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  +{selectedHub?.optimizationPotential}%
                </p>
                <p className="text-xs text-white/40">optymalizacji</p>
              </div>
            </div>

            {/* Issues */}
            {selectedHub?.issues && selectedHub.issues.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Zidentyfikowane Problemy
                </h4>
                <ul className="space-y-2">
                  {selectedHub.issues.map((issue, index) => (
                    <li
                      key={index}
                      className="text-white/80 text-sm flex items-start gap-2"
                    >
                      <span className="text-red-400 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {selectedHub?.improvements &&
              selectedHub.improvements.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Rekomendowane Ulepszenia
                  </h4>
                  <ul className="space-y-2">
                    {selectedHub.improvements.map((improvement, index) => (
                      <li
                        key={index}
                        className="text-white/80 text-sm flex items-start gap-2"
                      >
                        <span className="text-green-400 mt-1">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
                className="border-white/20 text-white/80"
              >
                Zamknij
              </Button>
              <Button
                className="linear-button"
                onClick={() => {
                  // Handle optimization implementation
                  setIsDetailsOpen(false);
                }}
              >
                Optymalizuj Węzeł
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

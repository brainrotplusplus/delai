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
import { Users, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "$/components/ui/sheet";
import { TramLineMap } from "./TramLineMap";
import type { TramRoute } from "./TramLineMap";

interface SuggestedRoute {
  id: string;
  name: string;
  priority: "Wysoki" | "Średni" | "Niski";
  reason: string;
  impact: number;
  route: TramRoute;
}

const suggestedRoutes: SuggestedRoute[] = [
  {
    id: "s1",
    name: "Ekspres Dzielnicy Technologicznej",
    priority: "Wysoki",
    reason:
      "Bezpośrednie połączenie między obszarami mieszkalnymi a firmami technologicznymi",
    impact: 2400,
    route: {
      id: "s1",
      name: "Ekspres Dzielnicy Technologicznej",
      color: "#3b82f6",
      stops: [
        {
          id: "s1-1",
          name: "Os. Kolorowe",
          lat: 50.0945,
          lng: 19.8876,
          isTerminal: true,
        },
        { id: "s1-2", name: "Park Technologiczny", lat: 50.0823, lng: 19.9089 },
        { id: "s1-3", name: "Centrum Badawcze", lat: 50.0721, lng: 19.9281 },
        { id: "s1-4", name: "Dworzec Główny", lat: 50.0677, lng: 19.9456 },
        { id: "s1-5", name: "Kampus UJ", lat: 50.0614, lng: 19.9228 },
        {
          id: "s1-6",
          name: "Os. Ruczaj",
          lat: 50.0234,
          lng: 19.9123,
          isTerminal: true,
        },
      ],
      path: [
        { lat: 50.0945, lng: 19.8876 },
        { lat: 50.0823, lng: 19.9089 },
        { lat: 50.0721, lng: 19.9281 },
        { lat: 50.0677, lng: 19.9456 },
        { lat: 50.0614, lng: 19.9228 },
        { lat: 50.0234, lng: 19.9123 },
      ],
    },
  },
  {
    id: "s2",
    name: "Łącznik Szpitalny",
    priority: "Średni",
    reason: "Ulepszony dostęp do placówek medycznych z przedmieść",
    impact: 1800,
    route: {
      id: "s2",
      name: "Łącznik Szpitalny",
      color: "#10b981",
      stops: [
        {
          id: "s2-1",
          name: "Szpital Uniwersytecki",
          lat: 50.0677,
          lng: 19.9456,
          isTerminal: true,
        },
        { id: "s2-2", name: "Centrum Medyczne", lat: 50.0625, lng: 19.9215 },
        { id: "s2-3", name: "Klinika Dziecięca", lat: 50.0823, lng: 19.9089 },
        {
          id: "s2-4",
          name: "Szpital Specjalistyczny",
          lat: 50.0989,
          lng: 19.8934,
        },
        {
          id: "s2-5",
          name: "Os. Medyczne",
          lat: 50.0777,
          lng: 19.7848,
          isTerminal: true,
        },
      ],
      path: [
        { lat: 50.0677, lng: 19.9456 },
        { lat: 50.0625, lng: 19.9215 },
        { lat: 50.0823, lng: 19.9089 },
        { lat: 50.0989, lng: 19.8934 },
        { lat: 50.0777, lng: 19.7848 },
      ],
    },
  },
];

export function SuggestedRoutes() {
  const [selectedRoute, setSelectedRoute] = useState<SuggestedRoute | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleShowDetails = (route: SuggestedRoute) => {
    setSelectedRoute(route);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card className="linear-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-white font-semibold">
            Sugerowane Nowe Trasy
          </CardTitle>
          <CardDescription className="text-white/60">
            Rekomendacje tras generowane przez AI na podstawie analizy popytu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedRoutes.map((route) => (
            <div
              key={route.id}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{route.name}</h4>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    route.priority === "Wysoki"
                      ? "linear-badge-destructive"
                      : route.priority === "Średni"
                      ? "linear-badge-warning"
                      : "linear-badge"
                  }`}
                >
                  {route.priority} Priorytet
                </span>
              </div>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">
                {route.reason}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>
                    Szac. {route.impact.toLocaleString()} pasażerów dziennie
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white/80"
                  onClick={() => handleShowDetails(route)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Szczegóły
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="linear-card w-[95vw] sm:max-w-4xl overflow-y-auto p-6">
          <SheetHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/20">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-xl text-white">
                  {selectedRoute?.name}
                </SheetTitle>
                <SheetDescription className="text-white/60">
                  Szczegóły proponowanej trasy
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Route Map */}
            <Card className="linear-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-white font-semibold">
                  Podgląd Trasy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRoute && (
                  <TramLineMap route={selectedRoute.route} height={300} />
                )}
              </CardContent>
            </Card>

            {/* Route Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">Szczegóły Trasy</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Priorytet:</span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      selectedRoute?.priority === "Wysoki"
                        ? "linear-badge-destructive"
                        : selectedRoute?.priority === "Średni"
                        ? "linear-badge-warning"
                        : "linear-badge"
                    }`}
                  >
                    {selectedRoute?.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Szacowany ruch:</span>
                  <span className="text-white font-medium">
                    {selectedRoute?.impact.toLocaleString()} pasażerów dziennie
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Liczba przystanków:</span>
                  <span className="text-white font-medium">
                    {selectedRoute?.route.stops.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Description */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-3">Uzasadnienie</h4>
              <p className="text-white/80 leading-relaxed">
                {selectedRoute?.reason}
              </p>
            </div>

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
                  // Handle route implementation
                  setIsDetailsOpen(false);
                }}
              >
                Zaimplementuj Trasę
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

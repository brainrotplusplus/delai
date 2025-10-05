"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Badge } from "$/components/ui/badge";
import { Users, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { suggestedStops, popularRoutes, excludedAreas } from "./data";
import { StopPlanningMap } from "./stop-planning-map";

export function StopPlanning() {
  const totalEstimatedImpact = suggestedStops.reduce(
    (sum, stop) => sum + stop.impact,
    0
  );
  const highPriorityStops = suggestedStops.filter(
    (stop) => stop.priority === "Wysoki"
  ).length;
  const affectedPopulation = excludedAreas.reduce(
    (sum, area) => sum + area.population,
    0
  );

  return (
    <div id="stops" className="space-y-6">
      <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-200">
        Planowanie Przystanków
      </h3>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="linear-card animate-fade-in-up animation-delay-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {totalEstimatedImpact.toLocaleString()}
                </p>
                <p className="text-sm text-white/60">Pasażerów dziennie</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="linear-card animate-fade-in-up animation-delay-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {highPriorityStops}
                </p>
                <p className="text-sm text-white/60">Wysoki priorytet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="linear-card animate-fade-in-up animation-delay-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {affectedPopulation.toLocaleString()}
                </p>
                <p className="text-sm text-white/60">Ludność bez dostępu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suggested Stops List */}
        <div className="lg:col-span-1">
          <Card className="linear-card animate-fade-in-up animation-delay-700">
            <CardHeader>
              <CardTitle className="text-white font-semibold">
                Sugerowane Lokalizacje Przystanków
              </CardTitle>
              <CardDescription className="text-white/60">
                Optymalne lokalizacje dla nowych przystanków na podstawie
                analizy popytu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedStops.map((stop, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">
                        {stop.location}
                      </h4>
                      <Badge
                        variant={
                          stop.priority === "Wysoki"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {stop.priority} Priorytet
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{stop.reason}</p>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Users className="h-4 w-4" />
                      <span>Szac. {stop.impact} pasażerów dziennie</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
        </div>
      </div>

      {/* Route Analysis */}
      <Card className="linear-card animate-fade-in-up animation-delay-900">
        <CardHeader>
          <CardTitle className="text-white font-semibold">
            Analiza Tras
          </CardTitle>
          <CardDescription className="text-white/60">
            Przegląd istniejących tras i ich intensywności użytkowania
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {popularRoutes.map((route) => (
              <div
                key={route.id}
                className="p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{route.name}</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        route.intensity > 80
                          ? "bg-red-500"
                          : route.intensity > 60
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm text-white/60">
                      {route.intensity}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Users className="h-4 w-4" />
                    <span>
                      {route.dailyUsers.toLocaleString()} pasażerów/dzień
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        route.intensity > 80
                          ? "bg-red-500"
                          : route.intensity > 60
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }`}
                      style={{ width: `${route.intensity}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

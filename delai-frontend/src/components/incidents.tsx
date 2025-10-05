"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { AlertTriangle, CheckCircle, Siren, Plus } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "$/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Import extracted components and data
import { VehiclesMap } from "./incidents/VehiclesMap";
import { OptimizationDrawer } from "./optimization/OptimizationDrawer";
import {
  demandData,
  heatmapPoints,
  routeAlerts,
  reportedIncidents,
  allAlerts,
  vehiclesPoints
} from "../data/route-optimization";
import type { RouteAlert } from "../types/route-optimization";
import { SuggestedRoutes } from "./optimization/SuggestedRoutes";
import { TransferOptimization } from "./optimization/TransferOptimization";

export function Incidents() {
  const [isOptimizationDrawerOpen, setIsOptimizationDrawerOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteAlert | null>(null);
  const [incidents, setIncidents] = useState(reportedIncidents);
  const [newAlert, setNewAlert] = useState({
    text: "",
    route: "A1",
    timeRange: "0:00 - 24:00"
  });

  const handleOptimizeClick = (route: RouteAlert) => {
    setSelectedRoute(route);
    setIsOptimizationDrawerOpen(true);
  };

  const handleRemoveIncident = (route_id: string) => {
    setIncidents((prev) => prev.filter((incident) => incident.route_id !== route_id));
  };

  const handleCreateAlert = () => {
    if (!newAlert.text.trim()) return;

    const newRouteAlert: RouteAlert = {
      id: `alert-${Date.now()}`,
      route_id: newAlert.route,
      text: newAlert.text,
      timeRange: newAlert.timeRange,
      sent: false
    };

    // Tutaj możesz dodać logikę wysyłania alertu
    console.log("Tworzenie nowego alertu:", newRouteAlert);

    // Reset formularza
    setNewAlert({
      text: "",
      route: "A1",
      timeRange: "0:00 - 24:00"
    });

    // Możesz też dodać alert do listy allAlerts jeśli chcesz
    // allAlerts.unshift(newRouteAlert);
  };

  const getAnimationDelay = (index: number) => {
    const delays = [
      "animation-delay-700",
      "animation-delay-800",
      "animation-delay-900",
      "animation-delay-1000",
    ];
    return delays[index] || "animation-delay-1000";
  };

  const sortedAlerts = allAlerts.slice().sort((a, b) => Number(a.sent) - Number(b.sent));

  return (
    <div className="space-y-8 overflow-hidden">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-fade-in-up">
          Zarządzanie Incydentami
        </h2>
        <p className="text-white/60 text-lg leading-relaxed animate-fade-in-up animation-delay-100">
          Podgląd oraz zarządzanie incydentami zgłaszanymi przez użytkowników oraz alertami
        </p>
      </div>

      {/* Mapa Cieplna Popytu Section */}
      <div id="incident-map" className="space-y-6">
        <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-200">
          Mapa Transportu Publicznego
        </h3>
        <div className="w-full">
          <Card className="linear-card animate-fade-in-up animation-delay-400 w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-white font-semibold">
                Rozmieszczenie pojazdów w sieci
              </CardTitle>
              <CardDescription className="text-white/60">
                Aktualne pozycje wszystkich pojazdów
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <VehiclesMap />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Optymalizacja Częstotliwości Section */}
      <div id="alerts" className="space-y-6">
        <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-500">
          Alerty
        </h3>

        {/* Nowy Card z formularzem tworzenia alertu */}
        <Card className="linear-card animate-fade-in-up animation-delay-550">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-semibold flex items-center gap-2">

              Tworzenie Nowego Alertu
            </CardTitle>
            <CardDescription className="text-white/60">
              Stwórz nowy alert dla pasażerów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pole tekstowe */}
                <div className="md:col-span-2">
                  <label className="text-sm text-white/60 mb-2 block">
                    Treść alertu
                  </label>
                  <input
                    type="text"
                    value={newAlert.text}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Wpisz treść alertu..."
                    className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {/* Dropdown z wyborem trasy */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">
                    Wybierz agencję
                  </label>
                  <select
                    value={newAlert.route}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, route: e.target.value }))}
                    className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none transition-all duration-200"
                  >
                    <option value="A1">Mobilis</option>
                    <option value="A2">Trasa A2</option>
                    <option value="A3">Trasa A3</option>
                     <option value="A4">Trasa A2</option>
                                        <option value="A5">Trasa A3</option>
                  </select>
                </div>
              </div>

              {/* Przycisk wysłania */}
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateAlert}
                  disabled={!newAlert.text.trim()}
                  className="linear-button px-6 py-2"
                >
                  Dodaj Alert
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing alerts card */}
        <Card className="linear-card animate-fade-in-up animation-delay-600">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-semibold">
              Zarządzanie Alertami
            </CardTitle>
            <CardDescription className="text-white/60">
              Roześlij informacje dla podróżnych o bieżących problemach na trasach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200 animate-fade-in-up ${getAnimationDelay(
                    index
                  )}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                      w-10 h-10 rounded-xl flex items-center justify-center
                      ${
                        alert.sent
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-red-500/20 border border-red-500/30"
                      }
                    `}
                    >
                      {alert.sent ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <Siren className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                    <h4 className="font-semibold text-white">
                                              {alert.text}
                                            </h4>
                      <p className="text-sm text-white/60">Zakres czasu: {alert.timeRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!alert.sent && (
                      <input
                        className="rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none transition-all duration-200 w-64 md:w-80"
                        placeholder="Dodaj komentarz..."
                        defaultValue={alert.text}
                      />
                    )}
                    <Button
                      size="sm"
                      className="linear-button px-4 py-2 text-sm"
                      onClick={() => handleOptimizeClick(alert)}
                    >
                      {alert.sent ? "Anuluj" : "Wyślij"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incydenty Section */}
      <div id="incidents" className="space-y-6">
        <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-500">
          Incydenty
        </h3>
        <Card className="linear-card animate-fade-in-up animation-delay-600">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-semibold">
              Zarządzanie Incydentami
            </CardTitle>
            <CardDescription className="text-white/60">
              Przeglądaj i zarządzaj incydentami zgłoszonymi przez użytkowników
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center text-white/60 py-8">Brak incydentów</div>
              ) : (
                incidents.map((incident, index) => (
                  <div
                    key={incident.route_id}
                    className={`flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200 animate-fade-in-up ${getAnimationDelay(
                      index
                    )}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/20 border border-red-500/30
                      `}
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Trasa {incident.route_id}
                        </h4>
                        <p className="text-sm text-white/60">Przyczyna: {incident.cause}</p>
                        <p className="text-sm text-white/60">Efekt: {incident.effect}</p>
                        <p className="text-sm text-white/60">Zakres czasu: {incident.timeRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="linear-button px-4 py-2 text-sm"
                      >
                        Akceptuj
                      </Button>
                      <Button
                        size="sm"
                        className="linear-button px-4 py-2 text-sm"
                        onClick={() => handleRemoveIncident(incident.route_id)}
                      >
                        Odrzuć
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
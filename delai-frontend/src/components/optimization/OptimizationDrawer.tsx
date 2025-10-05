"use client";

import { Card, CardContent, CardHeader, CardTitle } from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "$/components/ui/sheet";
import { ArrowRight, Brain, TrendingUp, Clock, Route } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "$/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { RouteAlert } from "../../types/route-optimization";
import { optimizationData, tramRoutes } from "../../data/route-optimization";
import { TramLineMap } from "./TramLineMap";

interface OptimizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteAlert | null;
}

export function OptimizationDrawer({
  isOpen,
  onClose,
  route,
}: OptimizationDrawerProps) {
  const data = optimizationData[route?.route as keyof typeof optimizationData];

  if (!data) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="linear-card w-[95vw] sm:max-w-4xl overflow-y-auto p-6">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/20">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-xl text-white">
                Optymalizacja AI: {route?.route}
              </SheetTitle>
              <SheetDescription className="text-white/60">
                Analiza i rekomendacje dla {route?.issue}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Tram Route Preview */}
          <Card className="linear-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-white font-semibold flex items-center gap-2">
                <Route className="h-5 w-5 text-blue-400" />
                Podgląd Trasy
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>

          {/* AI Explanation */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Analiza AI</h4>
                <p className="text-white/80 leading-relaxed">
                  {data.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Before/After Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="linear-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-white font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-400" />
                  Przed Optymalizacją
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    passengers: { label: "Pasażerowie", color: "#e5484d" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.beforeData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: "#8a90b8", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#8a90b8", fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="passengers"
                        stroke="#e5484d"
                        strokeWidth={2}
                        dot={{ fill: "#e5484d", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="linear-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Po Optymalizacji
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    passengers: { label: "Pasażerowie", color: "#00d47e" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.afterData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: "#8a90b8", fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: "#8a90b8", fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="passengers"
                        stroke="#00d47e"
                        strokeWidth={2}
                        dot={{ fill: "#00d47e", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Improvements Summary */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Przewidywane Ulepszenia
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">
                  Czas Oczekiwania
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-400">
                    {data.improvements.waitTime.before}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                  <span className="text-green-400 font-semibold">
                    {data.improvements.waitTime.after}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">Wykorzystanie</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-400">
                    {data.improvements.utilization.before}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                  <span className="text-green-400 font-semibold">
                    {data.improvements.utilization.after}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-1">Satysfakcja</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-400">
                    {data.improvements.satisfaction.before}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                  <span className="text-green-400 font-semibold">
                    {data.improvements.satisfaction.after}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white/80"
            >
              Anuluj
            </Button>
            <Button
              className="linear-button"
              onClick={() => {
                // Handle optimization acceptance
                onClose();
              }}
            >
              Zastosuj Optymalizację
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

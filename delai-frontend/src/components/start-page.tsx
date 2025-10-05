"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "$/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Logo } from "$/components/ui/logo";

// Import extracted components and data
import { GoogleMapsHeatmap } from "./optimization/GoogleMapsHeatmap";
import { OptimizationDrawer } from "./optimization/OptimizationDrawer";
import {
  demandData,
  heatmapPoints,
  routeAlerts,
} from "../data/route-optimization";
import type { RouteAlert } from "../types/route-optimization";
import { SuggestedRoutes } from "./optimization/SuggestedRoutes";
import { TransferOptimization } from "./optimization/TransferOptimization";
import { UserCard } from "./start-page/user-card";

export function StartPage({
  setActiveSection,
}: {
  setActiveSection: (section: string) => void;
}) {
  const [isOptimizationDrawerOpen, setIsOptimizationDrawerOpen] =
    useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteAlert | null>(null);

  const handleOptimizeClick = (route: RouteAlert) => {
    setSelectedRoute(route);
    setIsOptimizationDrawerOpen(true);
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-y-12">
        <Logo className="h-64 w-auto" />
        <div className="grid gap-6 md:grid-cols-2 w-auto">
          <UserCard
            title="Pasażer"
            onRedirect={() => setActiveSection("incidents")}
          />
          <UserCard
            title="Dyspozytor"
            onRedirect={() => setActiveSection("incidents")}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Badge } from "$/components/ui/badge";
import { accessibilityData } from "./data";
import { TransportCoverageMap } from "./transport-coverage-map";

export function AccessibilityAnalysis() {
  const getAnimationDelay = (index: number) => {
    const delays = [
      "animation-delay-300",
      "animation-delay-400",
      "animation-delay-500",
      "animation-delay-600",
      "animation-delay-700",
    ];
    return delays[index] || "animation-delay-700";
  };

  return (
    <div id="accessibility" className="space-y-6">
      <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-200">
        Dostępność Transportu
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="linear-card animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold">
              Analiza Pokrycia Według Obszaru
            </CardTitle>
            <CardDescription className="text-white/60">
              Dostępność transportu w różnych obszarach miasta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessibilityData.map((area, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200 animate-fade-in-up ${getAnimationDelay(
                    index
                  )}`}
                >
                  <div>
                    <h4 className="font-medium text-white">{area.area}</h4>
                    <p className="text-sm text-white/60">
                      Populacja: {area.population.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      {area.coverage}%
                    </div>
                    <Badge
                      variant={
                        area.score === "Doskonały"
                          ? "default"
                          : area.score === "Bardzo Dobry" ||
                            area.score === "Dobry"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {area.score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

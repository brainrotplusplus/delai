"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { ChartContainer, ChartTooltip } from "$/components/ui/chart";
import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { densityCorrelation } from "./data";
import { RoutePopularityMap } from "./route-popularity-map";

export function DensityAnalysis() {
  return (
    <div id="density" className="space-y-6">
      <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-200">
        Gęstość Zabudowy
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="linear-card animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold">
              Korelacja Gęstości i Wykorzystania
            </CardTitle>
            <CardDescription className="text-white/60">
              Związek między gęstością zabudowy a wykorzystaniem transportu
              publicznego
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                usage: {
                  label: "Wykorzystanie Transportu",
                  color: "#3b82f6",
                },
                density: {
                  label: "Gęstość Zabudowy",
                  color: "#8b5cf6",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={densityCorrelation}
                  margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                >
                  <XAxis
                    dataKey="density"
                    name="Gęstość Zabudowy"
                    type="number"
                    domain={["dataMin - 10", "dataMax + 10"]}
                    tick={{ fill: "#8a90b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    label={{
                      value: "Gęstość Zabudowy (osoby/km²)",
                      position: "insideBottom",
                      offset: -10,
                      style: {
                        textAnchor: "middle",
                        fill: "#8a90b8",
                        fontSize: "12px",
                      },
                    }}
                  />
                  <YAxis
                    dataKey="usage"
                    name="Wykorzystanie Transportu"
                    type="number"
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tick={{ fill: "#8a90b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                    label={{
                      value: "Wykorzystanie Transportu (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fill: "#8a90b8",
                        fontSize: "12px",
                      },
                    }}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-black/90 p-3 border border-white/20 rounded-lg shadow-lg backdrop-blur-md">
                            <p className="font-semibold text-white mb-2">
                              {data.area}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-white/80">
                                <span className="font-medium">Gęstość:</span>{" "}
                                {data.density} osób/km²
                              </p>
                              <p className="text-sm text-white/80">
                                <span className="font-medium">
                                  Wykorzystanie:
                                </span>{" "}
                                {data.usage}%
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    dataKey="usage"
                    fill="#074feb"
                    stroke="#00e0ff"
                    strokeWidth={2}
                    r={6}
                    fillOpacity={0.8}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

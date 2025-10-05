"use client";

import { useState, useEffect } from "react";
import { Thermometer } from "lucide-react";
import { Badge } from "$/components/ui/badge";
import { ChartTooltip } from "$/components/ui/chart";
import {
  Line,
  LineChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { TimelineDataItem } from "./types";
import { EventIcon } from "./icons";

interface TimelineChartProps {
  data: TimelineDataItem[];
}

export const TimelineChart = ({ data }: TimelineChartProps) => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setChartKey((prev) => prev + 1);
    };

    const initialTimeout = setTimeout(() => {
      setChartKey(1);
    }, 100);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer key={chartKey} width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 60 }}
        >
          <XAxis
            dataKey="dayLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="ridership"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            domain={["dataMin - 5000", "dataMax + 5000"]}
          />
          <YAxis
            yAxisId="temperature"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0]?.payload;
              return (
                <div className="bg-background border rounded-lg p-4 shadow-lg">
                  <h4 className="font-semibold mb-2">{label}</h4>
                  <div className="space-y-2">
                    {data?.ridership && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                        <span>
                          Rzeczywiste: {data.ridership.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                      <span>Prognoza: {data?.predicted?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <span>{data?.temperature}°C</span>
                    </div>
                    {data?.event && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <EventIcon type={data.event.type} className="h-4 w-4" />
                        <span className="font-medium">{data.event.name}</span>
                        <Badge variant="secondary">+{data.event.impact}%</Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          />

          {/* Ridership lines */}
          <Line
            yAxisId="ridership"
            type="monotone"
            dataKey="ridership"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{
              fill: "#3b82f6",
              stroke: "#ffffff",
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              r: 6,
              fill: "#3b82f6",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            connectNulls={false}
          />
          <Line
            yAxisId="ridership"
            type="monotone"
            dataKey="predicted"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={{
              fill: "#8b5cf6",
              stroke: "#ffffff",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 5,
              fill: "#8b5cf6",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />

          {/* Temperature area */}
          <Area
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.1}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

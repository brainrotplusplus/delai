import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import {
  Line,
  LineChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SeasonalDataItem } from "./types";

interface SeasonalChartProps {
  data: SeasonalDataItem[];
}

export const SeasonalChart = ({ data }: SeasonalChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Wzorce Sezonowe
        </CardTitle>
        <CardDescription>
          Analiza sezonowości z uwzględnieniem temperatury
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="ridership"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="temp"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <h4 className="font-semibold mb-2">{label}</h4>
                      <div className="space-y-1">
                        {payload.map(
                          (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            entry: any,
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>
                                {entry.name}: {entry.value?.toLocaleString()}
                              </span>
                              {entry.dataKey === "temperature" && (
                                <span>°C</span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                }}
              />

              {/* Ridership data */}
              <Area
                yAxisId="ridership"
                type="monotone"
                dataKey="avg"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
                name="2024 Średnia"
              />
              <Line
                yAxisId="ridership"
                type="monotone"
                dataKey="year2023"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: "#8b5cf6", r: 3 }}
                name="2023"
              />

              {/* Temperature line */}
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                name="Temperatura"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

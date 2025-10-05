import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Badge } from "$/components/ui/badge";
import { AnomalyDataItem } from "./types";

interface AnomaliesDetectionProps {
  data: AnomalyDataItem[];
}

export const AnomaliesDetection = ({ data }: AnomaliesDetectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Wykrywanie Anomalii
        </CardTitle>
        <CardDescription>Odstępstwa od przewidywanych wzorców</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((anomaly, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  anomaly.severity === "extreme"
                    ? "bg-red-600"
                    : anomaly.severity === "high"
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
              />
              <div>
                <p className="font-medium">
                  {new Date(anomaly.date).toLocaleDateString("pl-PL")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {anomaly.description}
                </p>
              </div>
            </div>
            <Badge
              variant={
                anomaly.severity === "extreme"
                  ? "destructive"
                  : anomaly.severity === "high"
                  ? "default"
                  : "secondary"
              }
            >
              {anomaly.type === "event" ? "Wydarzenie" : "Pogoda"}
            </Badge>
          </div>
        ))}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Statystyki Anomalii</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">
                Wykryte w tym miesiącu:
              </span>
              <div className="font-semibold">4</div>
            </div>
            <div>
              <span className="text-muted-foreground">Średni wpływ:</span>
              <div className="font-semibold">+28%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

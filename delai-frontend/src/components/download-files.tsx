"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Badge } from "$/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "$/components/ui/select";
import { Button } from "$/components/ui/button";
import { Music, Trophy, Calendar, Trash2 } from "lucide-react";

// Import new smaller components
import { Event, TimelineDataItem } from "./demand-forecasting/types";
import {
  baseTimelineData,
  seasonalData,
  anomaliesData,
  createDefaultEvents,
} from "./demand-forecasting/data";
import { TimelineChart } from "./demand-forecasting/timeline-chart";
import { CalendarTimeline } from "./demand-forecasting/calendar-timeline";
import { EventsMap } from "./demand-forecasting/events-map";
import { EventManagement } from "./demand-forecasting/event-management";
import { SeasonalChart } from "./demand-forecasting/seasonal-chart";
import { AnomaliesDetection } from "./demand-forecasting/anomalies-detection";

export function DownloadFiles() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [events, setEvents] = useState<Event[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("demand-forecast-events");
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed.length > 0 ? parsed : createDefaultEvents());
    } else {
      setEvents(createDefaultEvents());
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("demand-forecast-events", JSON.stringify(events));
  }, [events]);

  // Merge base data with dynamic events
  const timelineData: TimelineDataItem[] = baseTimelineData.map((item) => {
    const event = events.find((e) => e.date === item.date);
    return {
      ...item,
      event: event
        ? { name: event.name, type: event.type, impact: event.impact }
        : null,
    };
  });

  const addEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

const handleDownload = async (endpoint: string, defaultFileName: string = 'file.zip') => {
  try {
    const base = "http://0.0.0.0:2137/api/v1/";
    const response = await fetch(base + endpoint);

    if (!response.ok) {
      throw new Error(`Download error: ${response.status}`);
    }

    // Get the file data as a Blob
    const blob = await response.blob();

    // Create a temporary download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Try to get the filename from the headers, otherwise use the provided default
    let fileName = defaultFileName;
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch) {
        // Use the filename from the header and ensure it doesn't have a trailing underscore
        fileName = fileNameMatch[1].replace(/_$/, '');
      }
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download failed:', error);
    alert('Podczas pobierania pliku wystąpił błąd');
  }
};


  return (
    <div className="space-y-8 overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">
          Pliki do Pobrania
        </h2>
        <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up animation-delay-100">
          Pobierz pliki
        </p>
      </div>

      {/* Single full-width card */}
      <Card className="linear-card animate-fade-in-up animation-delay-300 w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-white">
                  GTFS
                </p>
                <p className="text-sm text-white/60">.zip</p>
              </div>
            </div>
            <Button
              size="sm"
              className="linear-button px-6 py-2 text-sm"
              onClick={() => handleDownload("raw-static/GTFS.zip")}
            >
              Pobierz
            </Button>
          </div>
        </CardContent>
      </Card>

          {/* Single full-width card */}
            <Card className="linear-card animate-fade-in-up animation-delay-300 w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        Raw Service Alerts
                      </p>
                      <p className="text-sm text-white/60">.pb</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="linear-button px-6 py-2 text-sm"
                    onClick={() => handleDownload('raw-service-alerts/RawServiceAlerts.pb')}
                  >
                    Pobierz
                  </Button>
                </div>
              </CardContent>
            </Card>

                {/* Single full-width card */}
                  <Card className="linear-card animate-fade-in-up animation-delay-300 w-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              Raw Trip Updates
                            </p>
                            <p className="text-sm text-white/60">.pb</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="linear-button px-6 py-2 text-sm"
                          onClick={() => handleDownload('raw-trip-updates/RawTripUpdates.pb')}
                        >
                          Pobierz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                      {/* Single full-width card */}
                        <Card className="linear-card animate-fade-in-up animation-delay-300 w-full">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-2xl font-bold text-white">
                                    Raw Vehicle Positions
                                  </p>
                                  <p className="text-sm text-white/60">.pb</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="linear-button px-6 py-2 text-sm"
                                onClick={() => handleDownload('raw-vehicle-positions/RawVehiclePositions.pb')}
                              >
                                Pobierz
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

    </div>
  );
}
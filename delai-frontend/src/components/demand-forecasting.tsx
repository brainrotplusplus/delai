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

export function DemandForecasting() {
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

  return (
    <div className="space-y-8 overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">
          Inteligentne Prognozowanie Popytu
        </h2>
        <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up animation-delay-100">
          Zaawansowana analiza czasowa łącząca wzorce pogodowe, wydarzenia
          miejskie i trendy sezonowe
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-white/5 to-white/3 border border-white/10 rounded-xl backdrop-blur-sm animate-fade-in-up animation-delay-200">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-56 h-12 text-base font-medium bg-white/10 border-white/20 text-white hover:bg-white/15 focus:ring-2 focus:ring-blue-500/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">3 miesiące</SelectItem>
            <SelectItem value="6months">6 miesięcy</SelectItem>
            <SelectItem value="12months">12 miesięcy</SelectItem>
          </SelectContent>
        </Select>
        <Badge
          variant="outline"
          className="text-base px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400/30 text-green-100 font-semibold"
        >
          Dokładność: 91.2%
        </Badge>

        {/* Event Management */}
        <EventManagement
          onAddEvent={addEvent}
          isSheetOpen={isSheetOpen}
          onSheetOpenChange={setIsSheetOpen}
        />
      </div>

      {/* Main Timeline Visualization */}
      <Card
        id="timeline"
        className="p-6 animate-fade-in-up animation-delay-300"
      >
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl">
            Oś Czasowa Popytu Transportowego
          </CardTitle>
          <CardDescription>
            Interaktywna wizualizacja łącząca prognozy, warunki pogodowe i
            wydarzenia miejskie
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {/* Timeline Chart */}
          <TimelineChart data={timelineData} />

          {/* Calendar Timeline */}
          <div className="-mt-4">
            <CalendarTimeline data={timelineData} />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Seasonal & Anomalies */}
      <div className="grid gap-6 md:grid-cols-2">
        <div id="seasonal" className="animate-fade-in-up animation-delay-400">
          <SeasonalChart data={seasonalData} />
        </div>
        <div id="anomalies" className="animate-fade-in-up animation-delay-500">
          <AnomaliesDetection data={anomaliesData} />
        </div>
      </div>

      {/* Current Events List and Map */}
      {events.length > 0 && (
        <div id="events" className="grid gap-6 md:grid-cols-2">
          <Card className="animate-fade-in-up animation-delay-600">
            <CardHeader>
              <CardTitle className="text-lg">Aktywne Wydarzenia</CardTitle>
              <CardDescription>
                Zarządzaj wydarzeniami wpływającymi na prognozy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => {
                  const availableDates = baseTimelineData.map((item) => ({
                    value: item.date,
                    label: item.dayLabel,
                  }));

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex justify-center">
                          {event.type === "music" ? (
                            <Music className="h-5 w-5 text-primary" />
                          ) : event.type === "sports" ? (
                            <Trophy className="h-5 w-5 text-primary" />
                          ) : (
                            <Calendar className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {
                              availableDates.find((d) => d.value === event.date)
                                ?.label
                            }{" "}
                            • {event.attendees.toLocaleString()} uczestników
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">+{event.impact}%</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

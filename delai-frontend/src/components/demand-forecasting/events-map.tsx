"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from "@vis.gl/react-google-maps";
import { Event } from "./types";

interface EventsMapProps {
  events: Event[];
}

export const EventsMap = ({ events }: EventsMapProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getMarkerColor = (eventType: string) => {
    switch (eventType) {
      case "music":
        return "#8b5cf6"; // Purple
      case "sports":
        return "#10b981"; // Green
      default:
        return "#3b82f6"; // Blue
    }
  };

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={{ lat: 50.0616, lng: 19.9372 }} // Kraków center
          defaultZoom={13}
          mapId="events-map"
          style={{ width: "100%", height: "100%" }}
        >
          {events.map((event) => (
            <AdvancedMarker
              key={event.id}
              position={{ lat: event.latitude, lng: event.longitude }}
              onClick={() => setSelectedEvent(event)}
            >
              <Pin
                background={getMarkerColor(event.type)}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          ))}

          {selectedEvent && (
            <InfoWindow
              position={{
                lat: selectedEvent.latitude,
                lng: selectedEvent.longitude,
              }}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div className="p-3 min-w-[200px]">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {selectedEvent.name}
                </h3>
                <p className="text-sm text-gray-700 mb-1">
                  👥 {selectedEvent.attendees.toLocaleString()} uczestników
                </p>
                <p className="text-sm font-medium text-green-700 mb-2">
                  📈 +{selectedEvent.impact}% wpływu na ruch
                </p>
                <p className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded">
                  {selectedEvent.type === "music"
                    ? "🎵 Wydarzenie muzyczne"
                    : selectedEvent.type === "sports"
                    ? "🏆 Wydarzenie sportowe"
                    : "📅 Inne wydarzenie"}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

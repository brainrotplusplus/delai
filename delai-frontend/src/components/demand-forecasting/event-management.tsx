"use client";

import { useState } from "react";
import { Button } from "$/components/ui/button";
import { Input } from "$/components/ui/input";
import { Label } from "$/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "$/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "$/components/ui/sheet";
import { Plus } from "lucide-react";
import { Event } from "./types";
import { calculateImpact, baseTimelineData } from "./data";

interface EventManagementProps {
  onAddEvent: (event: Event) => void;
  isSheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

interface EventFormData {
  date: string;
  name: string;
  type: string;
  attendees: number;
  latitude: number;
  longitude: number;
  description: string;
}

interface EventFormProps {
  formData: EventFormData;
  onFormDataChange: (data: Partial<EventFormData>) => void;
  onSubmit: () => void;
  isValid: boolean;
  previewImpact: number;
}

const EventForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  isValid,
  previewImpact,
}: EventFormProps) => {
  const availableDates = baseTimelineData.map((item) => ({
    value: item.date,
    label: item.dayLabel,
  }));

  return (
    <>
      <div className="grid gap-4 py-6 px-4">
        <div className="space-y-2">
          <Label htmlFor="event-date">Data Wydarzenia</Label>
          <Select
            value={formData.date}
            onValueChange={(value) => onFormDataChange({ date: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz datę" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  {date.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-name">Nazwa Wydarzenia</Label>
          <Input
            id="event-name"
            placeholder="np. Koncert, Mecz sportowy"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-type">Typ Wydarzenia</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => onFormDataChange({ type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="music">Koncert/Festiwal</SelectItem>
              <SelectItem value="sports">Wydarzenie Sportowe</SelectItem>
              <SelectItem value="conference">Konferencja</SelectItem>
              <SelectItem value="other">Inne</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-attendees">Liczba Uczestników</Label>
          <Input
            id="event-attendees"
            type="number"
            placeholder="np. 1000"
            value={formData.attendees || ""}
            onChange={(e) =>
              onFormDataChange({ attendees: Number(e.target.value) })
            }
          />
          {previewImpact > 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              Przewidywany wpływ na popyt:{" "}
              <span className="font-semibold text-primary">
                +{previewImpact}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="event-latitude">Szerokość geograficzna</Label>
            <Input
              id="event-latitude"
              type="number"
              step="0.0001"
              placeholder="50.0616"
              value={formData.latitude || ""}
              onChange={(e) =>
                onFormDataChange({ latitude: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-longitude">Długość geograficzna</Label>
            <Input
              id="event-longitude"
              type="number"
              step="0.0001"
              placeholder="19.9372"
              value={formData.longitude || ""}
              onChange={(e) =>
                onFormDataChange({ longitude: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <SheetFooter className="px-1">
        <Button onClick={onSubmit} disabled={!isValid}>
          Dodaj Wydarzenie
        </Button>
      </SheetFooter>
    </>
  );
};

export const EventManagement = ({
  onAddEvent,
  isSheetOpen,
  onSheetOpenChange,
}: EventManagementProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    date: "",
    name: "",
    type: "",
    attendees: 0,
    latitude: 50.0616, // Default to Kraków city center
    longitude: 19.9372,
    description: "",
  });

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      date: "",
      name: "",
      type: "",
      attendees: 0,
      latitude: 50.0616,
      longitude: 19.9372,
      description: "",
    });
  };

  const isFormValid =
    formData.date &&
    formData.name &&
    formData.type &&
    formData.attendees &&
    formData.latitude &&
    formData.longitude;

  const previewImpact =
    formData.attendees && formData.type
      ? calculateImpact(formData.attendees, formData.type)
      : 0;

  const handleAddEvent = () => {
    if (isFormValid) {
      const impact = calculateImpact(formData.attendees, formData.type);
      const event: Event = {
        id: Date.now().toString(),
        date: formData.date,
        name: formData.name,
        type: formData.type,
        attendees: formData.attendees,
        impact: impact,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description || "",
      };
      onAddEvent(event);
      resetForm();
      onSheetOpenChange(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-12 px-6 text-base font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-white hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 transition-all duration-200 shadow-lg shadow-blue-500/10"
        >
          <Plus className="h-5 w-5 mr-2" />
          Dodaj Wydarzenie
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dodaj Nowe Wydarzenie</SheetTitle>
          <SheetDescription>
            Wprowadź szczegóły wydarzenia, które wpłynie na popyt transportowy
          </SheetDescription>
        </SheetHeader>

        <EventForm
          formData={formData}
          onFormDataChange={updateFormData}
          onSubmit={handleAddEvent}
          isValid={!!isFormValid}
          previewImpact={previewImpact}
        />
      </SheetContent>
    </Sheet>
  );
};

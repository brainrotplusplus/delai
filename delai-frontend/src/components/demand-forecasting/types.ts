export interface Event {
  id: string;
  date: string;
  name: string;
  type: string;
  attendees: number;
  impact: number;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface TimelineDataItem {
  date: string;
  dayLabel: string;
  ridership: number | null;
  predicted: number;
  weather: string;
  temperature: number;
  weatherImpact: number;
  event?: {
    name: string;
    type: string;
    impact: number;
  } | null;
}

export interface SeasonalDataItem {
  month: string;
  avg: number;
  year2023: number;
  anomaly: number;
  temperature: number;
}

export interface AnomalyDataItem {
  date: string;
  type: string;
  severity: string;
  description: string;
}

import {
  Event,
  TimelineDataItem,
  SeasonalDataItem,
  AnomalyDataItem,
} from "./types";

// Base timeline data without events - using real current dates
export const baseTimelineData: Omit<TimelineDataItem, "event">[] = [
  {
    date: "2024-12-20",
    dayLabel: "20 Gru",
    ridership: 42000,
    predicted: 43200,
    weather: "snow",
    temperature: -2,
    weatherImpact: -15,
  },
  {
    date: "2024-12-21",
    dayLabel: "21 Gru",
    ridership: 45000,
    predicted: 44800,
    weather: "cloudy",
    temperature: 5,
    weatherImpact: 5,
  },
  {
    date: "2024-12-22",
    dayLabel: "22 Gru",
    ridership: 44500,
    predicted: 45200,
    weather: "sunny",
    temperature: 8,
    weatherImpact: 0,
  },
  {
    date: "2024-12-23",
    dayLabel: "23 Gru",
    ridership: 58000,
    predicted: 46000,
    weather: "rain",
    temperature: 12,
    weatherImpact: 25,
  },
  {
    date: "2024-12-24",
    dayLabel: "24 Gru",
    ridership: 47000,
    predicted: 47200,
    weather: "sunny",
    temperature: 15,
    weatherImpact: 0,
  },
  {
    date: "2024-12-25",
    dayLabel: "25 Gru",
    ridership: 65000,
    predicted: 49000,
    weather: "cloudy",
    temperature: 18,
    weatherImpact: 5,
  },
  {
    date: "2024-12-26",
    dayLabel: "26 Gru",
    ridership: 51000,
    predicted: 50800,
    weather: "sunny",
    temperature: 22,
    weatherImpact: 0,
  },
  {
    date: "2024-12-27",
    dayLabel: "27 Gru",
    ridership: 52500,
    predicted: 52200,
    weather: "rain",
    temperature: 16,
    weatherImpact: 15,
  },
  {
    date: "2024-12-28",
    dayLabel: "28 Gru",
    ridership: null,
    predicted: 54000,
    weather: "sunny",
    temperature: 25,
    weatherImpact: 0,
  },
  {
    date: "2024-12-29",
    dayLabel: "29 Gru",
    ridership: null,
    predicted: 72000,
    weather: "sunny",
    temperature: 24,
    weatherImpact: 0,
  },
];

// Seasonal patterns data
export const seasonalData: SeasonalDataItem[] = [
  { month: "Sty", avg: 42000, year2023: 40000, anomaly: 5, temperature: 2 },
  { month: "Lut", avg: 44000, year2023: 42000, anomaly: -2, temperature: 4 },
  { month: "Mar", avg: 49000, year2023: 47000, anomaly: 12, temperature: 10 },
  { month: "Kwi", avg: 54000, year2023: 52000, anomaly: 8, temperature: 16 },
  { month: "Maj", avg: 57000, year2023: 55000, anomaly: -3, temperature: 21 },
  { month: "Cze", avg: 60000, year2023: 58000, anomaly: 15, temperature: 25 },
  { month: "Lip", avg: 62000, year2023: 60000, anomaly: 7, temperature: 27 },
  { month: "Sie", avg: 61000, year2023: 59000, anomaly: -5, temperature: 26 },
  { month: "Wrz", avg: 56000, year2023: 54000, anomaly: 4, temperature: 20 },
  { month: "Paź", avg: 52000, year2023: 50000, anomaly: -8, temperature: 14 },
  { month: "Lis", avg: 47000, year2023: 45000, anomaly: 3, temperature: 8 },
  { month: "Gru", avg: 44000, year2023: 42000, anomaly: 6, temperature: 3 },
];

// Anomalies data
export const anomaliesData: AnomalyDataItem[] = [
  {
    date: "2024-02-10",
    type: "event",
    severity: "high",
    description: "Koncert - wzrost o 30%",
  },
  {
    date: "2024-03-05",
    type: "event",
    severity: "high",
    description: "Mecz sportowy - wzrost o 45%",
  },
  {
    date: "2024-01-15",
    type: "weather",
    severity: "medium",
    description: "Śnieg - spadek o 15%",
  },
  {
    date: "2024-04-20",
    type: "event",
    severity: "extreme",
    description: "Festiwal - przewidywany wzrost o 50%",
  },
];

// Function to calculate impact based on event size
export const calculateImpact = (
  attendees: number,
  eventType: string
): number => {
  const baseCapacity = 50000; // Average daily ridership
  let multiplier = 1;

  // Different event types have different impact multipliers
  switch (eventType) {
    case "sports":
      multiplier = 1.5; // Sports events generate more transport demand
      break;
    case "music":
      multiplier = 1.2; // Concerts/festivals
      break;
    case "conference":
      multiplier = 0.8; // Business events generate less peak demand
      break;
    default:
      multiplier = 1;
  }

  // Calculate percentage impact based on attendees vs base capacity
  const impact = Math.round((attendees / baseCapacity) * 100 * multiplier);
  return Math.min(impact, 200); // Cap at 200% increase
};

// Default example events for Kraków
export const createDefaultEvents = (): Event[] => [
  {
    id: "default-1",
    date: "2024-12-25",
    name: "Koncert na Rynku Głównym",
    type: "music",
    attendees: 5000,
    impact: calculateImpact(5000, "music"),
    latitude: 50.0616,
    longitude: 19.9372,
    description: "Koncert noworoczny na Rynku Głównym",
  },
  {
    id: "default-2",
    date: "2024-12-28",
    name: "Mecz Wisły Kraków",
    type: "sports",
    attendees: 15000,
    impact: calculateImpact(15000, "sports"),
    latitude: 50.0696,
    longitude: 19.9578,
    description: "Mecz piłkarski na stadionie Wisły",
  },
];

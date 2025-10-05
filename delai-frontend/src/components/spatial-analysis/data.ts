export const accessibilityData = [
  { area: "Centrum", coverage: 95, population: 45000, score: "Doskonały" },
  {
    area: "Północne Przedmieścia",
    coverage: 72,
    population: 32000,
    score: "Dobry",
  },
  {
    area: "Strefa Przemysłowa",
    coverage: 45,
    population: 18000,
    score: "Słaby",
  },
  {
    area: "Wschodnia Dzielnica Mieszkaniowa",
    coverage: 68,
    population: 28000,
    score: "Dobry",
  },
  {
    area: "Dzielnica Uniwersytecka",
    coverage: 88,
    population: 22000,
    score: "Bardzo Dobry",
  },
];

export const densityCorrelation = [
  { density: 120, usage: 85, area: "Centrum Miasta" },
  { density: 95, usage: 72, area: "Dzielnica Biznesowa" },
  { density: 80, usage: 65, area: "Dzielnica Mieszkaniowa A" },
  { density: 60, usage: 45, area: "Przedmieścia" },
  { density: 150, usage: 95, area: "Uniwersytet" },
  { density: 40, usage: 30, area: "Strefa Przemysłowa" },
  { density: 110, usage: 78, area: "Centrum Handlowe" },
];

export const suggestedStops = [
  {
    id: "stop1",
    location: "Klonowa i 5 Ulica",
    priority: "Wysoki",
    reason: "Duży ruch pieszych, 800m przerwy",
    impact: 1200,
    coordinates: { lat: 50.0845, lng: 19.9176 },
  },
  {
    id: "stop2",
    location: "Wejście do Parku Technologicznego",
    priority: "Wysoki",
    reason: "Główne centrum zatrudnienia",
    impact: 950,
    coordinates: { lat: 50.0723, lng: 19.9281 },
  },
  {
    id: "stop3",
    location: "Centrum Społeczności",
    priority: "Średni",
    reason: "Ośrodek usług społecznych",
    impact: 600,
    coordinates: { lat: 50.0534, lng: 19.9412 },
  },
  {
    id: "stop4",
    location: "Plaza Handlowa",
    priority: "Średni",
    reason: "Aktywność komercyjna",
    impact: 750,
    coordinates: { lat: 50.0912, lng: 19.8734 },
  },
];

// Areas with poor transport coverage
export const excludedAreas = [
  {
    id: "area1",
    name: "Północne Przedmieścia",
    center: { lat: 50.1123, lng: 19.9123 },
    radius: 800,
    severity: "high" as const, // high, medium, low
    population: 15000,
  },
  {
    id: "area2",
    name: "Strefa Przemysłowa",
    center: { lat: 50.0234, lng: 19.8567 },
    radius: 1200,
    severity: "high" as const,
    population: 8000,
  },
  {
    id: "area3",
    name: "Wschodnie Osiedle",
    center: { lat: 50.0789, lng: 20.0123 },
    radius: 600,
    severity: "medium" as const,
    population: 12000,
  },
  {
    id: "area4",
    name: "Południowe Przedmieścia",
    center: { lat: 50.0123, lng: 19.9789 },
    radius: 900,
    severity: "medium" as const,
    population: 18000,
  },
];

// Popular routes with usage intensity
export const popularRoutes = [
  {
    id: "route1",
    name: "Trasa 4",
    path: [
      { lat: 50.0677, lng: 19.9456 },
      { lat: 50.0725, lng: 19.9234 },
      { lat: 50.0823, lng: 19.9089 },
      { lat: 50.0912, lng: 19.8956 },
    ],
    intensity: 95, // 0-100
    dailyUsers: 35000,
  },
  {
    id: "route2",
    name: "Trasa 11",
    path: [
      { lat: 50.0614, lng: 19.9228 },
      { lat: 50.0567, lng: 19.9345 },
      { lat: 50.0534, lng: 19.9412 },
      { lat: 50.0489, lng: 19.9567 },
    ],
    intensity: 78,
    dailyUsers: 28000,
  },
  {
    id: "route3",
    name: "Trasa 18",
    path: [
      { lat: 50.0833, lng: 19.9425 },
      { lat: 50.0789, lng: 19.9567 },
      { lat: 50.0723, lng: 19.9681 },
      { lat: 50.0677, lng: 19.9789 },
    ],
    intensity: 62,
    dailyUsers: 21000,
  },
];

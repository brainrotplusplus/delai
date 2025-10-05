export interface RouteAlert {
  route: string;
  status: string;
  utilization: number;
  issue: string | null;
}

export interface TransferHub {
  name: string;
  connections: number;
  efficiency: number;
  passengers: number;
}

export interface DemandDataPoint {
  hour: string;
  demand: number;
  capacity: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface VehiclePointInfo {
  lat: number;
  lng: number;
  label: string;
}

interface VehiclePoint {
  id: string;
  vehicle: Vehicle;
}

interface Vehicle {
  congestion_level: "UNKNOWN_CONGESTION_LEVEL" | string;
  current_status: "IN_TRANSIT_TO" | string;
  current_stop_sequence: number;
  occupancy_status: "EMPTY" | string;
  position: Position;
  stop_id: string;
  timestamp: string;
  trip: Trip;
  vehicle: VehicleInfo;
}

interface Position {
  bearing: number;
  latitude: number;
  longitude: number;
}

interface Trip {
  schedule_relationship: "SCHEDULED" | string;
  trip_id: string;
}

interface VehicleInfo {
  id: string;
  label: string;
  license_plate: string;
}

// Enums dla znanych wartości (opcjonalnie, ale zalecane)
enum CongestionLevel {
  UNKNOWN_CONGESTION_LEVEL = "UNKNOWN_CONGESTION_LEVEL"
}

enum CurrentStatus {
  IN_TRANSIT_TO = "IN_TRANSIT_TO"
}

enum OccupancyStatus {
  EMPTY = "EMPTY"
}

enum ScheduleRelationship {
  SCHEDULED = "SCHEDULED"
}

// Alternatywnie, bardziej szczegółowe typy z enumami:
interface VehicleDetailed {
  congestion_level: CongestionLevel;
  current_status: CurrentStatus;
  current_stop_sequence: number;
  occupancy_status: OccupancyStatus;
  position: Position;
  stop_id: string;
  timestamp: string;
  trip: {
    schedule_relationship: ScheduleRelationship;
    trip_id: string;
  };
  vehicle: VehicleInfo;
}

interface VehicleDataDetailed {
  id: string;
  vehicle: VehicleDetailed;
}

export interface OptimizationData {
  issue: string;
  explanation: string;
  beforeData: { hour: string; passengers: number }[];
  afterData: { hour: string; passengers: number }[];
  improvements: {
    waitTime: { before: string; after: string };
    utilization: { before: string; after: string };
    satisfaction: { before: string; after: string };
  };
}

export interface Alert {
  route_id: string;
  text: string;
  timeRange: string;
  sent: boolean;
  status: string;
}

export interface Incident {
  route_id: string;
  cause: string;
  effect: string;
  timeRange: string;
}

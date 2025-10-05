import type {
  DemandDataPoint,
  HeatmapPoint,
  RouteAlert,
  TransferHub,
  OptimizationData,
  Alert,
  Incident,
  VehiclePoint
} from "../types/route-optimization";
import type { TramRoute } from "../components/optimization/TramLineMap";

// Tram routes data for Kraków
export const tramRoutes: Record<string, TramRoute> = {
  "Trasa 15": {
    id: "15",
    name: "Trasa 15",
    color: "#e5484d",
    stops: [
      {
        id: "15-1",
        name: "Dworzec Główny",
        lat: 50.0677,
        lng: 19.9456,
        isTerminal: true,
      },
      { id: "15-2", name: "Galeria Krakowska", lat: 50.0693, lng: 19.9447 },
      { id: "15-3", name: "Rondo Mogilskie", lat: 50.0784, lng: 19.9364 },
      { id: "15-4", name: "Teatr Bagatela", lat: 50.0721, lng: 19.9281 },
      {
        id: "15-5",
        name: "Plac Wszystkich Świętych",
        lat: 50.0656,
        lng: 19.9298,
      },
      { id: "15-6", name: "Rynek Główny", lat: 50.0619, lng: 19.9368 },
      { id: "15-7", name: "Stradom", lat: 50.0534, lng: 19.9423 },
      { id: "15-8", name: "Wawel", lat: 50.0544, lng: 19.9356 },
      { id: "15-9", name: "Most Grunwaldzki", lat: 50.0478, lng: 19.9334 },
      {
        id: "15-10",
        name: "Salwator",
        lat: 50.0456,
        lng: 19.9123,
        isTerminal: true,
      },
    ],
    path: [
      { lat: 50.0677, lng: 19.9456 },
      { lat: 50.0693, lng: 19.9447 },
      { lat: 50.0784, lng: 19.9364 },
      { lat: 50.0721, lng: 19.9281 },
      { lat: 50.0656, lng: 19.9298 },
      { lat: 50.0619, lng: 19.9368 },
      { lat: 50.0534, lng: 19.9423 },
      { lat: 50.0544, lng: 19.9356 },
      { lat: 50.0478, lng: 19.9334 },
      { lat: 50.0456, lng: 19.9123 },
    ],
  },
  "Trasa 7": {
    id: "7",
    name: "Trasa 7",
    color: "#f59e0b",
    stops: [
      {
        id: "7-1",
        name: "Os. Piastów",
        lat: 50.0945,
        lng: 19.8876,
        isTerminal: true,
      },
      { id: "7-2", name: "Bronowice Małe", lat: 50.0892, lng: 19.8923 },
      { id: "7-3", name: "AGH", lat: 50.0648, lng: 19.9137 },
      { id: "7-4", name: "Filharmonia", lat: 50.0634, lng: 19.9223 },
      {
        id: "7-5",
        name: "Plac Wszystkich Świętych",
        lat: 50.0656,
        lng: 19.9298,
      },
      { id: "7-6", name: "Poczta Główna", lat: 50.0623, lng: 19.9412 },
      { id: "7-7", name: "Kazimierz", lat: 50.0516, lng: 19.9461 },
      { id: "7-8", name: "Podgórze", lat: 50.0389, lng: 19.9489 },
      {
        id: "7-9",
        name: "Bonarka",
        lat: 50.0234,
        lng: 19.9523,
        isTerminal: true,
      },
    ],
    path: [
      { lat: 50.0945, lng: 19.8876 },
      { lat: 50.0892, lng: 19.8923 },
      { lat: 50.0648, lng: 19.9137 },
      { lat: 50.0634, lng: 19.9223 },
      { lat: 50.0656, lng: 19.9298 },
      { lat: 50.0623, lng: 19.9412 },
      { lat: 50.0516, lng: 19.9461 },
      { lat: 50.0389, lng: 19.9489 },
      { lat: 50.0234, lng: 19.9523 },
    ],
  },
  "Trasa 23": {
    id: "23",
    name: "Trasa 23",
    color: "#00d47e",
    stops: [
      {
        id: "23-1",
        name: "Dworzec Główny",
        lat: 50.0677,
        lng: 19.9456,
        isTerminal: true,
      },
      { id: "23-2", name: "Politechnika", lat: 50.0625, lng: 19.9215 },
      { id: "23-3", name: "Krowodrza Górka", lat: 50.0823, lng: 19.9089 },
      { id: "23-4", name: "Azory", lat: 50.0989, lng: 19.8934 },
      {
        id: "23-5",
        name: "Balice",
        lat: 50.0777,
        lng: 19.7848,
        isTerminal: true,
      },
    ],
    path: [
      { lat: 50.0677, lng: 19.9456 },
      { lat: 50.0625, lng: 19.9215 },
      { lat: 50.0823, lng: 19.9089 },
      { lat: 50.0989, lng: 19.8934 },
      { lat: 50.0777, lng: 19.7848 },
    ],
  },
  "Trasa 42": {
    id: "42",
    name: "Trasa 42",
    color: "#8b5cf6",
    stops: [
      {
        id: "42-1",
        name: "Rondo Matecznego",
        lat: 50.0234,
        lng: 19.9123,
        isTerminal: true,
      },
      { id: "42-2", name: "Wieczysta", lat: 50.0356, lng: 19.9256 },
      { id: "42-3", name: "Teatr Słowackiego", lat: 50.0678, lng: 19.9356 },
      { id: "42-4", name: "Dworzec Główny", lat: 50.0677, lng: 19.9456 },
      { id: "42-5", name: "Nowa Huta Centrum", lat: 50.0775, lng: 20.0339 },
      {
        id: "42-6",
        name: "Plac Centralny",
        lat: 50.0801,
        lng: 20.0398,
        isTerminal: true,
      },
    ],
    path: [
      { lat: 50.0234, lng: 19.9123 },
      { lat: 50.0356, lng: 19.9256 },
      { lat: 50.0678, lng: 19.9356 },
      { lat: 50.0677, lng: 19.9456 },
      { lat: 50.0823, lng: 19.9578 },
      { lat: 50.0775, lng: 20.0339 },
      { lat: 50.0801, lng: 20.0398 },
    ],
  },
};

export const demandData: DemandDataPoint[] = [
  { hour: "06:00", demand: 45, capacity: 60 },
  { hour: "07:00", demand: 85, capacity: 60 },
  { hour: "08:00", demand: 95, capacity: 60 },
  { hour: "09:00", demand: 70, capacity: 60 },
  { hour: "10:00", demand: 40, capacity: 60 },
  { hour: "11:00", demand: 35, capacity: 60 },
  { hour: "12:00", demand: 55, capacity: 60 },
  { hour: "13:00", demand: 50, capacity: 60 },
  { hour: "14:00", demand: 45, capacity: 60 },
  { hour: "15:00", demand: 60, capacity: 60 },
  { hour: "16:00", demand: 75, capacity: 60 },
  { hour: "17:00", demand: 90, capacity: 60 },
  { hour: "18:00", demand: 85, capacity: 60 },
  { hour: "19:00", demand: 65, capacity: 60 },
];

// Sample heatmap data points for Kraków transport demand
export const heatmapPoints: HeatmapPoint[] = [
  // Main Market Square & Old Town - High demand
  { lat: 50.0619, lng: 19.9368, weight: 0.95 }, // Rynek Główny (Main Square)
  { lat: 50.0614, lng: 19.9383, weight: 0.88 },
  { lat: 50.0625, lng: 19.9355, weight: 0.85 },

  // Kraków Główny Station area - Very High demand
  { lat: 50.0677, lng: 19.9456, weight: 0.98 }, // Main Railway Station
  { lat: 50.0685, lng: 19.9441, weight: 0.92 },
  { lat: 50.067, lng: 19.947, weight: 0.89 },

  // Kazimierz District - High demand
  { lat: 50.0516, lng: 19.9461, weight: 0.82 },
  { lat: 50.0501, lng: 19.9485, weight: 0.78 },

  // Jagiellonian University area - High demand
  { lat: 50.0614, lng: 19.9228, weight: 0.8 },
  { lat: 50.0628, lng: 19.9214, weight: 0.75 },

  // Galeria Krakowska Shopping Center
  { lat: 50.0693, lng: 19.9447, weight: 0.85 },

  // Wawel Castle area
  { lat: 50.0544, lng: 19.9356, weight: 0.72 },

  // Business District (around Rondo Mogilskie)
  { lat: 50.0784, lng: 19.9364, weight: 0.78 },
  { lat: 50.0798, lng: 19.9381, weight: 0.74 },

  // Podgórze District - Medium demand
  { lat: 50.0389, lng: 19.9489, weight: 0.65 },
  { lat: 50.0356, lng: 19.9523, weight: 0.62 },

  // Nowa Huta - Medium demand
  { lat: 50.0775, lng: 20.0339, weight: 0.68 },
  { lat: 50.0801, lng: 20.0298, weight: 0.64 },
  { lat: 50.0834, lng: 20.0412, weight: 0.61 },

  // Bronowice - Medium demand
  { lat: 50.0892, lng: 19.8876, weight: 0.58 },
  { lat: 50.0934, lng: 19.8923, weight: 0.55 },

  // Kraków Airport area
  { lat: 50.0777, lng: 19.7848, weight: 0.52 },

  // Residential suburbs - Lower demand
  { lat: 50.0234, lng: 19.9123, weight: 0.35 },
  { lat: 50.1089, lng: 19.9678, weight: 0.32 },
  { lat: 50.0445, lng: 20.0789, weight: 0.28 },
  { lat: 50.0123, lng: 19.8567, weight: 0.25 },
  { lat: 50.1234, lng: 19.8234, weight: 0.3 },
];


export const vehiclesPoints : VehiclePoint[] = [

        {
          "id": "A1_244",
          "vehicle": {
            "current_stop_sequence": 1,
            "position": {
              "bearing": 90.0,
              "latitude": 50.043285,
              "longitude": 19.819792
            },
            "stop_id": "A1_stop_196_26102",
            "timestamp": "1759620500",
            "trip": {
              "trip_id": "A1_block_837_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_244",
              "label": "244",
              "license_plate": "DO244"
            }
          }
        },
        {
          "id": "A1_311",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 1,
            "position": {
              "latitude": 50.018345,
              "longitude": 19.889236
            },
            "stop_id": "A1_stop_1362_303804",
            "timestamp": "1759620502",
            "trip": {
              "trip_id": "A1_block_858_trip_10_service_2"
            },
            "vehicle": {
              "id": "A1_311",
              "label": "311",
              "license_plate": "DU311"
            }
          }
        },
        {
          "id": "A1_319",
          "vehicle": {
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 7,
            "position": {
              "bearing": 135.0,
              "latitude": 50.093853,
              "longitude": 19.773785
            },
            "stop_id": "A1_stop_2203_341402",
            "timestamp": "1759620504",
            "trip": {
              "trip_id": "A1_block_863_trip_7_service_2"
            },
            "vehicle": {
              "id": "A1_319",
              "label": "319",
              "license_plate": "BU319"
            }
          }
        },
        {
          "id": "A1_341",
          "vehicle": {
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 1,
            "position": {
              "bearing": 180.0,
              "latitude": 50.029484,
              "longitude": 19.937082
            },
            "stop_id": "A1_stop_640_92211",
            "timestamp": "1759620500",
            "trip": {
              "trip_id": "A1_block_742_trip_19_service_2"
            },
            "vehicle": {
              "id": "A1_341",
              "label": "341",
              "license_plate": "KU341"
            }
          }
        },
        {
          "id": "A1_509",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 43,
            "position": {
              "bearing": 225.0,
              "latitude": 50.027866,
              "longitude": 19.914097
            },
            "stop_id": "A1_stop_1133_268901",
            "timestamp": "1759620505",
            "trip": {
              "trip_id": "A1_block_836_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_509",
              "label": "509",
              "license_plate": "BR509"
            }
          }
        },
        {
          "id": "A1_522",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 15,
            "position": {
              "bearing": 90.0,
              "latitude": 50.02536,
              "longitude": 19.959167
            },
            "stop_id": "A1_stop_108_14101",
            "timestamp": "1759620507",
            "trip": {
              "trip_id": "A1_block_856_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_522",
              "label": "522",
              "license_plate": "DR522"
            }
          }
        },
        {
          "id": "A1_523",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 13,
            "position": {
              "bearing": 135.0,
              "latitude": 50.064743,
              "longitude": 19.94455
            },
            "stop_id": "A1_stop_1921_324202",
            "timestamp": "1759620498",
            "trip": {
              "trip_id": "A1_block_845_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_523",
              "label": "523",
              "license_plate": "DR523"
            }
          }
        },
        {
          "id": "A1_543",
          "vehicle": {
            "current_stop_sequence": 34,
            "position": {
              "bearing": 90.0,
              "latitude": 50.00591,
              "longitude": 19.982119
            },
            "stop_id": "A1_stop_629_90402",
            "timestamp": "1759620507",
            "trip": {
              "trip_id": "A1_block_859_trip_6_service_2"
            },
            "vehicle": {
              "id": "A1_543",
              "label": "543",
              "license_plate": "DR543"
            }
          }
        },
        {
          "id": "A1_545",
          "vehicle": {
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 35,
            "position": {
              "bearing": 45.0,
              "latitude": 50.09645,
              "longitude": 19.974583
            },
            "stop_id": "A1_stop_3432_391204",
            "timestamp": "1759620500",
            "trip": {
              "trip_id": "A1_block_840_trip_7_service_2"
            },
            "vehicle": {
              "id": "A1_545",
              "label": "545",
              "license_plate": "DR545"
            }
          }
        },
        {
          "id": "A1_547",
          "vehicle": {
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 27,
            "position": {
              "bearing": 90.0,
              "latitude": 50.014267,
              "longitude": 19.965242
            },
            "stop_id": "A1_stop_501_71504",
            "timestamp": "1759620504",
            "trip": {
              "trip_id": "A1_block_839_trip_6_service_2"
            },
            "vehicle": {
              "id": "A1_547",
              "label": "547",
              "license_plate": "DR547"
            }
          }
        },
        {
          "id": "A1_557",
          "vehicle": {
            "current_stop_sequence": 39,
            "position": {
              "bearing": 90.0,
              "latitude": 50.090004,
              "longitude": 20.024061
            },
            "stop_id": "A1_stop_291_40201",
            "timestamp": "1759620498",
            "trip": {
              "trip_id": "A1_block_828_trip_10_service_2"
            },
            "vehicle": {
              "id": "A1_557",
              "label": "557",
              "license_plate": "BR557"
            }
          }
        },
        {
          "id": "A1_560",
          "vehicle": {
            "current_stop_sequence": 3,
            "position": {
              "bearing": 135.0,
              "latitude": 50.005157,
              "longitude": 19.943193
            },
            "stop_id": "A1_stop_523_74004",
            "timestamp": "1759620505",
            "trip": {
              "trip_id": "A1_block_838_trip_9_service_2"
            },
            "vehicle": {
              "id": "A1_560",
              "label": "560",
              "license_plate": "BR560"
            }
          }
        },
        {
          "id": "A1_569",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 1,
            "position": {
              "bearing": 45.0,
              "latitude": 50.09094,
              "longitude": 19.840311
            },
            "stop_id": "A1_stop_2512_356001",
            "timestamp": "1759620502",
            "trip": {
              "trip_id": "A1_block_830_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_569",
              "label": "569",
              "license_plate": "BR569"
            }
          }
        },
        {
          "id": "A1_573",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 14,
            "position": {
              "bearing": 135.0,
              "latitude": 50.06463,
              "longitude": 19.944653
            },
            "stop_id": "A1_stop_1921_324202",
            "timestamp": "1759620501",
            "trip": {
              "trip_id": "A1_block_841_trip_8_service_2"
            },
            "vehicle": {
              "id": "A1_573",
              "label": "573",
              "license_plate": "BR573"
            }
          }
        },
        {
          "id": "A1_575",
          "vehicle": {
            "current_stop_sequence": 29,
            "position": {
              "latitude": 50.079617,
              "longitude": 19.880556
            },
            "stop_id": "A1_stop_0_0",
            "timestamp": "1759620505",
            "trip": {
              "trip_id": "A1_block_846_trip_6_service_2"
            },
            "vehicle": {
              "id": "A1_575",
              "label": "575",
              "license_plate": "BR575"
            }
          }
        },
        {
          "id": "A1_577",
          "vehicle": {
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 18,
            "position": {
              "bearing": 270.0,
              "latitude": 50.07905,
              "longitude": 20.038855
            },
            "stop_id": "A1_stop_302_41701",
            "timestamp": "1759620502",
            "trip": {
              "trip_id": "A1_block_827_trip_11_service_2"
            },
            "vehicle": {
              "id": "A1_577",
              "label": "577",
              "license_plate": "BR577"
            }
          }
        },
        {
          "id": "A1_583",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 5,
            "position": {
              "bearing": 315.0,
              "latitude": 50.007137,
              "longitude": 19.896147
            },
            "stop_id": "A1_stop_582_83001",
            "timestamp": "1759620500",
            "trip": {
              "trip_id": "A1_block_835_trip_3_service_2"
            },
            "vehicle": {
              "id": "A1_583",
              "label": "583",
              "license_plate": "DR583"
            }
          }
        },
        {
          "id": "A1_594",
          "vehicle": {
            "current_stop_sequence": 9,
            "position": {
              "bearing": 270.0,
              "latitude": 50.036613,
              "longitude": 20.012362
            },
            "stop_id": "A1_stop_1058_257602",
            "timestamp": "1759620498",
            "trip": {
              "trip_id": "A1_block_831_trip_7_service_2"
            },
            "vehicle": {
              "id": "A1_594",
              "label": "594",
              "license_plate": "DR594"
            }
          }
        },
        {
          "id": "A1_733",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 17,
            "position": {
              "bearing": 270.0,
              "latitude": 50.06465,
              "longitude": 19.945799
            },
            "stop_id": "A1_stop_1921_324201",
            "timestamp": "1759620502",
            "trip": {
              "trip_id": "A1_block_843_trip_3_service_2"
            },
            "vehicle": {
              "id": "A1_733",
              "label": "733",
              "license_plate": "DC733"
            }
          }
        },
        {
          "id": "A1_791",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 19,
            "position": {
              "bearing": 270.0,
              "latitude": 50.064606,
              "longitude": 19.945452
            },
            "stop_id": "A1_stop_1921_324201",
            "timestamp": "1759620498",
            "trip": {
              "trip_id": "A1_block_842_trip_7_service_2"
            },
            "vehicle": {
              "id": "A1_791",
              "label": "791",
              "license_plate": "PR791"
            }
          }
        },
        {
          "id": "A1_792",
          "vehicle": {
            "current_stop_sequence": 1,
            "position": {
              "bearing": 270.0,
              "latitude": 50.09062,
              "longitude": 19.839272
            },
            "stop_id": "A1_stop_2514_356502",
            "timestamp": "1759620497",
            "trip": {
              "trip_id": "A1_block_829_trip_6_service_2"
            },
            "vehicle": {
              "id": "A1_792",
              "label": "792",
              "license_plate": "PR792"
            }
          }
        },
        {
          "id": "A1_793",
          "vehicle": {
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 1,
            "position": {
              "bearing": 180.0,
              "latitude": 50.101006,
              "longitude": 20.012882
            },
            "stop_id": "A1_stop_273_37802",
            "timestamp": "1759620502",
            "trip": {
              "trip_id": "A1_block_844_trip_9_service_2"
            },
            "vehicle": {
              "id": "A1_793",
              "label": "793",
              "license_plate": "PR793"
            }
          }
        },
        {
          "id": "A2_vehicle_628",
          "vehicle": {
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 6,
            "occupancy_status": "NO_DATA_AVAILABLE",
            "position": {
              "latitude": 50.05859,
              "longitude": 20.01766,
              "speed": 3.8
            },
            "stop_id": "A2_274",
            "timestamp": "1759620508",
            "trip": {
              "direction_id": 0,
              "route_id": "A2_603",
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A2_1523_30754"
            },
            "vehicle": {
              "id": "A2_628",
              "label": "628",
              "license_plate": "MS628"
            }
          }
        },
        {
          "id": "A2_vehicle_629",
          "vehicle": {
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 8,
            "occupancy_status": "NO_DATA_AVAILABLE",
            "position": {
              "bearing": 238.0,
              "latitude": 50.03504,
              "longitude": 19.88534,
              "speed": 5.2
            },
            "stop_id": "A2_2610",
            "timestamp": "1759620510",
            "trip": {
              "direction_id": 0,
              "route_id": "A2_612",
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A2_1523_34952"
            },
            "vehicle": {
              "id": "A2_629",
              "label": "629",
              "license_plate": "MS629"
            }
          }
        },
        {
          "id": "A3_410",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 20,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 0.0,
              "latitude": 50.06429,
              "longitude": 19.945068
            },
            "stop_id": "A3_stop_204_12629",
            "timestamp": "1759620512",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_880_trip_6_service_2"
            },
            "vehicle": {
              "id": "A3_410",
              "label": "410",
              "license_plate": "HL410"
            }
          }
        },
        {
          "id": "A3_414",
          "vehicle": {
            "congestion_level": "CONGESTION",
            "current_status": "INCOMING_AT",
            "current_stop_sequence": 17,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 0.0,
              "latitude": 50.015747,
              "longitude": 20.024061
            },
            "stop_id": "A3_stop_852_324239",
            "timestamp": "1759620511",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_888_trip_5_service_2"
            },
            "vehicle": {
              "id": "A3_414",
              "label": "414",
              "license_plate": "HL414"
            }
          }
        },
        {
          "id": "A3_425",
          "vehicle": {
            "congestion_level": "CONGESTION",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 31,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 270.0,
              "latitude": 50.10417,
              "longitude": 19.962847
            },
            "stop_id": "A3_stop_1552_378519",
            "timestamp": "1759620519",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_887_trip_5_service_2"
            },
            "vehicle": {
              "id": "A3_425",
              "label": "425",
              "license_plate": "HL425"
            }
          }
        },
        {
          "id": "A3_429",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 2,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 45.0,
              "latitude": 50.020805,
              "longitude": 19.898022
            },
            "stop_id": "A3_stop_346_269029",
            "timestamp": "1759620513",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_881_trip_6_service_2"
            },
            "vehicle": {
              "id": "A3_429",
              "label": "429",
              "license_plate": "HL429"
            }
          }
        },
        {
          "id": "A3_604",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 1,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 270.0,
              "latitude": 50.01559,
              "longitude": 20.02191
            },
            "stop_id": "A3_stop_302_67929",
            "timestamp": "1759620517",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_889_trip_6_service_2"
            },
            "vehicle": {
              "id": "A3_604",
              "label": "604",
              "license_plate": "RP604"
            }
          }
        },
        {
          "id": "A3_608",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 16,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 270.0,
              "latitude": 50.064583,
              "longitude": 19.945381
            },
            "stop_id": "A3_stop_222_35719",
            "timestamp": "1759620514",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_883_trip_5_service_2"
            },
            "vehicle": {
              "id": "A3_608",
              "label": "608",
              "license_plate": "RP608"
            }
          }
        },
        {
          "id": "A3_609",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 15,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 180.0,
              "latitude": 50.065815,
              "longitude": 19.945036
            },
            "stop_id": "A3_stop_852_324249",
            "timestamp": "1759620510",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_886_trip_6_service_2"
            },
            "vehicle": {
              "id": "A3_609",
              "label": "609",
              "license_plate": "RP609"
            }
          }
        },
        {
          "id": "A3_615",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 31,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 90.0,
              "latitude": 50.015385,
              "longitude": 20.022778
            },
            "stop_id": "A3_stop_840_317519",
            "timestamp": "1759620516",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_885_trip_6_service_2"
            },
            "vehicle": {
              "id": "A3_615",
              "label": "615",
              "license_plate": "RP615"
            }
          }
        },
        {
          "id": "A3_623",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "IN_TRANSIT_TO",
            "current_stop_sequence": 34,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 270.0,
              "latitude": 50.018253,
              "longitude": 19.892742
            },
            "stop_id": "A3_stop_572_303819",
            "timestamp": "1759620516",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_882_trip_5_service_2"
            },
            "vehicle": {
              "id": "A3_623",
              "label": "623",
              "license_plate": "RP623"
            }
          }
        },
        {
          "id": "A3_624",
          "vehicle": {
            "congestion_level": "UNKNOWN_CONGESTION_LEVEL",
            "current_status": "STOPPED_AT",
            "current_stop_sequence": 1,
            "occupancy_status": "EMPTY",
            "position": {
              "bearing": 0.0,
              "latitude": 50.015568,
              "longitude": 20.02316
            },
            "stop_id": "A3_stop_353_274419",
            "timestamp": "1759620520",
            "trip": {
              "schedule_relationship": "SCHEDULED",
              "trip_id": "A3_block_884_trip_5_service_2"
            },
            "vehicle": {
              "id": "A3_624",
              "label": "624",
              "license_plate": "RP624"
            }
          }
        }
    ];


export const routeAlerts: RouteAlert[] = [
  {
    route: "Trasa 15",
    status: "overloaded",
    utilization: 95,
    issue: "Zatłoczenie w godzinach szczytu",
  },
  {
    route: "Trasa 7",
    status: "underutilized",
    utilization: 25,
    issue: "Niskie wykorzystanie",
  },
  { route: "Trasa 23", status: "optimal", utilization: 75, issue: null },
  {
    route: "Trasa 42",
    status: "overloaded",
    utilization: 88,
    issue: "Niewystarczająca częstotliwość",
  },
];

export const reportedIncidents: Incident[] = [
  {
    route_id: "A12",
    cause: "Awaria pojazdu",
    effect: "Opóźnienie kursu",
    timeRange: "08:00 - 09:30",
  },
  {
    route_id: "B34",
    cause: "Roboty drogowe",
    effect: "Zmiana trasy",
    timeRange: "10:15 - 12:00",
  },
  {
    route_id: "C56",
    cause: "Wypadek",
    effect: "Zatrzymanie ruchu",
    timeRange: "14:00 - 15:45",
  },
];

export const allAlerts: Alert[] = [
  {
    route_id: "A1",
    text: "Przeciążenie na trasie A1",
    timeRange: "08:00-10:00",
    sent: true,
  },
  {
    route_id: "B2",
    text: "Niska frekwencja na trasie B2",
    timeRange: "12:00-14:00",
    sent: false,
  },
  {
    route_id: "C3",
    text: "Brak incydentów",
    timeRange: "Cały dzień",
    sent: true,
  }
];

export const transferHubs: TransferHub[] = [
  {
    name: "Dworzec Centralny",
    connections: 8,
    efficiency: 92,
    passengers: 15420,
  },
  {
    name: "Węzeł Uniwersytecki",
    connections: 5,
    efficiency: 78,
    passengers: 8930,
  },
  {
    name: "Dzielnica Handlowa",
    connections: 6,
    efficiency: 85,
    passengers: 12100,
  },
  {
    name: "Terminal Lotniczy",
    connections: 4,
    efficiency: 95,
    passengers: 6750,
  },
];

// Optimization data for different routes
export const optimizationData: Record<string, OptimizationData> = {
  "Trasa 15": {
    issue: "Zatłoczenie w godzinach szczytu",
    explanation:
      "Analiza pokazuje, że Trasa 15 osiąga 95% wykorzystania w godzinach 7:00-9:00 i 17:00-19:00. AI zaleca zwiększenie częstotliwości kursów o 40% w tych godzinach oraz wprowadzenie dodatkowych wagonów.",
    beforeData: [
      { hour: "06:00", passengers: 45 },
      { hour: "07:00", passengers: 95 },
      { hour: "08:00", passengers: 95 },
      { hour: "09:00", passengers: 70 },
      { hour: "10:00", passengers: 40 },
      { hour: "11:00", passengers: 35 },
      { hour: "12:00", passengers: 55 },
      { hour: "13:00", passengers: 50 },
      { hour: "14:00", passengers: 45 },
      { hour: "15:00", passengers: 60 },
      { hour: "16:00", passengers: 75 },
      { hour: "17:00", passengers: 95 },
      { hour: "18:00", passengers: 95 },
      { hour: "19:00", passengers: 80 },
    ],
    afterData: [
      { hour: "06:00", passengers: 45 },
      { hour: "07:00", passengers: 75 },
      { hour: "08:00", passengers: 75 },
      { hour: "09:00", passengers: 60 },
      { hour: "10:00", passengers: 40 },
      { hour: "11:00", passengers: 35 },
      { hour: "12:00", passengers: 55 },
      { hour: "13:00", passengers: 50 },
      { hour: "14:00", passengers: 45 },
      { hour: "15:00", passengers: 60 },
      { hour: "16:00", passengers: 70 },
      { hour: "17:00", passengers: 75 },
      { hour: "18:00", passengers: 75 },
      { hour: "19:00", passengers: 65 },
    ],
    improvements: {
      waitTime: { before: "12 min", after: "8 min" },
      utilization: { before: "95%", after: "75%" },
      satisfaction: { before: "62%", after: "89%" },
    },
  },
  "Trasa 7": {
    issue: "Niskie wykorzystanie",
    explanation:
      "Trasa 7 ma tylko 25% wykorzystania. AI sugeruje zmniejszenie częstotliwości kursów o 30% oraz przekierowanie części taboru na bardziej obciążone trasy w godzinach szczytu.",
    beforeData: [
      { hour: "06:00", passengers: 15 },
      { hour: "07:00", passengers: 25 },
      { hour: "08:00", passengers: 30 },
      { hour: "09:00", passengers: 20 },
      { hour: "10:00", passengers: 15 },
      { hour: "11:00", passengers: 12 },
      { hour: "12:00", passengers: 18 },
      { hour: "13:00", passengers: 16 },
      { hour: "14:00", passengers: 14 },
      { hour: "15:00", passengers: 20 },
      { hour: "16:00", passengers: 25 },
      { hour: "17:00", passengers: 28 },
      { hour: "18:00", passengers: 22 },
      { hour: "19:00", passengers: 18 },
    ],
    afterData: [
      { hour: "06:00", passengers: 18 },
      { hour: "07:00", passengers: 35 },
      { hour: "08:00", passengers: 42 },
      { hour: "09:00", passengers: 28 },
      { hour: "10:00", passengers: 20 },
      { hour: "11:00", passengers: 15 },
      { hour: "12:00", passengers: 25 },
      { hour: "13:00", passengers: 22 },
      { hour: "14:00", passengers: 18 },
      { hour: "15:00", passengers: 28 },
      { hour: "16:00", passengers: 35 },
      { hour: "17:00", passengers: 38 },
      { hour: "18:00", passengers: 32 },
      { hour: "19:00", passengers: 25 },
    ],
    improvements: {
      waitTime: { before: "15 min", after: "12 min" },
      utilization: { before: "25%", after: "45%" },
      satisfaction: { before: "45%", after: "72%" },
    },
  },
};

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  TextField,
  IconButton,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TramIcon from '@mui/icons-material/Tram';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import SubwayIcon from '@mui/icons-material/Subway';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SensorsIcon from '@mui/icons-material/Sensors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { LocationInput } from '../../ui';
import { usePlanTrip } from '../../../hooks/usePlanTrip';
import type { PlanTripResponse } from '../../../lib/queries/trip';
import { decodePolyline } from '../../../lib/utils';
import { useReverseGeocode } from '../../../hooks/useReverseGeocode';

const GREEN_MODES = new Set([
  'WALK',
  'BICYCLE',
  'BIKE',
  'SCOOTER',
  'MICROMOBILITY',
  'MICROMOBILITY_RENTAL',
  'BICYCLE_RENTAL',
]);

const MODE_ICON_MAP: Record<string, React.ElementType> = {
  WALK: DirectionsWalkIcon,
  BICYCLE: PedalBikeIcon,
  BIKE: PedalBikeIcon,
  SCOOTER: ElectricScooterIcon,
  MICROTRANSIT: PedalBikeIcon,
  BUS: DirectionsBusIcon,
  BUSISH: DirectionsBusIcon,
  TROLLEYBUS: DirectionsBusIcon,
  TRAM: TramIcon,
  STREETCAR: TramIcon,
  SUBWAY: SubwayIcon,
  RAIL: TrainIcon,
  RAILWAY: TrainIcon,
  TRAIN: TrainIcon,
  LONG_DISTANCE: TrainIcon,
  FERRY: DirectionsBoatIcon,
  BOAT: DirectionsBoatIcon,
  GONDOLA: DirectionsBoatIcon,
  CABLE_CAR: TramIcon,
  AIRPLANE: FlightIcon,
  AIR: FlightIcon,
  PLANE: FlightIcon,
  CAR: DirectionsCarIcon,
  CARPOOL: DirectionsCarIcon,
};

type ItineraryLeg = PlanTripResponse['planConnection']['edges'][number]['node']['legs'][number];

type TimelineStopItem = {
  key: string;
  type: 'stop';
  label: string;
  secondary?: string | null;
  isFirst?: boolean;
  isLast?: boolean;
  isIntermediate?: boolean;
  connectorTop?: boolean;
  connectorBottom?: boolean;
  connectorTopColor?: string;
  connectorBottomColor?: string;
  arrivalTime?: number | null;
  departureTime?: number | null;
  stopCode?: string | null;
};

type TimelineTransitStop = {
  key: string;
  name: string;
  code?: string | null;
  arrivalTime?: number | null;
  departureTime?: number | null;
};

type TimelineLegItem = {
  key: string;
  type: 'leg';
  time?: string;
  leg: ItineraryLeg;
  title: string;
  subtitleLines?: string[];
  routeLabel?: string | null;
  headsign?: string | null;
  distanceLabel?: string | null;
  durationLabel: string;
  alerts: Array<{
    severity: string | null | undefined;
    header: string | null;
    description: string | null;
  }>;
  connectorTop?: boolean;
  connectorBottom?: boolean;
  connectorTopColor?: string;
  connectorBottomColor?: string;
  isTransit: boolean;
  legIndex: number;
  transitStops: TimelineTransitStop[];
};

type DetailTimelineItem = TimelineStopItem | TimelineLegItem;

const DEFAULT_ICON_SIZE = 20;

const normalizeHexColor = (color?: string | null) => {
  if (!color) {
    return null;
  }

  const trimmed = color.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)
    ? normalized
    : null;
};

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const shouldDisplayAlert = (header?: string | null, description?: string | null) => {
  const normalizedHeader = header?.trim().toLowerCase() ?? '';
  const normalizedDescription = description?.trim().toLowerCase() ?? '';

  if (
    normalizedHeader === 'ogólny tekst specjalny' &&
    normalizedDescription.includes('wyłączenie ruchu tramwajowego na ulicy straszewskiego')
  ) {
    return false;
  }

  return true;
};

const getDefaultDepartureDate = () => formatDateForInput(new Date());
const getDefaultDepartureTime = () => new Date().toTimeString().slice(0, 5);

const toOffsetDateTimeString = (date: string, time: string) => {
  if (!date || !time) {
    return undefined;
  }

  const [hours, minutes] = time.split(':');
  if (hours === undefined || minutes === undefined) {
    return undefined;
  }

  const offsetDate = new Date(`${date}T${time}:00`);
  if (Number.isNaN(offsetDate.getTime())) {
    return undefined;
  }

  const offsetMinutes = offsetDate.getTimezoneOffset();
  const absoluteMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
  const offsetMins = String(absoluteMinutes % 60).padStart(2, '0');
  const sign = offsetMinutes <= 0 ? '+' : '-';

  return `${date}T${time}:00${sign}${offsetHours}:${offsetMins}`;
};

export default function StopsComponent() {
  const theme = useTheme();
  const isCompact = useMediaQuery('(max-width: 768px)');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [fromCoordinates, setFromCoordinates] = useState<[number, number] | null>(null);
  const [toCoordinates, setToCoordinates] = useState<[number, number] | null>(null);
  const [departureDate, setDepartureDate] = useState(getDefaultDepartureDate);
  const [departureTime, setDepartureTime] = useState(getDefaultDepartureTime);
  const [selectedItineraryIndex, setSelectedItineraryIndex] = useState<number | null>(null);
  const [detailItineraryIndex, setDetailItineraryIndex] = useState<number | null>(null);
  const [expandedTransitLegs, setExpandedTransitLegs] = useState<Record<number, boolean>>({});
  const previousFromCoordinatesRef = useRef<[number, number] | null>(null);
  const previousToCoordinatesRef = useRef<[number, number] | null>(null);
  const detailItineraryIndexRef = useRef<number | null>(null);
  const fromAddressPendingRef = useRef(false);
  const toAddressPendingRef = useRef(false);
  const { planTrip, data, loading, error } = usePlanTrip();
  const {
    address: fromReverseAddress,
    error: fromReverseError,
    reverseGeocode: reverseFromCoordinates,
  } = useReverseGeocode();
  const {
    address: toReverseAddress,
    error: toReverseError,
    reverseGeocode: reverseToCoordinates,
  } = useReverseGeocode();

  useEffect(() => {
    const handleTabChange = (event: Event) => {
      const { detail } = event as CustomEvent<{ tab: string }>;
      if (detail?.tab === 'trip') {
        window.dispatchEvent(
          new CustomEvent('map-zoom', {
            detail: {
              from: fromCoordinates,
              to: toCoordinates,
              fitBounds: false,
              flyTo: false,
            },
          })
        );
      }
    };

    window.addEventListener('sidepanel-tab-change', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('sidepanel-tab-change', handleTabChange as EventListener);
    };
  }, [fromCoordinates, toCoordinates]);

  const getModeIcon = (mode: string) => {
    const normalizedMode = mode?.toUpperCase();
    return MODE_ICON_MAP[normalizedMode] ?? DirectionsWalkIcon;
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const formatTimeRange = (start: number, end: number) => `${formatTime(start)} - ${formatTime(end)}`;

  const formatDuration = (durationSeconds: number) => {
    const totalMinutes = Math.round(durationSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }

    return `${minutes}min`;
  };

  const formatDistance = (distanceMeters?: number | null) => {
    if (distanceMeters === undefined || distanceMeters === null) {
      return null;
    }

    if (distanceMeters >= 1000) {
      return `${(distanceMeters / 1000).toFixed(1)} km`;
    }

    return `${Math.round(distanceMeters)} m`;
  };

  const mapAlertSeverityToMui = (severity?: string | null): 'error' | 'warning' | 'info' | 'success' => {
    const normalized = severity?.toUpperCase() ?? '';

    switch (normalized) {
      case 'SEVERE':
      case 'NO_SERVICE':
      case 'EMERGENCY':
        return 'error';
      case 'WARNING':
      case 'MINOR':
        return 'warning';
      case 'INFO':
      case 'UNKNOWN_SEVERITY':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getTranslatedText = (
    translated?: { text: string | null } | string | null
  ) => {
    if (typeof translated === 'string') {
      return translated;
    }

    return translated?.text ?? null;
  };

  const getRouteLabel = (leg: ItineraryLeg) =>
    leg.route?.shortName || leg.route?.longName || leg.trip?.tripHeadsign || null;

  const getRouteBadgeColors = (leg: ItineraryLeg) => {
    const fallbackBackground = theme.palette.primary.main;
    const fallbackText = theme.palette.primary.contrastText;

    const backgroundColor = normalizeHexColor(leg.route?.color) ?? fallbackBackground;
    const textColor = normalizeHexColor(leg.route?.textColor) ?? fallbackText;

    return { backgroundColor, textColor };
  };

  const coordinatesEqual = useCallback((a: [number, number] | null, b: [number, number] | null) => {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a[0] === b[0] && a[1] === b[1];
  }, []);

  useEffect(() => {
    detailItineraryIndexRef.current = detailItineraryIndex;
  }, [detailItineraryIndex]);

  useEffect(() => {
    setExpandedTransitLegs({});
  }, [detailItineraryIndex]);

  const handleSwapLocations = () => {
    const tempLocation = fromLocation;
    const tempCoordinates = fromCoordinates;

    setFromLocation(toLocation);
    setFromCoordinates(toCoordinates);
    setToLocation(tempLocation);
    setToCoordinates(tempCoordinates);
  };

  const toggleTransitLegExpansion = useCallback((legIndex: number) => {
    setExpandedTransitLegs((previous) => ({
      ...previous,
      [legIndex]: !previous[legIndex],
    }));
  }, []);

  const setDepartureToNow = useCallback(() => {
    const now = new Date();
    const dateString = formatDateForInput(now);
    const timeString = now.toTimeString().slice(0, 5);

    setDepartureDate(dateString);
    setDepartureTime(timeString);
  }, []);

  const triggerPlanTrip = useCallback(() => {
    if (!fromCoordinates || !toCoordinates || !departureDate || !departureTime) {
      return;
    }

    const earliestDeparture = toOffsetDateTimeString(departureDate, departureTime);
    if (!earliestDeparture) {
      return;
    }

    planTrip({
      origin: {
        label: fromLocation || undefined,
        location: {
          coordinate: {
            latitude: fromCoordinates[1],
            longitude: fromCoordinates[0],
          },
        },
      },
      destination: {
        label: toLocation || undefined,
        location: {
          coordinate: {
            latitude: toCoordinates[1],
            longitude: toCoordinates[0],
          },
        },
      },
      dateTime: {
        earliestDeparture,
      },
      first: 10,
    });
  }, [departureDate, departureTime, fromCoordinates, fromLocation, planTrip, toCoordinates, toLocation]);

  useEffect(() => {
    triggerPlanTrip();
  }, [triggerPlanTrip]);

  const itineraries = useMemo(() => {
    if (!fromCoordinates || !toCoordinates) {
      return [];
    }

    const edges = data?.planConnection?.edges ?? [];
    return edges.slice(0, 10).map((edge) => edge.node);
  }, [data, fromCoordinates, toCoordinates]);

  const detailItinerary = useMemo(() => {
    if (detailItineraryIndex === null) {
      return null;
    }

    if (detailItineraryIndex < 0 || detailItineraryIndex >= itineraries.length) {
      return null;
    }

    return itineraries[detailItineraryIndex];
  }, [detailItineraryIndex, itineraries]);

  useEffect(() => {
    setExpandedTransitLegs({});
  }, [detailItinerary]);

  const detailFromLabel = useMemo(() => {
    if (!detailItinerary) {
      return '';
    }

    return fromLocation || detailItinerary.legs[0]?.from?.name || '';
  }, [detailItinerary, fromLocation]);

  const detailToLabel = useMemo(() => {
    if (!detailItinerary) {
      return '';
    }

    const lastLeg = detailItinerary.legs[detailItinerary.legs.length - 1];
    return toLocation || lastLeg?.to?.name || '';
  }, [detailItinerary, toLocation]);

  const detailAlerts = useMemo(() => {
    if (!detailItinerary) {
      return [] as Array<{
        severity: string | null | undefined;
        header: string | null;
        description: string | null;
        legIndex: number;
        legLabel: string;
      }>;
    }

    return detailItinerary.legs.flatMap((leg, index) => {
      const headerBase = `${leg.from?.name ?? 'Start'} → ${leg.to?.name ?? 'Koniec'}`;
      return (leg.alerts ?? [])
        .map((alert) => ({
          severity: alert.alertSeverityLevel,
          header: getTranslatedText(alert.alertHeaderText) ?? headerBase,
          description: getTranslatedText(alert.alertDescriptionText),
          legIndex: index,
          legLabel: headerBase,
        }))
        .filter((alert) => shouldDisplayAlert(alert.header, alert.description));
    });
  }, [detailItinerary]);

  const detailItineraryHasAlerts = detailAlerts.length > 0;

  const detailWalkingMetrics = useMemo(() => {
    if (!detailItinerary) {
      return { distance: 0, duration: 0 };
    }

    return detailItinerary.legs.reduce(
      (acc, leg) => {
        const normalizedMode = leg.mode?.toUpperCase?.() ?? '';

        if (GREEN_MODES.has(normalizedMode)) {
          const durationSeconds =
            leg.duration ?? Math.max(0, Math.round((leg.endTime - leg.startTime) / 1000));

          return {
            distance: acc.distance + (leg.distance ?? 0),
            duration: acc.duration + durationSeconds,
          };
        }

        return acc;
      },
      { distance: 0, duration: 0 }
    );
  }, [detailItinerary]);

  const detailTransitCount = useMemo(() => {
    if (!detailItinerary) {
      return 0;
    }

    return detailItinerary.legs.filter((leg) => {
      const normalizedMode = leg.mode?.toUpperCase?.() ?? '';
      return !GREEN_MODES.has(normalizedMode);
    }).length;
  }, [detailItinerary]);

  const detailTimeline = useMemo<DetailTimelineItem[]>(() => {
    if (!detailItinerary) {
      return [];
    }

    const items: DetailTimelineItem[] = [];

    detailItinerary.legs.forEach((leg, index) => {
      const previousLeg = index > 0 ? detailItinerary.legs[index - 1] : null;
      const previousSegmentColor = previousLeg
        ? !GREEN_MODES.has(previousLeg.mode?.toUpperCase?.() ?? '')
          ? getRouteBadgeColors(previousLeg).backgroundColor
          : theme.palette.grey[400]
        : undefined;

      const startStop: TimelineStopItem = {
        key: `stop-${index}`,
        type: 'stop',
        label: leg.from?.name ?? 'Nieznane miejsce',
        isFirst: index === 0,
        arrivalTime: previousLeg ? previousLeg.endTime : null,
        departureTime: leg.startTime,
        connectorTopColor: previousSegmentColor,
        stopCode: leg.from?.stop?.code ?? null,
      };

      const normalizedMode = leg.mode?.toUpperCase?.() ?? '';
      const isTransit = !GREEN_MODES.has(normalizedMode);
      const routeLabel = getRouteLabel(leg);
      const distanceLabel = formatDistance(leg.distance);
      const compactDistanceLabel = distanceLabel ? distanceLabel.replace(/\s+/g, '') : null;
      const durationSeconds =
        leg.duration ?? Math.max(0, Math.round((leg.endTime - leg.startTime) / 1000));
      const durationLabel = formatDuration(durationSeconds);
      const headsign = leg.trip?.tripHeadsign ?? null;
      const segmentColor = isTransit
        ? getRouteBadgeColors(leg).backgroundColor
        : theme.palette.grey[400];

      startStop.connectorBottomColor = segmentColor;
      items.push(startStop);

      const alerts = (leg.alerts ?? [])
        .map((alert) => ({
          severity: alert.alertSeverityLevel,
          header: getTranslatedText(alert.alertHeaderText),
          description: getTranslatedText(alert.alertDescriptionText),
        }))
        .filter((alert) => shouldDisplayAlert(alert.header, alert.description));

      const subtitleLines: string[] = [];
      if (isTransit) {
        subtitleLines.push(durationLabel);
        if (compactDistanceLabel) {
          subtitleLines.push(compactDistanceLabel);
        }
      } else {
        subtitleLines.push(`ok. ${durationLabel.replace('min', ' min')}`);
        if (compactDistanceLabel) {
          subtitleLines.push(compactDistanceLabel);
        }
      }

      const transitStops: TimelineTransitStop[] = isTransit
        ? (leg.intermediatePlaces ?? []).map((place, placeIndex) => ({
            key: `leg-${index}-intermediate-${placeIndex}`,
            name: place.name ?? place.stop?.name ?? 'Przystanek pośredni',
            code: place.stop?.code ?? null,
            arrivalTime: place.arrivalTime ?? null,
            departureTime: place.departureTime ?? null,
          }))
        : [];

      items.push({
        key: `leg-${index}`,
        type: 'leg',
        leg,
        title: isTransit ? routeLabel ?? leg.mode : 'Pieszo',
        subtitleLines,
        routeLabel,
        headsign,
        distanceLabel: compactDistanceLabel,
        durationLabel,
        alerts,
        connectorTopColor: segmentColor,
        connectorBottomColor: segmentColor,
        isTransit,
        legIndex: index,
        transitStops,
      });

      if (isTransit && (expandedTransitLegs[index] ?? false) && transitStops.length > 0) {
        transitStops.forEach((stop) => {
          items.push({
            key: stop.key,
            type: 'stop',
            label: stop.name,
            arrivalTime: stop.arrivalTime ?? null,
            departureTime: stop.departureTime ?? null,
            stopCode: stop.code ?? null,
            isIntermediate: true,
            connectorTopColor: segmentColor,
            connectorBottomColor: segmentColor,
          });
        });
      }

      if (index === detailItinerary.legs.length - 1) {
        const endStop: TimelineStopItem = {
          key: 'stop-end',
          type: 'stop',
          label: leg.to?.name ?? 'Nieznane miejsce',
          isLast: true,
          connectorTopColor: segmentColor,
          arrivalTime: leg.endTime,
          departureTime: null,
          stopCode: leg.to?.stop?.code ?? null,
        };
        items.push(endStop);
      }
    });

    return items.map((item, idx) => ({
      ...item,
      connectorTop: idx > 0,
      connectorBottom: idx < items.length - 1,
    }));
  }, [detailItinerary, expandedTransitLegs, theme]);

  const detailTransferCount = Math.max(0, detailTransitCount - 1);

  const detailWalkingDistanceLabel = useMemo(() => {
    if (!detailItinerary) {
      return null;
    }

    if (detailWalkingMetrics.distance <= 0) {
      return null;
    }

    return formatDistance(detailWalkingMetrics.distance)?.replace(/\s+/g, '') ?? null;
  }, [detailItinerary, detailWalkingMetrics.distance]);

  const showEmptyState =
    !loading && itineraries.length === 0 && Boolean(fromCoordinates) && Boolean(toCoordinates);
  const hasActiveCoordinates = Boolean(fromCoordinates && toCoordinates);
  const showLoadingSpinner = loading && hasActiveCoordinates;

  useEffect(() => {
    if (!data?.planConnection?.edges?.length) {
      setSelectedItineraryIndex(null);
      setDetailItineraryIndex(null);
      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments: [],
          },
        })
      );
    } else {
      setSelectedItineraryIndex(null);
      setDetailItineraryIndex(null);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments: [],
          },
        })
      );
    };
  }, []);

  useEffect(() => {
    if (!fromCoordinates || !toCoordinates) {
      setSelectedItineraryIndex(null);
      setDetailItineraryIndex(null);
      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments: [],
          },
        })
      );
    }
  }, [fromCoordinates, toCoordinates]);

  useEffect(() => {
    const fromChanged = !coordinatesEqual(fromCoordinates, previousFromCoordinatesRef.current);
    const toChanged = !coordinatesEqual(toCoordinates, previousToCoordinatesRef.current);

    if (fromChanged) {
      previousFromCoordinatesRef.current = fromCoordinates;
    }

    if (toChanged) {
      previousToCoordinatesRef.current = toCoordinates;
    }

    if ((fromChanged || toChanged) && detailItineraryIndex !== null) {
      setDetailItineraryIndex(null);
      setSelectedItineraryIndex(null);
      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments: [],
          },
        })
      );
    }
  }, [coordinatesEqual, detailItineraryIndex, fromCoordinates, toCoordinates]);

  useEffect(() => {
    if (fromAddressPendingRef.current && fromReverseAddress) {
      setFromLocation(fromReverseAddress);
      fromAddressPendingRef.current = false;
    }
  }, [fromReverseAddress]);

  useEffect(() => {
    if (toAddressPendingRef.current && toReverseAddress) {
      setToLocation(toReverseAddress);
      toAddressPendingRef.current = false;
    }
  }, [toReverseAddress]);

  useEffect(() => {
    if (fromAddressPendingRef.current && fromReverseError) {
      fromAddressPendingRef.current = false;
    }
  }, [fromReverseError]);

  useEffect(() => {
    if (toAddressPendingRef.current && toReverseError) {
      toAddressPendingRef.current = false;
    }
  }, [toReverseError]);

  useEffect(() => {
    const handleMarkerDragged = (event: Event) => {
      const { detail } = event as CustomEvent<{ type: 'from' | 'to'; coordinates: [number, number] }>;
      if (!detail) {
        return;
      }

      const detailWasOpen = detailItineraryIndexRef.current !== null;

      if (detail.type === 'from') {
        setFromCoordinates(detail.coordinates);
        if (detailWasOpen) {
          fromAddressPendingRef.current = true;
          reverseFromCoordinates(detail.coordinates[0], detail.coordinates[1]);
        }
      } else if (detail.type === 'to') {
        setToCoordinates(detail.coordinates);
        if (detailWasOpen) {
          toAddressPendingRef.current = true;
          reverseToCoordinates(detail.coordinates[0], detail.coordinates[1]);
        }
      }

      setDetailItineraryIndex(null);
      setSelectedItineraryIndex(null);
      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments: [],
          },
        })
      );
    };

    window.addEventListener('marker-dragged', handleMarkerDragged as EventListener);

    return () => {
      window.removeEventListener('marker-dragged', handleMarkerDragged as EventListener);
    };
  }, [reverseFromCoordinates, reverseToCoordinates]);

  const drawItinerarySegments = useCallback(
    (itinerary: PlanTripResponse['planConnection']['edges'][number]['node']) => {
      const fallbackColor = normalizeHexColor(theme.palette.primary.main) ?? '#1976d2';

      const segments = itinerary.legs.reduce<
        Array<{
          coordinates: [number, number][];
          color: string;
          isWalk: boolean;
          mode: string;
          start: [number, number];
          end: [number, number];
        }>
      >(
        (acc, leg) => {
          if (!leg.legGeometry?.points) {
            return acc;
          }

          const decoded = decodePolyline(leg.legGeometry.points);
          if (!decoded.length) {
            return acc;
          }

          const coordinates = decoded.map(([lat, lng]) => {
            return [lng, lat] as [number, number];
          });

          const startCoordinate = coordinates[0];
          const endCoordinate = coordinates[coordinates.length - 1];

          const normalizedMode = leg.mode?.toUpperCase() ?? '';
          const isWalk = normalizedMode === 'WALK';
          const color = GREEN_MODES.has(normalizedMode)
            ? '#08CB00'
            : normalizeHexColor(leg.route?.color) ?? fallbackColor;

          acc.push({
            coordinates,
            color,
            isWalk,
            mode: normalizedMode,
            start: startCoordinate,
            end: endCoordinate,
          });

          return acc;
        },
        []
      );

      window.dispatchEvent(
        new CustomEvent('draw-itinerary', {
          detail: {
            segments,
          },
        })
      );
    },
    [theme]
  );

  const handleItinerarySelect = useCallback(
    (
      itinerary: PlanTripResponse['planConnection']['edges'][number]['node'],
      index: number,
      options?: { openDetail?: boolean }
    ) => {
      setSelectedItineraryIndex(index);
      setDetailItineraryIndex(options?.openDetail ? index : null);
      drawItinerarySegments(itinerary);
    },
    [drawItinerarySegments]
  );

  useEffect(() => {
    if (!itineraries.length) {
      return;
    }

    if (selectedItineraryIndex === null || selectedItineraryIndex >= itineraries.length) {
      handleItinerarySelect(itineraries[0], 0);
    }
  }, [handleItinerarySelect, itineraries, selectedItineraryIndex]);

  const handleItineraryCardActivation = useCallback(
    (itinerary: PlanTripResponse['planConnection']['edges'][number]['node'], index: number) => {
      if (selectedItineraryIndex === index && detailItineraryIndex !== index) {
        handleItinerarySelect(itinerary, index, { openDetail: true });
      } else if (selectedItineraryIndex !== index) {
        handleItinerarySelect(itinerary, index);
      }
    },
    [detailItineraryIndex, handleItinerarySelect, selectedItineraryIndex]
  );

  return (
    <Box
      sx={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: isCompact ? (detailItinerary ? 1 : 1.25) : detailItinerary ? 1.5 : 2,
      }}
    >
      {!detailItinerary && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            fontSize: isCompact ? '1rem' : undefined,
          }}
        >
          Plan Your Route
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: isCompact ? (detailItinerary ? 1 : 1.25) : detailItinerary ? 1.5 : 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        {!detailItinerary && (
          <>
            <LocationInput
              fromValue={fromLocation}
              toValue={toLocation}
              onFromChange={setFromLocation}
              onToChange={setToLocation}
              onFromCoordinatesChange={setFromCoordinates}
              onToCoordinatesChange={setToCoordinates}
              onSwap={handleSwapLocations}
              fromCoordinatesValue={fromCoordinates}
              toCoordinatesValue={toCoordinates}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, flex: '1 1 auto' }}>
                <TextField
                  label="Data"
                  type="date"
                  size="small"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Godzina"
                  type="time"
                  size="small"
                  value={departureTime}
                  onChange={(event) => setDepartureTime(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    },
                  }}
                />
              </Box>
              <IconButton
                aria-label="Ustaw aktualny czas odjazdu"
                onClick={setDepartureToNow}
                color="primary"
                size="small"
                sx={{
                  ml: 'auto',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: '4px',
                  flexGrow: 1,
                  alignSelf: 'stretch',
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccessTimeFilledIcon fontSize="small" />
              </IconButton>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
          </>
        )}

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {detailItinerary ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isCompact ? 0.75 : 1 }}>
                <IconButton
                  aria-label="Powrót do listy kursów"
                  onClick={() => setDetailItineraryIndex(null)}
                  size="small"
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: isCompact ? 0.25 : 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCompact ? 0.4 : 0.5,
                    }}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      From:
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {detailFromLabel || 'Nieznany początek'}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCompact ? 0.4 : 0.5,
                    }}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      To:
                    </Typography>
                    <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                      {detailToLabel || 'Nieznany cel'}
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isCompact ? 0.75 : 1,
                  p: isCompact ? 1.25 : 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isCompact ? 0.75 : 1, flexWrap: 'wrap' }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, fontSize: isCompact ? '1.35rem' : undefined }}
                  >
                    {formatTimeRange(
                      detailItinerary.legs[0]?.startTime,
                      detailItinerary.legs[detailItinerary.legs.length - 1]?.endTime
                    )}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: isCompact ? '0.9rem' : undefined }}
                  >
                    ({formatDuration(detailItinerary.duration)})
                  </Typography>
                  {detailItineraryHasAlerts && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
                      <ReportProblemIcon fontSize="small" />
                      <Typography variant="body2" color="warning.main">
                        Występują alerty
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: isCompact ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <AccessTimeFilledIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {detailTransferCount === 0
                        ? 'Bez przesiadek'
                        : `${detailTransferCount} ${
                            detailTransferCount === 1
                              ? 'przesiadka'
                              : detailTransferCount < 5
                              ? 'przesiadki'
                              : 'przesiadek'
                          }`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <DirectionsWalkIcon fontSize="small" color="primary" />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Pieszo
                      </Typography>
                      {detailWalkingMetrics.duration > 0 ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(detailWalkingMetrics.duration)}
                          </Typography>
                          {detailWalkingDistanceLabel && (
                            <Typography variant="body2" color="text.secondary">
                              {detailWalkingDistanceLabel}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          brak
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mt: 1 }} />

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                {detailTimeline.map((item) => {
                  const isStop = item.type === 'stop';
                  const connectorTopColor = item.connectorTopColor ?? theme.palette.grey[300];
                  const connectorBottomColor = item.connectorBottomColor ?? theme.palette.grey[300];

                  let stopTimes: string[] = [];
                  if (isStop) {
                    const arrival = item.arrivalTime ? formatTime(item.arrivalTime) : null;
                    const departure = item.departureTime ? formatTime(item.departureTime) : null;

                    if (arrival) {
                      stopTimes.push(arrival);
                    }

                    if (departure) {
                      if (!arrival || arrival !== departure) {
                        stopTimes.push(departure);
                      }
                    }

                    if (stopTimes.length === 0) {
                      stopTimes = [''];
                    }
                  }

                  const displayTimes = isStop ? stopTimes : [''];
                  const visibleTimes = displayTimes.filter((time) => Boolean(time));
                  const hasSingleTime = visibleTimes.length === 1;
                  const isIntermediateStop = isStop && item.isIntermediate;
                  const legItem = item.type === 'leg' ? (item as TimelineLegItem) : null;
                  const intermediateStops = legItem ? legItem.transitStops : [];
                  const canExpand = Boolean(legItem?.isTransit);
                  const isExpanded = legItem?.isTransit
                    ? expandedTransitLegs[legItem.legIndex] ?? false
                    : false;
                  const showExpandToggle = canExpand && intermediateStops.length > 0;
                  const expansionBaseColor = legItem
                    ? legItem.connectorBottomColor ?? theme.palette.primary.main
                    : connectorBottomColor;

                  return (
                    <Box
                      key={item.key}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '48px 24px 1fr', sm: '56px 26px 1fr' },
                        columnGap: 0,
                        alignItems: 'flex-start',
                        py: 1.15,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: hasSingleTime ? 0 : 0.25,
                          pt: hasSingleTime ? 0 : isStop ? 0.4 : 0.6,
                          alignItems: 'flex-end',
                          textAlign: 'right',
                          justifyContent: hasSingleTime ? 'center' : 'flex-start',
                          minHeight: '100%',
                          pr: { xs: '4px', sm: '6px' },
                        }}
                      >
                        {isStop ? (
                          displayTimes.map((timeValue, idx) => (
                            <Typography
                              key={`${item.key}-time-${idx}`}
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 600, lineHeight: 1.2 }}
                            >
                              {timeValue}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            &nbsp;
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '100%',
                          ml: { xs: '-6px', sm: '-8px' },
                        }}
                      >
                        {(() => {
                          const connectorTopActive = item.connectorTop ?? false;
                          const connectorBottomActive = item.connectorBottom ?? false;

                          if (!connectorTopActive && !connectorBottomActive) {
                            return null;
                          }

                          const connectorExtension = 10;
                          const topOffset = connectorTopActive ? `-${connectorExtension}px` : '50%';
                          const bottomOffset = connectorBottomActive ? `-${connectorExtension}px` : '50%';
                          const background = connectorTopActive && connectorBottomActive
                            ? connectorTopColor === connectorBottomColor
                              ? connectorBottomColor
                              : `linear-gradient(to bottom, ${connectorTopColor} 0%, ${connectorTopColor} 50%, ${connectorBottomColor} 50%, ${connectorBottomColor} 100%)`
                            : connectorTopActive
                            ? connectorTopColor
                            : connectorBottomColor;

                          return (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: topOffset,
                                bottom: bottomOffset,
                                left: 'calc(50% - 1.5px)',
                                width: 3,
                                background,
                                borderRadius: 1.5,
                                zIndex: 0,
                              }}
                            />
                          );
                        })()}
                        {isStop ? (
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: '2px solid',
                              borderColor: item.isFirst
                                ? theme.palette.success.main
                                : item.isLast
                                ? theme.palette.primary.main
                                : isIntermediateStop && expansionBaseColor
                                ? expansionBaseColor
                                : theme.palette.grey[500],
                              backgroundColor: theme.palette.background.paper,
                              position: 'relative',
                              zIndex: 2,
                            }}
                          />
                        ) : (
                          (() => {
                            const ModeIcon = getModeIcon(item.leg.mode);
                            const iconBackground = item.connectorBottomColor ?? theme.palette.primary.main;
                            const iconColor = item.isTransit
                              ? theme.palette.getContrastText(iconBackground)
                              : theme.palette.text.primary;
                            return (
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  backgroundColor: iconBackground,
                                  color: iconColor,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                                  zIndex: 1,
                                }}
                              >
                                <ModeIcon sx={{ fontSize: 18 }} />
                              </Box>
                            );
                          })()
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: isStop ? 0.25 : 0.75,
                          justifyContent: isStop ? 'center' : 'flex-start',
                          minHeight: '100%',
                        }}
                      >
                        {isStop ? (
                          <>
                            <Typography
                              variant={isIntermediateStop ? 'body2' : 'subtitle2'}
                              sx={{
                                fontWeight: isIntermediateStop ? 500 : 600,
                                lineHeight: 1.3,
                                color: isIntermediateStop ? alpha(theme.palette.text.primary, 0.85) : undefined,
                              }}
                            >
                              {item.label}
                              {item.stopCode && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: isIntermediateStop ? 0.75 : 1,
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    color: (theme) => alpha(theme.palette.text.secondary, 0.75),
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {item.stopCode}
                                </Box>
                              )}
                            </Typography>
                            {item.secondary && (
                              <Typography variant="body2" color="text.secondary">
                                {item.secondary}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                  flex: '1 1 auto',
                                }}
                              >
                                {item.isTransit && item.routeLabel && (
                                  <Box
                                    sx={{
                                      ...theme.typography.body2,
                                      px: 0.75,
                                      py: 0.25,
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: item.connectorBottomColor ?? theme.palette.primary.main,
                                      color: theme.palette.getContrastText(
                                        item.connectorBottomColor ?? theme.palette.primary.main
                                      ),
                                      fontWeight: 600,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {item.routeLabel}
                                  </Box>
                                )}
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {item.isTransit ? item.headsign ?? item.title : item.title}
                                </Typography>
                                {item.leg.realTime && (
                                  <SensorsIcon fontSize="small" sx={{ color: 'success.main' }} />
                                )}
                              </Box>
                              {showExpandToggle && legItem && (
                                <IconButton
                                  aria-label={
                                    isExpanded ? 'Zwiń listę przystanków' : 'Rozwiń listę przystanków'
                                  }
                                  size="small"
                                  onClick={() => toggleTransitLegExpansion(legItem.legIndex)}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: alpha(expansionBaseColor, 0.08),
                                    color: expansionBaseColor,
                                    '&:hover': {
                                      backgroundColor: alpha(expansionBaseColor, 0.16),
                                    },
                                  }}
                                >
                                  {isExpanded ? (
                                    <ExpandLessIcon fontSize="small" />
                                  ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                  )}
                                </IconButton>
                              )}
                            </Box>
                            {item.subtitleLines?.map((line, idx) => (
                              <Typography
                                key={`${item.key}-subtitle-${idx}`}
                                variant="body2"
                                color="text.secondary"
                              >
                                {line}
                              </Typography>
                            ))}
                            {item.alerts.length > 0 && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                                {item.alerts.map((alert, alertIndex) => (
                                  <Alert
                                    key={`${item.key}-alert-${alertIndex}`}
                                    severity={mapAlertSeverityToMui(alert.severity)}
                                    variant="outlined"
                                    sx={{ alignItems: 'flex-start' }}
                                  >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {alert.header || 'Alert'}
                                    </Typography>
                                    {alert.description && (
                                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {alert.description}
                                      </Typography>
                                    )}
                                  </Alert>
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {detailAlerts.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Powiadomienia z podróży
                  </Typography>
                  {detailAlerts.map((alert, idx) => (
                    <Alert key={`detail-alert-${idx}`} severity={mapAlertSeverityToMui(alert.severity)}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {alert.header}
                      </Typography>
                      {alert.description && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {alert.description}
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                overflowY: 'auto',
                pr: 1,
              }}
            >
              {showLoadingSpinner ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {itineraries.map((itinerary, index) => {
                    if (!itinerary.legs.length) {
                      return null;
                    }

                    const firstLeg = itinerary.legs[0];
                    const lastLeg = itinerary.legs[itinerary.legs.length - 1];
                    const isSelected = index === selectedItineraryIndex;
                    const itineraryHasAlerts = itinerary.legs.some((leg) =>
                      (leg.alerts ?? []).some((alert) =>
                        shouldDisplayAlert(
                          getTranslatedText(alert.alertHeaderText),
                          getTranslatedText(alert.alertDescriptionText)
                        )
                      )
                    );

                    return (
                      <Box
                        key={`${firstLeg.startTime}-${index}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleItineraryCardActivation(itinerary, index)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleItineraryCardActivation(itinerary, index);
                          }
                        }}
                        sx={{
                          borderTop: index === 0 ? '1px solid' : 'none',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          px: 2,
                          py: 2,
                          backgroundColor: isSelected ? 'action.hover' : 'background.paper',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {itineraryHasAlerts && (
                              <ReportProblemIcon
                                fontSize="small"
                                sx={{
                                  color: 'warning.main',
                                  backgroundColor: '#fff',
                                  borderRadius: '50%',
                                  p: '2px',
                                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.12)',
                                }}
                              />
                            )}
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {formatTimeRange(firstLeg.startTime, lastLeg.endTime)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDuration(itinerary.duration)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
                            {itinerary.legs.map((leg, legIndex) => {
                              const Icon = getModeIcon(leg.mode);
                              const routeLabel = getRouteLabel(leg);
                              const badgeColors = getRouteBadgeColors(leg);

                              return (
                                <React.Fragment key={`${leg.mode}-${legIndex}`}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    {leg.realTime && (
                                      <SensorsIcon
                                        fontSize="small"
                                        sx={{ color: 'success.main' }}
                                      />
                                    )}
                                    <Icon sx={{ fontSize: DEFAULT_ICON_SIZE, color: 'grey.700' }} />
                                    {routeLabel && (
                                      <Box
                                        sx={{
                                          ...theme.typography.body2,
                                          minWidth: DEFAULT_ICON_SIZE,
                                          height: DEFAULT_ICON_SIZE,
                                          px: 0.75,
                                          borderRadius: '4px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: badgeColors.backgroundColor,
                                          color: badgeColors.textColor,
                                          fontWeight: 600,
                                          lineHeight: 1,
                                        }}
                                      >
                                        {routeLabel}
                                      </Box>
                                    )}
                                  </Box>
                                  {legIndex < itinerary.legs.length - 1 && (
                                    <ArrowForwardIosIcon fontSize="small" color="disabled" sx={{ mx: 0.125 }} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}

                  {showEmptyState && (
                    <Typography variant="body2" color="text.secondary">
                      Brak dostępnych tras dla wybranych parametrów.
                    </Typography>
                  )}

                  {!hasActiveCoordinates ? (
                    <Typography variant="body2" color="text.secondary">
                      Wybierz punkt początkowy i końcowy, aby zobaczyć propozycje tras.
                    </Typography>
                  ) : null}
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
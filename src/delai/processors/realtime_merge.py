from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from google.transit import gtfs_realtime_pb2

from ..utils.io import atomic_write_bytes

_VARIANT_TO_AGENCY: dict[str, str] = {
    "A": "A1",
    "M": "A2",
    "T": "A3",
}


@dataclass(frozen=True, slots=True)
class ServiceAlertInput:
    """Descriptor for a Service Alerts feed that should be consolidated."""

    path: Path
    agency_id: str


@dataclass(frozen=True, slots=True)
class TripUpdateInput:
    """Descriptor for a TripUpdates feed that should be consolidated."""

    path: Path
    agency_id: str


@dataclass(frozen=True, slots=True)
class VehiclePositionInput:
    """Descriptor for a VehiclePositions feed that should be consolidated."""

    path: Path
    agency_id: str


def agency_id_from_filename(path: Path, index: int) -> str:
    """Infer the synthetic agency identifier based on the filename variant."""
    stem = path.stem
    variant = stem.split("_")[-1].upper() if "_" in stem else stem.upper()
    return _VARIANT_TO_AGENCY.get(variant, f"A{index + 1}")


def _ensure_prefixed(value: str, prefix: str) -> str:
    if not value:
        return value
    if value.startswith(prefix):
        return value
    return f"{prefix}{value}"


def consolidate_service_alerts(
    feeds: Sequence[ServiceAlertInput],
    output_path: Path,
) -> Path:
    """Merge multiple ServiceAlerts feeds into a single protobuf file."""

    merged = gtfs_realtime_pb2.FeedMessage()
    latest_timestamp = 0
    version: str | None = None
    incrementality: int | None = None

    for feed in feeds:
        message = gtfs_realtime_pb2.FeedMessage()
        message.ParseFromString(feed.path.read_bytes())

        if message.header.gtfs_realtime_version:
            version = message.header.gtfs_realtime_version
        if message.header.HasField("incrementality"):
            incrementality = message.header.incrementality
        if message.header.timestamp > latest_timestamp:
            latest_timestamp = message.header.timestamp

        for entity in message.entity:
            new_entity = merged.entity.add()
            new_entity.CopyFrom(entity)
            if new_entity.HasField("alert"):
                for informed in new_entity.alert.informed_entity:
                    if informed.agency_id:
                        informed.agency_id = feed.agency_id

    header = merged.header
    header.gtfs_realtime_version = version or "2.0"
    header.incrementality = (
        incrementality
        if incrementality is not None
        else gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    )
    if latest_timestamp:
        header.timestamp = latest_timestamp

    atomic_write_bytes(output_path, merged.SerializeToString())
    return output_path


def consolidate_trip_updates(
    feeds: Sequence[TripUpdateInput],
    output_path: Path,
) -> Path:
    """Merge multiple TripUpdates feeds into a single protobuf file."""

    merged = gtfs_realtime_pb2.FeedMessage()
    latest_timestamp = 0
    version: str | None = None
    incrementality: int | None = None

    for feed in feeds:
        message = gtfs_realtime_pb2.FeedMessage()
        message.ParseFromString(feed.path.read_bytes())

        if message.header.gtfs_realtime_version:
            version = message.header.gtfs_realtime_version
        if message.header.HasField("incrementality"):
            incrementality = message.header.incrementality
        if message.header.timestamp > latest_timestamp:
            latest_timestamp = message.header.timestamp

        prefix = f"{feed.agency_id}_"

        for entity in message.entity:
            new_entity = merged.entity.add()
            new_entity.CopyFrom(entity)

            if new_entity.id:
                new_entity.id = _ensure_prefixed(new_entity.id, prefix)

            if not new_entity.HasField("trip_update"):
                continue

            trip_update = new_entity.trip_update

            if trip_update.trip.trip_id:
                trip_update.trip.trip_id = _ensure_prefixed(
                    trip_update.trip.trip_id,
                    prefix,
                )

            if trip_update.trip.route_id:
                trip_update.trip.route_id = _ensure_prefixed(
                    trip_update.trip.route_id,
                    prefix,
                )

            if trip_update.vehicle.id:
                trip_update.vehicle.id = _ensure_prefixed(
                    trip_update.vehicle.id,
                    prefix,
                )

            for stop_update in trip_update.stop_time_update:
                if stop_update.stop_id:
                    stop_update.stop_id = _ensure_prefixed(
                        stop_update.stop_id,
                        prefix,
                    )

    header = merged.header
    header.gtfs_realtime_version = version or "2.0"
    header.incrementality = (
        incrementality
        if incrementality is not None
        else gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    )
    if latest_timestamp:
        header.timestamp = latest_timestamp

    atomic_write_bytes(output_path, merged.SerializeToString())
    return output_path


def consolidate_vehicle_positions(
    feeds: Sequence[VehiclePositionInput],
    output_path: Path,
) -> Path:
    """Merge multiple VehiclePositions feeds into a single protobuf file."""

    merged = gtfs_realtime_pb2.FeedMessage()
    latest_timestamp = 0
    version: str | None = None
    incrementality: int | None = None

    for feed in feeds:
        message = gtfs_realtime_pb2.FeedMessage()
        message.ParseFromString(feed.path.read_bytes())

        if message.header.gtfs_realtime_version:
            version = message.header.gtfs_realtime_version
        if message.header.HasField("incrementality"):
            incrementality = message.header.incrementality
        if message.header.timestamp > latest_timestamp:
            latest_timestamp = message.header.timestamp

        prefix = f"{feed.agency_id}_"

        for entity in message.entity:
            new_entity = merged.entity.add()
            new_entity.CopyFrom(entity)

            if new_entity.id:
                new_entity.id = _ensure_prefixed(new_entity.id, prefix)

            if not new_entity.HasField("vehicle"):
                continue

            vehicle = new_entity.vehicle

            if vehicle.stop_id:
                vehicle.stop_id = _ensure_prefixed(vehicle.stop_id, prefix)

            if vehicle.trip.trip_id:
                vehicle.trip.trip_id = _ensure_prefixed(vehicle.trip.trip_id, prefix)

            if vehicle.trip.route_id:
                vehicle.trip.route_id = _ensure_prefixed(vehicle.trip.route_id, prefix)

            if vehicle.vehicle.id:
                vehicle.vehicle.id = _ensure_prefixed(vehicle.vehicle.id, prefix)

    header = merged.header
    header.gtfs_realtime_version = version or "2.0"
    header.incrementality = (
        incrementality
        if incrementality is not None
        else gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    )
    if latest_timestamp:
        header.timestamp = latest_timestamp

    atomic_write_bytes(output_path, merged.SerializeToString())
    return output_path

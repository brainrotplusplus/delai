from __future__ import annotations

from pathlib import Path

from google.transit import gtfs_realtime_pb2

from delai.processors.realtime_merge import (
    ServiceAlertInput,
    TripUpdateInput,
    VehiclePositionInput,
    consolidate_service_alerts,
    consolidate_trip_updates,
    consolidate_vehicle_positions,
)


def _build_service_alert(path: Path, agency_value: str | None, entity_id: str, timestamp: int) -> Path:
    message = gtfs_realtime_pb2.FeedMessage()
    header = message.header
    header.gtfs_realtime_version = "2.0"
    header.incrementality = gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    header.timestamp = timestamp

    if agency_value is not None:
        entity = message.entity.add()
        entity.id = entity_id
        alert = entity.alert
        alert.header_text.translation.add().text = "Header"
        alert.description_text.translation.add().text = "Description"
        informed = alert.informed_entity.add()
        informed.agency_id = agency_value

    path.write_bytes(message.SerializeToString())
    return path


def _build_trip_update(
    path: Path,
    *,
    entity_id: str,
    trip_id: str,
    route_id: str | None,
    stop_ids: list[str],
    vehicle_id: str,
    timestamp: int,
) -> Path:
    message = gtfs_realtime_pb2.FeedMessage()
    header = message.header
    header.gtfs_realtime_version = "2.0"
    header.incrementality = gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    header.timestamp = timestamp

    entity = message.entity.add()
    entity.id = entity_id
    update = entity.trip_update
    update.trip.trip_id = trip_id
    if route_id is not None:
        update.trip.route_id = route_id
    update.vehicle.id = vehicle_id

    for index, stop_id in enumerate(stop_ids):
        stop_time = update.stop_time_update.add()
        stop_time.stop_id = stop_id
        stop_time.stop_sequence = index

    path.write_bytes(message.SerializeToString())
    return path


def _build_vehicle_position(
    path: Path,
    *,
    entity_id: str,
    stop_id: str | None,
    trip_id: str | None,
    vehicle_id: str | None,
    route_id: str | None,
    timestamp: int,
) -> Path:
    message = gtfs_realtime_pb2.FeedMessage()
    header = message.header
    header.gtfs_realtime_version = "2.0"
    header.incrementality = gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    header.timestamp = timestamp

    entity = message.entity.add()
    entity.id = entity_id
    vehicle = entity.vehicle

    if stop_id is not None:
        vehicle.stop_id = stop_id

    if trip_id is not None:
        vehicle.trip.trip_id = trip_id

    if route_id is not None:
        vehicle.trip.route_id = route_id

    if vehicle_id is not None:
        vehicle.vehicle.id = vehicle_id

    path.write_bytes(message.SerializeToString())
    return path


def test_consolidate_service_alerts(tmp_path: Path) -> None:
    feeds = []
    variants = [
        ("ServiceAlerts_A.pb", "agency_1", "Action-A", 10, "A1"),
        ("ServiceAlerts_M.pb", "agency_2", "Action-M", 20, "A2"),
        ("ServiceAlerts_T.pb", None, "Action-T", 15, "A3"),
    ]

    for filename, agency_value, entity_id, timestamp, agency_id in variants:
        path = tmp_path / filename
        _build_service_alert(path, agency_value, entity_id, timestamp)
        feeds.append(ServiceAlertInput(path=path, agency_id=agency_id))

    output_path = tmp_path / "ServiceAlerts.pb"
    consolidated = consolidate_service_alerts(feeds, output_path)

    assert consolidated.exists()

    merged = gtfs_realtime_pb2.FeedMessage()
    merged.ParseFromString(consolidated.read_bytes())

    assert merged.header.timestamp == 20
    assert merged.header.gtfs_realtime_version == "2.0"
    assert merged.header.incrementality == gtfs_realtime_pb2.FeedHeader.FULL_DATASET

    # only two feeds contained entities
    assert len(merged.entity) == 2

    agency_values = {
        informed.agency_id
        for entity in merged.entity
        for informed in entity.alert.informed_entity
    }
    assert agency_values == {"A1", "A2"}


def test_consolidate_trip_updates(tmp_path: Path) -> None:
    variants = [
        (
            "TripUpdates_A.pb",
            "entity_a",
            "trip_a",
            "route_a",
            ["stop_a1", "stop_a2"],
            "vehicle_a",
            30,
            "A1",
        ),
        (
            "TripUpdates_M.pb",
            "entity_m",
            "trip_m",
            None,
            ["stop_m1"],
            "vehicle_m",
            25,
            "A2",
        ),
        (
            "TripUpdates_T.pb",
            "entity_t",
            "trip_t",
            "route_t",
            ["stop_t1", "stop_t2", "stop_t3"],
            "vehicle_t",
            35,
            "A3",
        ),
    ]

    feeds: list[TripUpdateInput] = []

    for filename, entity_id, trip_id, route_id, stops, vehicle_id, timestamp, agency_id in variants:
        path = tmp_path / filename
        _build_trip_update(
            path,
            entity_id=entity_id,
            trip_id=trip_id,
            route_id=route_id,
            stop_ids=stops,
            vehicle_id=vehicle_id,
            timestamp=timestamp,
        )
        feeds.append(TripUpdateInput(path=path, agency_id=agency_id))

    output_path = tmp_path / "TripUpdates.pb"
    consolidated = consolidate_trip_updates(feeds, output_path)

    assert consolidated.exists()

    merged = gtfs_realtime_pb2.FeedMessage()
    merged.ParseFromString(consolidated.read_bytes())

    assert merged.header.timestamp == 35
    assert merged.header.gtfs_realtime_version == "2.0"
    assert merged.header.incrementality == gtfs_realtime_pb2.FeedHeader.FULL_DATASET

    assert len(merged.entity) == len(variants)

    for entity, variant in zip(
        merged.entity,
        variants,
        strict=True,
    ):
        (
            _,
            original_entity_id,
            original_trip_id,
            original_route_id,
            stops,
            vehicle_id,
            _,
            agency_id,
        ) = variant

        prefix = f"{agency_id}_"
        assert entity.id == f"{prefix}{original_entity_id}"
        assert entity.trip_update.trip.trip_id == f"{prefix}{original_trip_id}"
        if original_route_id is not None:
            assert entity.trip_update.trip.route_id == f"{prefix}{original_route_id}"
        else:
            assert not entity.trip_update.trip.route_id
        assert entity.trip_update.vehicle.id == f"{prefix}{vehicle_id}"

        stop_ids = [stop_update.stop_id for stop_update in entity.trip_update.stop_time_update]
        assert stop_ids == [f"{prefix}{stop_id}" for stop_id in stops]


def test_consolidate_vehicle_positions(tmp_path: Path) -> None:
    variants = [
        (
            "VehiclePositions_A.pb",
            "entity_a",
            "stop_a",
            "trip_a",
            "veh_a",
            None,
            40,
            "A1",
        ),
        (
            "VehiclePositions_M.pb",
            "entity_m",
            None,
            "trip_m",
            None,
            "route_m",
            45,
            "A2",
        ),
        (
            "VehiclePositions_T.pb",
            "entity_t",
            "stop_t",
            None,
            "veh_t",
            "route_t",
            42,
            "A3",
        ),
    ]

    feeds: list[VehiclePositionInput] = []

    for (
        filename,
        entity_id,
        stop_id,
        trip_id,
        vehicle_id,
        route_id,
        timestamp,
        agency_id,
    ) in variants:
        path = tmp_path / filename
        _build_vehicle_position(
            path,
            entity_id=entity_id,
            stop_id=stop_id,
            trip_id=trip_id,
            vehicle_id=vehicle_id,
            route_id=route_id,
            timestamp=timestamp,
        )
        feeds.append(VehiclePositionInput(path=path, agency_id=agency_id))

    output_path = tmp_path / "VehiclePositions.pb"
    consolidated = consolidate_vehicle_positions(feeds, output_path)

    assert consolidated.exists()

    merged = gtfs_realtime_pb2.FeedMessage()
    merged.ParseFromString(consolidated.read_bytes())

    assert merged.header.timestamp == 45
    assert merged.header.gtfs_realtime_version == "2.0"
    assert merged.header.incrementality == gtfs_realtime_pb2.FeedHeader.FULL_DATASET

    assert len(merged.entity) == len(variants)

    for entity, variant in zip(merged.entity, variants, strict=True):
        (
            _,
            original_entity_id,
            original_stop_id,
            original_trip_id,
            original_vehicle_id,
            original_route_id,
            _,
            agency_id,
        ) = variant

        prefix = f"{agency_id}_"
        assert entity.id == f"{prefix}{original_entity_id}"

        vehicle = entity.vehicle

        if original_stop_id is not None:
            assert vehicle.stop_id == f"{prefix}{original_stop_id}"
        else:
            assert not vehicle.stop_id

        if original_trip_id is not None:
            assert vehicle.trip.trip_id == f"{prefix}{original_trip_id}"
        else:
            assert not vehicle.trip.trip_id

        if original_vehicle_id is not None:
            assert vehicle.vehicle.id == f"{prefix}{original_vehicle_id}"
        else:
            assert not vehicle.vehicle.id

        if original_route_id is not None:
            assert vehicle.trip.route_id == f"{prefix}{original_route_id}"
        else:
            assert not vehicle.trip.route_id
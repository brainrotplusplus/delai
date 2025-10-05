from __future__ import annotations

import logging
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Sequence, TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover - type checking helper
    from threading import Event

import requests

from .processors import (
    StaticFeedInput,
    ServiceAlertInput,
    TripUpdateInput,
    VehiclePositionInput,
    consolidate_static_feeds,
    consolidate_service_alerts,
    consolidate_trip_updates,
    consolidate_vehicle_positions,
    convert_feed_to_json,
    determine_agency_id,
    extract_zip,
    agency_id_from_filename,
    process_service_alerts,
)
from .sources.base import DataSource, DownloadTarget

LOGGER = logging.getLogger(__name__)
DEFAULT_TIMEOUT = 60  # seconds
DEFAULT_CHUNK_SIZE = 1024 * 1024  # 1 MiB

CONSOLIDATED_STATIC_FILENAME = "GTFS.zip"
RAW_SERVICE_ALERTS_FILENAME = "RawServiceAlerts.pb"
RAW_TRIP_UPDATES_FILENAME = "RawTripUpdates.pb"
RAW_VEHICLE_POSITIONS_FILENAME = "RawVehiclePositions.pb"
SERVICE_ALERTS_JSON_FILENAME = "alerts.json"
APPROVED_ALERTS_PB_FILENAME = "approved_all_alerts.pb"
RAW_INCIDENTS_FILENAME = "raw_incidents.json"
APPROVED_INCIDENTS_FILENAME = "approved_incidents.json"
DISPATCHER_ALERTS_FILENAME = "dispatcher_alerts.json"
APPROVED_ALERTS_FILENAME = "approved_alerts.json"


@dataclass(slots=True, frozen=True)
class DownloadResult:
    """Represents a successfully downloaded artifact."""

    source: str
    url: str
    output_path: Path
    bytes_written: int
    derived_paths: tuple[Path, ...] = ()


class DownloadService:
    """Orchestrates downloads for a collection of data sources."""

    def __init__(
        self,
        sources: Sequence[DataSource],
        output_dir: Path,
        *,
        session_factory: Callable[[], requests.Session] | None = None,
        timeout: int = DEFAULT_TIMEOUT,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        cleanup_intermediate_files: bool = False,
    ) -> None:
        self._sources = list(sources)
        self._output_dir = Path(output_dir)
        self._session_factory = session_factory or requests.Session
        self._timeout = timeout
        self._chunk_size = chunk_size
        self._cleanup_enabled = cleanup_intermediate_files

    def run(
        self,
        target_filter: Callable[[DataSource, DownloadTarget], bool] | None = None,
    ) -> list[DownloadResult]:
        if not self._sources:
            LOGGER.warning("No data sources configured. Nothing to download.")
            return []

        self._output_dir.mkdir(parents=True, exist_ok=True)

        results: list[DownloadResult] = []
        intermediate_paths: set[Path] = set()

        with self._session_factory() as session:
            session.headers.setdefault(
                "User-Agent", "delai/0.1 (+https://github.com/brainrotplusplus/delai)"
            )
            for source in self._sources:
                LOGGER.info("Processing source %s.", source.name)
                for result in self._download_source(session, source, target_filter):
                    results.append(result)
                    intermediate_paths.add(result.output_path)
                    intermediate_paths.update(result.derived_paths)

        final_artifacts: set[Path] = set()
        extra_intermediate: set[Path] = set()

        static_artifacts, static_intermediate = self._finalize_static_feeds(results)
        final_artifacts.update(static_artifacts)
        extra_intermediate.update(static_intermediate)

        realtime_artifacts, realtime_intermediate = self._finalize_realtime_feeds(results)
        final_artifacts.update(realtime_artifacts)
        extra_intermediate.update(realtime_intermediate)

        intermediate_paths.update(extra_intermediate)

        if self._cleanup_enabled:
            self._cleanup_artifacts(intermediate_paths, final_artifacts)

        return results

    def _download_source(
        self,
        session: requests.Session,
        source: DataSource,
        target_filter: Callable[[DataSource, DownloadTarget], bool] | None = None,
    ) -> Iterable[DownloadResult]:
        for target in source.iter_targets():
            if target_filter is not None and not target_filter(source, target):
                continue
            yield self._download_target(session, source, target)

    def _download_target(
        self,
        session: requests.Session,
        source: DataSource,
        target: DownloadTarget,
    ) -> DownloadResult:
        destination = target.destination(self._output_dir, source.slug)
        destination.parent.mkdir(parents=True, exist_ok=True)

        LOGGER.debug("Fetching %s", target.url)

        with session.get(target.url, stream=True, timeout=self._timeout) as response:
            response.raise_for_status()
            bytes_written = self._write_stream(response.iter_content(self._chunk_size), destination)

        derived_paths = tuple(self._post_process(source, target, destination))

        LOGGER.info("Saved %s (%s bytes)", destination, bytes_written)
        for generated in derived_paths:
            LOGGER.info("Generated %s", generated)

        return DownloadResult(
            source=source.slug,
            url=target.url,
            output_path=destination,
            bytes_written=bytes_written,
            derived_paths=derived_paths,
        )

    def _write_stream(self, chunks: Iterable[bytes], destination: Path) -> int:
        bytes_written = 0
        with tempfile.NamedTemporaryFile(delete=False, dir=destination.parent) as tmp_file:
            tmp_path = Path(tmp_file.name)
            try:
                for chunk in chunks:
                    if not chunk:
                        continue
                    tmp_file.write(chunk)
                    bytes_written += len(chunk)
            except Exception:
                tmp_path.unlink(missing_ok=True)
                raise

        tmp_path.replace(destination)
        return bytes_written

    def _post_process(
        self,
        source: DataSource,
        target: DownloadTarget,
        destination: Path,
    ) -> Iterable[Path]:
        generated: list[Path] = []

        suffix = destination.suffix.lower()

        if suffix == ".pb":
            try:
                json_path = convert_feed_to_json(destination)
            except Exception:
                LOGGER.exception(
                    "Failed to convert realtime feed for source %s target %s",
                    source.slug,
                    target.url,
                )
            else:
                generated.append(json_path)
        elif suffix == ".zip":
            try:
                extracted_dir = extract_zip(destination)
            except Exception:
                LOGGER.exception(
                    "Failed to extract archive for source %s target %s",
                    source.slug,
                    target.url,
                )
            else:
                generated.append(extracted_dir)

        return generated

    def _finalize_static_feeds(
        self, results: Sequence[DownloadResult]
    ) -> tuple[list[Path], list[Path]]:
        static_results = [
            result
            for result in results
            if result.output_path.suffix.lower() == ".zip"
        ]

        if not static_results:
            return [], []

        static_results = sorted(static_results, key=lambda item: item.output_path.name)
        feeds: list[StaticFeedInput] = []

        for index, result in enumerate(static_results):
            extracted_dir = next((path for path in result.derived_paths if path.is_dir()), None)
            if extracted_dir is None:
                continue
            agency_id = determine_agency_id(result.output_path, index)
            feeds.append(StaticFeedInput(result.output_path, extracted_dir, agency_id))

        if not feeds:
            return [], []

        try:
            consolidated_path = consolidate_static_feeds(
                feeds,
                static_results[0].output_path.parent / CONSOLIDATED_STATIC_FILENAME,
            )
        except Exception:
            LOGGER.exception("Failed to consolidate static GTFS bundles")
            return [], []

        LOGGER.info("Generated consolidated static bundle at %s", consolidated_path)
        return [consolidated_path], []

    def _finalize_realtime_feeds(
        self, results: Sequence[DownloadResult]
    ) -> tuple[list[Path], list[Path]]:
        final_artifacts: list[Path] = []
        extra_intermediate: list[Path] = []

        alerts_inputs: list[ServiceAlertInput] = []
        service_alert_results = sorted(
            (
                result
                for result in results
                if result.output_path.suffix.lower() == ".pb"
                and result.output_path.stem.startswith("ServiceAlerts_")
            ),
            key=lambda item: item.output_path.name,
        )

        for index, result in enumerate(service_alert_results):
            agency_id = agency_id_from_filename(result.output_path, index)
            alerts_inputs.append(ServiceAlertInput(result.output_path, agency_id))

        if alerts_inputs:
            alerts_dir = service_alert_results[0].output_path.parent
            output_path = service_alert_results[0].output_path.with_name(
                RAW_SERVICE_ALERTS_FILENAME
            )

            try:
                consolidated_alerts = consolidate_service_alerts(alerts_inputs, output_path)
            except Exception:
                LOGGER.exception("Failed to consolidate ServiceAlerts feeds")
            else:
                LOGGER.info("Generated consolidated ServiceAlerts feed at %s", consolidated_alerts)

                alerts_json_path = alerts_dir / SERVICE_ALERTS_JSON_FILENAME
                approved_alerts_path = alerts_dir / APPROVED_ALERTS_FILENAME
                approved_incidents_path = alerts_dir / APPROVED_INCIDENTS_FILENAME
                dispatcher_alerts_path = alerts_dir / DISPATCHER_ALERTS_FILENAME
                raw_incidents_path = alerts_dir / RAW_INCIDENTS_FILENAME
                approved_alerts_pb_path = alerts_dir / APPROVED_ALERTS_PB_FILENAME

                try:
                    alerts_output = process_service_alerts(
                        consolidated_alerts,
                        alerts_json_path,
                        approved_alerts_path,
                        approved_incidents_path,
                        dispatcher_alerts_path,
                        raw_incidents_path,
                        approved_alerts_pb_path,
                    )
                except Exception:
                    LOGGER.exception("Failed to post-process consolidated ServiceAlerts feed")
                else:
                    final_artifacts.append(alerts_output.alerts_json)
                    final_artifacts.append(alerts_output.approved_alerts_pb)

                final_artifacts.append(consolidated_alerts)

        trip_inputs: list[TripUpdateInput] = []
        trip_update_results = sorted(
            (
                result
                for result in results
                if result.output_path.suffix.lower() == ".pb"
                and result.output_path.stem.startswith("TripUpdates_")
            ),
            key=lambda item: item.output_path.name,
        )

        for index, result in enumerate(trip_update_results):
            agency_id = agency_id_from_filename(result.output_path, index)
            trip_inputs.append(TripUpdateInput(result.output_path, agency_id))

        if trip_inputs:
            trip_output = trip_update_results[0].output_path.with_name(
                RAW_TRIP_UPDATES_FILENAME
            )

            try:
                consolidated_trips = consolidate_trip_updates(trip_inputs, trip_output)
            except Exception:
                LOGGER.exception("Failed to consolidate TripUpdates feeds")
            else:
                LOGGER.info("Generated consolidated TripUpdates feed at %s", consolidated_trips)

                try:
                    trips_json = convert_feed_to_json(consolidated_trips)
                except Exception:
                    LOGGER.exception("Failed to render consolidated TripUpdates feed as JSON")
                else:
                    extra_intermediate.append(trips_json)

                final_artifacts.append(consolidated_trips)

        vehicle_inputs: list[VehiclePositionInput] = []
        vehicle_results = sorted(
            (
                result
                for result in results
                if result.output_path.suffix.lower() == ".pb"
                and result.output_path.stem.startswith("VehiclePositions_")
            ),
            key=lambda item: item.output_path.name,
        )

        for index, result in enumerate(vehicle_results):
            agency_id = agency_id_from_filename(result.output_path, index)
            vehicle_inputs.append(VehiclePositionInput(result.output_path, agency_id))

        if vehicle_inputs:
            vehicle_output = vehicle_results[0].output_path.with_name(
                RAW_VEHICLE_POSITIONS_FILENAME
            )

            try:
                consolidated_vehicles = consolidate_vehicle_positions(vehicle_inputs, vehicle_output)
            except Exception:
                LOGGER.exception("Failed to consolidate VehiclePositions feeds")
            else:
                LOGGER.info("Generated consolidated VehiclePositions feed at %s", consolidated_vehicles)

                try:
                    vehicles_json = convert_feed_to_json(consolidated_vehicles)
                except Exception:
                    LOGGER.exception("Failed to render consolidated VehiclePositions feed as JSON")
                else:
                    extra_intermediate.append(vehicles_json)

                final_artifacts.append(consolidated_vehicles)

        return final_artifacts, extra_intermediate

    def _cleanup_artifacts(self, artifacts: Iterable[Path], preserved: Iterable[Path]) -> None:
        preserved_set = {Path(path) for path in preserved}
        candidates = {Path(path) for path in artifacts}

        for path in sorted(candidates, key=lambda item: len(item.parts), reverse=True):
            if path in preserved_set:
                continue

            try:
                if not path.exists():
                    continue

                if path.is_dir():
                    if any(self._is_relative_to(target, path) for target in preserved_set):
                        continue
                    shutil.rmtree(path, ignore_errors=False)
                else:
                    path.unlink()
            except Exception:
                LOGGER.exception("Failed to remove intermediate artifact at %s", path)

    @staticmethod
    def _is_relative_to(child: Path, parent: Path) -> bool:
        try:
            child.relative_to(parent)
            return True
        except ValueError:
            return False

from __future__ import annotations

import csv
import io
import zipfile
from pathlib import Path

import pytest

from delai.processors.static_gtfs import (  # type: ignore[attr-defined]
    StaticFeedInput,
    consolidate_static_feeds,
    determine_agency_id,
)


@pytest.fixture
def static_dirs(tmp_path: Path) -> list[StaticFeedInput]:
    static_root = tmp_path / "static"
    static_root.mkdir()

    datasets = []
    specs = [
        ("GTFS_KRK_A", "A1", False),
        ("GTFS_KRK_M", "A2", True),
        ("GTFS_KRK_T", "A3", True),
        ("kml-ska-gtfs", "A4", False),
        ("ald-gtfs", "A5", False),
    ]

    for name, agency_id, include_mail in specs:
        directory = static_root / name
        directory.mkdir()
        zip_path = static_root / f"{name}.zip"

        _write_agency(directory / "agency.txt", include_mail)
        _write_calendar(directory / "calendar.txt", name)
        _write_calendar_dates(directory / "calendar_dates.txt", name)
        _write_routes(directory / "routes.txt", name)
        _write_shapes(directory / "shapes.txt", name)
        _write_stops(directory / "stops.txt", name)
        _write_stop_times(directory / "stop_times.txt", name)
        _write_trips(directory / "trips.txt", name)

        if name.endswith("A"):
            _write_blocks(directory / "blocks.txt")

        datasets.append(StaticFeedInput(zip_path=zip_path, extracted_dir=directory, agency_id=agency_id))

    return datasets


def test_consolidate_static_feeds(static_dirs: list[StaticFeedInput], tmp_path: Path) -> None:
    output_zip = consolidate_static_feeds(static_dirs, tmp_path / "GTFS_KRK.zip")

    assert output_zip.exists()

    with zipfile.ZipFile(output_zip) as archive:
        agency_rows = _read_csv_from_zip(archive, "agency.txt")
        assert {row["agency_id"] for row in agency_rows} == {"A1", "A2", "A3", "A4", "A5"}
        assert "agency_email" in agency_rows[0]

        calendar_rows = _read_csv_from_zip(archive, "calendar.txt")
        assert all(
            row["service_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in calendar_rows
        )

        routes_rows = _read_csv_from_zip(archive, "routes.txt")
        assert all(
            row["route_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in routes_rows
        )
        assert {row["agency_id"] for row in routes_rows} == {"A1", "A2", "A3", "A4", "A5"}

        stops_rows = _read_csv_from_zip(archive, "stops.txt")
        assert all(
            row["stop_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in stops_rows
        )

        stop_times_rows = _read_csv_from_zip(archive, "stop_times.txt")
        assert all(
            row["trip_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in stop_times_rows
        )
        assert all(
            row["stop_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in stop_times_rows
        )

        trips_rows = _read_csv_from_zip(archive, "trips.txt")
        assert all(
            row["trip_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in trips_rows
        )
        assert all(
            row["route_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in trips_rows
        )
        assert all(
            row["service_id"].startswith(("A1_", "A2_", "A3_", "A4_", "A5_"))
            for row in trips_rows
        )


        assert "blocks.txt" in archive.namelist()


def test_determine_agency_id_default(tmp_path: Path) -> None:
    assert determine_agency_id(tmp_path / "GTFS_KRK_A.zip", 0) == "A1"
    assert determine_agency_id(tmp_path / "GTFS_KRK_M.zip", 1) == "A2"
    assert determine_agency_id(tmp_path / "GTFS_KRK_T.zip", 2) == "A3"
    assert determine_agency_id(tmp_path / "kml-ska-gtfs.zip", 3) == "A4"
    assert determine_agency_id(tmp_path / "ald-gtfs.zip", 4) == "A5"
    assert determine_agency_id(tmp_path / "unknown.zip", 0) == "A1"
    assert determine_agency_id(tmp_path / "mystery.zip", 5) == "A6"


def _write_agency(path: Path, include_mail: bool) -> None:
    header = ["agency_id", "agency_name", "agency_url", "agency_timezone"]
    if include_mail:
        header.append("agency_email")

    rows = [["1", "Agency", "https://example.com", "Europe/Warsaw"]]

    _write_csv(path, header, rows)


def _write_calendar(path: Path, label: str) -> None:
    header = [
        "service_id",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
        "start_date",
        "end_date",
    ]
    rows = [[f"svc_{label}", "1", "1", "1", "1", "1", "0", "0", "20240101", "20241231"]]
    _write_csv(path, header, rows)


def _write_calendar_dates(path: Path, label: str) -> None:
    header = ["service_id", "date", "exception_type"]
    rows = [[f"svc_{label}", "20240601", "1"]]
    _write_csv(path, header, rows)


def _write_routes(path: Path, label: str) -> None:
    header = ["route_id", "agency_id", "route_short_name", "route_long_name", "route_type"]
    rows = [[f"r_{label}", "1", "10", "Route", "3"]]
    _write_csv(path, header, rows)


def _write_shapes(path: Path, label: str) -> None:
    header = ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"]
    rows = [[f"sh_{label}", "50.0", "19.9", "1"]]
    _write_csv(path, header, rows)


def _write_stops(path: Path, label: str) -> None:
    header = ["stop_id", "stop_name", "stop_lat", "stop_lon"]
    rows = [[f"stop_{label}", "Stop", "50.0", "19.9"]]
    _write_csv(path, header, rows)


def _write_stop_times(path: Path, label: str) -> None:
    header = ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"]
    rows = [[f"trip_{label}", "08:00:00", "08:00:00", f"stop_{label}", "1"]]
    _write_csv(path, header, rows)


def _write_trips(path: Path, label: str) -> None:
    header = ["route_id", "service_id", "trip_id", "shape_id", "block_id"]
    rows = [[f"r_{label}", f"svc_{label}", f"trip_{label}", f"sh_{label}", f"block_{label}"]]
    _write_csv(path, header, rows)


def _write_blocks(path: Path) -> None:
    header = ["block_id", "block_name"]
    rows = [["block_GTFS_KRK_A", "Block"]]
    _write_csv(path, header, rows)


def _write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)


def _read_csv_from_zip(archive: zipfile.ZipFile, name: str) -> list[dict[str, str]]:
    with archive.open(name) as handle:
        text = io.TextIOWrapper(handle, encoding="utf-8")
        reader = csv.DictReader(text)
        return [dict(row) for row in reader]
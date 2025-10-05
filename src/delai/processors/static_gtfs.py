from __future__ import annotations

import csv
import io
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

_STATIC_VARIANT_MAP = {
    "A": "A1",
    "M": "A2",
    "T": "A3",
}

_STATIC_STEM_MAP = {
    "KML-SKA-GTFS": "A4",
    "ALD-GTFS": "A5",
}


@dataclass(frozen=True, slots=True)
class StaticFeedInput:
    """Metadata describing a downloaded static GTFS bundle."""

    zip_path: Path
    extracted_dir: Path
    agency_id: str


def determine_agency_id(zip_path: Path, index: int) -> str:
    """Derive a deterministic agency identifier for the consolidated bundle."""

    stem = zip_path.stem
    stem_upper = stem.upper()

    if stem_upper in _STATIC_STEM_MAP:
        return _STATIC_STEM_MAP[stem_upper]

    variant = stem_upper.split("_")[-1] if "_" in stem_upper else stem_upper
    return _STATIC_VARIANT_MAP.get(variant, f"A{index + 1}")


def consolidate_static_feeds(
    feeds: Sequence[StaticFeedInput],
    output_zip: Path | None = None,
) -> Path:
    """Merge multiple static GTFS bundles into a single consolidated archive."""

    if not feeds:
        raise ValueError("No static feeds provided for consolidation")

    if output_zip is None:
        output_zip = feeds[0].zip_path.parent / "GTFS_KRK.zip"

    aggregated: dict[str, dict[str, list]] = {}
    blocks_captured = False

    for feed in feeds:
        directory = feed.extracted_dir
        if not directory.exists():
            continue

        _process_agency(directory / "agency.txt", feed.agency_id, aggregated)
        _process_calendar(directory / "calendar.txt", feed.agency_id, aggregated)
        _process_calendar_dates(directory / "calendar_dates.txt", feed.agency_id, aggregated)
        _process_routes(directory / "routes.txt", feed.agency_id, aggregated)
        _process_shapes(directory / "shapes.txt", feed.agency_id, aggregated)
        _process_stops(directory / "stops.txt", feed.agency_id, aggregated)
        _process_stop_times(directory / "stop_times.txt", feed.agency_id, aggregated)
        _process_trips(directory / "trips.txt", feed.agency_id, aggregated)

        if not blocks_captured and (directory / "blocks.txt").exists():
            _process_generic(directory / "blocks.txt", "blocks.txt", aggregated)
            blocks_captured = True

    # Copy any other ancillary GTFS files without modification
        for extra_path in directory.glob("*.txt"):
            name = extra_path.name
            if name in {
                "agency.txt",
                "calendar.txt",
                "calendar_dates.txt",
        "feed_info.txt",
                "routes.txt",
                "shapes.txt",
                "stops.txt",
                "stop_times.txt",
                "trips.txt",
                "blocks.txt",
            }:
                continue
            _process_generic(extra_path, name, aggregated)

    output_zip.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for filename, data in sorted(aggregated.items()):
            header = data.get("header", [])
            rows = data.get("rows", [])
            if not header:
                continue
            buffer = io.StringIO()
            writer = csv.DictWriter(buffer, fieldnames=header, lineterminator="\n")
            writer.writeheader()
            for row in rows:
                writer.writerow({field: row.get(field, "") for field in header})
            bundle.writestr(filename, buffer.getvalue())

    return output_zip


def _process_agency(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    if "agency_email" not in header:
        header.append("agency_email")

    for row in rows:
        row.setdefault("agency_email", "")
        row["agency_id"] = agency_id

    _add_rows("agency.txt", header, rows, aggregated)


def _process_calendar(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "service_id", agency_id)

    _add_rows("calendar.txt", header, rows, aggregated)


def _process_calendar_dates(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "service_id", agency_id)

    _add_rows("calendar_dates.txt", header, rows, aggregated)


def _process_routes(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "route_id", agency_id)
        if row.get("agency_id"):
            row["agency_id"] = agency_id

    _add_rows("routes.txt", header, rows, aggregated)


def _process_shapes(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "shape_id", agency_id)

    _add_rows("shapes.txt", header, rows, aggregated)


def _process_stops(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "stop_id", agency_id)
        if row.get("parent_station"):
            _apply_prefix(row, "parent_station", agency_id)

    _add_rows("stops.txt", header, rows, aggregated)


def _process_stop_times(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "trip_id", agency_id)
        _apply_prefix(row, "stop_id", agency_id)

    _add_rows("stop_times.txt", header, rows, aggregated)


def _process_trips(path: Path, agency_id: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return

    for row in rows:
        _apply_prefix(row, "trip_id", agency_id)
        _apply_prefix(row, "route_id", agency_id)
        _apply_prefix(row, "service_id", agency_id)
        _apply_prefix(row, "block_id", agency_id)
        _apply_prefix(row, "shape_id", agency_id)

    _add_rows("trips.txt", header, rows, aggregated)


def _process_generic(path: Path, name: str, aggregated: dict[str, dict[str, list]]) -> None:
    header, rows = _read_csv(path)
    if not header:
        return
    _add_rows(name, header, rows, aggregated)


def _read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    if not path.exists():
        return [], []

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        header = list(reader.fieldnames or [])
        rows = [dict(row) for row in reader]
    return header, rows


def _add_rows(
    name: str,
    header: Iterable[str],
    rows: Iterable[dict[str, str]],
    aggregated: dict[str, dict[str, list]],
) -> None:
    target = aggregated.setdefault(name, {"header": [], "rows": []})
    for column in header:
        if column not in target["header"]:
            target["header"].append(column)
    target["rows"].extend(dict(row) for row in rows)


def _apply_prefix(row: dict[str, str], field: str, prefix: str) -> None:
    value = row.get(field, "")
    if not value:
        return
    qualified = f"{prefix}_{value}" if not value.startswith(f"{prefix}_") else value
    row[field] = qualified

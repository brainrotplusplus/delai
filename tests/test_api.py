from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from delai.api import create_app
from delai.service import (
    CONSOLIDATED_STATIC_FILENAME,
    RAW_SERVICE_ALERTS_FILENAME,
    RAW_TRIP_UPDATES_FILENAME,
    RAW_VEHICLE_POSITIONS_FILENAME,
)


def _prepare_file(path: Path, contents: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(contents)


def test_endpoints_serve_files(tmp_path: Path) -> None:
    source_slug = "krakow-gtfs"
    base_dir = tmp_path / source_slug

    static_bytes = b"zip-bytes"
    service_alert_bytes = b"alerts"
    trip_update_bytes = b"trips"
    vehicle_bytes = b"vehicles"

    _prepare_file(base_dir / "static" / CONSOLIDATED_STATIC_FILENAME, static_bytes)
    _prepare_file(base_dir / "servicealerts" / RAW_SERVICE_ALERTS_FILENAME, service_alert_bytes)
    _prepare_file(base_dir / "tripupdates" / RAW_TRIP_UPDATES_FILENAME, trip_update_bytes)
    _prepare_file(base_dir / "vehiclepositions" / RAW_VEHICLE_POSITIONS_FILENAME, vehicle_bytes)

    app = create_app(tmp_path, source_slug)
    client = TestClient(app)

    response = client.get("/api/v1/raw-static")
    assert response.status_code == 200
    assert response.content == static_bytes
    assert response.headers["content-disposition"].endswith(f'filename="{CONSOLIDATED_STATIC_FILENAME}"')

    response = client.get("/api/v1/raw-service-alerts")
    assert response.status_code == 200
    assert response.content == service_alert_bytes

    response = client.get("/api/v1/raw-trip-updates")
    assert response.status_code == 200
    assert response.content == trip_update_bytes

    response = client.get("/api/v1/raw-vehicle-positions")
    assert response.status_code == 200
    assert response.content == vehicle_bytes


def test_missing_file_returns_404(tmp_path: Path) -> None:
    source_slug = "krakow-gtfs"
    app = create_app(tmp_path, source_slug)
    client = TestClient(app)

    response = client.get("/api/v1/raw-static")
    assert response.status_code == 404
    assert response.json()["detail"] == "Requested artifact is not available"

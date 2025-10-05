from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from delai.api import (
    RAW_SERVICE_ALERTS_ROUTE,
    RAW_STATIC_ROUTE,
    RAW_TRIP_UPDATES_ROUTE,
    RAW_VEHICLE_POSITIONS_ROUTE,
    create_app,
)
from delai.service import (
    CONSOLIDATED_STATIC_FILENAME,
    RAW_SERVICE_ALERTS_FILENAME,
    RAW_TRIP_UPDATES_FILENAME,
    RAW_VEHICLE_POSITIONS_FILENAME,
    SERVICE_ALERTS_JSON_FILENAME,
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

    servicealerts_dir = base_dir / "servicealerts"
    _prepare_file(base_dir / "static" / CONSOLIDATED_STATIC_FILENAME, static_bytes)
    _prepare_file(servicealerts_dir / RAW_SERVICE_ALERTS_FILENAME, service_alert_bytes)
    _prepare_file(servicealerts_dir / SERVICE_ALERTS_JSON_FILENAME, b"{}")
    _prepare_file(base_dir / "tripupdates" / RAW_TRIP_UPDATES_FILENAME, trip_update_bytes)
    _prepare_file(base_dir / "vehiclepositions" / RAW_VEHICLE_POSITIONS_FILENAME, vehicle_bytes)

    app = create_app(tmp_path, source_slug)
    client = TestClient(app)

    response = client.get(RAW_STATIC_ROUTE)
    assert response.status_code == 200
    assert response.content == static_bytes
    assert response.headers["content-disposition"].endswith(f'filename="{CONSOLIDATED_STATIC_FILENAME}"')

    response = client.get(RAW_SERVICE_ALERTS_ROUTE)
    assert response.status_code == 200
    assert response.content == service_alert_bytes

    response = client.get("/api/v1/service-alerts")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    assert response.json() == {}

    response = client.get(RAW_TRIP_UPDATES_ROUTE)
    assert response.status_code == 200
    assert response.content == trip_update_bytes

    response = client.get(RAW_VEHICLE_POSITIONS_ROUTE)
    assert response.status_code == 200
    assert response.content == vehicle_bytes


def test_missing_file_returns_404(tmp_path: Path) -> None:
    source_slug = "krakow-gtfs"
    app = create_app(tmp_path, source_slug)
    client = TestClient(app)

    response = client.get(RAW_STATIC_ROUTE)
    assert response.status_code == 404
    assert response.json()["detail"] == "Requested artifact is not available"

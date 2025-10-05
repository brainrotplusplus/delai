from __future__ import annotations

from pathlib import Path
from typing import Callable

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse

from .service import (
    CONSOLIDATED_STATIC_FILENAME,
    RAW_SERVICE_ALERTS_FILENAME,
    RAW_TRIP_UPDATES_FILENAME,
    RAW_VEHICLE_POSITIONS_FILENAME,
)


def create_app(output_dir: Path, source_slug: str) -> FastAPI:
    """Build the HTTP application exposing consolidated feed artifacts."""

    app = FastAPI(title="delai", version="0.1.0")

    def _resolve_path(resolver: Callable[[Path], Path]) -> Path:
        base_dir = output_dir / source_slug
        resolved_path = resolver(base_dir)
        if not resolved_path.exists() or not resolved_path.is_file():
            raise HTTPException(status_code=404, detail="Requested artifact is not available")
        return resolved_path

    def _serve(path: Path) -> FileResponse:
        media_type = {
            ".zip": "application/zip",
            ".pb": "application/octet-stream",
        }.get(path.suffix.lower(), "application/octet-stream")
        return FileResponse(path, media_type=media_type, filename=path.name)

    @app.get("/api/v1/raw-static")
    def get_raw_static() -> FileResponse:
        path = _resolve_path(lambda base: base / "static" / CONSOLIDATED_STATIC_FILENAME)
        return _serve(path)

    @app.get("/api/v1/raw-service-alerts")
    def get_raw_service_alerts() -> FileResponse:
        path = _resolve_path(
            lambda base: base / "servicealerts" / RAW_SERVICE_ALERTS_FILENAME
        )
        return _serve(path)

    @app.get("/api/v1/raw-trip-updates")
    def get_raw_trip_updates() -> FileResponse:
        path = _resolve_path(lambda base: base / "tripupdates" / RAW_TRIP_UPDATES_FILENAME)
        return _serve(path)

    @app.get("/api/v1/raw-vehicle-positions")
    def get_raw_vehicle_positions() -> FileResponse:
        path = _resolve_path(
            lambda base: base / "vehiclepositions" / RAW_VEHICLE_POSITIONS_FILENAME
        )
        return _serve(path)

    return app

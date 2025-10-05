from __future__ import annotations

import json
import threading
from pathlib import Path
from typing import Any, Callable

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.responses import FileResponse

from .service import (
    APPROVED_INCIDENTS_FILENAME,
    CONSOLIDATED_STATIC_FILENAME,
    DISPATCHER_ALERTS_FILENAME,
    RAW_INCIDENTS_FILENAME,
    RAW_SERVICE_ALERTS_FILENAME,
    RAW_TRIP_UPDATES_FILENAME,
    RAW_VEHICLE_POSITIONS_FILENAME,
    SERVICE_ALERTS_JSON_FILENAME,
)


RAW_STATIC_ROUTE = f"/api/v1/raw-static/{CONSOLIDATED_STATIC_FILENAME}"
RAW_SERVICE_ALERTS_ROUTE = f"/api/v1/raw-service-alerts/{RAW_SERVICE_ALERTS_FILENAME}"
RAW_TRIP_UPDATES_ROUTE = f"/api/v1/raw-trip-updates/{RAW_TRIP_UPDATES_FILENAME}"
RAW_VEHICLE_POSITIONS_ROUTE = f"/api/v1/raw-vehicle-positions/{RAW_VEHICLE_POSITIONS_FILENAME}"


def create_app(output_dir: Path, source_slug: str) -> FastAPI:
    """Build the HTTP application exposing consolidated feed artifacts."""

    app = FastAPI(title="delai", version="0.1.0")
    io_lock = threading.Lock()
    base_dir = output_dir / source_slug
    servicealerts_dir = base_dir / "servicealerts"
    raw_incidents_path = servicealerts_dir / RAW_INCIDENTS_FILENAME
    approved_incidents_path = servicealerts_dir / APPROVED_INCIDENTS_FILENAME
    dispatcher_alerts_path = servicealerts_dir / DISPATCHER_ALERTS_FILENAME

    def _resolve_path(resolver: Callable[[Path], Path]) -> Path:
        resolved_path = resolver(base_dir)
        if not resolved_path.exists() or not resolved_path.is_file():
            raise HTTPException(status_code=404, detail="Requested artifact is not available")
        return resolved_path

    def _serve(path: Path) -> FileResponse:
        media_type = {
            ".zip": "application/zip",
            ".pb": "application/octet-stream",
            ".json": "application/json",
        }.get(path.suffix.lower(), "application/octet-stream")
        return FileResponse(path, media_type=media_type, filename=path.name)

    def _load_json_document(path: Path) -> Any:
        try:
            with path.open("r", encoding="utf-8") as handle:
                return json.load(handle)
        except Exception as exc:  # pragma: no cover - defensive
            raise HTTPException(status_code=500, detail=f"Failed to read {path.name}") from exc

    @app.get(RAW_STATIC_ROUTE)
    def get_raw_static() -> FileResponse:
        path = _resolve_path(lambda base: base / "static" / CONSOLIDATED_STATIC_FILENAME)
        return _serve(path)

    @app.get(RAW_SERVICE_ALERTS_ROUTE)
    def get_raw_service_alerts() -> FileResponse:
        path = _resolve_path(
            lambda base: base / "servicealerts" / RAW_SERVICE_ALERTS_FILENAME
        )
        return _serve(path)

    @app.get(RAW_TRIP_UPDATES_ROUTE)
    def get_raw_trip_updates() -> FileResponse:
        path = _resolve_path(lambda base: base / "tripupdates" / RAW_TRIP_UPDATES_FILENAME)
        return _serve(path)

    @app.get(RAW_VEHICLE_POSITIONS_ROUTE)
    def get_raw_vehicle_positions() -> FileResponse:
        path = _resolve_path(
            lambda base: base / "vehiclepositions" / RAW_VEHICLE_POSITIONS_FILENAME
        )
        return _serve(path)

    @app.get("/api/v1/service-alerts")
    def get_processed_service_alerts() -> Any:
        path = _resolve_path(
            lambda base: base / "servicealerts" / SERVICE_ALERTS_JSON_FILENAME
        )
        return _load_json_document(path)

    def _load_list(path: Path) -> list[Any]:
        if not path.exists():
            return []
        try:
            with path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
        except Exception as exc:  # pragma: no cover - defensive
            raise HTTPException(status_code=500, detail=f"Failed to read {path.name}") from exc
        if isinstance(data, list):
            return data
        return []

    def _write_list(path: Path, payload: list[Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
            handle.write("\n")

    def _ensure_list_file(path: Path) -> None:
        if not path.exists():
            _write_list(path, [])

    def _extract_id(item: Any) -> str | None:
        if isinstance(item, str):
            return item
        if isinstance(item, dict):
            value = item.get("id")
            if isinstance(value, str):
                return value
        return None

    def _expect_mapping(payload: Any, label: str) -> dict[str, Any]:
        if not isinstance(payload, dict):
            raise HTTPException(status_code=400, detail=f"{label} must be an object")
        return payload

    @app.get("/api/v1/incidents")
    def get_raw_incidents() -> list[Any]:
        _ensure_list_file(raw_incidents_path)
        return _load_list(raw_incidents_path)

    @app.post("/api/v1/raw-incident", status_code=status.HTTP_201_CREATED)
    def post_raw_incident(payload: Any) -> dict[str, Any]:
        document = _expect_mapping(payload, "Incident")
        with io_lock:
            incidents = _load_list(raw_incidents_path)
            incidents.append(document)
            _write_list(raw_incidents_path, incidents)
        return {"count": len(incidents)}

    @app.post("/api/v1/incidents", status_code=status.HTTP_201_CREATED)
    def post_approved_incident(payload: Any) -> dict[str, Any]:
        document = _expect_mapping(payload, "Incident")
        with io_lock:
            incidents = _load_list(approved_incidents_path)
            incidents.append(document)
            _write_list(approved_incidents_path, incidents)
        return {"count": len(incidents)}

    @app.delete("/api/v1/incidents/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_approved_incident(incident_id: str) -> Response:
        with io_lock:
            incidents = _load_list(approved_incidents_path)
            remaining = [item for item in incidents if _extract_id(item) != incident_id]
            if len(remaining) == len(incidents):
                raise HTTPException(status_code=404, detail="Incident not found")
            _write_list(approved_incidents_path, remaining)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.post("/api/v1/dispatcher-alerts", status_code=status.HTTP_201_CREATED)
    def post_dispatcher_alert(payload: Any) -> dict[str, Any]:
        document = _expect_mapping(payload, "Alert")
        with io_lock:
            alerts = _load_list(dispatcher_alerts_path)
            alerts.append(document)
            _write_list(dispatcher_alerts_path, alerts)
        return {"count": len(alerts)}

    @app.delete("/api/v1/dispatcher-alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_dispatcher_alert(alert_id: str) -> Response:
        with io_lock:
            alerts = _load_list(dispatcher_alerts_path)
            remaining = [item for item in alerts if _extract_id(item) != alert_id]
            if len(remaining) == len(alerts):
                raise HTTPException(status_code=404, detail="Alert not found")
            _write_list(dispatcher_alerts_path, remaining)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return app

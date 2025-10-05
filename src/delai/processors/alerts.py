from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from .realtime import convert_feed_to_json

LOGGER = logging.getLogger(__name__)


def process_service_alerts(
    raw_feed_path: Path,
    output_json_path: Path,
    approved_alerts_path: Path,
    approved_incidents_path: Path,
    dispatcher_alerts_path: Path,
) -> Path:
    """Convert and enrich the consolidated ServiceAlerts feed.

    Steps:
    1. Convert the protobuf feed into JSON.
    2. Ensure each alert carries an ``approved`` flag (default ``False``).
    3. Append additional alert entities sourced from dispatcher/incident files.
    4. Mark alerts as approved when they are listed in ``approved_alerts.json``.
       Entries that no longer reference an existing alert are removed from that file.
    """

    base_json_path = convert_feed_to_json(raw_feed_path, output_json_path)
    data = _load_json(base_json_path)

    entity_list = data.get("entity")
    if not isinstance(entity_list, list):
        entity_list = []
        data["entity"] = entity_list

    id_to_entity: dict[str, dict[str, Any]] = {}

    for entity in list(entity_list):
        _ensure_approved(entity)
        entity_id = entity.get("id")
        if isinstance(entity_id, str):
            id_to_entity[entity_id] = entity

    additional_sources = (
        approved_incidents_path,
        dispatcher_alerts_path,
    )

    for source_path in additional_sources:
        additional = _load_json_list(source_path)
        for item in additional:
            normalized = _normalize_entity(item)
            if normalized is None:
                continue
            _ensure_approved(normalized)
            entity_id = normalized.get("id")
            if isinstance(entity_id, str):
                id_to_entity[entity_id] = normalized
            entity_list.append(normalized)

    approved_entries = _load_json_list(approved_alerts_path)
    matched_entries: list[Any] = []
    for entry in approved_entries:
        entity_id = _extract_entity_id(entry)
        if entity_id and entity_id in id_to_entity:
            alert = id_to_entity[entity_id].get("alert")
            if isinstance(alert, dict):
                alert["approved"] = True
            matched_entries.append(entry)

    if approved_alerts_path.exists():
        _write_json(approved_alerts_path, matched_entries)

    _write_json(output_json_path, data)
    return output_json_path


def _ensure_approved(entity: dict[str, Any]) -> None:
    alert = entity.get("alert")
    if not isinstance(alert, dict):
        return
    alert.setdefault("approved", False)


def _normalize_entity(item: Any) -> dict[str, Any] | None:
    if isinstance(item, dict):
        if "entity" in item and isinstance(item["entity"], dict):
            return item["entity"]
        if "id" in item:
            return item
    return None


def _extract_entity_id(entry: Any) -> str | None:
    if isinstance(entry, str):
        return entry
    if isinstance(entry, dict):
        if "id" in entry and isinstance(entry["id"], str):
            return entry["id"]
        if "entity" in entry and isinstance(entry["entity"], dict):
            entity = entry["entity"]
            if isinstance(entity.get("id"), str):
                return entity["id"]
    return None


def _load_json(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except FileNotFoundError:
        LOGGER.error("Base JSON file %s is missing", path)
        raise
    except Exception:
        LOGGER.exception("Failed to parse JSON payload from %s", path)
        raise

    if not isinstance(data, dict):
        LOGGER.warning("Expected object at root of %s; coercing to dict", path)
        return {}
    return data


def _load_json_list(path: Path) -> list[Any]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except Exception:
        LOGGER.exception("Failed to read supplemental alerts from %s", path)
        return []

    if isinstance(data, list):
        return data

    LOGGER.warning("Supplemental alerts in %s were not a list; ignoring", path)
    return []


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
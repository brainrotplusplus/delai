from __future__ import annotations

import json
from pathlib import Path

from google.transit import gtfs_realtime_pb2

from delai.processors.alerts import process_service_alerts


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _build_raw_service_alert(path: Path, entity_id: str) -> None:
    feed = gtfs_realtime_pb2.FeedMessage()
    entity = feed.entity.add()
    entity.id = entity_id
    alert = entity.alert
    header = alert.header_text.translation.add()
    header.text = "Alert header"

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(feed.SerializeToString())


def test_process_service_alerts(tmp_path: Path) -> None:
    alerts_dir = tmp_path / "servicealerts"
    raw_pb = alerts_dir / "RawServiceAlerts.pb"
    _build_raw_service_alert(raw_pb, "base-alert")

    dispatcher_payload = [
        {
            "id": "dispatcher-1",
            "alert": {
                "header_text": {"translation": [{"text": "Dispatcher alert"}]},
            },
        }
    ]
    _write_json(alerts_dir / "dispatcher_alerts.json", dispatcher_payload)

    incidents_payload = [
        {
            "entity": {
                "id": "incident-1",
                "alert": {
                    "header_text": {"translation": [{"text": "Incident alert"}]},
                },
            }
        }
    ]
    _write_json(alerts_dir / "approved_incidents.json", incidents_payload)

    approved_payload = [
        {"id": "base-alert"},
        {"id": "missing"},
    ]
    approved_path = alerts_dir / "approved_alerts.json"
    _write_json(approved_path, approved_payload)

    alerts_json_path = alerts_dir / "alerts.json"

    result_path = process_service_alerts(
        raw_pb,
        alerts_json_path,
        approved_path,
        alerts_dir / "approved_incidents.json",
        alerts_dir / "dispatcher_alerts.json",
    )

    data = json.loads(result_path.read_text(encoding="utf-8"))
    entities = data.get("entity", [])
    assert len(entities) == 3

    id_map = {entity["id"]: entity for entity in entities}

    assert id_map["base-alert"]["alert"]["approved"] is True
    assert id_map["dispatcher-1"]["alert"]["approved"] is False
    assert id_map["incident-1"]["alert"]["approved"] is False

    updated_approved = json.loads(approved_path.read_text(encoding="utf-8"))
    assert updated_approved == [{"id": "base-alert"}]


def test_process_service_alerts_handles_missing_files(tmp_path: Path) -> None:
    alerts_dir = tmp_path / "servicealerts"
    raw_pb = alerts_dir / "RawServiceAlerts.pb"
    _build_raw_service_alert(raw_pb, "base-alert")

    alerts_json_path = alerts_dir / "alerts.json"

    process_service_alerts(
        raw_pb,
        alerts_json_path,
        alerts_dir / "approved_alerts.json",
        alerts_dir / "approved_incidents.json",
        alerts_dir / "dispatcher_alerts.json",
    )

    data = json.loads(alerts_json_path.read_text(encoding="utf-8"))
    entity = data["entity"][0]
    assert entity["id"] == "base-alert"
    assert entity["alert"]["approved"] is False
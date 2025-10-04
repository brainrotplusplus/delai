from __future__ import annotations

import json
from pathlib import Path

from google.protobuf.json_format import MessageToDict
from google.transit import gtfs_realtime_pb2


class RealtimeFeedError(RuntimeError):
    """Raised when a realtime protobuf feed cannot be processed."""


def convert_feed_to_json(pb_path: Path, json_path: Path | None = None) -> Path:
    """Parse a GTFS-realtime protobuf file and store it as formatted JSON.

    Args:
        pb_path: Path to the protobuf file on disk.
        json_path: Optional path for the resulting JSON file. If omitted, a
            sibling file with the ``.json`` suffix will be created.

    Returns:
        The path to the generated JSON file.

    Raises:
        RealtimeFeedError: If the protobuf cannot be parsed or the JSON file
            cannot be written.
    """

    if json_path is None:
        json_path = pb_path.with_suffix(".json")

    feed = gtfs_realtime_pb2.FeedMessage()
    try:
        feed.ParseFromString(pb_path.read_bytes())
    except Exception as exc:  # pragma: no cover - defensive
        raise RealtimeFeedError(f"Failed to parse GTFS-realtime file: {pb_path}") from exc

    try:
        data = MessageToDict(feed, preserving_proto_field_name=True)
        json_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )
    except Exception as exc:  # pragma: no cover - defensive
        raise RealtimeFeedError(f"Failed to serialize realtime feed to JSON: {json_path}") from exc

    return json_path

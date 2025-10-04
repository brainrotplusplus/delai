from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path
from typing import Iterable, Iterator

import pytest

from google.transit import gtfs_realtime_pb2

from delai.service import DownloadResult, DownloadService
from delai.sources.base import DataSource, DownloadTarget


class DummyResponse:
    def __init__(self, payload: bytes) -> None:
        self._payload = payload
        self.status_code = 200

    def raise_for_status(self) -> None:  # pragma: no cover - simple stub
        if self.status_code >= 400:
            raise RuntimeError("HTTP error")

    def iter_content(self, chunk_size: int) -> Iterator[bytes]:
        yield self._payload

    def __enter__(self) -> "DummyResponse":  # pragma: no cover - simple stub
        return self

    def __exit__(self, exc_type, exc, tb) -> None:  # pragma: no cover - simple stub
        return None


class DummySession:
    def __init__(self, payload_by_url: dict[str, bytes] | None = None) -> None:
        self.headers: dict[str, str] = {}
        self.requested_urls: list[str] = []
        self._payload_by_url = payload_by_url or {}

    def get(self, url: str, *, stream: bool, timeout: int) -> DummyResponse:
        assert stream is True
        assert timeout > 0
        self.requested_urls.append(url)
        payload = self._payload_by_url.get(url, b"payload")
        return DummyResponse(payload=payload)

    def __enter__(self) -> "DummySession":  # pragma: no cover - simple stub
        return self

    def __exit__(self, exc_type, exc, tb) -> None:  # pragma: no cover - simple stub
        return None


class DummySource(DataSource):
    def __init__(self) -> None:
        super().__init__(name="dummy", slug="dummy")
        self._targets = [
            DownloadTarget(relative_path=Path("a.txt"), url="https://example.com/a.txt"),
            DownloadTarget(
                relative_path=Path("nested") / "b.txt",
                url="https://example.com/b.txt",
            ),
        ]

    def iter_targets(self) -> Iterable[DownloadTarget]:
        return list(self._targets)


class DummySessionFactory:
    def __init__(self, payload_by_url: dict[str, bytes] | None = None) -> None:
        self._payload_by_url = payload_by_url or {}

    def __call__(self) -> DummySession:
        return DummySession(self._payload_by_url)


def test_service_downloads_files(tmp_path: Path) -> None:
    service = DownloadService(
        sources=[DummySource()],
        output_dir=tmp_path,
        session_factory=DummySessionFactory(),
        chunk_size=4,
    )

    results = service.run()

    assert all(isinstance(result, DownloadResult) for result in results)
    assert len(results) == 2

    for result in results:
        file_path = result.output_path
        assert file_path.exists()
        assert file_path.read_bytes() == b"payload"
        assert file_path.is_file()
        assert file_path.relative_to(tmp_path).parts[0] == "dummy"
        assert result.derived_paths == ()


def test_service_with_no_sources(tmp_path: Path, caplog: pytest.LogCaptureFixture) -> None:
    service = DownloadService(
        sources=[],
        output_dir=tmp_path,
        session_factory=DummySessionFactory(),
    )

    with caplog.at_level("WARNING"):
        results = service.run()

    assert results == []
    assert "No data sources configured" in caplog.text


class RealtimeSource(DataSource):
    def __init__(self) -> None:
        super().__init__(name="realtime", slug="realtime")
        self._targets = [
            DownloadTarget(
                relative_path=Path("tripupdates") / "TripUpdates.pb",
                url="https://example.com/TripUpdates.pb",
            )
        ]

    def iter_targets(self) -> Iterable[DownloadTarget]:
        return list(self._targets)


def test_service_converts_realtime_feeds(tmp_path: Path) -> None:
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.header.gtfs_realtime_version = "2.0"
    feed.header.incrementality = gtfs_realtime_pb2.FeedHeader.FULL_DATASET
    feed.header.timestamp = 42

    entity = feed.entity.add()
    entity.id = "vehicle-1"
    entity.vehicle.vehicle.id = "vehicle-1"

    payload = feed.SerializeToString()

    source = RealtimeSource()
    url = source.iter_targets()[0].url
    service = DownloadService(
        sources=[source],
        output_dir=tmp_path,
        session_factory=DummySessionFactory({url: payload}),
    )

    results = service.run()

    assert len(results) == 1
    result = results[0]
    assert result.output_path.exists()
    assert result.output_path.suffix == ".pb"
    assert len(result.derived_paths) == 1

    json_path = result.derived_paths[0]
    assert json_path.exists()
    assert json_path.suffix == ".json"

    data = json.loads(json_path.read_text(encoding="utf-8"))
    assert data["header"]["gtfs_realtime_version"] == "2.0"
    assert data["entity"][0]["vehicle"]["vehicle"]["id"] == "vehicle-1"


class StaticZipSource(DataSource):
    def __init__(self) -> None:
        super().__init__(name="static", slug="static")
        self._targets = [
            DownloadTarget(
                relative_path=Path("static") / "GTFS.zip",
                url="https://example.com/GTFS.zip",
            )
        ]

    def iter_targets(self) -> Iterable[DownloadTarget]:
        return list(self._targets)


def test_service_extracts_static_zip(tmp_path: Path) -> None:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, mode="w") as zip_file:
        zip_file.writestr("stops.txt", "stop_id,stop_name\n1,Stop A\n")
        zip_file.writestr("routes.txt", "route_id,route_short_name\n10,Line 10\n")

    payload = buffer.getvalue()

    source = StaticZipSource()
    url = source.iter_targets()[0].url
    service = DownloadService(
        sources=[source],
        output_dir=tmp_path,
        session_factory=DummySessionFactory({url: payload}),
    )

    results = service.run()

    assert len(results) == 1
    result = results[0]
    assert result.output_path.exists()
    assert result.output_path.suffix == ".zip"
    assert len(result.derived_paths) == 1

    extracted_dir = result.derived_paths[0]
    assert extracted_dir.is_dir()
    assert (extracted_dir / "stops.txt").exists()
    assert (extracted_dir / "routes.txt").exists()

    stops_content = (extracted_dir / "stops.txt").read_text(encoding="utf-8")
    assert "Stop A" in stops_content

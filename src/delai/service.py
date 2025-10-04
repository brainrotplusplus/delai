from __future__ import annotations

import logging
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Sequence

import requests

from .processors import (
    StaticFeedInput,
    consolidate_static_feeds,
    convert_feed_to_json,
    determine_agency_id,
    extract_zip,
)
from .sources.base import DataSource, DownloadTarget

LOGGER = logging.getLogger(__name__)
DEFAULT_TIMEOUT = 60  # seconds
DEFAULT_CHUNK_SIZE = 1024 * 1024  # 1 MiB


@dataclass(slots=True, frozen=True)
class DownloadResult:
    """Represents a successfully downloaded artifact."""

    source: str
    url: str
    output_path: Path
    bytes_written: int
    derived_paths: tuple[Path, ...] = ()


class DownloadService:
    """Orchestrates downloads for a collection of data sources."""

    def __init__(
        self,
        sources: Sequence[DataSource],
        output_dir: Path,
        *,
        session_factory: Callable[[], requests.Session] | None = None,
        timeout: int = DEFAULT_TIMEOUT,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
    ) -> None:
        self._sources = list(sources)
        self._output_dir = Path(output_dir)
        self._session_factory = session_factory or requests.Session
        self._timeout = timeout
        self._chunk_size = chunk_size

    def run(self) -> list[DownloadResult]:
        if not self._sources:
            LOGGER.warning("No data sources configured. Nothing to download.")
            return []

        self._output_dir.mkdir(parents=True, exist_ok=True)

        results: list[DownloadResult] = []
        with self._session_factory() as session:
            session.headers.setdefault(
                "User-Agent", "delai/0.1 (+https://github.com/brainrotplusplus/delai)"
            )
            for source in self._sources:
                LOGGER.info("Processing source %s", source.name)
                results.extend(self._download_source(session, source))

        self._finalize_static_feeds(results)

        return results

    def _download_source(
        self, session: requests.Session, source: DataSource
    ) -> Iterable[DownloadResult]:
        for target in source.iter_targets():
            yield self._download_target(session, source, target)

    def _download_target(
        self,
        session: requests.Session,
        source: DataSource,
        target: DownloadTarget,
    ) -> DownloadResult:
        destination = target.destination(self._output_dir, source.slug)
        destination.parent.mkdir(parents=True, exist_ok=True)

        LOGGER.debug("Fetching %s", target.url)

        with session.get(target.url, stream=True, timeout=self._timeout) as response:
            response.raise_for_status()
            bytes_written = self._write_stream(response.iter_content(self._chunk_size), destination)

        derived_paths = tuple(self._post_process(source, target, destination))

        LOGGER.info("Saved %s (%s bytes)", destination, bytes_written)
        for generated in derived_paths:
            LOGGER.info("Generated %s", generated)

        return DownloadResult(
            source=source.slug,
            url=target.url,
            output_path=destination,
            bytes_written=bytes_written,
            derived_paths=derived_paths,
        )

    def _write_stream(self, chunks: Iterable[bytes], destination: Path) -> int:
        bytes_written = 0
        with tempfile.NamedTemporaryFile(delete=False, dir=destination.parent) as tmp_file:
            tmp_path = Path(tmp_file.name)
            try:
                for chunk in chunks:
                    if not chunk:
                        continue
                    tmp_file.write(chunk)
                    bytes_written += len(chunk)
            except Exception:
                tmp_path.unlink(missing_ok=True)
                raise

        tmp_path.replace(destination)
        return bytes_written

    def _post_process(
        self,
        source: DataSource,
        target: DownloadTarget,
        destination: Path,
    ) -> Iterable[Path]:
        generated: list[Path] = []

        suffix = destination.suffix.lower()

        if suffix == ".pb":
            try:
                json_path = convert_feed_to_json(destination)
            except Exception:
                LOGGER.exception(
                    "Failed to convert realtime feed for source %s target %s",
                    source.slug,
                    target.url,
                )
            else:
                generated.append(json_path)
        elif suffix == ".zip":
            try:
                extracted_dir = extract_zip(destination)
            except Exception:
                LOGGER.exception(
                    "Failed to extract archive for source %s target %s",
                    source.slug,
                    target.url,
                )
            else:
                generated.append(extracted_dir)

        return generated

    def _finalize_static_feeds(self, results: Sequence[DownloadResult]) -> None:
        static_results = [
            result
            for result in results
            if result.output_path.suffix.lower() == ".zip"
        ]

        if not static_results:
            return

        static_results = sorted(static_results, key=lambda item: item.output_path.name)
        feeds: list[StaticFeedInput] = []

        for index, result in enumerate(static_results):
            extracted_dir = next((path for path in result.derived_paths if path.is_dir()), None)
            if extracted_dir is None:
                continue
            agency_id = determine_agency_id(result.output_path, index)
            feeds.append(StaticFeedInput(result.output_path, extracted_dir, agency_id))

        if not feeds:
            return

        try:
            consolidated_path = consolidate_static_feeds(feeds)
        except Exception:
            LOGGER.exception("Failed to consolidate static GTFS bundles")
        else:
            LOGGER.info("Generated consolidated static bundle at %s", consolidated_path)

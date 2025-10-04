from __future__ import annotations

from pathlib import Path
from typing import Iterable

from .base import DataSource, DownloadTarget

BASE_URL = "https://gtfs.ztp.krakow.pl"


class KrakowGTFSDataSource(DataSource):
    """Static definition of the publicly available GTFS feeds for Kraków."""

    def __init__(self) -> None:
        super().__init__(name="ZTP Kraków GTFS", slug="krakow-gtfs")
        self._targets: tuple[DownloadTarget, ...] = tuple(_build_targets())

    def iter_targets(self) -> Iterable[DownloadTarget]:
        return self._targets


def _build_targets() -> list[DownloadTarget]:
    targets: list[DownloadTarget] = []

    for filename in (
        "GTFS_KRK_A.zip",
        "GTFS_KRK_M.zip",
        "GTFS_KRK_T.zip",
    ):
        targets.append(
            DownloadTarget(
                relative_path=Path("static") / filename,
                url=f"{BASE_URL}/{filename}",
                description="Static GTFS schedule bundle",
            )
        )

    for feed_name in ("ServiceAlerts", "TripUpdates", "VehiclePositions"):
        for variant, description in (
            ("A", "Agglomeration lines"),
            ("M", "Metropolitan lines"),
            ("T", "Tram lines"),
        ):
            filename = f"{feed_name}_{variant}.pb"
            targets.append(
                DownloadTarget(
                    relative_path=Path(feed_name.lower()) / filename,
                    url=f"{BASE_URL}/{filename}",
                    description=f"{feed_name} feed for {description.lower()}",
                )
            )

    return targets


def build_source() -> KrakowGTFSDataSource:
    """Factory used by the configuration layer."""
    return KrakowGTFSDataSource()

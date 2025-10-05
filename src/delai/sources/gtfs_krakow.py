from __future__ import annotations

from pathlib import Path
from typing import Iterable

from .base import DataSource, DownloadTarget

BASE_URL = "https://gtfs.ztp.krakow.pl"
KOLEJE_BASE_URL = "https://kolejemalopolskie.com.pl/rozklady_jazdy"


class KrakowGTFSDataSource(DataSource):
    """Static definition of the publicly available GTFS feeds for Kraków."""

    def __init__(self) -> None:
        super().__init__(name="ZTP Kraków GTFS", slug="krakow-gtfs")
        self._targets: tuple[DownloadTarget, ...] = tuple(_build_targets())

    def iter_targets(self) -> Iterable[DownloadTarget]:
        return self._targets


def _build_targets() -> list[DownloadTarget]:
    targets: list[DownloadTarget] = []

    static_files = [
        (
            "GTFS_KRK_A.zip",
            f"{BASE_URL}/GTFS_KRK_A.zip",
            "Static GTFS schedule bundle (agglomeration)",
        ),
        (
            "GTFS_KRK_M.zip",
            f"{BASE_URL}/GTFS_KRK_M.zip",
            "Static GTFS schedule bundle (metropolitan)",
        ),
        (
            "GTFS_KRK_T.zip",
            f"{BASE_URL}/GTFS_KRK_T.zip",
            "Static GTFS schedule bundle (tram)",
        ),
        (
            "kml-ska-gtfs.zip",
            f"{KOLEJE_BASE_URL}/kml-ska-gtfs.zip",
            "Static GTFS schedule bundle (Koleje Małopolskie SKA)",
        ),
        (
            "ald-gtfs.zip",
            f"{KOLEJE_BASE_URL}/ald-gtfs.zip",
            "Static GTFS schedule bundle (ALD)",
        ),
    ]

    for filename, url, description in static_files:
        targets.append(
            DownloadTarget(
                relative_path=Path("static") / filename,
                url=url,
                description=description,
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

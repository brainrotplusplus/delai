from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Sequence

from .sources.base import DataSource


@dataclass(slots=True)
class ServiceConfig:
    """High-level configuration for the download service."""

    output_dir: Path = Path("output")
    sources: Sequence[DataSource] = field(default_factory=list)


def default_config(output_dir: Path | str = Path("output")) -> ServiceConfig:
    """Build the default configuration with Kraków GTFS feeds enabled."""
    from .sources.gtfs_krakow import build_source

    return ServiceConfig(output_dir=Path(output_dir), sources=[build_source()])

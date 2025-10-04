from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True, slots=True)
class DownloadTarget:
    """Immutable description of a downloadable artifact."""

    relative_path: Path
    url: str
    description: str | None = None

    def destination(self, root: Path, source_slug: str) -> Path:
        """Compute the full path where the file should be stored."""
        return root / source_slug / self.relative_path


class DataSource(ABC):
    """Abstract base class for any data source providing downloadable files."""

    name: str
    slug: str

    def __init__(self, name: str, slug: str) -> None:
        self.name = name
        self.slug = slug

    @abstractmethod
    def iter_targets(self) -> Iterable[DownloadTarget]:
        """Yield the targets that should be downloaded for this source."""

    def __repr__(self) -> str:  # pragma: no cover - trivial
        return f"{self.__class__.__name__}(name={self.name!r}, slug={self.slug!r})"

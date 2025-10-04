"""delai data ingestion service."""

from importlib import metadata


def get_version() -> str:
    """Return the installed package version."""
    try:
        return metadata.version("delai")
    except metadata.PackageNotFoundError:
        return "0.0.0"


__all__ = ["get_version"]

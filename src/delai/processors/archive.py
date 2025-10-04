from __future__ import annotations

import zipfile
from pathlib import Path


class ArchiveExtractionError(RuntimeError):
    """Raised when an archive cannot be safely extracted."""


def extract_zip(zip_path: Path, destination_dir: Path | None = None) -> Path:
    """Extract a ZIP archive into a directory.

    Args:
        zip_path: Path to the `.zip` file.
        destination_dir: Optional directory to extract into. Defaults to a
            sibling directory whose name matches the ZIP stem.

    Returns:
        The directory containing the extracted files.

    Raises:
        ArchiveExtractionError: If extraction fails or is unsafe.
    """

    if destination_dir is None:
        destination_dir = zip_path.with_suffix("")

    destination_dir.mkdir(parents=True, exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path) as zip_file:
            for member in zip_file.infolist():
                extracted_path = destination_dir / member.filename
                _assert_within_directory(destination_dir, extracted_path)
                if member.is_dir():
                    extracted_path.mkdir(parents=True, exist_ok=True)
                else:
                    extracted_path.parent.mkdir(parents=True, exist_ok=True)
                    with zip_file.open(member) as source, extracted_path.open("wb") as target:
                        target.write(source.read())
    except Exception as exc:  # pragma: no cover - defensive
        raise ArchiveExtractionError(f"Failed to extract ZIP archive: {zip_path}") from exc

    return destination_dir


def _assert_within_directory(directory: Path, target: Path) -> None:
    """Ensure the target path stays within the destination directory."""

    try:
        target.relative_to(directory)
    except ValueError as exc:
        raise ArchiveExtractionError(
            f"Archive extraction would escape destination directory: {target}"
        ) from exc

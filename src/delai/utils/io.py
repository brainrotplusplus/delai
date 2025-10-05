from __future__ import annotations

import json
import tempfile
from pathlib import Path
from typing import Any, Callable


Writer = Callable[[Path], None]


def _prepare_temp_path(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(delete=False, dir=destination.parent)
    temp_path = Path(handle.name)
    handle.close()
    return temp_path


def atomic_write(destination: Path, writer: Writer) -> Path:
    """Write data to *destination* using a temporary file and atomic replace."""

    temp_path = _prepare_temp_path(destination)
    try:
        writer(temp_path)
        temp_path.replace(destination)
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise
    return destination


def atomic_write_bytes(destination: Path, payload: bytes) -> Path:
    """Atomically write *payload* bytes to *destination*."""

    return atomic_write(destination, lambda temp_path: temp_path.write_bytes(payload))


def atomic_write_text(
    destination: Path,
    payload: str,
    *,
    encoding: str = "utf-8",
) -> Path:
    """Atomically write text content to *destination*."""

    return atomic_write(destination, lambda temp_path: temp_path.write_text(payload, encoding=encoding))


def atomic_dump_json(
    destination: Path,
    payload: Any,
    *,
    encoding: str = "utf-8",
    ensure_ascii: bool = False,
    indent: int | None = 2,
    sort_keys: bool = True,
) -> Path:
    """Atomically serialize *payload* as JSON to *destination*."""

    def _writer(temp_path: Path) -> None:
        text = json.dumps(payload, ensure_ascii=ensure_ascii, indent=indent, sort_keys=sort_keys)
        temp_path.write_text(f"{text}\n", encoding=encoding)

    return atomic_write(destination, _writer)

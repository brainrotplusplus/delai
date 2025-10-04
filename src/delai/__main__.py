from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import Sequence

from .config import ServiceConfig, default_config
from .service import DownloadResult, DownloadService


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="delai data ingestion service")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("output"),
        help="Directory where downloaded files will be stored",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Configure logging level",
    )
    return parser


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def run(config: ServiceConfig) -> Sequence[DownloadResult]:
    service = DownloadService(config.sources, config.output_dir)
    return service.run()


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    configure_logging(args.log_level)

    config = default_config(output_dir=args.output)
    results = run(config)

    for result in results:
        logging.getLogger("delai").info("%s -> %s", result.url, result.output_path)

    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(main())

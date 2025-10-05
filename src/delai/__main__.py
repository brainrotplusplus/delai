from __future__ import annotations

import argparse
import logging
import time
from datetime import datetime, time as dt_time, timedelta
from pathlib import Path
from typing import Callable, Sequence

from .config import ServiceConfig, default_config
from .service import DownloadResult, DownloadService
from .sources.base import DataSource, DownloadTarget

RUNNER_LOGGER = logging.getLogger("delai.runner")
REALTIME_INTERVAL = timedelta(seconds=15)
REALTIME_FAILURE_DELAY = timedelta(seconds=5)
STATIC_FAILURE_DELAY = timedelta(minutes=15)
STATIC_REFRESH_TIME = dt_time(hour=3, minute=0)
MAX_IDLE_SLEEP = 60.0


TargetFilter = Callable[[DataSource, DownloadTarget], bool]


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


def run_once(config: ServiceConfig) -> Sequence[DownloadResult]:
    service = DownloadService(config.sources, config.output_dir)
    return service.run()


def _is_static_target(_: DataSource, target: DownloadTarget) -> bool:
    return target.relative_path.suffix.lower() == ".zip"


def _is_realtime_target(_: DataSource, target: DownloadTarget) -> bool:
    return target.relative_path.suffix.lower() == ".pb"


def _log_results(results: Sequence[DownloadResult], label: str) -> None:
    if not results:
        RUNNER_LOGGER.info("No artifacts updated during %s refresh", label)
        return

    for result in results:
        RUNNER_LOGGER.info("%s -> %s", result.url, result.output_path)


def _refresh_with_filter(
    service: DownloadService,
    label: str,
    target_filter: TargetFilter,
) -> bool:
    RUNNER_LOGGER.info("Starting %s refresh", label)
    start = time.perf_counter()
    try:
        results = service.run(target_filter=target_filter)
    except Exception:  # pragma: no cover - defensive
        RUNNER_LOGGER.exception("Failed during %s refresh", label)
        return False

    duration = time.perf_counter() - start
    _log_results(results, label)
    RUNNER_LOGGER.info(
        "Finished %s refresh in %.2fs (%d artifacts)",
        label,
        duration,
        len(results),
    )
    return True


def _next_static_refresh(after: datetime) -> datetime:
    candidate = after.replace(
        hour=STATIC_REFRESH_TIME.hour,
        minute=STATIC_REFRESH_TIME.minute,
        second=0,
        microsecond=0,
    )

    if candidate <= after:
        candidate += timedelta(days=1)

    return candidate


def run_forever(service: DownloadService) -> None:
    RUNNER_LOGGER.info("Download service entering continuous mode")

    now = datetime.now()
    static_next = _next_static_refresh(now)

    if _refresh_with_filter(service, "static feed", _is_static_target):
        static_next = _next_static_refresh(datetime.now())
    else:
        RUNNER_LOGGER.warning(
            "Initial static refresh failed; retrying in %s", STATIC_FAILURE_DELAY
        )
        static_next = datetime.now() + STATIC_FAILURE_DELAY

    realtime_next = datetime.now()

    while True:
        now = datetime.now()

        if now >= static_next:
            if _refresh_with_filter(service, "static feed", _is_static_target):
                static_next = _next_static_refresh(datetime.now())
            else:
                RUNNER_LOGGER.warning(
                    "Static refresh failed; retrying in %s", STATIC_FAILURE_DELAY
                )
                static_next = datetime.now() + STATIC_FAILURE_DELAY

        if now >= realtime_next:
            if _refresh_with_filter(service, "realtime feed", _is_realtime_target):
                realtime_next = datetime.now() + REALTIME_INTERVAL
            else:
                RUNNER_LOGGER.warning(
                    "Realtime refresh failed; retrying in %s", REALTIME_FAILURE_DELAY
                )
                realtime_next = datetime.now() + REALTIME_FAILURE_DELAY

        next_event = min(static_next, realtime_next)
        sleep_seconds = (next_event - datetime.now()).total_seconds()

        if sleep_seconds > 0:
            time.sleep(min(sleep_seconds, MAX_IDLE_SLEEP))
        else:
            time.sleep(0.5)


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    configure_logging(args.log_level)

    config = default_config(output_dir=args.output)
    service = DownloadService(config.sources, config.output_dir)

    try:
        run_forever(service)
    except KeyboardInterrupt:  # pragma: no cover - interactive loop
        RUNNER_LOGGER.info("Shutdown requested. Exiting.")

    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(main())

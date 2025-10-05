# delai

Data ingestion service for consolidating transit feeds from multiple providers. The initial release focuses on the public GTFS feeds provided by ZTP Kraków.

## Getting started

Create and activate a Python 3.10+ virtual environment, then install the package in editable mode (along with the optional test dependencies if you plan to run the test suite):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[test]
# or
# pip install -r requirements.txt
```

To start the service and keep GTFS bundles up to date in the local `output/` directory, run:

```bash
python -m delai --output output
```

The service runs continuously until interrupted (Ctrl+C). Static GTFS bundles (including the Koleje Małopolskie SKA and ALD feeds) are refreshed immediately on start and then every day at 03:00 local time. Realtime protobuf feeds are fetched every 15 seconds. While the downloader runs, an HTTP API is exposed on port 2137 with the following endpoints:

- `GET /api/v1/raw-static/GTFS.zip` → consolidated `GTFS.zip`
- `GET /api/v1/raw-service-alerts/RawServiceAlerts.pb` → `RawServiceAlerts.pb`
- `GET /api/v1/raw-trip-updates/RawTripUpdates.pb` → `RawTripUpdates.pb`
- `GET /api/v1/raw-vehicle-positions/RawVehiclePositions.pb` → `RawVehiclePositions.pb`
- `GET /api/v1/service-alerts` → enriched `alerts.json`

The downloader writes each feed under `output/<source>/<category>/...` for easy manual inspection.
Realtime protobuf feeds (`*.pb`) are automatically converted to pretty-printed JSON files placed alongside the original binaries.
Static GTFS bundles (`*.zip`) are unpacked into sibling directories so the raw `.txt` tables are immediately accessible.
Additionally, all static bundles are merged into a consolidated `GTFS.zip` package with normalized identifiers across agencies.

## Development

Run the automated tests with:

```bash
pytest
```

Additional data sources can be added by implementing new classes that inherit from `delai.sources.base.DataSource`.
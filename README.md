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

To download the latest GTFS bundles and realtime protobuf feeds into the local `output/` directory, run:

```bash
python -m delai --output output
```

The downloader writes each feed under `output/<source>/<category>/...` for easy manual inspection.
Realtime protobuf feeds (`*.pb`) are automatically converted to pretty-printed JSON files placed alongside the original binaries.
Static GTFS bundles (`*.zip`) are unpacked into sibling directories so the raw `.txt` tables are immediately accessible.
Additionally, the three static bundles are merged into a consolidated `GTFS_KRK.zip` package with normalized identifiers across agencies.

## Development

Run the automated tests with:

```bash
pytest
```

Additional data sources can be added by implementing new classes that inherit from `delai.sources.base.DataSource`.
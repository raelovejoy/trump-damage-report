# Architecture

Worker (scheduled) → Postgres → API → Static frontend

## Worker
- ingest → normalize → cluster → summarize → store

## API
- reads incidents/sources/edges and serves JSON

## Frontend
- fetches JSON, renders cards, filters, and graph view

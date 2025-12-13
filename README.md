# Daily Damage Report

An evidence-first project answering a simple question:

**“What notable actions, statements, or policy moves by Trump or aligned actors happened today?”**

This repository powers a website that provides:

* Daily incident summaries with citations
* Clear confidence and severity labels
* A “zoom out” view showing how incidents connect to institutions, laws, groups, and systems

The goal is **structured accountability and systems-level understanding**.

---

## What this is (and is not)

**This is:**

* A daily incident log, not a news feed
* Evidence-forward (sources are required)
* Explicit about uncertainty (confirmed vs contested)
* Designed to scale from “today” → “historical patterns”

**This is not:**

* A comprehensive archive of everything Trump-related
* An opinion blog
* A replacement for journalism

---

## High-level architecture

```
Scheduled Worker → Postgres → Read-only API → Static Website
```

* **Worker**: fetches news, clusters duplicates, summarizes incidents
* **Database**: stores incidents, sources, and system links
* **API**: serves read-only JSON
* **Frontend**: static site (hosted via Fastmail)

Details live in `docs/architecture.md`.

---

## Repository structure

```text
apps/
  api/          Read-only HTTP API (incidents + graph)
  worker/       Scheduled pipeline (ingest → summarize → store)
  web-static/   Static frontend (Fastmail-hosted)

packages/
  shared/       Shared schemas and types

db/
  schema.sql    Postgres schema

infra/
  cron-manager/ Fly.io Cron Manager configuration

docs/
  rubric.md        Severity + confidence scoring
  sources.md       Sourcing rules
  glossary.md      Definitions
  architecture.md  Dataflow overview
```

---

## Core principles

* **Sources required**
  Every incident must link to at least one source URL.

* **Confidence is explicit**
  Each incident includes a confidence score and “confirmed” or “contested” label.

* **Separation of claim vs verification**
  “What was said” is distinct from “what is established.”

* **Zoom out matters**
  Incidents are linked to institutions, laws, groups, and systems to reveal patterns.

---

## Status

🚧 **Early scaffold / MVP in progress**

Next milestones:

1. Finalize schemas and rubrics
2. Implement worker ingestion + summarization
3. Deploy API + scheduled jobs
4. Publish first live daily report

---

## License

Code is licensed under the MIT License.

Content licensing will be clarified as the project matures.

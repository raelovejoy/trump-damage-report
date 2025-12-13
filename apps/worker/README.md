# Worker

Scheduled pipeline job:
1) fetch articles
2) cluster duplicates into incidents
3) summarize incidents (structured output)
4) write incidents + sources + edges into Postgres

## Env
- `DATABASE_URL`

## Notes
- Keep output schema stable so the frontend stays simple.
- Never write an incident without at least 1 source URL.

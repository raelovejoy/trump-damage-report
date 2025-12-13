import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { Pool } from "pg";

type DateQuery = { date?: string };

type IncidentRow = {
  id: string;
  incident_date: string;
  title?: string;
  severity?: number;
  confidence?: number;
  [k: string]: unknown;
};

type SourceRow = {
  incident_id: string;
  [k: string]: unknown;
};

type EdgeRow = {
  incident_id: string;
  [k: string]: unknown;
};

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL missing");

const pool = new Pool({ connectionString: DATABASE_URL });

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.get(
  "/incidents",
  async (req: FastifyRequest<{ Querystring: DateQuery }>) => {
    const incidentDate = req.query?.date ?? new Date().toISOString().slice(0, 10);

    const incidentsRes = await pool.query<IncidentRow>(
      `select * from incidents where incident_date = $1 order by severity desc, confidence desc`,
      [incidentDate]
    );

    const ids = incidentsRes.rows.map((r) => r.id);

    const sourcesRes = ids.length
      ? await pool.query<SourceRow>(
          `select * from sources where incident_id = any($1::text[])`,
          [ids]
        )
      : ({ rows: [] } as { rows: SourceRow[] });

    const edgesRes = ids.length
      ? await pool.query<EdgeRow>(
          `select * from edges where incident_id = any($1::text[])`,
          [ids]
        )
      : ({ rows: [] } as { rows: EdgeRow[] });

    const byIncidentSources = new Map<string, SourceRow[]>();
    for (const s of sourcesRes.rows) {
      const arr = byIncidentSources.get(s.incident_id) ?? [];
      arr.push(s);
      byIncidentSources.set(s.incident_id, arr);
    }

    const byIncidentEdges = new Map<string, EdgeRow[]>();
    for (const e of edgesRes.rows) {
      const arr = byIncidentEdges.get(e.incident_id) ?? [];
      arr.push(e);
      byIncidentEdges.set(e.incident_id, arr);
    }

    const incidents = incidentsRes.rows.map((r) => ({
      ...r,
      sources: byIncidentSources.get(r.id) ?? [],
      edges: byIncidentEdges.get(r.id) ?? [],
    }));

    return { date: incidentDate, incidents };
  }
);

app.get(
  "/graph",
  async (req: FastifyRequest<{ Querystring: DateQuery }>) => {
    const incidentDate = req.query?.date ?? new Date().toISOString().slice(0, 10);

    const incidentsRes = await pool.query<Pick<IncidentRow, "id" | "title" | "severity" | "confidence">>(
      `select id, title, severity, confidence from incidents where incident_date = $1`,
      [incidentDate]
    );

    const ids = incidentsRes.rows.map((r) => r.id);

    const edgesRes = ids.length
      ? await pool.query(
          `select incident_id, kind, label, weight from edges where incident_id = any($1::text[])`,
          [ids]
        )
      : ({ rows: [] } as { rows: unknown[] });

    return { date: incidentDate, incidents: incidentsRes.rows, edges: edgesRes.rows };
  }
);

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 8080);

app
  .listen({ host: HOST, port: PORT })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

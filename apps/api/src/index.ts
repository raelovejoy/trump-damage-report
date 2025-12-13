import Fastify from "fastify";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL missing");

const pool = new Pool({ connectionString: DATABASE_URL });

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.get("/incidents", async (req: any) => {
  const { date } = (req.query as { date?: string }) ?? {};
  const incidentDate = date ?? new Date().toISOString().slice(0, 10);

  const incidentsRes = await pool.query(
    `select * from incidents where incident_date = $1 order by severity desc, confidence desc`,
    [incidentDate]
  );

  const ids = incidentsRes.rows.map((r) => r.id);

  const sourcesRes = ids.length
    ? await pool.query(`select * from sources where incident_id = any($1::text[])`, [ids])
    : { rows: [] as any[] };

  const edgesRes = ids.length
    ? await pool.query(`select * from edges where incident_id = any($1::text[])`, [ids])
    : { rows: [] as any[] };

  const byIncidentSources = new Map<string, any[]>();
  for (const s of sourcesRes.rows) {
    const arr = byIncidentSources.get(s.incident_id) ?? [];
    arr.push(s);
    byIncidentSources.set(s.incident_id, arr);
  }

  const byIncidentEdges = new Map<string, any[]>();
  for (const e of edgesRes.rows) {
    const arr = byIncidentEdges.get(e.incident_id) ?? [];
    arr.push(e);
    byIncidentEdges.set(e.incident_id, arr);
  }

  const incidents = incidentsRes.rows.map((r) => ({
    ...r,
    sources: byIncidentSources.get(r.id) ?? [],
    edges: byIncidentEdges.get(r.id) ?? []
  }));

  return { date: incidentDate, incidents };
});

app.get("/graph", async (req: any) => {
  const { date } = (req.query as { date?: string }) ?? {};
  const incidentDate = date ?? new Date().toISOString().slice(0, 10);

  const incidentsRes = await pool.query(
    `select id, title, severity, confidence from incidents where incident_date = $1`,
    [incidentDate]
  );
  const ids = incidentsRes.rows.map((r) => r.id);

  const edgesRes = ids.length
    ? await pool.query(
        `select incident_id, kind, label, weight from edges where incident_id = any($1::text[])`,
        [ids]
      )
    : { rows: [] as any[] };

  return { date: incidentDate, incidents: incidentsRes.rows, edges: edgesRes.rows };
});

app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 8080) });

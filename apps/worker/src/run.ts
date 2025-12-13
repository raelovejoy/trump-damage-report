import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL missing");

const pool = new Pool({ connectionString: DATABASE_URL });

const today = new Date().toISOString().slice(0, 10);

async function main() {
  const incidentId = `inc_${uuidv4()}`;

  await pool.query("begin");

  await pool.query(
    `insert into incidents (id, incident_date, title, summary_bullets, confirmed, confidence, severity, topics)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (id) do nothing`,
    [
      incidentId,
      today,
      "Stub incident (replace with real pipeline)",
      JSON.stringify([
        "Placeholder data written by the worker.",
        "Next: ingest real articles and summarize with citations.",
        "Keep schema stable so frontend stays simple."
      ]),
      true,
      70,
      20,
      ["meta", "pipeline"]
    ]
  );

  await pool.query(
    `insert into sources (incident_id, publisher, title, url, published_at)
     values ($1,$2,$3,$4,$5)
     on conflict (incident_id, url) do nothing`,
    [incidentId, "Example", "Example source", "https://example.com", new Date().toISOString()]
  );

  await pool.query(
    `insert into edges (incident_id, kind, label, weight) values
     ($1,'topic','pipeline',2),
     ($1,'institution','example-institution',1),
     ($1,'group','public',1)`,
    [incidentId]
  );

  await pool.query("commit");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try { await pool.query("rollback"); } catch {}
  process.exit(1);
});

create table if not exists incidents (
  id text primary key,
  incident_date date not null,
  title text not null,
  summary_bullets jsonb not null,
  confirmed boolean not null default true,
  confidence smallint not null default 60,
  severity smallint not null default 40,
  topics text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sources (
  id bigserial primary key,
  incident_id text not null references incidents(id) on delete cascade,
  publisher text,
  title text,
  url text not null,
  published_at timestamptz,
  quote text,
  unique(incident_id, url)
);

create table if not exists edges (
  id bigserial primary key,
  incident_id text not null references incidents(id) on delete cascade,
  kind text not null,
  label text not null,
  weight smallint not null default 1
);

create index if not exists incidents_date_idx on incidents(incident_date);
create index if not exists edges_incident_idx on edges(incident_id);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  source_path TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_role TEXT NOT NULL DEFAULT 'operations',
  permission_level TEXT NOT NULL DEFAULT 'plant'
);

CREATE TABLE chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  section TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding TEXT NOT NULL
);

CREATE TABLE entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  chunk_id INTEGER,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0.82,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entity_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_entity_id INTEGER,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  target_entity_id INTEGER,
  target_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  document_id INTEGER,
  evidence TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.8
);

CREATE TABLE assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  location TEXT NOT NULL,
  criticality TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'Monitored'
);

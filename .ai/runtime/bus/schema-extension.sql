-- FlyDea Message Bus Schema — portado do AbaMais
CREATE TABLE IF NOT EXISTS bus_agents (
  id TEXT PRIMARY KEY, name TEXT, role TEXT, layer INTEGER DEFAULT 0,
  status TEXT DEFAULT 'idle', last_heartbeat TEXT
);

CREATE TABLE IF NOT EXISTS bus_messages (
  id TEXT PRIMARY KEY, correlation_id TEXT, parent_id TEXT, pipeline_run_id TEXT,
  sender TEXT, recipient TEXT, msg_type TEXT, subject TEXT, body TEXT,
  clinical_score INTEGER, risk_level TEXT, priority TEXT DEFAULT 'P2',
  status TEXT DEFAULT 'pending', created_at TEXT, delivered_at TEXT
);

CREATE TABLE IF NOT EXISTS bus_pipelines (
  id TEXT PRIMARY KEY, name TEXT, category TEXT, steps TEXT,
  is_mutable INTEGER DEFAULT 0, requires_human_approval INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bus_pipeline_runs (
  id TEXT PRIMARY KEY, pipeline_id TEXT, work_item_id TEXT, correlation_id TEXT,
  current_step INTEGER DEFAULT 0, total_steps INTEGER, status TEXT DEFAULT 'running',
  context_json TEXT DEFAULT '{}', created_by TEXT, started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS bus_subscriptions (
  id TEXT PRIMARY KEY, agent_id TEXT, topic TEXT, created_at TEXT
);

-- Seed pipelines
INSERT OR IGNORE INTO bus_pipelines (id, name, category, steps, is_mutable, requires_human_approval) VALUES
  ('read-only-query', 'Read-only query', 'read', '["orchestrator", "executor", "qa"]', 0, 0),
  ('non-critical-patch', 'Non-critical patch', 'patch', '["orchestrator", "risk", "security", "executor", "qa"]', 1, 0),
  ('terraform-plan', 'Terraform plan', 'plan', '["orchestrator", "risk", "security", "finops", "executor", "qa"]', 0, 0),
  ('terraform-apply', 'Terraform apply', 'mutate', '["orchestrator", "business", "risk", "security", "finops", "human", "executor", "qa"]', 1, 1),
  ('db-migration', 'Database migration', 'mutate', '["orchestrator", "business", "risk", "security", "human", "executor", "qa"]', 1, 1),
  ('emergency-fix', 'Emergency hotfix', 'emergency', '["orchestrator", "business", "executor", "qa"]', 1, 0);
INSERT OR IGNORE INTO bus_pipelines (id, name, category, steps, is_mutable, requires_human_approval) VALUES
  ('gis-deploy', 'GIS layer deploy', 'patch', '["orchestrator", "giss", "risk", "executor", "qa"]', 1, 0),
  ('gis-crs-transform', 'CRS transformation', 'read', '["orchestrator", "giss", "executor", "qa"]', 0, 0),
  ('infra-deploy', 'Infrastructure deploy', 'mutate', '["orchestrator", "devops", "risk", "security", "finops", "human", "executor", "qa"]', 1, 1),
  ('infra-rollback', 'Infrastructure rollback', 'emergency', '["orchestrator", "devops", "risk", "executor", "qa"]', 1, 0),
  ('compliance-audit', 'Compliance audit scan', 'read', '["orchestrator", "compliance", "security", "executor", "qa"]', 0, 0),
  ('compliance-lgpd-clean', 'LGPD data cleanup', 'mutate', '["orchestrator", "compliance", "business", "risk", "executor", "qa"]', 1, 1);

-- Seed agents
INSERT OR IGNORE INTO bus_agents (id, name, role, layer) VALUES
  ('orchestrator', 'Orchestrator', 'orchestrator', 1),
  ('business', 'Business Guardian', 'business', 2),
  ('risk', 'Risk Analyst', 'risk', 3),
  ('security', 'Security Reviewer', 'security', 3),
  ('finops', 'FinOps Guardian', 'finops', 3),
  ('executor', 'Executor', 'executor', 4),
  ('qa', 'QA Validator', 'qa', 4),
  ('memory', 'Memory Manager', 'memory', 5);
INSERT OR IGNORE INTO bus_agents (id, name, role, layer) VALUES
  ('giss', 'GIS Guardian', 'giss', 3),
  ('devops', 'DevOps Guardian', 'devops', 3),
  ('compliance', 'Compliance Guardian', 'compliance', 3);

-- Queues (queues)
CREATE TABLE IF NOT EXISTS bus_queues (
  name TEXT PRIMARY KEY,
  type TEXT DEFAULT 'topic' CHECK(type IN ('topic','direct','competitive')),
  dlq_name TEXT,
  max_retries INTEGER DEFAULT 3,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed default queues
INSERT OR IGNORE INTO bus_queues (name, type, dlq_name, max_retries) VALUES
  ('pipeline.default', 'topic', 'pipeline.dlq', 3),
  ('alerts', 'topic', 'alerts.dlq', 3),
  ('tasks', 'competitive', 'tasks.dlq', 3),
  ('planning.sync', 'topic', NULL, 1);
INSERT OR IGNORE INTO bus_queues (name, type, dlq_name, max_retries) VALUES
  ('gis.operations', 'competitive', 'gis.dlq', 3),
  ('infra.deploy', 'competitive', 'infra.dlq', 3),
  ('compliance.audit', 'topic', 'compliance.dlq', 3);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT, event_type TEXT, source TEXT, work_item_id TEXT,
  payload TEXT DEFAULT '{}', timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT, checkpoint_type TEXT, status TEXT,
  created_at TEXT, completed_at TEXT, evidence_path TEXT
);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT, command TEXT, environment TEXT, risk_level TEXT,
  blast_radius TEXT, rollback_plan TEXT, requested_by TEXT, approved_by TEXT,
  status TEXT, approval_type TEXT, created_at TEXT
);

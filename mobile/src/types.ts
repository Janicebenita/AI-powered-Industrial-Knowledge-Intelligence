export type BackendAsset = {
  tag: string;
  name: string;
  asset_type?: string;
  location?: string;
  risk_score?: number;
  status?: string;
};

export type DashboardResponse = {
  documents: number;
  entities: number;
  chunks: number;
  graph: { nodes: number; relationships: number };
  metrics: {
    citation_coverage: number;
    compliance_gaps_found: number;
    repeated_failure_patterns_detected: number;
  };
  maintenance: MaintenanceResponse;
};

export type MaintenanceResponse = {
  assets: BackendAsset[];
  failure_patterns: Array<{ failure_mode: string; count: number }>;
  incomplete_maintenance_history: string[];
  high_risk_assets: BackendAsset[];
};

export type ComplianceResponse = {
  covered: Array<{ clause: string; requirement: string; applies_to: string; evidence: unknown[] }>;
  gaps: Array<{ clause: string; requirement: string; applies_to: string; gap: string; evidence: unknown[] }>;
  audit_summary: string;
  missing_documents: string[];
};

export type CopilotCitation = {
  filename: string;
  page_number: number;
  section: string;
  quote: string;
  confidence: number;
};

export type CopilotResponse = {
  direct_answer: string;
  confidence: number;
  citations: CopilotCitation[];
  related_assets: string[];
  related_documents: string[];
  suggested_next_actions: string[];
  evidence_strength: string;
};

export type DocumentRecord = {
  id: number;
  filename: string;
  doc_type: string;
  created_at: string;
  owner_role: string;
  permission_level: string;
};

import type { IndustrialAsset } from "@/lib/demo-data";

export type BackendAsset = {
  tag: string;
  name: string;
  asset_type?: string;
  location?: string;
  criticality?: string;
  risk_score?: number;
  status?: string;
};

export type BackendEntity = {
  id: number;
  entity_type: string;
  name: string;
  confidence: number;
  filename: string;
  metadata?: string;
  document_id?: number;
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

export function toUiAsset(asset: BackendAsset): IndustrialAsset {
  const riskScore = Number(asset.risk_score ?? 45);
  const normalizedTag = asset.tag?.replace("-", "") || "ASSET";
  return {
    tag: normalizedTag,
    name: asset.name || asset.tag,
    type: asset.asset_type || "Industrial Asset",
    location: asset.location || "Unknown location",
    status: asset.status || "Indexed",
    riskScore,
    reliabilityScore: Math.max(35, Math.round(100 - riskScore * 0.42)),
    complianceStatus: riskScore >= 80 ? "At Risk" : riskScore >= 65 ? "Partial" : "Ready",
    mtbf: Math.max(20, Math.round(115 - riskScore * 0.65)),
    mttr: Number((3.5 + riskScore / 18).toFixed(1)),
    failureModes: [],
    nextAction: riskScore >= 70 ? "Review linked failures, inspections, and source-cited recommendations" : "Continue routine monitoring"
  };
}

export function confidenceToPercent(value: number) {
  return Math.round(value <= 1 ? value * 100 : value);
}

export async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export type Asset = {
  id: number;
  tag: string;
  name: string;
  asset_type: string;
  location: string;
  criticality: string;
  risk_score: number;
  status: string;
};

export type Citation = {
  document_id: number;
  chunk_id: number;
  filename: string;
  page_number: number;
  section: string;
  quote: string;
  confidence: number;
};

export type CopilotAnswer = {
  direct_answer: string;
  confidence: number;
  citations: Citation[];
  related_assets: string[];
  related_documents: string[];
  suggested_next_actions: string[];
  evidence_strength: string;
};

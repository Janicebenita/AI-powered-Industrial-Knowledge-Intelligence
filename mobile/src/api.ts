import type { BackendAsset, ComplianceResponse, CopilotResponse, DashboardResponse, DocumentRecord, MaintenanceResponse } from "./types";

export const API_BASE = "http://127.0.0.1:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`API ${path} failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getDashboard() {
  return api<DashboardResponse>("/api/dashboard");
}

export function getAssets() {
  return api<BackendAsset[]>("/api/assets");
}

export function getDocuments() {
  return api<DocumentRecord[]>("/api/documents");
}

export function getMaintenance() {
  return api<MaintenanceResponse>("/api/maintenance");
}

export function getCompliance() {
  return api<ComplianceResponse>("/api/compliance");
}

export function askCopilot(question: string) {
  return api<CopilotResponse>("/api/copilot/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, user_role: "maintenance" })
  });
}

export async function uploadDocument(file: { uri: string; name: string; mimeType?: string }) {
  const formData = new FormData();
  formData.append("owner_role", "operations");
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/octet-stream"
  } as unknown as Blob);

  const response = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    throw new Error(`Upload failed with ${response.status}`);
  }
  return response.json();
}
